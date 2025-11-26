import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HallDto } from './dtos/hall.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { capitalizeWords } from 'src/utils/CapitalizeFirst';
import { formatPakistanDate, getPakistanDate, parsePakistanDate } from 'src/utils/time';

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

    // Parse dates
    const outOfServiceFrom = payload.outOfServiceFrom
      ? new Date(payload.outOfServiceFrom)
      : null;
    const outOfServiceTo = payload.outOfServiceTo
      ? new Date(payload.outOfServiceTo)
      : null;

    // Determine if hall should be out of service now or scheduled for future
    const now = new Date();
    const shouldBeOutOfServiceNow =
      payload.isOutOfService &&
      outOfServiceFrom &&
      outOfServiceFrom <= now &&
      outOfServiceTo &&
      outOfServiceTo >= now;
    const isScheduledForOutOfService =
      payload.isOutOfService && outOfServiceFrom && outOfServiceFrom > now;

    // Hall should be active if:
    // - It's not out of service at all, OR
    // - It's only scheduled for future maintenance
    const shouldBeActive =
      !payload.isOutOfService || isScheduledForOutOfService;

    // Hall should be marked as out of service only if it's currently out of service
    const shouldBeMarkedOutOfService = shouldBeOutOfServiceNow;

    return await this.prismaService.hall.create({
      data: {
        name: capitalizeWords(payload.name),
        description: payload.description!,
        capacity: Number(payload.capacity),
        chargesGuests: Number(payload.chargesGuests),
        chargesMembers: Number(payload.chargesMembers),
        // Keep hall active if it's only scheduled for future maintenance
        isActive: !!shouldBeActive,
        // Only set isOutOfService to true if it's currently out of service
        isOutOfService: !!shouldBeMarkedOutOfService,
        outOfServiceReason: payload.outOfServiceReason,
        outOfServiceFrom: outOfServiceFrom,
        outOfServiceTo: outOfServiceTo,
        images: uploadedImages,
      },
    });
  }

  async updateHall(payload: HallDto, files: Express.Multer.File[] = []) {
    if (!payload.id) {
      throw new HttpException('Hall ID is required', HttpStatus.BAD_REQUEST);
    }

    const hallId = Number(payload.id);

    const hall: any = await this.prismaService.hall.findUnique({
      where: { id: hallId },
      select: { images: true },
    });

    if (!hall) {
      throw new HttpException('Hall not found', HttpStatus.NOT_FOUND);
    }

    // Extract only safe fields
    const keepImagePublicIds = Array.isArray(payload.existingimgs)
      ? payload.existingimgs
      : payload.existingimgs
        ? [payload.existingimgs]
        : [];

    const filteredExistingImages = hall?.images?.filter((img: any) =>
      keepImagePublicIds.includes(img.publicId),
    );

    // Upload new images
    const newUploadedImages: any[] = [];
    for (const file of files) {
      const result: any = await this.cloudinaryService.uploadFile(file);
      newUploadedImages.push({
        url: result.secure_url || result.url,
        publicId: result.public_id,
      });
    }

    const finalImages = [...filteredExistingImages, ...newUploadedImages];

    // Parse dates
    const outOfServiceFrom = payload.outOfServiceFrom
      ? new Date(payload.outOfServiceFrom)
      : null;
    const outOfServiceTo = payload.outOfServiceTo
      ? new Date(payload.outOfServiceTo)
      : null;

    // Check for reservation and booking conflicts only if setting out-of-service dates
    if (payload.isOutOfService && outOfServiceFrom && outOfServiceTo) {
      // Check for conflicting reservations
      const conflictingReservations =
        await this.prismaService.hallReservation.findMany({
          where: {
            hallId: hallId,
            OR: [
              {
                reservedFrom: { lte: outOfServiceTo },
                reservedTo: { gte: outOfServiceFrom },
              },
            ],
          },
        });

      // Check for conflicting bookings
      const conflictingBookings = await this.prismaService.hallBooking.findMany(
        {
          where: {
            hallId: hallId,
            OR: [
              {
                bookingDate: {
                  gte: outOfServiceFrom,
                  lte: outOfServiceTo,
                },
              },
            ],
          },
        },
      );

      if (
        conflictingReservations.length > 0 ||
        conflictingBookings.length > 0
      ) {
        const conflictMessages: any[] = [];

        if (conflictingReservations.length > 0) {
          conflictMessages.push(
            `${conflictingReservations.length} reservation(s)`,
          );
        }

        if (conflictingBookings.length > 0) {
          conflictMessages.push(`${conflictingBookings.length} booking(s)`);
        }

        throw new HttpException(
          `Cannot set hall as out of service. Hall has ${conflictMessages.join(' and ')} during the selected period.`,
          HttpStatus.CONFLICT,
        );
      }
    }

    // Determine if hall should be out of service now or scheduled for future
    const now = new Date();
    const shouldBeOutOfServiceNow =
      payload.isOutOfService &&
      outOfServiceFrom &&
      outOfServiceFrom <= now &&
      outOfServiceTo &&
      outOfServiceTo >= now;
    const isScheduledForOutOfService =
      payload.isOutOfService && outOfServiceFrom && outOfServiceFrom > now;

    // Hall should be active if:
    // - It's not out of service at all, OR
    // - It's only scheduled for future maintenance
    const shouldBeActive =
      !payload.isOutOfService || isScheduledForOutOfService;

    // Hall should be marked as out of service only if it's currently out of service
    const shouldBeMarkedOutOfService = shouldBeOutOfServiceNow;

    // Update with CLEAN DATA ONLY
    return this.prismaService.hall.update({
      where: { id: hallId },
      data: {
        name: payload.name?.trim(),
        description: payload.description?.trim(),
        capacity: Number(payload.capacity) || 0,
        chargesMembers: Number(payload.chargesMembers) || 0,
        chargesGuests: Number(payload.chargesGuests) || 0,
        // Keep hall active if it's only scheduled for future maintenance
        isActive: !!shouldBeActive,
        // Only set isOutOfService to true if it's currently out of service
        isOutOfService: !!shouldBeMarkedOutOfService,
        outOfServiceReason: payload.outOfServiceReason?.trim() || null,
        outOfServiceFrom: outOfServiceFrom,
        outOfServiceTo: outOfServiceTo,
        images: finalImages,
      },
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

    if (bookedHall) {
      throw new HttpException(
        `Hall "${bookedHall.name}" is currently on hold`,
        HttpStatus.CONFLICT,
      );
    }

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

        // Check for out-of-service conflicts
        const outOfServiceHalls = await prisma.hall.findMany({
          where: {
            id: { in: hallIds },
            OR: [
              {
                // Currently out of service
                isOutOfService: true,
              },
              {
                // Scheduled out of service during reservation period
                AND: [
                  { outOfServiceFrom: { not: null } },
                  { outOfServiceTo: { not: null } },
                  {
                    OR: [
                      {
                        // Out of service period overlaps with reservation
                        outOfServiceFrom: { lte: reservedTo },
                        outOfServiceTo: { gte: reservedFrom },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          select: {
            name: true,
            outOfServiceFrom: true,
            outOfServiceTo: true,
            isOutOfService: true,
          },
        });

        if (outOfServiceHalls.length > 0) {
          const conflicts = outOfServiceHalls.map((hall) => {
            if (hall.isOutOfService) {
              return `Hall "${hall.name}" is currently out of service`;
            } else {
              return `Hall "${hall.name}" is out of service from ${formatPakistanDate(hall.outOfServiceFrom!)} to ${formatPakistanDate(hall.outOfServiceTo!)}`;
            }
          });
          throw new HttpException(
            `Out of service conflicts: ${conflicts.join(', ')}`,
            HttpStatus.CONFLICT,
          );
        }

        // Now check for booking conflicts (excluding the ones we just deleted)
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

        // Create new reservations
        const reservations = hallIds.map((hallId) => ({
          hallId,
          reservedFrom: reservedFrom,
          reservedTo: reservedTo,
          reservedBy: Number(adminId),
          timeSlot: timeSlot,
        }));

        await prisma.hallReservation.createMany({ data: reservations });

        return {
          message: `${hallIds.length} hall(s) reserved successfully for ${timeSlot.toLowerCase()} slot`,
          count: hallIds.length,
          fromDate: reservedFrom.toISOString(),
          toDate: reservedTo.toISOString(),
          timeSlot: timeSlot,
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

        // Check if halls still have other reservations
        const hallsWithRemainingReservations =
          await this.prismaService.hallReservation.findMany({
            where: {
              hallId: { in: hallIds },
              reservedFrom: { gte: new Date() }, // Only count future reservations
              reservedTo: { gte: new Date() },
              timeSlot: { in: ['MORNING', 'EVENING', 'NIGHT'] },
              OR: [
                {
                  reservedFrom: { lte: new Date() },
                  reservedTo: { gte: new Date() },
                },
                {
                  reservedFrom: { gte: new Date() },
                },
              ],
            },
            select: { hallId: true },
            distinct: ['hallId'],
          });

        const hallIdsWithReservations = hallsWithRemainingReservations.map(
          (r) => r.hallId,
        );

        // Update hall reserved status - set to false for halls with no remaining reservations
        const hallIdsWithoutReservations = hallIds.filter(
          (id) => !hallIdsWithReservations.includes(id),
        );

        if (hallIdsWithoutReservations.length > 0) {
          await this.prismaService.hall.updateMany({
            where: { id: { in: hallIdsWithoutReservations } },
            data: { isReserved: false },
          });
        }

        return {
          message: `${result.count} reservation(s) removed for the specified dates and ${timeSlot.toLowerCase()} slot`,
          count: result.count,
          hallsStillReserved: hallIdsWithReservations.length,
          hallsFreed: hallIdsWithoutReservations.length,
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
