import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { capitalizeWords } from 'src/utils/CapitalizeFirst';
import { RoomTypeDto } from './dtos/room-type.dto';
import { RoomDto } from './dtos/room.dto';

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
        reservations: true,
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
        outOfOrderTo: payload.outOfOrderUntil,
        outOfOrderFrom: new Date(),
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
    const outOfOrderTo = payload.outOfOrderUntil
      ? new Date(payload.outOfOrderUntil)
      : null;

    // Determine if room should be out of order now or scheduled for future
    const now = new Date();
    const shouldBeOutOfOrderNow =
      payload.isOutOfOrder && outOfOrderFrom && outOfOrderFrom <= now;
    const isScheduledForOutOfOrder =
      payload.isOutOfOrder && outOfOrderFrom && outOfOrderFrom > now;

    // If room is scheduled for future maintenance, keep it active
    // If room is currently out of order, make it inactive
    const shouldBeActive = !shouldBeOutOfOrderNow;

    return await this.prismaService.room.update({
      where: { id: roomId },
      data: {
        roomNumber: payload.roomNumber,
        roomTypeId: Number(payload.roomTypeId),
        description: payload.description,
        // Keep room active if it's only scheduled for future maintenance
        isActive: shouldBeActive,
        // Only set isOutOfOrder to true if the start date has arrived
        isOutOfOrder: Boolean(shouldBeOutOfOrderNow),
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
    reserveFrom?: string,
    reserveTo?: string,
  ) {
    // Validate dates if reserving
    if (reserve) {
      if (!reserveFrom || !reserveTo) {
        throw new HttpException(
          'Reservation dates are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Parse dates and set to start of day
      const fromDate = new Date(reserveFrom);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(reserveTo);
      toDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (fromDate >= toDate) {
        throw new HttpException(
          'Reservation end date must be after start date',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (fromDate < today) {
        throw new HttpException(
          'Reservation start date cannot be in the past',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (reserve) {
      // Parse and normalize dates to start of day
      const fromDate = new Date(reserveFrom!);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(reserveTo!);
      toDate.setHours(0, 0, 0, 0);

      // Check for booking conflicts
      const conflictingBookings = await this.prismaService.roomBooking.findMany(
        {
          where: {
            roomId: { in: roomIds },
            OR: [
              {
                // Booking starts during reservation period
                checkIn: { gte: fromDate, lt: toDate },
              },
              {
                // Booking ends during reservation period
                checkOut: { gt: fromDate, lte: toDate },
              },
              {
                // Booking spans the entire reservation period
                checkIn: { lte: fromDate },
                checkOut: { gte: toDate },
              },
            ],
          },
          include: { room: { select: { roomNumber: true } } },
        },
      );

      if (conflictingBookings.length > 0) {
        const conflicts = conflictingBookings.map(
          (conflict) =>
            `Room ${conflict.room.roomNumber} (${conflict.checkIn.toDateString()} - ${conflict.checkOut.toDateString()})`,
        );
        throw new HttpException(
          `Booking conflicts: ${conflicts.join(', ')}`,
          HttpStatus.CONFLICT,
        );
      }

      // Check for reservation conflicts
      const conflictingReservations =
        await this.prismaService.roomReservation.findMany({
          where: {
            roomId: { in: roomIds },
            OR: [
              {
                // Reservation starts during new reservation period
                reservedFrom: { gte: fromDate, lt: toDate },
              },
              {
                // Reservation ends during new reservation period
                reservedTo: { gt: fromDate, lte: toDate },
              },
              {
                // Reservation spans the entire new reservation period
                reservedFrom: { lte: fromDate },
                reservedTo: { gte: toDate },
              },
            ],
          },
          include: { room: { select: { roomNumber: true } } },
        });

      if (conflictingReservations.length > 0) {
        const conflicts = conflictingReservations.map(
          (reservation) =>
            `Room ${reservation.room.roomNumber} (${reservation.reservedFrom.toDateString()} - ${reservation.reservedTo.toDateString()})`,
        );
        throw new HttpException(
          `Reservation conflicts: ${conflicts.join(', ')}`,
          HttpStatus.CONFLICT,
        );
      }

      // Use transaction for atomic operations
      return await this.prismaService.$transaction(async (prisma) => {
        // Remove existing reservations for these exact dates
        await prisma.roomReservation.deleteMany({
          where: {
            roomId: { in: roomIds },
            reservedFrom: fromDate,
            reservedTo: toDate,
          },
        });

        // Create new reservations
        const reservations = roomIds.map((roomId) => ({
          roomId,
          reservedFrom: fromDate,
          reservedTo: toDate,
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
        const fromDate = new Date(reserveFrom);
        fromDate.setHours(0, 0, 0, 0);

        const toDate = new Date(reserveTo);
        toDate.setHours(0, 0, 0, 0);

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
}
