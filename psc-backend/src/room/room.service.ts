import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { capitalizeWords } from 'src/utils/CapitalizeFirst';
import { RoomTypeDto } from './dtos/room-type.dto';
import { RoomDto } from './dtos/room.dto';
import {
  formatPakistanDate,
  getPakistanDate,
  normalizeDate,
  parsePakistanDate,
} from 'src/utils/time';
import { normalize } from 'path';

@Injectable()
export class RoomService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // ─────────────────────────── ROOM TYPES ───────────────────────────

  async createRoomType(payload: RoomTypeDto, files: Express.Multer.File[]) {
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
      if (!payload.type || !payload.priceMember || !payload.priceGuest) {
        throw new HttpException(
          'Type, priceMember, and priceGuest are required fields',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Create room type
      return await this.prismaService.roomType.create({
        data: {
          type: capitalizeWords(payload.type),
          priceMember: Number(payload.priceMember),
          priceGuest: Number(payload.priceGuest),
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
        `Failed to create room type: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateRoomType(
    id: number,
    payload: Partial<RoomTypeDto>,
    files?: Express.Multer.File[],
  ) {
    // Fetch existing room type with images
    const existingRoomType = await this.prismaService.roomType.findUnique({
      where: { id },
    });

    if (!existingRoomType) {
      throw new HttpException('Room type not found', HttpStatus.NOT_FOUND);
    }

    // Parse existing images safely
    const existingImages: { url: string; publicId: string }[] = [];
    try {
      if (existingRoomType.images && Array.isArray(existingRoomType.images)) {
        existingImages.push(
          ...(existingRoomType.images as any[]).filter(
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

      // Only update these fields if they are provided
      if (payload.type) updateData.type = capitalizeWords(payload.type);
      if (payload.priceMember)
        updateData.priceMember = Number(payload.priceMember);
      if (payload.priceGuest)
        updateData.priceGuest = Number(payload.priceGuest);

      return await this.prismaService.roomType.update({
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
        `Failed to update room type: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Helper method to clean up uploaded images if operation fails
  private async cleanupUploadedImages(
    images: { url: string; publicId: string }[],
  ) {
    const cleanupPromises = images.map(async (img) => {
      try {
        await this.cloudinaryService.removeFile(img.publicId);
      } catch (error) {
        console.error(`Failed to cleanup image ${img.publicId}:`, error);
        // Continue with other cleanups even if one fails
      }
    });

    await Promise.allSettled(cleanupPromises);
  }

  async deleteRoomType(id: number) {
    return await this.prismaService.roomType.delete({
      where: { id },
    });
  }
  async getRoomTypes() {
    return await this.prismaService.roomType.findMany({
      orderBy: { priceGuest: 'asc' },
    });
  }

  // ─────────────────────────── ROOMS ───────────────────────────
  async getRooms() {
    return await this.prismaService.room.findMany({
      include: {
        roomType: {
          select: { type: true, priceMember: true, priceGuest: true },
        },
        reservations: {
          include: {
            admin: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async getRoomCategories() {
    return await this.prismaService.roomType.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
  async getAvailRooms(roomTypeId: number) {
    // console.log(roomTypeId);
    return await this.prismaService.room.findMany({
      where: { roomTypeId },
      include: {
        roomType: {
          select: { type: true, priceMember: true, priceGuest: true },
        },
        reservations: true,
        bookings: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRoom(payload: RoomDto) {
    return await this.prismaService.room.create({
      data: {
        roomNumber: payload.roomNumber,
        roomTypeId: Number(payload.roomTypeId),
        description: payload.description,
        isActive: payload.isActive == 'true' || payload.isActive === true,
        isOutOfOrder:
          payload.isOutOfOrder == 'true' || payload.isOutOfOrder === true,
        outOfOrderReason: payload.outOfOrderReason,
        outOfOrderTo: payload.outOfOrderTo,
        outOfOrderFrom: payload.outOfOrderFrom,
        // Remove images field
      },
    });
  }

  async updateRoom(payload: RoomDto) {
    if (!payload.id)
      throw new HttpException('Room ID is required', HttpStatus.BAD_REQUEST);

    const roomId = Number(payload.id);

    const existingRoom = await this.prismaService.room.findUnique({
      where: { id: roomId },
    });

    if (!existingRoom)
      throw new HttpException('Room not found', HttpStatus.NOT_FOUND);

    // Parse dates
    const outOfOrderFrom = payload.outOfOrderFrom
      ? new Date(payload.outOfOrderFrom)
      : null;
    const outOfOrderTo = payload.outOfOrderTo
      ? new Date(payload.outOfOrderTo)
      : null;

    // Check for reservation and booking conflicts only if setting out-of-order dates
    if (payload.isOutOfOrder && outOfOrderFrom && outOfOrderTo) {
      // Check for conflicting reservations
      const conflictingReservations =
        await this.prismaService.roomReservation.findMany({
          where: {
            roomId: roomId,
            OR: [
              {
                reservedFrom: { lte: outOfOrderTo },
                reservedTo: { gte: outOfOrderFrom },
              },
            ],
          },
        });

      // Check for conflicting bookings
      const conflictingBookings = await this.prismaService.roomBooking.findMany(
        {
          where: {
            roomId: roomId,
            OR: [
              {
                checkIn: { lte: outOfOrderTo },
                checkOut: { gte: outOfOrderFrom },
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
          `Cannot set room as out of order. Room has ${conflictMessages.join(' and ')} during the selected period.`,
          HttpStatus.CONFLICT,
        );
      }
    }

    // Determine if room should be out of order now or scheduled for future
    const now = new Date();
    const shouldBeOutOfOrderNow =
      payload.isOutOfOrder &&
      outOfOrderFrom &&
      outOfOrderFrom <= now &&
      outOfOrderTo &&
      outOfOrderTo >= now;
    const isScheduledForOutOfOrder =
      payload.isOutOfOrder && outOfOrderFrom && outOfOrderFrom > now;

    // Room should be active if:
    // - It's not out of order at all, OR
    // - It's only scheduled for future maintenance
    const shouldBeActive = !payload.isOutOfOrder || isScheduledForOutOfOrder;

    // Room should be marked as out of order only if it's currently out of order
    const shouldBeMarkedOutOfOrder = shouldBeOutOfOrderNow;

    return await this.prismaService.room.update({
      where: { id: roomId },
      data: {
        roomNumber: payload.roomNumber,
        roomTypeId: Number(payload.roomTypeId),
        description: payload.description,
        // Keep room active if it's only scheduled for future maintenance
        isActive: !!shouldBeActive,
        // Only set isOutOfOrder to true if it's currently out of order
        isOutOfOrder: !!shouldBeMarkedOutOfOrder,
        outOfOrderReason: payload.outOfOrderReason,
        outOfOrderFrom: outOfOrderFrom,
        outOfOrderTo: outOfOrderTo,
      },
    });
  }

  async deleteRoom(id: number) {
    return await this.prismaService.room.delete({ where: { id } });
  }

  async reserveRooms(
    roomIds: number[],
    reserve: boolean,
    adminId: string,
    reserveFrom?: string,
    reserveTo?: string,
  ) {
    const onhold = await this.prismaService.room.findFirst({
      where: {
        id: { in: roomIds },
        onHold: true,
      },
    });
    if (onhold)
      return new HttpException(
        'Room is currently on hold',
        HttpStatus.CONFLICT,
      );

    // Validate dates if reserving
    if (reserve) {
      if (!reserveFrom || !reserveTo) {
        throw new HttpException(
          'Reservation dates are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Parse dates as Pakistan Time (UTC+5)
      const fromDate = parsePakistanDate(reserveFrom);
      const toDate = parsePakistanDate(reserveTo);

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
        // Remove existing reservations for these exact dates FIRST
        await prisma.roomReservation.deleteMany({
          where: {
            roomId: { in: roomIds },
            reservedFrom: fromDate,
            reservedTo: toDate,
          },
        });

        // Now check for conflicts (excluding the ones we just deleted)
        const conflictingBookings = await prisma.roomBooking.findMany({
          where: {
            roomId: { in: roomIds },
            OR: [
              {
                // Booking starts during reservation period
                checkIn: { lt: toDate }, // checkIn before reservation end
                checkOut: { gt: fromDate }, // checkOut after reservation start
              },
            ],
          },
          include: { room: { select: { roomNumber: true } } },
        });

        if (conflictingBookings.length > 0) {
          const conflicts = conflictingBookings.map(
            (conflict) =>
              `Room ${conflict.room.roomNumber} (${formatPakistanDate(conflict.checkIn)} - ${formatPakistanDate(conflict.checkOut)})`,
          );
          throw new HttpException(
            `Booking conflicts: ${conflicts.join(', ')}`,
            HttpStatus.CONFLICT,
          );
        }

        // Check for other reservation conflicts (excluding the ones we just deleted)
        const conflictingReservations = await prisma.roomReservation.findMany({
          where: {
            roomId: { in: roomIds },
            OR: [
              {
                // Reservation overlaps with new reservation period
                reservedFrom: { lt: toDate }, // existing reservation starts before new reservation ends
                reservedTo: { gt: fromDate }, // existing reservation ends after new reservation starts
              },
            ],
          },
          include: { room: { select: { roomNumber: true } } },
        });

        if (conflictingReservations.length > 0) {
          const conflicts = conflictingReservations.map(
            (reservation) =>
              `Room ${reservation.room.roomNumber} (${formatPakistanDate(reservation.reservedFrom)} - ${formatPakistanDate(reservation.reservedTo)})`,
          );
          throw new HttpException(
            `Reservation conflicts: ${conflicts.join(', ')}`,
            HttpStatus.CONFLICT,
          );
        }

        // Create new reservations
        const reservations = roomIds.map((roomId) => ({
          roomId,
          reservedFrom: fromDate,
          reservedTo: toDate,
          reservedBy: Number(adminId),
        }));

        await prisma.roomReservation.createMany({ data: reservations });

        return {
          message: `${roomIds.length} room(s) reserved successfully`,
          count: roomIds.length,
        };
      });
    } else {
      // UNRESERVE LOGIC - only remove reservations for exact dates
      if (reserveFrom && reserveTo) {
        const fromDate = parsePakistanDate(reserveFrom);
        const toDate = parsePakistanDate(reserveTo);

        // Only delete reservations that exactly match the provided dates
        const result = await this.prismaService.roomReservation.deleteMany({
          where: {
            roomId: { in: roomIds },
            reservedFrom: fromDate,
            reservedTo: toDate,
          },
        });

        return {
          message: `${result.count} reservation(s) removed for the specified dates`,
          count: result.count,
        };
      } else {
        // If no specific dates provided, don't remove any reservations
        return {
          message: `No reservations removed - please specify dates to remove specific reservations`,
          count: 0,
        };
      }
    }
  }

  // member rooms //
  async getMemberRoomsForDate(
    fromDate: string,
    toDate: string,
    roomType: number,
  ) {
    const typeExists = await this.prismaService.roomType.findFirst({
      where: { id: roomType },
    });
    if (!typeExists) return new NotFoundException(`room type not found`);

    // Parse dates as Pakistan Time
    // console.log('Searching for rooms from:', fromDate, 'to:', toDate);
    const from = new Date(fromDate);
    const to = new Date(toDate);
    // console.log('Parsed dates:', from, to);

    return await this.prismaService.room.findMany({
      where: {
        roomTypeId: roomType,
        onHold: false,

        // Exclude rooms that are out of order during the requested period
        OR: [
          { isOutOfOrder: false },
          {
            // Room is out of order but NOT during our requested dates
            AND: [
              { isOutOfOrder: true },
              {
                OR: [
                  { outOfOrderFrom: { gt: to } }, // Out of order starts after our period ends
                  { outOfOrderTo: { lt: from } }, // Out of order ends before our period starts
                ],
              },
            ],
          },
        ],

        // No reservations overlapping with our dates (exclusive end date for reservations)
        reservations: {
          none: {
            AND: [
              { reservedFrom: { lt: to } }, // Reservation starts before our period ends
              { reservedTo: { gt: from } }, // Reservation ends after our period starts
            ],
          },
        },

        // No bookings overlapping with our dates (exclusive end date for bookings)
        bookings: {
          none: {
            AND: [
              { checkIn: { lt: to } }, // Booking starts before our period ends
              { checkOut: { gt: from } }, // Booking ends after our period starts
            ],
          },
        },
      },
    });
  }
}
