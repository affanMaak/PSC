import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HallDto } from './dtos/hall.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { capitalizeWords } from 'src/utils/CapitalizeFirst';
import {
  formatPakistanDate,
  getPakistanDate,
  parsePakistanDate,
} from 'src/utils/time';

@Injectable()
export class HallService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // ─────────────────────────── HALLS ───────────────────────────
  async getHalls() {
    return await this.prismaService.hall.findMany({
      include: {
        outOfOrders: {
          orderBy: {
            startDate: 'asc',
          },
        },
        reservations: {
          include: {
            admin: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            reservedFrom: 'asc',
          },
        },
        bookings: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async getAvailHalls() {
    return await this.prismaService.hall.findMany({
      where: { isActive: true, isBooked: false },
      include: {
        outOfOrders: {
          orderBy: {
            startDate: 'asc',
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createHall(payload: HallDto, files: Express.Multer.File[]) {
    const uploadedImages: { url: string; publicId: string }[] = [];

    for (const file of files ?? []) {
      const img = await this.cloudinaryService.uploadFile(file);
      uploadedImages.push({
        url: img.url,
        publicId: img.public_id,
      });
    }

    // Parse out of order periods if provided
    let outOfOrderPeriodsData: any[] = [];
    if (payload.outOfOrders && Array.isArray(payload.outOfOrders)) {
      outOfOrderPeriodsData = payload.outOfOrders.map((period) => ({
        reason: period.reason,
        startDate: new Date(period.startDate),
        endDate: new Date(period.endDate),
      }));
    }

    // Check if hall should be active based on current date and out-of-order periods
    const now = new Date();
    const hasActiveOutOfOrder = outOfOrderPeriodsData.some(
      (period) => period.startDate <= now && period.endDate >= now,
    );

    const shouldBeActive = !hasActiveOutOfOrder;

    return await this.prismaService.hall.create({
      data: {
        name: capitalizeWords(payload.name),
        description: payload.description!,
        capacity: Number(payload.capacity),
        chargesGuests: Number(payload.chargesGuests),
        chargesMembers: Number(payload.chargesMembers),
        isActive: shouldBeActive,
        images: uploadedImages,
        outOfOrders: {
          create: outOfOrderPeriodsData,
        },
      },
      include: {
        outOfOrders: true,
      },
    });
  }

  async updateHall(payload: HallDto, files: Express.Multer.File[] = []) {
    if (!payload.id) {
      throw new HttpException('Hall ID is required', HttpStatus.BAD_REQUEST);
    }

    const hallId = Number(payload.id);

    const hall = await this.prismaService.hall.findUnique({
      where: { id: hallId },
      include: {
        outOfOrders: true,
        reservations: true,
        bookings: true,
      },
    });

    if (!hall) {
      throw new HttpException('Hall not found', HttpStatus.NOT_FOUND);
    }

    // Handle images (existing code)
    const keepImagePublicIds = Array.isArray(payload.existingimgs)
      ? payload.existingimgs
      : payload.existingimgs
        ? [payload.existingimgs]
        : [];

    const filteredExistingImages = Array.isArray(hall.images)
      ? hall.images?.filter((img: any) =>
          keepImagePublicIds.includes(img.publicId),
        )
      : [];

    const newUploadedImages: any[] = [];
    for (const file of files) {
      const result: any = await this.cloudinaryService.uploadFile(file);
      newUploadedImages.push({
        url: result.secure_url || result.url,
        publicId: result.public_id,
      });
    }

    const finalImages = [...filteredExistingImages, ...newUploadedImages];

    // Parse out of order periods from payload
    const newOutOfOrderPeriods = payload.outOfOrders
      ? JSON.parse(payload.outOfOrders as any)
      : [];

    // Check for conflicts with existing reservations and bookings
    const now = new Date();

    for (const period of newOutOfOrderPeriods) {
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);

      // Check for conflicting reservations
      const conflictingReservations = hall.reservations.filter(
        (reservation) => {
          const resStart = new Date(reservation.reservedFrom);
          const resEnd = new Date(reservation.reservedTo);
          return (
            (startDate <= resEnd && endDate >= resStart) ||
            (resStart <= endDate && resEnd >= startDate)
          );
        },
      );

      // Check for conflicting bookings
      const conflictingBookings = hall.bookings.filter((booking) => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate >= startDate && bookingDate <= endDate;
      });

      if (
        conflictingReservations.length > 0 ||
        conflictingBookings.length > 0
      ) {
        throw new HttpException(
          `Cannot set hall as out of order from ${startDate.toDateString()} to ${endDate.toDateString()}. Hall has ${conflictingReservations.length} reservation(s) and ${conflictingBookings.length} booking(s) during this period.`,
          HttpStatus.CONFLICT,
        );
      }
    }

    // Determine if hall should be active based on current date
    const hasActiveOutOfOrder = newOutOfOrderPeriods.some((period) => {
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);
      return startDate <= now && endDate >= now;
    });

    const shouldBeActive = !hasActiveOutOfOrder;

    // Perform transaction to update hall and out-of-order periods
    return await this.prismaService.$transaction(async (prisma) => {
      // Delete all existing out-of-order periods
      await prisma.hallOutOfOrder.deleteMany({
        where: { hallId },
      });

      // Update hall with new data
      const updatedHall = await prisma.hall.update({
        where: { id: hallId },
        data: {
          name: payload.name?.trim(),
          description: payload.description?.trim(),
          capacity: Number(payload.capacity) || 0,
          chargesMembers: Number(payload.chargesMembers) || 0,
          chargesGuests: Number(payload.chargesGuests) || 0,
          isActive: shouldBeActive,
          images: finalImages,
        },
      });

      // Create new out-of-order periods if any
      if (newOutOfOrderPeriods.length > 0) {
        await prisma.hallOutOfOrder.createMany({
          data: newOutOfOrderPeriods.map((period) => ({
            hallId,
            reason: period.reason,
            startDate: new Date(period.startDate),
            endDate: new Date(period.endDate),
          })),
        });
      }

      // Fetch complete hall data
      return await prisma.hall.findUnique({
        where: { id: hallId },
        include: { outOfOrders: true },
      });
    });
  }

  async deleteHall(id: number): Promise<void> {
    const hall = await this.prismaService.hall.findFirst({ where: { id } });

    if (!hall) {
      throw new Error(`Hall with ID ${id} not found`);
    }

    // Delete images
    if (Array.isArray(hall.images)) {
      const deletePromises = hall.images
        .filter((img: { publicId: string }) => img?.publicId)
        .map((img: { publicId: string }) =>
          this.cloudinaryService
            .removeFile(img.publicId)
            .catch((error) =>
              console.error(`Failed to delete image ${img.publicId}:`, error),
            ),
        );

      await Promise.all(deletePromises);
    }

    // Delete hall record
    await this.prismaService.hall.delete({ where: { id } });
  }

  // reserve hall(s)
  async reserveHalls(
    hallIds: number[],
    reserve: boolean,
    adminId: string,
    timeSlot: string,
    reserveFrom?: string,
    reserveTo?: string,
  ) {
    // Check if any hall is currently booked
    const bookedHall = await this.prismaService.hall.findFirst({
      where: {
        id: { in: hallIds },
        onHold: true,
      },
    });

    // if (bookedHall) {
    //   throw new HttpException(
    //     `Hall "${bookedHall.name}" is currently on hold`,
    //     HttpStatus.CONFLICT,
    //   );
    // }

    // Validate dates and time slot if reserving
    if (reserve) {
      if (!reserveFrom || !reserveTo || !timeSlot) {
        throw new HttpException(
          'Reservation dates and time slot are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate time slot
      const validTimeSlots = ['MORNING', 'EVENING', 'NIGHT'];
      if (!validTimeSlots.includes(timeSlot)) {
        throw new HttpException(
          'Invalid time slot. Must be MORNING, EVENING, or NIGHT',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Parse dates as Pakistan Time (UTC+5)
      const fromDate = parsePakistanDate(reserveFrom);
      const toDate = parsePakistanDate(reserveTo);

      // Set time based on time slot
      const setTimeForDate = (date: Date, slot: string) => {
        const newDate = new Date(date);
        switch (slot) {
          case 'MORNING':
            newDate.setHours(8, 0, 0, 0); // 8:00 AM
            break;
          case 'EVENING':
            newDate.setHours(14, 0, 0, 0); // 2:00 PM
            break;
          case 'NIGHT':
            newDate.setHours(20, 0, 0, 0); // 8:00 PM
            break;
        }
        return newDate;
      };

      const reservedFrom = setTimeForDate(fromDate, timeSlot);
      const reservedTo = setTimeForDate(toDate, timeSlot);

      // Get current time in Pakistan
      const today = getPakistanDate();
      today.setHours(0, 0, 0, 0);

      // For date comparison, use date-only values in PKT
      const fromDateOnly = new Date(fromDate);
      fromDateOnly.setHours(0, 0, 0, 0);

      const toDateOnly = new Date(toDate);
      toDateOnly.setHours(0, 0, 0, 0);

      if (fromDateOnly >= toDateOnly) {
        throw new HttpException(
          'Reservation end date must be after start date',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (fromDateOnly < today) {
        throw new HttpException(
          'Reservation start date cannot be in the past',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Use transaction for atomic operations
      return await this.prismaService.$transaction(async (prisma) => {
        // Remove existing reservations for these exact dates and time slot FIRST
        await prisma.hallReservation.deleteMany({
          where: {
            hallId: { in: hallIds },
            reservedFrom: reservedFrom,
            reservedTo: reservedTo,
            timeSlot: timeSlot,
          },
        });

        // Check for out-of-order period conflicts
        const outOfOrderHalls = await prisma.hall.findMany({
          where: {
            id: { in: hallIds },
            outOfOrders: {
              some: {
                // Check if any out-of-order period overlaps with reservation period
                AND: [
                  { startDate: { lte: reservedTo } },
                  { endDate: { gte: reservedFrom } },
                ],
              },
            },
          },
          include: {
            outOfOrders: {
              where: {
                AND: [
                  { startDate: { lte: reservedTo } },
                  { endDate: { gte: reservedFrom } },
                ],
              },
            },
          },
        });

        if (outOfOrderHalls.length > 0) {
          const conflicts = outOfOrderHalls.map((hall: any) => {
            const conflictingPeriods = hall.outOfOrders
              .filter((period: any) => {
                const periodStart = new Date(period.startDate);
                const periodEnd = new Date(period.endDate);
                return periodStart <= reservedTo && periodEnd >= reservedFrom;
              })
              .map((period) => {
                const startDate = new Date(period.startDate);
                const endDate = new Date(period.endDate);
                return `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}: ${period.reason}`;
              });

            return `Hall "${hall.name}" has out-of-order periods: ${conflictingPeriods.join('; ')}`;
          });

          throw new HttpException(
            `Out-of-order conflicts: ${conflicts.join(', ')}`,
            HttpStatus.CONFLICT,
          );
        }

        // Check for booking conflicts (excluding the ones we just deleted)
        const conflictingBookings = await prisma.hallBooking.findMany({
          where: {
            hallId: { in: hallIds },
            OR: [
              {
                // Booking overlaps with reservation period AND matches time slot
                bookingDate: {
                  gte: reservedFrom,
                  lt: reservedTo,
                },
                bookingTime: timeSlot as any, // Strict time slot check
              },
            ],
          },
          include: { hall: { select: { name: true } } },
        });

        if (conflictingBookings.length > 0) {
          const conflicts = conflictingBookings.map(
            (conflict) =>
              `Hall "${conflict.hall.name}" booked on ${formatPakistanDate(conflict.bookingDate)} (${conflict.bookingTime})`,
          );
          throw new HttpException(
            `Booking conflicts: ${conflicts.join(', ')}`,
            HttpStatus.CONFLICT,
          );
        }

        // Check for other reservation conflicts (excluding the ones we just deleted)
        const conflictingReservations = await prisma.hallReservation.findMany({
          where: {
            hallId: { in: hallIds },
            OR: [
              {
                // Reservation overlaps with new reservation period
                reservedFrom: { lt: reservedTo }, // existing reservation starts before new reservation ends
                reservedTo: { gt: reservedFrom }, // existing reservation ends after new reservation starts
                timeSlot: timeSlot, // Same time slot conflict
              },
            ],
          },
          include: { hall: { select: { name: true } } },
        });

        if (conflictingReservations.length > 0) {
          const conflicts = conflictingReservations.map(
            (reservation) =>
              `Hall "${reservation.hall.name}" (${formatPakistanDate(reservation.reservedFrom)} - ${formatPakistanDate(reservation.reservedTo)}, ${reservation.timeSlot.toLowerCase()} slot)`,
          );
          throw new HttpException(
            `Reservation conflicts: ${conflicts.join(', ')}`,
            HttpStatus.CONFLICT,
          );
        }

        // Check if halls are active
        const inactiveHalls = await prisma.hall.findMany({
          where: {
            id: { in: hallIds },
            isActive: false,
          },
          select: { name: true, id: true },
        });

        if (inactiveHalls.length > 0) {
          // For inactive halls that have no active out-of-order periods
          // during the reservation period, allow reservation
          const allowedInactiveHalls: any[] = [];
          const deniedInactiveHalls: any[] = [];

          for (const hall of inactiveHalls) {
            // Check if hall has any out-of-order periods during reservation period
            const hasOutOfOrderDuringPeriod =
              await prisma.hallOutOfOrder.findFirst({
                where: {
                  hallId: hall.id,
                  AND: [
                    { startDate: { lte: reservedTo } },
                    { endDate: { gte: reservedFrom } },
                  ],
                },
              });

            if (hasOutOfOrderDuringPeriod) {
              deniedInactiveHalls.push(hall.name);
            } else {
              allowedInactiveHalls.push(hall.id);
            }
          }

          if (deniedInactiveHalls.length > 0) {
            throw new HttpException(
              `Cannot reserve inactive halls with active out-of-order periods: ${deniedInactiveHalls.join(', ')}`,
              HttpStatus.CONFLICT,
            );
          }

          // Update inactive halls without out-of-order conflicts to active
          if (allowedInactiveHalls.length > 0) {
            await prisma.hall.updateMany({
              where: {
                id: { in: allowedInactiveHalls },
              },
              data: {
                isActive: true,
              },
            });
          }
        }

        // Create new reservations
        const reservations = hallIds.map((hallId) => ({
          hallId,
          reservedFrom: reservedFrom,
          reservedTo: reservedTo,
          reservedBy: Number(adminId),
          timeSlot: timeSlot,
        }));

        const createdReservations = await prisma.hallReservation.createMany({
          data: reservations,
        });

        // Update hall reserved status
        await prisma.hall.updateMany({
          where: {
            id: { in: hallIds },
          },
          data: {
            isReserved: true,
          },
        });

        return {
          message: `${hallIds.length} hall(s) reserved successfully for ${timeSlot.toLowerCase()} slot`,
          count: hallIds.length,
          fromDate: reservedFrom.toISOString(),
          toDate: reservedTo.toISOString(),
          timeSlot: timeSlot,
          updatedInactiveHalls: inactiveHalls
            .filter((h) => hallIds.some((id) => id === h.id && h.name))
            .map((h) => h.name),
        };
      });
    } else {
      // UNRESERVE LOGIC - only remove reservations for exact dates and time slot
      if (reserveFrom && reserveTo && timeSlot) {
        const fromDate = parsePakistanDate(reserveFrom);
        const toDate = parsePakistanDate(reserveTo);

        // Set time based on time slot for precise matching
        const setTimeForDate = (date: Date, slot: string) => {
          const newDate = new Date(date);
          switch (slot) {
            case 'MORNING':
              newDate.setHours(8, 0, 0, 0);
              break;
            case 'EVENING':
              newDate.setHours(14, 0, 0, 0);
              break;
            case 'NIGHT':
              newDate.setHours(20, 0, 0, 0);
              break;
          }
          return newDate;
        };

        const reservedFrom = setTimeForDate(fromDate, timeSlot);
        const reservedTo = setTimeForDate(toDate, timeSlot);

        // Only delete reservations that exactly match the provided dates and time slot
        const result = await this.prismaService.hallReservation.deleteMany({
          where: {
            hallId: { in: hallIds },
            reservedFrom: reservedFrom,
            reservedTo: reservedTo,
            timeSlot: timeSlot,
          },
        });

        // Check if halls have any other upcoming reservations
        const upcomingReservations =
          await this.prismaService.hallReservation.findMany({
            where: {
              hallId: { in: hallIds },
              reservedTo: { gte: new Date() }, // Only count reservations that haven't ended yet
            },
            select: { hallId: true },
            distinct: ['hallId'],
          });

        const hallIdsWithUpcomingReservations = upcomingReservations.map(
          (r) => r.hallId,
        );
        const hallIdsWithoutUpcomingReservations = hallIds.filter(
          (id) => !hallIdsWithUpcomingReservations.includes(id),
        );

        // Update hall reserved status - set to false for halls with no upcoming reservations
        if (hallIdsWithoutUpcomingReservations.length > 0) {
          await this.prismaService.hall.updateMany({
            where: { id: { in: hallIdsWithoutUpcomingReservations } },
            data: { isReserved: false },
          });
        }

        // Check if halls should be marked as inactive based on out-of-order periods
        const now = new Date();
        const hallsToCheck = await this.prismaService.hall.findMany({
          where: {
            id: { in: hallIds },
          },
          include: {
            outOfOrders: {
              where: {
                endDate: { gte: now }, // Only check periods that haven't ended
              },
            },
          },
        });

        // Update halls that have current out-of-order periods
        for (const hall of hallsToCheck) {
          const hasCurrentOutOfOrder = hall.outOfOrders.some((period) => {
            const startDate = new Date(period.startDate);
            const endDate = new Date(period.endDate);
            return startDate <= now && endDate >= now;
          });

          if (hasCurrentOutOfOrder && hall.isActive) {
            await this.prismaService.hall.update({
              where: { id: hall.id },
              data: { isActive: false },
            });
          }
        }

        return {
          message: `${result.count} reservation(s) removed for the specified dates and ${timeSlot.toLowerCase()} slot`,
          count: result.count,
          hallsStillReserved: hallIdsWithUpcomingReservations.length,
          hallsFreed: hallIdsWithoutUpcomingReservations.length,
        };
      } else {
        // If no specific dates and time slot provided, don't remove any reservations
        return {
          message: `No reservations removed - please specify dates and time slot to remove specific reservations`,
          count: 0,
        };
      }
    }
  }
}
