import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LawnDto } from './dtos/lawn.dto';
import { LawnCategory } from './dtos/lawn-category.dto';
import { capitalizeWords } from 'src/utils/CapitalizeFirst';
import {
  formatPakistanDate,
  getPakistanDate,
  parsePakistanDate,
} from 'src/utils/time';

@Injectable()
export class LawnService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) { }

  // ─────────────────────────── LAWN CATEGORY ───────────────────────────
  async getLawnCategories() {
    return await this.prismaService.lawnCategory.findMany({
      include: { lawns: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  async getLawnNames(id: number) {
    return await this.prismaService.lawn.findMany({
      where: { lawnCategoryId: id, isActive: true },
      orderBy: { memberCharges: 'desc' },
    });
  }

  async createLawnCategory(
    payload: LawnCategory,
    files: Express.Multer.File[],
  ) {
    const uploadedImages: { url: string; publicId: string }[] = [];

    try {
      // Upload new images
      for (const file of files ?? []) {
        try {
          const img = await this.cloudinaryService.uploadFile(file);
          uploadedImages.push({
            url: img.url,
            publicId: img.public_id,
          });
        } catch (uploadError: any) {
          // Handle Cloudinary upload errors
          if (
            uploadError.http_code === 400 &&
            uploadError.message?.includes('File size too large')
          ) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const maxSizeMB = (10 * 1024 * 1024) / (1024 * 1024); // 10MB in MB

            throw new HttpException(
              `File "${file.originalname}" is too large (${fileSizeMB}MB). Maximum allowed size is ${maxSizeMB}MB.`,
              HttpStatus.BAD_REQUEST,
            );
          } else if (uploadError.http_code) {
            // Handle other Cloudinary-specific errors
            throw new HttpException(
              `Failed to upload image "${file.originalname}": ${uploadError.message}`,
              HttpStatus.BAD_REQUEST,
            );
          } else {
            // Handle generic upload errors
            throw new HttpException(
              `Failed to upload image "${file.originalname}": ${uploadError.message || 'Unknown error'}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }
      }

      // Validate required fields
      if (!payload.category) {
        throw new HttpException(
          'Category is a required field',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Create lawn category
      return await this.prismaService.lawnCategory.create({
        data: {
          category: capitalizeWords(payload.category),
          images: uploadedImages,
        },
      });
    } catch (error: any) {
      // If any upload fails, clean up already uploaded images
      if (uploadedImages.length > 0) {
        await this.cleanupUploadedImages(uploadedImages);
      }

      // Re-throw the error if it's already an HttpException
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle unexpected errors
      throw new HttpException(
        `Failed to create lawn category: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateLawnCategory(
    id: number,
    payload: Partial<LawnCategory>,
    files?: Express.Multer.File[],
  ) {
    // Fetch existing lawn category with images
    const existingLawnCategory =
      await this.prismaService.lawnCategory.findUnique({
        where: { id },
      });

    if (!existingLawnCategory) {
      throw new HttpException('Lawn category not found', HttpStatus.NOT_FOUND);
    }

    // Parse existing images safely
    const existingImages: { url: string; publicId: string }[] = [];
    try {
      if (
        existingLawnCategory.images &&
        Array.isArray(existingLawnCategory.images)
      ) {
        existingImages.push(
          ...(existingLawnCategory.images as any[]).filter(
            (img): img is { url: string; publicId: string } =>
              img &&
              typeof img === 'object' &&
              typeof img.url === 'string' &&
              typeof img.publicId === 'string',
          ),
        );
      }
    } catch (error) {
      console.error('Error parsing existing images:', error);
    }

    // Get images to keep from frontend
    const frontendImagePublicIds: string[] = payload.existingimgs || [];

    // Determine removed images
    const removedImages = existingImages.filter(
      (img) => !frontendImagePublicIds.includes(img.publicId),
    );

    // Delete removed images from cloudinary
    for (const img of removedImages) {
      try {
        await this.cloudinaryService.removeFile(img.publicId);
      } catch (error: any) {
        console.error(
          `Failed to delete image from Cloudinary: ${error.message}`,
        );
        // Continue with other operations even if deletion fails
      }
    }

    // Upload new images
    const newUploadedImages: { url: string; publicId: string }[] = [];

    try {
      for (const file of files ?? []) {
        try {
          const uploaded = await this.cloudinaryService.uploadFile(file);
          newUploadedImages.push({
            url: uploaded.url,
            publicId: uploaded.public_id,
          });
        } catch (uploadError: any) {
          // Handle Cloudinary upload errors (same as create)
          if (
            uploadError.http_code === 400 &&
            uploadError.message?.includes('File size too large')
          ) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const maxSizeMB = (10 * 1024 * 1024) / (1024 * 1024);

            throw new HttpException(
              `File "${file.originalname}" is too large (${fileSizeMB}MB). Maximum allowed size is ${maxSizeMB}MB.`,
              HttpStatus.BAD_REQUEST,
            );
          } else if (uploadError.http_code) {
            throw new HttpException(
              `Failed to upload image "${file.originalname}": ${uploadError.message}`,
              HttpStatus.BAD_REQUEST,
            );
          } else {
            throw new HttpException(
              `Failed to upload image "${file.originalname}": ${uploadError.message || 'Unknown error'}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }
      }

      // Merge final images - keep existing ones that weren't removed, plus new ones
      const finalImages = [
        ...existingImages.filter((img) =>
          frontendImagePublicIds.includes(img.publicId),
        ),
        ...newUploadedImages,
      ];

      // Prepare update data
      const updateData: any = {
        images: finalImages,
      };

      // Only update category field if provided
      if (payload.category)
        updateData.category = capitalizeWords(payload.category);

      return await this.prismaService.lawnCategory.update({
        where: { id },
        data: updateData,
      });
    } catch (error: any) {
      // If any upload fails during update, clean up newly uploaded images
      if (newUploadedImages.length > 0) {
        await this.cleanupUploadedImages(newUploadedImages);
      }

      // Re-throw the error if it's already an HttpException
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle unexpected errors
      throw new HttpException(
        `Failed to update lawn category: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Add this helper method if it doesn't exist
  private async cleanupUploadedImages(
    images: { url: string; publicId: string }[],
  ) {
    for (const img of images) {
      try {
        await this.cloudinaryService.removeFile(img.publicId);
      } catch (error) {
        console.error(`Failed to cleanup image: ${img.publicId}`, error);
      }
    }
  }

  async deleteLawnCategory(catID: number) {
    // First, fetch the category to get its images
    const category = await this.prismaService.lawnCategory.findUnique({
      where: { id: catID },
    });

    if (!category) {
      throw new HttpException('Lawn category not found', HttpStatus.NOT_FOUND);
    }

    // Delete images from Cloudinary
    if (category.images && Array.isArray(category.images)) {
      for (const img of category.images as { publicId: string }[]) {
        if (img?.publicId) {
          try {
            await this.cloudinaryService.removeFile(img.publicId);
          } catch (error) {
            console.error(`Failed to delete image ${img.publicId}:`, error);
          }
        }
      }
    }

    // Delete the category
    return await this.prismaService.lawnCategory.delete({
      where: { id: catID },
    });
  }

  // ─────────────────────────── LAWNS ───────────────────────────

  private isCurrentlyOutOfOrder(outOfOrders: any[]): boolean {
    if (!outOfOrders || outOfOrders.length === 0) return false;

    const now = new Date();
    return outOfOrders.some(period => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      return start <= now && end >= now;
    });
  }

  async getLawnWithOutOfOrders(id: number) {
    const lawn = await this.prismaService.lawn.findUnique({
      where: { id },
      include: {
        lawnCategory: true,
        outOfOrders: {
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!lawn) return null;

    return {
      ...lawn,
      isOutOfService: this.isCurrentlyOutOfOrder(lawn.outOfOrders),
    };
  }
  async createLawn(payload: LawnDto) {
    // Parse out of order periods if provided
    let outOfOrderPeriodsData: any[] = [];
    if (payload.outOfOrders && Array.isArray(payload.outOfOrders)) {
      outOfOrderPeriodsData = payload.outOfOrders.map((period) => ({
        reason: period.reason,
        startDate: new Date(period.startDate),
        endDate: new Date(period.endDate),
      }));
    }

    // Check if lawn should be out of service based on current date
    const now = new Date();
    // Use inclusive check for "current" status: if today is start or end date, it's out of service
    const hasActiveOutOfOrder = outOfOrderPeriodsData.some(
      (period) => period.startDate <= now && period.endDate >= now,
    );

    return await this.prismaService.lawn.create({
      data: {
        lawnCategoryId: Number(payload.lawnCategoryId),
        description: payload.description?.trim() || 'Lawn',
        minGuests: Number(payload.minGuests) || 0,
        maxGuests: Number(payload.maxGuests) || 0,
        memberCharges: new Prisma.Decimal(payload.memberCharges || 0),
        guestCharges: new Prisma.Decimal(payload.guestCharges || 0),
        isActive: payload.isActive !== undefined ? (typeof payload.isActive === 'string' ? payload.isActive === 'true' : payload.isActive) : true,
        isOutOfService: hasActiveOutOfOrder,
        outOfOrders: {
          create: outOfOrderPeriodsData,
        },
      },
      include: {
        outOfOrders: true,
        lawnCategory: true,
      },
    });
  }

  async updateLawn(payload: Partial<LawnDto>) {
    if (!payload.id) {
      throw new HttpException('Lawn ID is required', HttpStatus.BAD_REQUEST);
    }

    const lawnId = Number(payload.id);
    const lawn = await this.prismaService.lawn.findUnique({
      where: { id: lawnId },
      include: {
        outOfOrders: true,
        reservations: true,
        bookings: true
      },
    });

    if (!lawn) {
      throw new HttpException('Lawn not found', HttpStatus.NOT_FOUND);
    }

    // Parse out of order periods from payload
    const newOutOfOrderPeriods = payload.outOfOrders || [];

    // Check for conflicts with existing reservations and bookings
    const now = new Date();

    for (const period of newOutOfOrderPeriods) {
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);

      // Check for conflicting reservations: Strict inequality allows "touching" dates
      const conflictingReservations = lawn.reservations.filter((reservation) => {
        const resStart = new Date(reservation.reservedFrom);
        const resEnd = new Date(reservation.reservedTo);
        return (startDate < resEnd && endDate > resStart);
      });

      // Check for conflicting bookings: Booking on endDate is allowed (checkout day)
      const conflictingBookings = lawn.bookings.filter((booking) => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate >= startDate && bookingDate < endDate;
      });

      if (conflictingReservations.length > 0 || conflictingBookings.length > 0) {
        throw new HttpException(
          `Cannot set lawn as out of order from ${startDate.toDateString()} to ${endDate.toDateString()}. Lawn has ${conflictingReservations.length} reservation(s) and ${conflictingBookings.length} booking(s) during this period.`,
          HttpStatus.CONFLICT,
        );
      }
    }

    // Determine if lawn should be out of service based on current date
    const hasActiveOutOfOrder = newOutOfOrderPeriods.some((period) => {
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);
      return startDate <= now && endDate >= now;
    });

    return await this.prismaService.$transaction(async (prisma) => {
      // Delete all existing out-of-order periods
      await prisma.lawnOutOfOrder.deleteMany({
        where: { lawnId },
      });

      // Update lawn with new data
      const updatedLawn = await prisma.lawn.update({
        where: { id: lawnId },
        data: {
          lawnCategoryId: payload.lawnCategoryId ? Number(payload.lawnCategoryId) : undefined,
          description: payload.description?.trim(),
          minGuests: payload.minGuests ? Number(payload.minGuests) : undefined,
          maxGuests: payload.maxGuests ? Number(payload.maxGuests) : undefined,
          memberCharges: payload.memberCharges ? new Prisma.Decimal(payload.memberCharges) : undefined,
          guestCharges: payload.guestCharges ? new Prisma.Decimal(payload.guestCharges) : undefined,
          isActive: payload.isActive !== undefined ? (typeof payload.isActive === 'string' ? payload.isActive === 'true' : payload.isActive) : undefined,
          isOutOfService: hasActiveOutOfOrder,
        },
      });

      // Create new out-of-order periods if any
      if (newOutOfOrderPeriods.length > 0) {
        await prisma.lawnOutOfOrder.createMany({
          data: newOutOfOrderPeriods.map((period) => ({
            lawnId,
            reason: period.reason,
            startDate: new Date(period.startDate),
            endDate: new Date(period.endDate),
          })),
        });
      }

      return this.getLawnWithOutOfOrders(lawnId);
    });
  }

  async getLawns() {
    return this.prismaService.lawn.findMany({
      include: {
        outOfOrders: { orderBy: { startDate: "asc" } },
        lawnCategory: { select: { id: true, category: true } },
        reservations: {
          include: {
            admin: { select: { id: true, name: true, email: true } }
          }
        },
        bookings: {
          include: {
            member: { select: { Name: true, Membership_No: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCalendarLawns() {
    return this.prismaService.lawn.findMany({
      include: {
        lawnCategory: { select: { id: true, category: true } },
        bookings: {
          include: {
            member: {
              select: { Name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteLawn(lawnID: number) {
    return await this.prismaService.lawn.delete({
      where: { id: lawnID },
    });
  }

  // ─────────────────────────── LAWN RESERVATIONS ───────────────────────────
  async reserveLawns(
    lawnIds: number[],
    reserve: boolean,
    adminId: string,
    timeSlot: string,
    reserveFrom?: string,
    reserveTo?: string,
  ) {
    console.log('reserveLawns called with:', { lawnIds, reserve, timeSlot, reserveFrom, reserveTo });

    // Check if any lawn is currently on hold
    const heldLawns = await this.prismaService.lawnHoldings.findMany({
      where: {
        lawnId: { in: lawnIds },
        onHold: true,
        holdExpiry: { gt: new Date() },
      },
      include: {
        lawn: { include: { lawnCategory: true } },
      },
    });

    if (heldLawns.length > 0) {
      const lawnNames = heldLawns
        .map((l) => `"${l.lawn.lawnCategory.category} - ${l.lawn.description}"`)
        .join(', ');
      throw new HttpException(
        `Lawn(s) ${lawnNames} is/are currently on hold`,
        HttpStatus.CONFLICT,
      );
    }

    if (reserve) {
      if (!reserveFrom || !reserveTo || !timeSlot) {
        throw new HttpException(
          'Reservation dates and time slot are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const validTimeSlots = ['MORNING', 'EVENING', 'NIGHT'];
      if (!validTimeSlots.includes(timeSlot)) {
        throw new HttpException(
          'Invalid time slot. Must be MORNING, EVENING, or NIGHT',
          HttpStatus.BAD_REQUEST,
        );
      }

      const fromDate = parsePakistanDate(reserveFrom);
      const toDate = parsePakistanDate(reserveTo);

      const setTimeToMidnightUTC = (date: Date) => {
        const d = new Date(date);
        d.setUTCHours(0, 0, 0, 0);
        return d;
      };

      const reservedFrom = setTimeToMidnightUTC(fromDate);
      const reservedTo = setTimeToMidnightUTC(toDate);

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const fromDateOnly = reservedFrom.getTime();
      const toDateOnly = reservedTo.getTime();

      if (fromDateOnly >= toDateOnly) {
        throw new HttpException(
          'Reservation end date must be after start date',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (fromDateOnly < today.getTime()) {
        throw new HttpException(
          'Reservation start date cannot be in the past',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.prismaService.$transaction(async (prisma) => {
        // Remove existing exact reservations if re-reserving
        await prisma.lawnReservation.deleteMany({
          where: {
            lawnId: { in: lawnIds },
            reservedFrom: reservedFrom,
            reservedTo: reservedTo,
            timeSlot: timeSlot,
          },
        });

        // Check for out-of-order conflicts
        const outOfOrderLawns = await prisma.lawn.findMany({
          where: {
            id: { in: lawnIds },
            outOfOrders: {
              some: {
                AND: [
                  { startDate: { lt: reservedTo } },
                  { endDate: { gt: reservedFrom } },
                ],
              },
            },
          },
          include: {
            outOfOrders: {
              where: {
                AND: [
                  { startDate: { lt: reservedTo } },
                  { endDate: { gt: reservedFrom } },
                ],
              },
            },
            lawnCategory: true,
          },
        });

        if (outOfOrderLawns.length > 0) {
          const conflicts = outOfOrderLawns.map((lawn: any) => {
            const conflictingPeriods = lawn.outOfOrders.map((p: any) =>
              `${new Date(p.startDate).toLocaleDateString()} to ${new Date(p.endDate).toLocaleDateString()}: ${p.reason}`
            ).join('; ');
            return `Lawn "${lawn.lawnCategory.category} - ${lawn.description}" has maintenance: ${conflictingPeriods}`;
          });
          throw new HttpException(
            `Maintenance conflicts: ${conflicts.join(', ')}`,
            HttpStatus.CONFLICT,
          );
        }

        // Check for booking conflicts
        const conflictingBookings = await prisma.lawnBooking.findMany({
          where: {
            lawnId: { in: lawnIds },
            bookingDate: {
              gte: reservedFrom,
              lt: reservedTo,
            },
            bookingTime: timeSlot as any,
          },
          include: { lawn: { include: { lawnCategory: true } } },
        });

        if (conflictingBookings.length > 0) {
          const conflicts = conflictingBookings.map(
            (b) =>
              `Lawn "${b.lawn.lawnCategory.category} - ${b.lawn.description}" booked on ${formatPakistanDate(b.bookingDate)} (${b.bookingTime})`,
          );
          throw new HttpException(
            `Booking conflicts: ${conflicts.join(', ')}`,
            HttpStatus.CONFLICT,
          );
        }

        // Check for other reservation conflicts
        const conflictingReservations = await prisma.lawnReservation.findMany({
          where: {
            lawnId: { in: lawnIds },
            reservedFrom: { lt: reservedTo },
            reservedTo: { gt: reservedFrom },
            timeSlot: timeSlot,
          },
          include: { lawn: { include: { lawnCategory: true } } },
        });

        if (conflictingReservations.length > 0) {
          const conflicts = conflictingReservations.map(
            (r) =>
              `Lawn "${r.lawn.lawnCategory.category} - ${r.lawn.description}" (${formatPakistanDate(r.reservedFrom)} - ${formatPakistanDate(r.reservedTo)}, ${r.timeSlot.toLowerCase()} slot)`,
          );
          throw new HttpException(
            `Reservation conflicts: ${conflicts.join(', ')}`,
            HttpStatus.CONFLICT,
          );
        }

        // Create reservations
        const reservations = lawnIds.map((lawnId) => ({
          lawnId,
          reservedFrom,
          reservedTo,
          reservedBy: Number(adminId),
          timeSlot,
        }));

        await prisma.lawnReservation.createMany({ data: reservations });

        await prisma.lawn.updateMany({
          where: { id: { in: lawnIds } },
          data: { isReserved: true },
        });

        return {
          message: `${lawnIds.length} lawn(s) reserved successfully for ${timeSlot.toLowerCase()} slot`,
          count: lawnIds.length,
          fromDate: reservedFrom.toISOString(),
          toDate: reservedTo.toISOString(),
          timeSlot,
        };
      });
    } else {
      // UNRESERVE LOGIC
      if (reserveFrom && reserveTo && timeSlot) {
        const fromDate = parsePakistanDate(reserveFrom);
        const toDate = parsePakistanDate(reserveTo);

        const setTimeToMidnightUTC = (date: Date) => {
          const d = new Date(date);
          d.setUTCHours(0, 0, 0, 0);
          return d;
        };

        const reservedFrom = setTimeToMidnightUTC(fromDate);
        const reservedTo = setTimeToMidnightUTC(toDate);

        console.log('Unreserve calculated dates (UTC):', {
          reservedFrom: reservedFrom.toISOString(),
          reservedTo: reservedTo.toISOString()
        });

        const result = await this.prismaService.lawnReservation.deleteMany({
          where: {
            lawnId: { in: lawnIds },
            reservedFrom,
            reservedTo,
            timeSlot,
          },
        });

        const now = new Date();
        now.setUTCHours(0, 0, 0, 0);

        for (const lawnId of lawnIds) {
          const hasUpcoming = await this.prismaService.lawnReservation.findFirst({
            where: {
              lawnId,
              reservedTo: { gte: now },
            },
          });

          await this.prismaService.lawn.update({
            where: { id: lawnId },
            data: { isReserved: !!hasUpcoming },
          });
        }

        return {
          message: `${result.count} reservation(s) removed for ${timeSlot.toLowerCase()} slot`,
          count: result.count,
        };
      } else {
        return {
          message: 'No reservations removed - please specify dates and time slot',
          count: 0,
        };
      }
    }
  }
}
