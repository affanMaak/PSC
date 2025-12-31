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
  ) { }

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
        roomType: true,
        outOfOrders: {
          orderBy: {
            startDate: 'asc',
          },
        },
        reservations: {
          include: {
            admin: true,
          },
          orderBy: {
            reservedFrom: 'asc',
          },
        },
        bookings: {
          orderBy: {
            checkIn: 'asc',
          },
        },
      },
      orderBy: {
        roomNumber: 'asc',
      },
    });
  }
  async getRoomCategories() {
    return await this.prismaService.roomType.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
  async getAvailRooms(roomTypeId: number) {
    return await this.prismaService.room.findMany({
      where: { roomTypeId, isActive: true },
      include: {
        roomType: true,
        outOfOrders: {
          orderBy: {
            startDate: 'asc',
          },
        },
        reservations: {
          include: {
            admin: true,
          },
          orderBy: {
            reservedFrom: 'asc',
          },
        },
        bookings: {
          orderBy: {
            checkIn: 'asc',
          },
        },
      },
      orderBy: {
        roomNumber: 'asc',
      },
    });
  }

  async createRoom(payload: RoomDto) {
    const room = await this.prismaService.room.create({
      data: {
        roomNumber: payload.roomNumber,
        roomTypeId: Number(payload.roomTypeId),
        description: payload.description,
        isActive: payload.isActive == 'true' || payload.isActive === true,
      },
    });

    // Create out-of-order periods if provided
    if (payload.outOfOrders && payload.outOfOrders.length > 0) {
      const outOfOrderData = payload.outOfOrders.map((oo) => ({
        roomId: room.id,
        reason: oo.reason,
        startDate: new Date(oo.startDate),
        endDate: new Date(oo.endDate),
      }));

      await this.prismaService.roomOutOfOrder.createMany({
        data: outOfOrderData,
      });
    }

    return room;
  }

  async updateRoom(payload: RoomDto) {
    if (!payload.id)
      throw new HttpException('Room ID is required', HttpStatus.BAD_REQUEST);

    const roomId = Number(payload.id);

    const existingRoom = await this.prismaService.room.findUnique({
      where: { id: roomId },
      include: {
        outOfOrders: true,
        bookings: true,
        reservations: true,
      },
    });

    if (!existingRoom)
      throw new HttpException('Room not found', HttpStatus.NOT_FOUND);

    // Validate new out-of-order periods
    if (payload.outOfOrders && payload.outOfOrders.length > 0) {
      for (const oo of payload.outOfOrders) {
        const startDate = new Date(oo.startDate);
        const endDate = new Date(oo.endDate);

        if (endDate < startDate) {
          throw new HttpException(
            'End date must be after start date',
            HttpStatus.BAD_REQUEST,
          );
        }

        // MODIFIED: Check for conflicting reservations
        // Allow checkout date to equal out-of-order start date
        const conflictingReservations =
          await this.prismaService.roomReservation.findMany({
            where: {
              roomId: roomId,
              OR: [
                {
                  // Reservation overlaps with out-of-order period
                  // MODIFIED: Allow checkout to equal start of out-of-order
                  reservedFrom: { lt: endDate }, // reservation starts before out-of-order ends
                  reservedTo: { gt: startDate }, // reservation ends after out-of-order starts
                },
              ],
            },
          });

        // MODIFIED: Check for conflicting bookings
        const conflictingBookings =
          await this.prismaService.roomBooking.findMany({
            where: {
              roomId: roomId,
              OR: [
                {
                  // Booking overlaps with out-of-order period
                  // MODIFIED: Allow checkout to equal start of out-of-order
                  checkIn: { lt: endDate }, // booking starts before out-of-order ends
                  checkOut: { gt: startDate }, // booking ends after out-of-order starts
                },
              ],
            },
          });

        // MODIFIED: Check for conflicting existing out-of-order periods
        const conflictingOutOfOrders =
          await this.prismaService.roomOutOfOrder.findMany({
            where: {
              roomId: roomId,
              NOT: { id: oo.id ? Number(oo.id) : undefined }, // Exclude current if updating
              OR: [
                {
                  // Out-of-order period overlaps with new period
                  // MODIFIED: Allow periods to touch but not overlap
                  startDate: { lt: endDate }, // existing starts before new ends
                  endDate: { gt: startDate }, // existing ends after new starts
                },
              ],
            },
          });

        // Filter out non-overlapping conflicts (just touching)
        const actualConflictingReservations = conflictingReservations.filter(
          (reservation) => {
            const resStart = new Date(reservation.reservedFrom);
            const resEnd = new Date(reservation.reservedTo);
            return resStart < endDate && resEnd > startDate;
          },
        );

        const actualConflictingBookings = conflictingBookings.filter(
          (booking) => {
            const bookStart = new Date(booking.checkIn);
            const bookEnd = new Date(booking.checkOut);
            return bookStart < endDate && bookEnd > startDate;
          },
        );

        const actualConflictingOutOfOrders = conflictingOutOfOrders.filter(
          (ooPeriod) => {
            const ooStart = new Date(ooPeriod.startDate);
            const ooEnd = new Date(ooPeriod.endDate);
            return ooStart < endDate && ooEnd > startDate;
          },
        );

        const conflicts = [
          ...actualConflictingReservations,
          ...actualConflictingBookings,
          ...actualConflictingOutOfOrders,
        ];

        if (conflicts.length > 0) {
          const conflictDetails: any[] = [];

          if (actualConflictingReservations.length > 0) {
            conflictDetails.push(
              `Reservations: ${actualConflictingReservations
                .map(
                  (r) =>
                    `${formatPakistanDate(r.reservedFrom)} to ${formatPakistanDate(r.reservedTo)}`,
                )
                .join(', ')}`,
            );
          }

          if (actualConflictingBookings.length > 0) {
            conflictDetails.push(
              `Bookings: ${actualConflictingBookings
                .map(
                  (b) =>
                    `${formatPakistanDate(b.checkIn)} to ${formatPakistanDate(b.checkOut)}`,
                )
                .join(', ')}`,
            );
          }

          if (actualConflictingOutOfOrders.length > 0) {
            conflictDetails.push(
              `Other out-of-order periods: ${actualConflictingOutOfOrders
                .map(
                  (oo) =>
                    `${formatPakistanDate(oo.startDate)} to ${formatPakistanDate(oo.endDate)}`,
                )
                .join(', ')}`,
            );
          }

          throw new HttpException(
            `Cannot set out-of-order period from ${formatPakistanDate(startDate)} to ${formatPakistanDate(endDate)}. Room has conflicts during this period. ${conflictDetails.join('; ')}`,
            HttpStatus.CONFLICT,
          );
        }
      }
    }

    // Update room basic info
    const updatedRoom = await this.prismaService.room.update({
      where: { id: roomId },
      data: {
        roomNumber: payload.roomNumber,
        roomTypeId: Number(payload.roomTypeId),
        description: payload.description,
        isActive: payload.isActive == 'true' || payload.isActive === true,
      },
      include: {
        outOfOrders: true,
      },
    });

    // Handle out-of-order periods
    if (payload.outOfOrders) {
      // Delete existing out-of-orders
      await this.prismaService.roomOutOfOrder.deleteMany({
        where: { roomId: roomId },
      });

      // Create new out-of-orders
      if (payload.outOfOrders.length > 0) {
        const outOfOrderData = payload.outOfOrders.map((oo) => ({
          roomId: roomId,
          reason: oo.reason,
          startDate: new Date(oo.startDate),
          endDate: new Date(oo.endDate),
        }));

        await this.prismaService.roomOutOfOrder.createMany({
          data: outOfOrderData,
        });
      }
    }

    return this.prismaService.room.findUnique({
      where: { id: roomId },
      include: {
        outOfOrders: true,
        roomType: true,
      },
    });
  }

  // helpers:
  async isRoomOutOfOrder(
    roomId: number,
    date: Date = new Date(),
  ): Promise<boolean> {
    const currentOutOfOrder = await this.prismaService.roomOutOfOrder.findFirst(
      {
        where: {
          roomId: roomId,
          startDate: { lte: date },
          endDate: { gte: date },
        },
      },
    );

    return !!currentOutOfOrder;
  }

  async getRoomOutOfOrderPeriods(roomId: number, fromDate: Date = new Date()) {
    return await this.prismaService.roomOutOfOrder.findMany({
      where: {
        roomId: roomId,
        endDate: { gte: fromDate },
      },
      orderBy: {
        startDate: 'asc',
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
    remarks?: string,
  ) {
    const heldRooms = await this.prismaService.roomHoldings.findMany({
      where: {
        roomId: { in: roomIds },
        onHold: true,
        holdExpiry: { gt: new Date() },
      },
      include: {
        room: { select: { roomNumber: true } },
      },
    });

    if (heldRooms.length > 0) {
      const roomNumbers = heldRooms
        .map((r) => `Room ${r.room.roomNumber}`)
        .join(', ');
      throw new HttpException(
        `${roomNumbers} is/are currently on hold`,
        HttpStatus.CONFLICT,
      );
    }

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

        // MODIFIED: Check for out-of-order conflicts
        // Allow checkout date to equal out-of-order start date (no overlap, just touching)
        const roomsWithOutOfOrderConflicts = await prisma.room.findMany({
          where: {
            id: { in: roomIds },
            outOfOrders: {
              some: {
                // Check if any out-of-order period overlaps with the reservation
                // MODIFIED: Use less-than for endDate comparison (allow equality for checkout)
                AND: [
                  { startDate: { lt: toDate } }, // out-of-order starts before reservation ends
                  { endDate: { gt: fromDate } }, // out-of-order ends after reservation starts
                ],
              },
            },
          },
          include: {
            outOfOrders: {
              where: {
                // MODIFIED: Same logic here
                AND: [
                  { startDate: { lt: toDate } }, // starts before reservation ends
                  { endDate: { gt: fromDate } }, // ends after reservation starts
                ],
              },
              orderBy: {
                startDate: 'asc',
              },
            },
          },
        });

        if (roomsWithOutOfOrderConflicts.length > 0) {
          const conflicts = roomsWithOutOfOrderConflicts
            .map((room) => {
              const conflictPeriods = room.outOfOrders
                .filter((oo) => {
                  // Filter to show only actual overlapping periods
                  const ooStart = new Date(oo.startDate);
                  const ooEnd = new Date(oo.endDate);
                  // Check for actual overlap (not just touching)
                  return ooStart < toDate && ooEnd > fromDate;
                })
                .map(
                  (oo) =>
                    `${formatPakistanDate(oo.startDate)} to ${formatPakistanDate(oo.endDate)}`,
                )
                .join(', ');

              return `Room ${room.roomNumber} has maintenance scheduled during selected dates (${conflictPeriods})`;
            })
            .filter((conflict) => !conflict.includes('()')); // Remove empty conflict messages

          if (conflicts.length > 0) {
            throw new HttpException(
              `Out of order conflicts: ${conflicts.join(', ')}`,
              HttpStatus.CONFLICT,
            );
          }
        }

        // MODIFIED: Check for booking conflicts
        const conflictingBookings = await prisma.roomBooking.findMany({
          where: {
            roomId: { in: roomIds },
            OR: [
              {
                // Booking starts during reservation period
                // Allow checkout date to equal check-in date of next booking
                checkIn: { lt: toDate }, // checkIn before reservation end (allow equal)
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

        // MODIFIED: Check for other reservation conflicts
        const conflictingReservations = await prisma.roomReservation.findMany({
          where: {
            roomId: { in: roomIds },
            AND: [
              {
                // Reservation overlaps with new reservation period
                // Allow checkout date to equal start of another reservation
                reservedFrom: { lt: toDate }, // existing reservation starts before new reservation ends
                reservedTo: { gt: fromDate }, // existing reservation ends after new reservation starts
              },
              // Exclude exact matches (already deleted above)
              {
                NOT: {
                  AND: [{ reservedFrom: fromDate }, { reservedTo: toDate }],
                },
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
          remarks: remarks || null,
        }));

        await prisma.roomReservation.createMany({ data: reservations });

        return {
          message: `${roomIds.length} room(s) reserved successfully`,
          count: roomIds.length,
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
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
    const from = new Date(fromDate);
    const to = new Date(toDate);

    // First, get all room IDs that have conflicts
    const [
      conflictingOutOfOrderRooms,
      conflictingReservationRooms,
      conflictingBookingRooms,
      heldRooms,
    ] = await Promise.all([
      // Rooms with out-of-order conflicts
      this.prismaService.roomOutOfOrder.findMany({
        where: {
          startDate: { lte: to },
          endDate: { gte: from },
        },
        select: { roomId: true },
        distinct: ['roomId'],
      }),

      // Rooms with reservation conflicts
      this.prismaService.roomReservation.findMany({
        where: {
          reservedFrom: { lt: to },
          reservedTo: { gt: from },
        },
        select: { roomId: true },
        distinct: ['roomId'],
      }),

      // Rooms with booking conflicts
      this.prismaService.roomBooking.findMany({
        where: {
          checkIn: { lt: to },
          checkOut: { gt: from },
        },
        select: { roomId: true },
        distinct: ['roomId'],
      }),

      // Rooms currently on hold
      this.prismaService.roomHoldings.findMany({
        where: {
          onHold: true,
          holdExpiry: { gt: new Date() }, // Active holds only
        },
        select: { roomId: true },
        distinct: ['roomId'],
      }),
    ]);

    // Combine all conflicting room IDs
    const allConflictingRoomIds = [
      ...conflictingOutOfOrderRooms.map((oo) => oo.roomId),
      ...conflictingReservationRooms.map((r) => r.roomId),
      ...conflictingBookingRooms.map((b) => b.roomId),
      ...heldRooms.map((h) => h.roomId), // Add held rooms to conflicts
    ];

    // Get unique conflicting room IDs
    const conflictingRoomIds = [...new Set(allConflictingRoomIds)];

    // Find available rooms (excluding conflicting ones)
    return await this.prismaService.room.findMany({
      where: {
        roomTypeId: roomType,
        isActive: true,
        id: {
          notIn: conflictingRoomIds,
        },
      },
      include: {
        roomType: true,
        outOfOrders: {
          where: {
            endDate: { gte: new Date() },
          },
          orderBy: {
            startDate: 'asc',
          },
        },
        holdings: {
          where: {
            onHold: true,
            holdExpiry: { gt: new Date() },
          },
        },
      },
      orderBy: {
        roomNumber: 'asc',
      },
    });
  }

  // calendar
  async roomCalendar() {
    return await this.prismaService.room.findMany({
      include: {
        reservations: true,
        bookings: true,
        roomType: true,
        outOfOrders: true,
      },
    });
  }

  async getRoomLogs(roomId: number, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const [reservations, bookings, outOfOrders] = await Promise.all([
      this.prismaService.roomReservation.findMany({
        where: {
          roomId,
          reservedFrom: { lt: toDate },
          reservedTo: { gt: fromDate },
        },
        include: { admin: { select: { name: true } } },
        orderBy: { reservedFrom: 'asc' },
      }),
      this.prismaService.roomBooking.findMany({
        where: {
          roomId,
          checkIn: { lt: toDate },
          checkOut: { gt: fromDate },
        },
        include: { member: { select: { Name: true, Membership_No: true } } },
        orderBy: { checkIn: 'asc' },
      }),
      this.prismaService.roomOutOfOrder.findMany({
        where: {
          roomId,
          startDate: { lt: toDate },
          endDate: { gt: fromDate },
        },
        orderBy: { startDate: 'asc' },
      }),
    ]);

    return {
      reservations,
      bookings,
      outOfOrders,
    };
  }
}
