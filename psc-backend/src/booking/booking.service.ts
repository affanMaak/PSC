import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BookingDto } from './dtos/booking.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BookingType,
  PaymentMode,
  PaymentStatus,
  Prisma,
  VoucherStatus,
  VoucherType,
} from '@prisma/client';
import { getPakistanDate, parsePakistanDate } from 'src/utils/time';

@Injectable()
export class BookingService {
  constructor(private prismaService: PrismaService) {}
  async lock() {
    const bookings = await this.prismaService.roomBooking.findMany({
      where: {
        checkIn: {
          lte: new Date(),
        },
        checkOut: {
          gte: new Date(),
        },
      },
      select: { roomId: true },
    });

    const roomsTobeLocked = bookings.map((b) => b.roomId);
    return await this.prismaService.room.updateMany({
      where: { id: { in: roomsTobeLocked }, isBooked: false },
      data: { isBooked: true },
    });
  }

  // room booking
  async gBookingsRoom() {
    return await this.prismaService.roomBooking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        room: {
          select: {
            id: true,
            roomNumber: true,
            roomType: {
              select: { type: true, id: true },
            },
          },
        },
        member: {
          select: {
            Membership_No: true,
            Name: true,
            Balance: true,
          },
        },
      },
    });
  }

  async cBookingRoom(payload: BookingDto) {
    const {
      membershipNo,
      entityId,
      checkIn,
      checkOut,
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      paymentMode,
      numberOfAdults = 1,
      numberOfChildren = 0,
      specialRequests = '',
    } = payload;

    // ── 1. VALIDATE DATES ─────────────────────────────────────
    // Parse dates as Pakistan Time
    // console.log(checkIn, checkOut)
    const checkInDate = parsePakistanDate(checkIn!);
    const checkOutDate = parsePakistanDate(checkOut!);
    // console.log(checkInDate)
    // console.log(checkOutDate)

    // Normalize dates to start of day in PKT for comparison
    const normalizedCheckIn = new Date(checkInDate);
    normalizedCheckIn.setHours(0, 0, 0, 0);

    const now = getPakistanDate();
    now.setHours(0, 0, 0, 0);

    if (!checkIn || !checkOut || checkInDate >= checkOutDate)
      throw new ConflictException('Check-in must be before check-out');

    if (normalizedCheckIn < now)
      throw new ConflictException('Check-in date cannot be in the past');

    // ── 2. VALIDATE GUEST COUNT ───────────────────────────────
    if (numberOfAdults < 1) {
      throw new ConflictException('At least one adult is required');
    }
    if (numberOfAdults + numberOfChildren > 6) {
      throw new ConflictException(
        'Maximum room capacity exceeded (6 guests total)',
      );
    }

    // ── 3. VALIDATE ROOM ───────────────────────────────────────
    const room = await this.prismaService.room.findFirst({
      where: { id: Number(entityId) },
      include: {
        reservations: {
          where: {
            OR: [
              {
                reservedFrom: { gt: checkOutDate },
                reservedTo: { lt: checkInDate },
              },
            ],
          },
        },
      },
    });

    if (!room) throw new NotFoundException('Room not found');

    // Check if room is active
    // if (!room.isActive) {
    //   throw new ConflictException('Room is not active');
    // }
    // room is on hold
    if (room.onHold) {
      throw new ConflictException('Room is on hold');
    }

    // Check if room is currently out of order
    // if (room.isOutOfOrder) {
    //   throw new ConflictException(
    //     `Room is currently out of order${room.outOfOrderTo ? ` until ${room.outOfOrderTo.toLocaleDateString()}` : ''}`,
    //   );
    // }

    // Check if room is scheduled to be out of order during booking period
    if (room.outOfOrderFrom && room.outOfOrderTo) {
      const outOfOrderOverlap =
        checkInDate < room.outOfOrderTo && checkOutDate > room.outOfOrderFrom;

      if (outOfOrderOverlap) {
        throw new ConflictException(
          `Room is scheduled for maintenance from ${room.outOfOrderFrom.toLocaleDateString()} to ${room.outOfOrderTo.toLocaleDateString()}`,
        );
      }
    }

    // ── 4. CHECK FOR EXISTING RESERVATIONS ─────────────────────
    if (room.reservations.length > 0) {
      const reservation = room.reservations[0];
      throw new ConflictException(
        `Room has existing reservation from ${reservation.reservedFrom.toLocaleDateString()} to ${reservation.reservedTo.toLocaleDateString()}`,
      );
    }

    // ── 5. CHECK FOR BOOKING CONFLICTS ─────────────────────────
    const overlappingBooking = await this.prismaService.roomBooking.findFirst({
      where: {
        roomId: room.id,
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } },
        ],
      },
    });

    if (overlappingBooking) {
      throw new ConflictException(
        'Room is already booked for the selected dates',
      );
    }

    // ── 6. DETERMINE PAID / OWED AMOUNTS ───────────────────────
    const total = Number(totalPrice);
    let paid = 0;
    let owed = total;

    if (paymentStatus === (PaymentStatus.PAID as unknown)) {
      paid = total;
      owed = 0;
    } else if (paymentStatus === (PaymentStatus.HALF_PAID as unknown)) {
      paid = Number(paidAmount) || 0;
      if (paid <= 0)
        throw new ConflictException(
          'Paid amount must be greater than 0 for half-paid status',
        );
      if (paid >= total)
        throw new ConflictException(
          'Paid amount must be less than total for half-paid status',
        );
      owed = total - paid;
    } else {
      // UNPAID
      paid = 0;
      owed = total;
    }

    // ── 7. CREATE BOOKING ──────────────────────────────────────
    const booking = await this.prismaService.roomBooking.create({
      data: {
        Membership_No: membershipNo,
        roomId: room.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice: total,
        paymentStatus: paymentStatus as unknown as PaymentStatus,
        pricingType,
        paidAmount: paid,
        pendingAmount: owed,
        numberOfAdults,
        numberOfChildren,
        specialRequests,
      },
    });

    // ── 8. MARK ROOM AS BOOKED ONLY IF CHECK-IN STARTS NOW ─────
    if (checkInDate <= now && checkOutDate > now) {
      await this.prismaService.room.update({
        where: { id: room.id },
        data: { isBooked: true },
      });
    }

    // ── 9. UPDATE MEMBER LEDGER ────────────────────────────────
    await this.prismaService.member.update({
      where: { Membership_No: membershipNo },
      data: {
        totalBookings: { increment: 1 },
        lastBookingDate: now,
        drAmount: { increment: paid },
        crAmount: { increment: owed },
        Balance: { increment: paid - owed },
      },
    });

    // ── 10. CREATE PAYMENT VOUCHER (only if cash received) ─────
    if (paid > 0) {
      let voucherType: VoucherType | null = null;
      if (paymentStatus === (PaymentStatus.PAID as unknown))
        voucherType = VoucherType.FULL_PAYMENT;
      else if (paymentStatus === (PaymentStatus.HALF_PAID as unknown))
        voucherType = VoucherType.HALF_PAYMENT;

      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'ROOM',
          booking_id: booking.id,
          membership_no: membershipNo,
          amount: paid,
          payment_mode: paymentMode as unknown as PaymentMode,
          voucher_type: voucherType!,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'admin',
          remarks: `Room #${room.roomNumber} | ${checkInDate.toLocaleDateString()} → ${checkOutDate.toLocaleDateString()} | Adults: ${numberOfAdults}, Children: ${numberOfChildren}${specialRequests ? ` | Requests: ${specialRequests}` : ''}`,
        },
      });
    }

    return booking;
  }

  async cBookingRoomMember(payload: any) {
    const {
      membershipNo,
      entityId,
      checkIn,
      checkOut,
      totalPrice,
      paymentStatus = 'PAID',
      pricingType,
      paidAmount,
      paymentMode = 'ONLINE',
      numberOfAdults = 1,
      numberOfChildren = 0,
      specialRequests = '',
      selectedRoomIds,
    } = payload;

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (!checkIn || !checkOut || checkInDate >= checkOutDate) {
      throw new ConflictException('Check-in must be before check-out');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDateOnly = new Date(checkInDate);
    checkInDateOnly.setHours(0, 0, 0, 0);

    if (checkInDateOnly < today) {
      throw new ConflictException('Check-in date cannot be in the past');
    }

    // Validate guest count
    if (numberOfAdults < 1) {
      throw new ConflictException('At least one adult is required');
    }

    // Validate member
    const member = await this.prismaService.member.findUnique({
      where: { Membership_No: membershipNo.toString() },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Use transaction for atomic operations
    return await this.prismaService.$transaction(async (prisma) => {
      const bookings: any = [];

      // Get room type for pricing
      const roomType = await prisma.roomType.findFirst({
        where: { id: Number(entityId) },
      });

      if (!roomType) {
        throw new NotFoundException('Room type not found');
      }

      const pricePerNight =
        pricingType === 'member' ? roomType.priceMember : roomType.priceGuest;
      const nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const pricePerRoom = Number(pricePerNight) * nights;

      // Process each room
      for (const roomId of selectedRoomIds) {
        const room = await prisma.room.findFirst({
          where: { id: Number(roomId) },
        });

        if (!room) throw new NotFoundException(`Room ${roomId} not found`);

        // Check for booking conflicts
        const overlappingBooking = await prisma.roomBooking.findFirst({
          where: {
            roomId: room.id,
            AND: [
              { checkIn: { lt: checkOutDate } },
              { checkOut: { gt: checkInDate } },
            ],
          },
        });

        if (overlappingBooking) {
          throw new ConflictException(
            `Room ${room.roomNumber} is already booked for the selected dates`,
          );
        }

        // Calculate payment amounts
        const total = pricePerRoom;
        let paid = 0;
        let owed = total;

        if (paymentStatus === 'PAID') {
          paid = total;
          owed = 0;
        } else if (paymentStatus === 'HALF_PAID') {
          // Distribute paid amount across rooms
          const paidPerRoom =
            (Number(paidAmount) || 0) / selectedRoomIds.length;
          paid = paidPerRoom;
          owed = total - paid;
        }

        // Create booking
        const booking = await prisma.roomBooking.create({
          data: {
            Membership_No: membershipNo.toString(),
            roomId: room.id,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            totalPrice: total,
            paymentStatus: paymentStatus as any,
            pricingType,
            paidAmount: paid,
            pendingAmount: owed,
            numberOfAdults: numberOfAdults,
            numberOfChildren: numberOfChildren,
            specialRequests,
          },
          include: {
            room: {
              select: {
                roomNumber: true,
                roomType: {
                  select: {
                    type: true,
                  },
                },
              },
            },
          },
        });

        bookings.push(booking);

        // Update room status
        await prisma.room.update({
          where: { id: room.id },
          data: {
            onHold: false,
            holdExpiry: null,
            holdBy: null,
            isBooked: true,
          },
        });
      }

      // Update member ledger
      const totalPaid = Number(paidAmount) || Number(totalPrice);
      const totalOwed =
        paymentStatus === 'PAID' ? 0 : Number(totalPrice) - totalPaid;

      await prisma.member.update({
        where: { Membership_No: membershipNo.toString() },
        data: {
          totalBookings: { increment: selectedRoomIds.length },
          lastBookingDate: new Date(),
          drAmount: { increment: totalPaid },
          crAmount: { increment: totalOwed },
          Balance: { increment: totalPaid - totalOwed },
        },
      });
      if (totalPaid > 0) {
        let voucherType: VoucherType | null = null;
        if (paymentStatus === (PaymentStatus.PAID as unknown))
          voucherType = VoucherType.FULL_PAYMENT;
        else if (paymentStatus === (PaymentStatus.HALF_PAID as unknown))
          voucherType = VoucherType.HALF_PAYMENT;

        for (const booking of bookings) {
          await this.prismaService.paymentVoucher.create({
            data: {
              booking_type: 'ROOM',
              booking_id: booking.id,
              membership_no: membershipNo.toString(),
              amount: totalPaid,
              payment_mode: paymentMode as unknown as PaymentMode,
              voucher_type: voucherType!,
              status: VoucherStatus.CONFIRMED,
              issued_by: 'admin',
              remarks: `Room #${booking.room.roomNumber} | ${checkInDate.toLocaleDateString()} → ${checkOutDate.toLocaleDateString()} | Adults: ${numberOfAdults}, Children: ${numberOfChildren}${specialRequests ? ` | Requests: ${specialRequests}` : ''}`,
            },
          });
        }
      }

      return {
        success: true,
        message: `Successfully booked ${selectedRoomIds.length} room(s)`,
        bookings: bookings,
        totalAmount: Number(totalPrice),
        paidAmount: totalPaid,
        pendingAmount: totalOwed,
      };
    });
  }

  async uBookingRoom(payload: Partial<BookingDto>) {
    const {
      id,
      membershipNo,
      entityId,
      checkIn,
      checkOut,
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      paymentMode,
      numberOfAdults,
      numberOfChildren,
      specialRequests,
    } = payload;

    // ── 1. FETCH EXISTING BOOKING ─────────────────────────────
    const booking = await this.prismaService.roomBooking.findUnique({
      where: { id: Number(id) },
      include: {
        room: {
          include: {
            reservations: true,
          },
        },
      },
    });

    if (!booking) throw new UnprocessableEntityException('Booking not found');

    // ── 2. VALIDATE DATES ─────────────────────────────────────
    const newCheckIn = checkIn ? parsePakistanDate(checkIn) : booking.checkIn;
    const newCheckOut = checkOut
      ? parsePakistanDate(checkOut)
      : booking.checkOut;

    // Normalize dates to start of day in PKT for comparison
    const normalizedCheckIn = new Date(newCheckIn);
    normalizedCheckIn.setHours(0, 0, 0, 0);

    const now = getPakistanDate();
    now.setHours(0, 0, 0, 0);

    if (newCheckIn >= newCheckOut)
      throw new ConflictException('Check-in must be before check-out');

    if (normalizedCheckIn < now)
      throw new ConflictException('Check-in date cannot be in the past');

    // ── 3. VALIDATE GUEST COUNT ───────────────────────────────
    const newNumberOfAdults = numberOfAdults ?? booking.numberOfAdults;
    const newNumberOfChildren = numberOfChildren ?? booking.numberOfChildren;

    if (newNumberOfAdults < 1) {
      throw new ConflictException('At least one adult is required');
    }
    if (newNumberOfAdults + newNumberOfChildren > 6) {
      throw new ConflictException(
        'Maximum room capacity exceeded (6 guests total)',
      );
    }

    const newRoomId = entityId ? Number(entityId) : booking.roomId;

    // ── 4. VALIDATE ROOM ───────────────────────────────────────
    const room = await this.prismaService.room.findFirst({
      where: { id: newRoomId },
      include: {
        reservations: {
          where: {
            OR: [
              {
                reservedFrom: { lt: newCheckOut },
                reservedTo: { gt: newCheckIn },
              },
            ],
          },
        },
      },
    });

    if (!room) throw new NotFoundException('Room not found');

    // Check if room is active
    // if (!room.isActive) {
    //   throw new ConflictException('Room is not active');
    // }

    // room is on hold
    if (room.onHold) {
      throw new ConflictException('Room is on hold');
    }

    // Check if room is currently out of order
    // if (room.isOutOfOrder) {
    //   throw new ConflictException(
    //     `Room is currently out of order${room.outOfOrderTo ? ` until ${room.outOfOrderTo.toLocaleDateString()}` : ''}`,
    //   );
    // }

    // Check if room is scheduled to be out of order during booking period
    if (room.outOfOrderFrom && room.outOfOrderTo) {
      const outOfOrderOverlap =
        newCheckIn < room.outOfOrderTo && newCheckOut > room.outOfOrderFrom;

      if (outOfOrderOverlap) {
        throw new ConflictException(
          `Room is scheduled for maintenance from ${room.outOfOrderFrom.toLocaleDateString()} to ${room.outOfOrderTo.toLocaleDateString()}`,
        );
      }
    }

    // ── 5. CHECK FOR EXISTING RESERVATIONS ─────────────────────
    if (room.reservations.length > 0) {
      const reservation = room.reservations[0];
      throw new ConflictException(
        `Room has existing reservation from ${reservation.reservedFrom.toLocaleDateString()} to ${reservation.reservedTo.toLocaleDateString()}`,
      );
    }

    // ── 6. CHECK FOR BOOKING CONFLICTS (excluding current booking) ──
    const overlappingBooking = await this.prismaService.roomBooking.findFirst({
      where: {
        roomId: newRoomId,
        id: { not: booking.id }, // Exclude current booking
        AND: [
          { checkIn: { lt: newCheckOut } },
          { checkOut: { gt: newCheckIn } },
        ],
      },
    });

    if (overlappingBooking) {
      throw new ConflictException(
        'Room is already booked for the selected dates',
      );
    }

    // ── 7. DETERMINE PAID / OWED AMOUNTS ───────────────────────
    const newTotal =
      totalPrice !== undefined
        ? Number(totalPrice)
        : Number(booking.totalPrice);

    let newPaid = 0;
    let newOwed = newTotal;

    if (paymentStatus === (PaymentStatus.PAID as unknown)) {
      newPaid = newTotal;
      newOwed = 0;
    } else if (paymentStatus === (PaymentStatus.HALF_PAID as unknown)) {
      newPaid =
        paidAmount !== undefined
          ? Number(paidAmount)
          : Number(booking.paidAmount);

      if (newPaid <= 0)
        throw new ConflictException(
          'Paid amount must be greater than 0 for half-paid status',
        );
      if (newPaid >= newTotal)
        throw new ConflictException(
          'Paid amount must be less than total for half-paid status',
        );
      newOwed = newTotal - newPaid;
    } else {
      // UNPAID
      newPaid = 0;
      newOwed = newTotal;
    }

    const oldPaid = Number(booking.paidAmount);
    const oldOwed = Number(booking.pendingAmount);

    const paidDiff = newPaid - oldPaid;
    const owedDiff = newOwed - oldOwed;

    // ── 8. UPDATE BOOKING RECORD ──────────────────────────────
    const updated = await this.prismaService.roomBooking.update({
      where: { id: booking.id },
      data: {
        Membership_No: membershipNo ?? booking.Membership_No,
        roomId: newRoomId,
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        totalPrice: newTotal,
        paymentStatus:
          (paymentStatus as unknown as PaymentStatus) ?? booking.paymentStatus,
        pricingType: pricingType ?? booking.pricingType,
        paidAmount: newPaid,
        pendingAmount: newOwed,
        numberOfAdults: newNumberOfAdults,
        numberOfChildren: newNumberOfChildren,
        specialRequests: specialRequests ?? booking.specialRequests,
      },
    });

    // ── 9. UPDATE ROOM BOOKING STATE ──────────────────────────
    const roomUpdates: Promise<any>[] = [];

    // Mark new room as booked only if check-in starts now
    if (newCheckIn <= now && newCheckOut > now) {
      roomUpdates.push(
        this.prismaService.room.update({
          where: { id: newRoomId },
          data: { isBooked: true },
        }),
      );
    } else {
      roomUpdates.push(
        this.prismaService.room.update({
          where: { id: newRoomId },
          data: { isBooked: false },
        }),
      );
    }

    // If room changed, release the old one
    if (booking.roomId !== newRoomId) {
      roomUpdates.push(
        this.prismaService.room.update({
          where: { id: booking.roomId },
          data: { isBooked: false },
        }),
      );
    }

    await Promise.all(roomUpdates);

    // ── 10. UPDATE MEMBER LEDGER ──────────────────────────────
    if (paidDiff !== 0 || owedDiff !== 0) {
      await this.prismaService.member.update({
        where: { Membership_No: membershipNo ?? booking.Membership_No },
        data: {
          drAmount: { increment: paidDiff },
          crAmount: { increment: owedDiff },
          Balance: { increment: paidDiff - owedDiff },
          lastBookingDate: new Date(),
        },
      });
    }

    // ── 11. CREATE PAYMENT VOUCHER FOR ADDITIONAL PAYMENTS ────
    if (paidDiff > 0) {
      let voucherType: VoucherType | null = null;
      let voucherAmount = paidDiff;

      // Check if this is a final payment that completes the booking
      const remainingPaymentBeforeUpdate = Number(booking.pendingAmount);

      if (
        paymentStatus === (PaymentStatus.PAID as unknown) &&
        remainingPaymentBeforeUpdate > 0
      ) {
        // This is the final payment - use the actual remaining amount instead of paidDiff
        voucherAmount = remainingPaymentBeforeUpdate;
        voucherType = VoucherType.FULL_PAYMENT;
      } else if (paymentStatus === (PaymentStatus.HALF_PAID as unknown)) {
        voucherType = VoucherType.HALF_PAYMENT;
      }

      // Only create voucher if we have a valid type
      if (voucherType) {
        await this.prismaService.paymentVoucher.create({
          data: {
            booking_type: 'ROOM',
            booking_id: updated.id,
            membership_no: membershipNo ?? booking.Membership_No,
            amount: voucherAmount,
            payment_mode:
              (paymentMode as unknown as PaymentMode) ?? PaymentMode.CASH,
            voucher_type: voucherType,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'admin',
            remarks: `Room #${room.roomNumber} | ${paymentStatus === (PaymentStatus.PAID as unknown) && remainingPaymentBeforeUpdate > 0 ? 'Final payment' : 'Updated booking'} | ${newCheckIn.toLocaleDateString()} → ${newCheckOut.toLocaleDateString()} | Adults: ${newNumberOfAdults}, Children: ${newNumberOfChildren}${specialRequests ? ` | Requests: ${specialRequests}` : ''}`,
          },
        });
      }
    }

    return { ...updated, prevRoomId: booking.roomId };
  }

  async dBookingRoom(bookingId: number) {
    // delete booking
    const deleted = await this.prismaService.roomBooking.delete({
      where: { id: bookingId },
    });
    if (!deleted) throw HttpStatus.INTERNAL_SERVER_ERROR;
    // find room and activate
    await this.prismaService.room.update({
      where: { id: deleted?.roomId },
      data: {
        isBooked: false,
      },
    });
    return deleted;
  }

  // hall bookings
  async gBookingsHall() {
    return await this.prismaService.hallBooking.findMany({
      orderBy: {
        bookingDate: 'desc',
      },
      include: {
        hall: { select: { name: true } },
        member: {
          select: {
            Sno: true,
            Membership_No: true,
            Name: true,
            Balance: true,
          },
        },
      },
    });
  }

  async cBookingHall(payload: BookingDto) {
    const {
      membershipNo,
      entityId,
      bookingDate,
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      paymentMode,
      eventType,
      eventTime, // This should be the time slot (MORNING, EVENING, NIGHT)
    } = payload;
    console.log(bookingDate);

    // ── 1. VALIDATE REQUIRED FIELDS ─────────────────────────
    if (!membershipNo)
      throw new BadRequestException('Membership number is required');
    if (!entityId) throw new BadRequestException('Hall ID is required');
    if (!bookingDate) throw new BadRequestException('Booking date is required');
    if (!eventType) throw new BadRequestException('Event type is required');
    if (!eventTime) throw new BadRequestException('Event time is required');

    // ── 2. VALIDATE BOOKING DATE ────────────────────────────
    const today = new Date();
    const booking = new Date(bookingDate);

    if (booking < today) {
      throw new UnprocessableEntityException(
        'Booking date cannot be in the past',
      );
    }

    // ── 3. VALIDATE MEMBER ─────────────────────────────────
    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: membershipNo },
    });
    if (!member) throw new BadRequestException('Member not found');

    // ── 4. VALIDATE HALL ───────────────────────────────────
    const hall = await this.prismaService.hall.findFirst({
      where: { id: Number(entityId) },
    });
    if (!hall) throw new BadRequestException('Hall not found');

    // Check if hall is on hold
    if (hall.onHold) {
      throw new ConflictException('Hall is currently on hold');
    }

    // ── 5. VALIDATE EVENT TIME ─────────────────────────────
    const normalizedEventTime = eventTime.toUpperCase() as
      | 'MORNING'
      | 'EVENING'
      | 'NIGHT';
    const validEventTimes = ['MORNING', 'EVENING', 'NIGHT'];
    if (!validEventTimes.includes(normalizedEventTime)) {
      throw new BadRequestException(
        'Invalid event time. Must be MORNING, EVENING, or NIGHT',
      );
    }

    // ── 6. CHECK OUT OF SERVICE PERIODS ────────────────────
    if (hall.isOutOfService) {
      const outOfServiceFrom = hall.outOfServiceFrom
        ? new Date(hall.outOfServiceFrom)
        : null;
      const outOfServiceTo = hall.outOfServiceTo
        ? new Date(hall.outOfServiceTo)
        : null;

      if (outOfServiceFrom && outOfServiceTo) {
        // Check if booking date falls within out-of-service period
        if (booking >= outOfServiceFrom && booking <= outOfServiceTo) {
          throw new ConflictException(
            `Hall '${hall.name}' is out of service from ${outOfServiceFrom.toLocaleDateString()} to ${outOfServiceTo.toLocaleDateString()}`,
          );
        }
      } else if (hall.isOutOfService) {
        // Hall is marked out of service but no dates specified
        throw new ConflictException(
          `Hall '${hall.name}' is currently out of service`,
        );
      }
    }

    // Check for scheduled maintenance (future out-of-service)
    if (hall.outOfServiceFrom && hall.outOfServiceTo && !hall.isOutOfService) {
      const scheduledFrom = new Date(hall.outOfServiceFrom);
      if (
        booking >= scheduledFrom &&
        booking <= new Date(hall.outOfServiceTo)
      ) {
        throw new ConflictException(
          `Hall '${hall.name}' has scheduled maintenance starting from ${scheduledFrom.toLocaleDateString()}`,
        );
      }
    }

    // ── 7. ENHANCED TIMEFRAME CONFLICT CHECK ───────────────
    const conflictingBooking = await this.prismaService.hallBooking.findFirst({
      where: {
        hallId: hall.id,
        bookingDate: booking,
        bookingTime: normalizedEventTime, // Strict time slot check
      },
    });

    if (conflictingBooking) {
      const timeSlotMap = {
        MORNING: 'Morning (8 AM - 12 PM)',
        EVENING: 'Evening (4 PM - 8 PM)',
        NIGHT: 'Night (8 PM - 12 AM)',
      };

      throw new ConflictException(
        `Hall '${hall.name}' is already booked for ${booking.toLocaleDateString()} during ${timeSlotMap[normalizedEventTime]}`,
      );
    }

    // ── 8. CHECK FOR RESERVATIONS (FIXED: to date exclusive) ──────────────────────────
    const conflictingReservation =
      await this.prismaService.hallReservation.findFirst({
        where: {
          hallId: hall.id,
          // Booking date should be >= reservedFrom AND < reservedTo (to date exclusive)
          AND: [
            { reservedFrom: { lte: booking } }, // booking date is on or after reservedFrom
            { reservedTo: { gt: booking } }, // booking date is before reservedTo (exclusive)
          ],
          timeSlot: normalizedEventTime, // Strict time slot check
        },
      });

    if (conflictingReservation) {
      throw new ConflictException(
        `Hall '${hall.name}' is reserved from ${conflictingReservation.reservedFrom.toLocaleDateString()} to ${conflictingReservation.reservedTo.toLocaleDateString()} (${normalizedEventTime} time slot) - booking date conflicts with reservation period`,
      );
    }

    // ── 9. CALCULATE PRICE BASED ON PRICING TYPE ───────────
    const basePrice =
      pricingType === 'member' ? hall.chargesMembers : hall.chargesGuests;
    const total = totalPrice ? Number(totalPrice) : Number(basePrice);

    // ── 10. PAYMENT CALCULATIONS ────────────────────────────
    let paid = 0;
    let owed = total;

    if (paymentStatus === ('PAID' as any)) {
      paid = total;
      owed = 0;
    } else if (paymentStatus === ('HALF_PAID' as any)) {
      paid = Number(paidAmount) || 0;
      if (paid <= 0) {
        throw new ConflictException(
          'Paid amount must be greater than 0 for half-paid status',
        );
      }
      if (paid >= total) {
        throw new ConflictException(
          'Paid amount must be less than total price for half-paid status',
        );
      }
      owed = total - paid;
    }

    // ── 11. CREATE BOOKING ────────────────────────────────
    const booked = await this.prismaService.hallBooking.create({
      data: {
        memberId: member.Sno,
        hallId: hall.id,
        bookingDate: booking,
        totalPrice: total,
        paymentStatus: paymentStatus as any,
        pricingType,
        paidAmount: paid,
        pendingAmount: owed,
        eventType: eventType,
        bookingTime: normalizedEventTime, // Store the time slot
      },
    });

    // ── 12. UPDATE HALL STATUS IF BOOKING IS FOR TODAY ────
    const isToday =
      booking.getDate() === today.getDate() &&
      booking.getMonth() === today.getMonth() &&
      booking.getFullYear() === today.getFullYear();
    if (isToday) {
      await this.prismaService.hall.update({
        where: { id: hall.id },
        data: { isBooked: true },
      });
    }

    // ── 13. UPDATE MEMBER LEDGER ──────────────────────────
    await this.prismaService.member.update({
      where: { Membership_No: membershipNo },
      data: {
        totalBookings: { increment: 1 },
        lastBookingDate: new Date(),
        drAmount: { increment: paid },
        crAmount: { increment: owed },
        Balance: { increment: paid - owed },
      },
    });

    // ── 14. CREATE PAYMENT VOUCHER ────────────────────────
    if (paid > 0) {
      let voucherType: VoucherType;
      if (paymentStatus === ('PAID' as any)) {
        voucherType = VoucherType.FULL_PAYMENT;
      } else {
        voucherType = VoucherType.HALF_PAYMENT;
      }

      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'HALL',
          booking_id: booked.id,
          membership_no: membershipNo,
          amount: paid,
          payment_mode: paymentMode as any,
          voucher_type: voucherType,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'admin',
          remarks: `${hall.name} | ${booking.toLocaleDateString()} (${eventType}) - ${normalizedEventTime}`,
        },
      });
    }

    return booked;
  }
  async uBookingHall(payload: Partial<BookingDto>) {
    const {
      id,
      membershipNo,
      entityId,
      bookingDate,
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      paymentMode,
      eventType,
      eventTime,
    } = payload;

    // ── VALIDATE REQUIRED FIELDS ─────────────────────────
    if (!id) throw new BadRequestException('Booking ID is required');
    if (!membershipNo)
      throw new BadRequestException('Membership number is required');
    if (!entityId) throw new BadRequestException('Hall ID is required');
    if (!bookingDate) throw new BadRequestException('Booking date is required');
    if (!totalPrice) throw new BadRequestException('Total price is required');
    if (!eventType) throw new BadRequestException('Event type is required');
    if (!eventTime) throw new BadRequestException('Event time is required');
    if (!pricingType) throw new BadRequestException('Pricing type is required');

    // ── VALIDATE BOOKING DATE ────────────────────────────
    const today = new Date();
    const booking = new Date(bookingDate);

    if (booking < today) {
      throw new UnprocessableEntityException(
        'Booking date cannot be in the past',
      );
    }

    // ── FETCH EXISTING BOOKING ───────────────────────────
    const existing = await this.prismaService.hallBooking.findUnique({
      where: { id: Number(id) },
      include: { member: true, hall: true },
    });
    if (!existing) throw new NotFoundException('Booking not found');

    // ── VALIDATE MEMBER ─────────────────────────────────
    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: membershipNo },
    });
    if (!member) throw new BadRequestException('Member not found');

    // ── VALIDATE HALL ───────────────────────────────────
    const hall = await this.prismaService.hall.findFirst({
      where: { id: Number(entityId) },
    });
    if (!hall) throw new BadRequestException('Hall not found');

    // ── CHECK OUT OF SERVICE PERIODS ────────────────────
    if (hall.isOutOfService) {
      const outOfServiceFrom = hall.outOfServiceFrom
        ? new Date(hall.outOfServiceFrom)
        : null;
      const outOfServiceTo = hall.outOfServiceTo
        ? new Date(hall.outOfServiceTo)
        : null;

      if (outOfServiceFrom && outOfServiceTo) {
        // Check if booking date falls within out-of-service period
        if (booking >= outOfServiceFrom && booking <= outOfServiceTo) {
          throw new ConflictException(
            `Hall '${hall.name}' is out of service from ${outOfServiceFrom.toLocaleDateString()} to ${outOfServiceTo.toLocaleDateString()}`,
          );
        }
      } else if (hall.isOutOfService) {
        // Hall is marked out of service but no dates specified
        throw new ConflictException(
          `Hall '${hall.name}' is currently out of service`,
        );
      }
    }

    // Check for scheduled maintenance (future out-of-service)
    if (hall.outOfServiceFrom && hall.outOfServiceTo && !hall.isOutOfService) {
      const scheduledFrom = new Date(hall.outOfServiceFrom);
      if (
        booking >= scheduledFrom &&
        booking <= new Date(hall.outOfServiceTo)
      ) {
        throw new ConflictException(
          `Hall '${hall.name}' has scheduled maintenance starting from ${scheduledFrom.toLocaleDateString()}`,
        );
      }
    }

    // ── NORMALIZE EVENT TIME ────────────────────────────
    const normalizedEventTime = eventTime.toUpperCase() as
      | 'MORNING'
      | 'EVENING'
      | 'NIGHT';

    // ── CHECK HALL AVAILABILITY (excluding current booking) ──
    // Check if hall, date, or time slot has changed
    if (
      existing.hallId !== Number(entityId) ||
      existing.bookingDate.getTime() !== booking.getTime() ||
      existing.bookingTime !== normalizedEventTime
    ) {
      // Check for conflicting bookings
      const conflictingBooking = await this.prismaService.hallBooking.findFirst(
        {
          where: {
            hallId: Number(entityId),
            bookingDate: booking,
            bookingTime: normalizedEventTime, // Strict time slot check
            id: { not: Number(id) }, // Exclude current booking
          },
        },
      );

      if (conflictingBooking) {
        throw new ConflictException(
          `Hall '${hall.name}' is already booked for ${booking.toLocaleDateString()} during ${normalizedEventTime.toLowerCase()} time slot`,
        );
      }

      // Check for conflicting reservations (FIXED: to date exclusive)
      const conflictingReservation =
        await this.prismaService.hallReservation.findFirst({
          where: {
            hallId: Number(entityId),
            // Booking date should be >= reservedFrom AND < reservedTo (to date exclusive)
            AND: [
              { reservedFrom: { lte: booking } }, // booking date is on or after reservedFrom
              { reservedTo: { gt: booking } }, // booking date is before reservedTo (exclusive)
            ],
            timeSlot: normalizedEventTime, // Strict time slot check
          },
        });

      if (conflictingReservation) {
        throw new ConflictException(
          `Hall '${hall.name}' is reserved from ${conflictingReservation.reservedFrom.toLocaleDateString()} to ${conflictingReservation.reservedTo.toLocaleDateString()} (${normalizedEventTime} time slot) - booking date conflicts with reservation period`,
        );
      }
    }

    // ── PAYMENT CALCULATIONS ─────────────────────────────
    const total = Number(totalPrice);
    let paid = 0;
    let owed = total;

    if (paymentStatus === ('PAID' as any)) {
      paid = total;
      owed = 0;
    } else if (paymentStatus === ('HALF_PAID' as any)) {
      paid = Number(paidAmount) || 0;
      if (paid <= 0)
        throw new ConflictException(
          'Paid amount must be greater than 0 for half-paid status',
        );
      if (paid >= total)
        throw new ConflictException(
          'Paid amount must be less than total price for half-paid status',
        );
      owed = total - paid;
    } else if (paymentStatus === ('UNPAID' as any)) {
      paid = 0;
      owed = total;
    }

    // ── CALCULATE PAYMENT DIFFERENCES FOR LEDGER ─────────
    const prevPaid = Number(existing.paidAmount);
    const prevTotal = Number(existing.totalPrice);
    const prevOwed = prevTotal - prevPaid;

    const paidDiff = paid - prevPaid;
    const owedDiff = owed - prevOwed;

    // ── UPDATE HALL BOOKING ──────────────────────────────
    const updated = await this.prismaService.hallBooking.update({
      where: { id: Number(id) },
      data: {
        hallId: hall.id,
        memberId: member.Sno,
        bookingDate: booking,
        totalPrice: total,
        paymentStatus: paymentStatus as any,
        pricingType,
        paidAmount: paid,
        pendingAmount: owed,
        eventType: eventType,
        bookingTime: normalizedEventTime,
      },
    });

    // ── UPDATE HALL STATUS IF DATE CHANGED TO/FROM TODAY ─
    const isToday =
      booking.getDate() === today.getDate() &&
      booking.getMonth() === today.getMonth() &&
      booking.getFullYear() === today.getFullYear();
    const wasToday =
      existing.bookingDate.getDate() === today.getDate() &&
      existing.bookingDate.getMonth() === today.getMonth() &&
      existing.bookingDate.getFullYear() === today.getFullYear();

    if (isToday && !wasToday) {
      // Booking changed to today
      await this.prismaService.hall.update({
        where: { id: hall.id },
        data: { isBooked: true },
      });
    } else if (wasToday && !isToday) {
      // Booking changed from today
      await this.prismaService.hall.update({
        where: { id: hall.id },
        data: { isBooked: false },
      });
    }

    // ── UPDATE MEMBER LEDGER ─────────────────────────────
    if (paidDiff !== 0 || owedDiff !== 0) {
      await this.prismaService.member.update({
        where: { Membership_No: membershipNo },
        data: {
          drAmount: { increment: paidDiff },
          crAmount: { increment: owedDiff },
          Balance: { increment: paidDiff - owedDiff },
          lastBookingDate: new Date(),
        },
      });
    }

    // ── FIXED: UPDATE / CREATE PAYMENT VOUCHER LOGIC ─────
    if (paid > 0) {
      let voucherType: VoucherType;
      let voucherAmount = paid;

      // Calculate remaining payment before update
      const remainingPaymentBeforeUpdate = Number(existing.pendingAmount);

      // Check if this is a final payment that completes the booking
      if (
        paymentStatus === ('PAID' as any) &&
        remainingPaymentBeforeUpdate > 0
      ) {
        // This is the final payment - use the actual remaining amount instead of total paid
        voucherAmount = remainingPaymentBeforeUpdate;
      }

      if (paymentStatus === ('PAID' as any)) {
        voucherType = VoucherType.FULL_PAYMENT;
      } else {
        voucherType = VoucherType.HALF_PAYMENT;
      }

      const existingVoucher = await this.prismaService.paymentVoucher.findFirst(
        {
          where: {
            booking_type: 'HALL',
            booking_id: Number(id),
          },
        },
      );

      // Determine remarks based on payment type
      const isFinalPayment =
        paymentStatus === ('PAID' as any) && remainingPaymentBeforeUpdate > 0;
      const remarks = `${hall.name} | ${isFinalPayment ? 'Final payment' : 'Booking'} | ${booking.toLocaleDateString()} (${eventType}) - ${normalizedEventTime}`;

      if (existingVoucher) {
        await this.prismaService.paymentVoucher.update({
          where: { id: existingVoucher.id },
          data: {
            amount: voucherAmount,
            payment_mode: paymentMode as any,
            voucher_type: voucherType,
            remarks: remarks,
          },
        });
      } else {
        await this.prismaService.paymentVoucher.create({
          data: {
            booking_type: 'HALL',
            booking_id: updated.id,
            membership_no: membershipNo,
            amount: voucherAmount,
            payment_mode: paymentMode as any,
            voucher_type: voucherType,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'admin',
            remarks: remarks,
          },
        });
      }
    } else {
      // Delete voucher if payment is now unpaid
      await this.prismaService.paymentVoucher.deleteMany({
        where: {
          booking_type: 'HALL',
          booking_id: Number(id),
        },
      });
    }

    return updated;
  }

  async dBookingHall(bookingId: number) {
    return await this.prismaService.hallBooking.delete({
      where: { id: bookingId },
    });
  }

  // lawn booking
  async cBookingLawn(payload: BookingDto) {
    const {
      membershipNo,
      entityId,
      bookingDate,
      guestsCount,
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      paymentMode,
    } = payload;
    console.log(payload);

    // ── VALIDATE BOOKING DATE ───────────────────────────────
    const today = new Date();
    const booking = new Date(bookingDate!);
    if (!bookingDate || booking < today)
      throw new UnprocessableEntityException('Booking date is not valid');

    // ── VALIDATE MEMBER ─────────────────────────────────────
    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: membershipNo },
    });
    if (!member) throw new BadRequestException('Member must be selected');

    // ── VALIDATE LAWN ───────────────────────────────────────
    const lawn = await this.prismaService.lawn.findFirst({
      where: { id: Number(entityId) },
    });
    if (!lawn) throw new BadRequestException('Lawn must be specified');

    // ── CHECK DATE AVAILABILITY ─────────────────────────────
    const conflict = await this.prismaService.lawnBooking.findFirst({
      where: {
        lawnId: lawn.id,
        bookingDate: new Date(bookingDate),
      },
    });
    if (conflict)
      throw new ConflictException(
        `Lawn '${lawn.description}' is already booked for ${new Date(
          bookingDate,
        ).toLocaleDateString()}`,
      );

    // ── DETERMINE TOTAL, PAID & PENDING AMOUNTS ─────────────
    const total = Number(totalPrice);
    let paid = 0;
    let owed = total;

    if (paymentStatus === (PaymentStatus.PAID as unknown)) {
      paid = total;
    } else if (paymentStatus === (PaymentStatus.HALF_PAID as unknown)) {
      paid = Number(paidAmount) || 0;
      if (paid > total)
        throw new ConflictException('Paid amount cannot exceed total');
    }
    // UNPAID → paid = 0, owed = total

    // ── CREATE LAWN BOOKING ─────────────────────────────────
    const booked = await this.prismaService.lawnBooking.create({
      data: {
        memberId: member.Sno,
        lawnId: lawn.id,
        bookingDate: new Date(bookingDate),
        guestsCount: Number(guestsCount) || 0,
        totalPrice: total,
        paymentStatus: paymentStatus as any,
        pricingType,
        paidAmount: paid,
        pendingAmount: total - paid,
      },
    });

    // ── MARK LAWN AS BOOKED ─────────────────────────────────
    if (new Date(bookingDate) <= new Date()) {
      await this.prismaService.lawn.update({
        where: { id: lawn.id },
        data: { isBooked: true },
      });
    }

    // ── UPDATE MEMBER LEDGER ────────────────────────────────
    await this.prismaService.member.update({
      where: { Membership_No: membershipNo },
      data: {
        totalBookings: { increment: 1 },
        lastBookingDate: new Date(),

        // debit → money received
        drAmount: { increment: paid },

        // credit → money owed
        crAmount: { increment: owed },

        // balance = dr - cr
        Balance: { increment: paid - owed },
      },
    });

    // ── CREATE PAYMENT VOUCHER (if any cash received) ───────
    if (paid > 0) {
      let voucherType: VoucherType | null = null;
      if (paymentStatus === (PaymentStatus.PAID as unknown))
        voucherType = VoucherType.FULL_PAYMENT;
      else if (paymentStatus === (PaymentStatus.HALF_PAID as unknown))
        voucherType = VoucherType.HALF_PAYMENT;

      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'LAWN',
          booking_id: booked.id,
          membership_no: membershipNo,
          amount: paid,
          payment_mode: paymentMode as any,
          voucher_type: voucherType!,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'admin',
          remarks: `${lawn.description} | ${new Date(bookingDate).toLocaleDateString()}`,
        },
      });
    }

    return booked;
  }

  async uBookingLawn(payload: Partial<BookingDto>) {
    const {
      id,
      membershipNo,
      entityId,
      bookingDate,
      guestsCount,
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      pendingAmount,
    } = payload;

    // ── FETCH EXISTING BOOKING ──────────────────────────────
    const booking = await this.prismaService.lawnBooking.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        lawnId: true,
        totalPrice: true,
        paidAmount: true,
        pendingAmount: true,
        memberId: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    // ── VALIDATE LAWN ───────────────────────────────────────
    const newLawnId = entityId ? Number(entityId) : booking.lawnId;
    const lawn = await this.prismaService.lawn.findUnique({
      where: { id: newLawnId },
    });
    if (!lawn) throw new NotFoundException('Lawn not found');

    // ── CHECK DATE CONFLICT ─────────────────────────────────
    if (bookingDate) {
      const conflict = await this.prismaService.lawnBooking.findFirst({
        where: {
          lawnId: newLawnId,
          bookingDate: new Date(bookingDate),
          NOT: { id: booking.id },
        },
      });
      if (conflict)
        throw new ConflictException(
          `Lawn '${lawn.description}' is already booked for that date.`,
        );
    }

    // ── CALCULATE UPDATED PAYMENT ────────────────────────────
    const newTotal =
      totalPrice !== undefined
        ? Number(totalPrice)
        : Number(booking.totalPrice);
    let newPaid = 0;
    let newOwed = newTotal;

    if (paymentStatus === (PaymentStatus.PAID as unknown)) {
      newPaid = newTotal;
    } else if (paymentStatus === (PaymentStatus.HALF_PAID as unknown)) {
      newPaid =
        paidAmount !== undefined
          ? Number(paidAmount)
          : Number(booking.paidAmount);
      if (newPaid > newTotal)
        throw new ConflictException('Paid amount cannot exceed total');
    }

    const oldPaid = Number(booking.paidAmount);
    const oldOwed = Number(booking.totalPrice);
    const paidDiff = newPaid - oldPaid;
    const owedDiff = newOwed - oldOwed;

    // ── UPDATE BOOKING RECORD ───────────────────────────────
    const updated = await this.prismaService.lawnBooking.update({
      where: { id: booking.id },
      data: {
        memberId: membershipNo ? Number(membershipNo) : booking.memberId,
        lawnId: newLawnId,
        bookingDate: bookingDate ? new Date(bookingDate) : undefined,
        guestsCount: guestsCount ? Number(guestsCount) : undefined,
        totalPrice: totalPrice ? newTotal : undefined,
        paymentStatus: paymentStatus as any,
        pricingType,
        paidAmount: paidAmount ? newPaid : undefined,
        pendingAmount: newTotal - newPaid,
      },
    });

    // ── UPDATE LAWN BOOKED STATUS ───────────────────────────
    const lawnUpdates: Promise<any>[] = [];
    if (new Date(bookingDate!) <= new Date()) {
      lawnUpdates.push(
        this.prismaService.lawn.update({
          where: { id: newLawnId },
          data: { isBooked: true },
        }),
      );
    }
    if (booking.lawnId !== newLawnId) {
      lawnUpdates.push(
        this.prismaService.lawn.update({
          where: { id: booking.lawnId },
          data: { isBooked: false },
        }),
      );
    }
    await Promise.all(lawnUpdates);

    // ── UPDATE MEMBER LEDGER (if amounts changed) ────────────
    if (paidDiff !== 0 || owedDiff !== 0) {
      await this.prismaService.member.update({
        where: { Sno: booking.memberId },
        data: {
          drAmount: { increment: paidDiff },
          crAmount: { increment: owedDiff },
          Balance: { increment: paidDiff - owedDiff },
          lastBookingDate: new Date(),
        },
      });
    }

    return { ...updated, prevLawnId: booking.lawnId };
  }

  async gBookingsLawn() {
    return await this.prismaService.lawnBooking.findMany({
      orderBy: { bookingDate: 'desc' },
      include: { lawn: { select: { description: true } } },
    });
  }
  async dBookingLawn(bookingId) {}

  // photoshoot booking
  async cBookingPhotoshoot(payload: BookingDto) {}
  async uBookingPhotoshoot(payload: Partial<BookingDto>) {}
  async gBookingPhotoshoot() {}
  async dBookingPhotoshoot(bookingId) {}

  // vouchers
  async getVouchersByBooking(bookingType: string, bookingId: number) {
    return await this.prismaService.paymentVoucher.findMany({
      where: {
        booking_type: bookingType as BookingType,
        booking_id: bookingId,
      },

      orderBy: { issued_at: 'desc' },
    });
  }
}
