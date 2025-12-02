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
  BookingOpt,
  BookingType,
  PaymentMode,
  PaymentStatus,
  Prisma,
  VoucherStatus,
  VoucherType,
} from '@prisma/client';
import {
  formatPakistanDate,
  getPakistanDate,
  parsePakistanDate,
} from 'src/utils/time';
import { stringify } from 'querystring';

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
            outOfOrders: true,
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
      paidBy = 'MEMBER',
      guestContact,
      guestName,
    } = payload;

    // ── 1. VALIDATE DATES ─────────────────────────────────────
    // Parse dates as Pakistan Time
    const checkInDate = parsePakistanDate(checkIn!);
    const checkOutDate = parsePakistanDate(checkOut!);

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
                reservedFrom: { lt: checkOutDate },
                reservedTo: { gt: checkInDate },
              },
            ],
          },
        },
        outOfOrders: true, // Include out-of-order periods
      },
    });

    if (!room) throw new NotFoundException('Room not found');

    // Check if room is active
    if (!room.isActive) {
      throw new ConflictException('Room is not active');
    }

    // room is on hold
    // if (room.onHold) {
    //   throw new ConflictException('Room is on hold');
    // }

    // Check if room has any out-of-order periods during booking period
    const hasOutOfOrderConflict = room.outOfOrders.some((oo) => {
      return checkInDate <= oo.endDate && checkOutDate >= oo.startDate;
    });

    if (hasOutOfOrderConflict) {
      const conflictingPeriods = room.outOfOrders
        .filter(
          (oo) => checkInDate <= oo.endDate && checkOutDate >= oo.startDate,
        )
        .map(
          (oo) =>
            `${formatPakistanDate(oo.startDate)} to ${formatPakistanDate(oo.endDate)}`,
        )
        .join(', ');

      throw new ConflictException(
        `Room is scheduled for maintenance during the selected dates: ${conflictingPeriods}`,
      );
    }

    // ── 4. CHECK FOR EXISTING RESERVATIONS ─────────────────────
    if (room.reservations.length > 0) {
      const reservation = room.reservations[0];
      throw new ConflictException(
        `Room has existing reservation from ${formatPakistanDate(reservation.reservedFrom)} to ${formatPakistanDate(reservation.reservedTo)}`,
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
        paidBy,
        guestName,
        guestContact: guestContact?.toString(),
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
          remarks: `Room #${room.roomNumber} | ${formatPakistanDate(checkInDate)} → ${formatPakistanDate(checkOutDate)} | Adults: ${numberOfAdults}, Children: ${numberOfChildren}${specialRequests ? ` | Requests: ${specialRequests}` : ''}`,
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
      paidBy = 'MEMBER',
      guestContact,
      guestName,
    } = payload;

    // Validate dates
    const checkInDate = parsePakistanDate(checkIn);
    const checkOutDate = parsePakistanDate(checkOut);

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
          include: {
            outOfOrders: true, // Include out-of-order periods
          },
        });

        if (!room) throw new NotFoundException(`Room ${roomId} not found`);

        // Check if room is active
        if (!room.isActive) {
          throw new ConflictException(`Room ${room.roomNumber} is not active`);
        }

        // Check for out-of-order conflicts
        const hasOutOfOrderConflict = room.outOfOrders.some((oo) => {
          return checkInDate < oo.endDate && checkOutDate > oo.startDate;
        });

        if (hasOutOfOrderConflict) {
          const conflictingPeriods = room.outOfOrders
            .filter(
              (oo) => checkInDate < oo.endDate && checkOutDate > oo.startDate,
            )
            .map(
              (oo) =>
                `${formatPakistanDate(oo.startDate)} to ${formatPakistanDate(oo.endDate)}`,
            )
            .join(', ');

          throw new ConflictException(
            `Room ${room.roomNumber} has maintenance scheduled during selected dates: ${conflictingPeriods}`,
          );
        }

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
            paidBy,
            guestName,
            guestContact: guestContact?.toString(),
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

      // Create payment vouchers
      if (totalPaid > 0) {
        let voucherType: VoucherType | null = null;
        if (paymentStatus === 'PAID') voucherType = VoucherType.FULL_PAYMENT;
        else if (paymentStatus === 'HALF_PAID')
          voucherType = VoucherType.HALF_PAYMENT;

        for (const booking of bookings) {
          await this.prismaService.paymentVoucher.create({
            data: {
              booking_type: 'ROOM',
              booking_id: booking.id,
              membership_no: membershipNo.toString(),
              amount: totalPaid / bookings.length, // Distribute amount across vouchers
              payment_mode: paymentMode as unknown as PaymentMode,
              voucher_type: voucherType!,
              status: VoucherStatus.CONFIRMED,
              issued_by: 'admin',
              remarks: `Room #${booking.room.roomNumber} | ${formatPakistanDate(checkInDate)} → ${formatPakistanDate(checkOutDate)} | Adults: ${numberOfAdults}, Children: ${numberOfChildren}${specialRequests ? ` | Requests: ${specialRequests}` : ''}`,
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
      paidBy = 'MEMBER',
      guestContact,
      guestName,
    } = payload;

    // ── 1. FETCH EXISTING BOOKING ─────────────────────────────
    const booking = await this.prismaService.roomBooking.findUnique({
      where: { id: Number(id) },
      include: {
        room: {
          include: {
            reservations: true,
            outOfOrders: true, // Include out-of-order periods
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
        outOfOrders: true, // Include out-of-order periods
      },
    });

    if (!room) throw new NotFoundException('Room not found');

    // Check if room is active
    if (!room.isActive) {
      throw new ConflictException('Room is not active');
    }

    // room is on hold
    // if (room.onHold) {
    //   throw new ConflictException('Room is on hold');
    // }

    // Check for out-of-order conflicts
    const hasOutOfOrderConflict = room.outOfOrders.some((oo) => {
      return newCheckIn < oo.endDate && newCheckOut > oo.startDate;
    });

    if (hasOutOfOrderConflict) {
      const conflictingPeriods = room.outOfOrders
        .filter((oo) => newCheckIn < oo.endDate && newCheckOut > oo.startDate)
        .map(
          (oo) =>
            `${formatPakistanDate(oo.startDate)} to ${formatPakistanDate(oo.endDate)}`,
        )
        .join(', ');

      throw new ConflictException(
        `Room is scheduled for maintenance during the selected dates: ${conflictingPeriods}`,
      );
    }

    // ── 5. CHECK FOR EXISTING RESERVATIONS ─────────────────────
    if (room.reservations.length > 0) {
      const reservation = room.reservations[0];
      throw new ConflictException(
        `Room has existing reservation from ${formatPakistanDate(reservation.reservedFrom)} to ${formatPakistanDate(reservation.reservedTo)}`,
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
    const oldOwed = Number(booking.pendingAmount!);

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
        paidBy,
        guestName,
        guestContact: guestContact?.toString(),
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
      const remainingPaymentBeforeUpdate = Number(booking.pendingAmount!);

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
            remarks: `Room #${room.roomNumber} | ${paymentStatus === (PaymentStatus.PAID as unknown) && remainingPaymentBeforeUpdate > 0 ? 'Final payment' : 'Updated booking'} | ${formatPakistanDate(newCheckIn)} → ${formatPakistanDate(newCheckOut)} | Adults: ${newNumberOfAdults}, Children: ${newNumberOfChildren}${specialRequests ? ` | Requests: ${specialRequests}` : ''}`,
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

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  // hall bookings
  async gBookingsHall() {
    return await this.prismaService.hallBooking.findMany({
      orderBy: {
        bookingDate: 'desc',
      },
      include: {
        hall: {
          select: {
            name: true,
            outOfOrders: {
              orderBy: {
                startDate: 'asc',
              },
            },
          },
        },
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
      numberOfGuests,
      eventTime,
      paidBy,
      guestName,
      guestContact,
    } = payload;

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

    const todayNormalized = new Date(today);
    todayNormalized.setHours(0, 0, 0, 0);

    if (booking < todayNormalized) {
      throw new UnprocessableEntityException(
        'Booking date cannot be in the past',
      );
    }

    // ── 3. VALIDATE MEMBER ─────────────────────────────────
    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: membershipNo },
    });
    if (!member) throw new BadRequestException('Member not found');

    // Use transaction for atomic operations
    return await this.prismaService.$transaction(async (prisma) => {
      // ── 4. VALIDATE HALL WITH OUT-OF-ORDER PERIODS ────────
      const hall = await prisma.hall.findFirst({
        where: { id: Number(entityId) },
        include: {
          outOfOrders: true,
        },
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

      // ── 6. CHECK OUT-OF-ORDER PERIODS ─────────────────────
      // Check for conflicts with out-of-order periods
      const conflictingOutOfOrder = hall.outOfOrders?.find((period) => {
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setHours(0, 0, 0, 0);

        return booking >= periodStart && booking <= periodEnd;
      });

      if (conflictingOutOfOrder) {
        const startDate = new Date(conflictingOutOfOrder.startDate);
        const endDate = new Date(conflictingOutOfOrder.endDate);

        throw new ConflictException(
          `Hall '${hall.name}' is out of order from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}: ${conflictingOutOfOrder.reason}`,
        );
      }

      // Check if hall is currently out of order (active period)
      const now = new Date();
      const isCurrentlyOutOfOrder = hall.outOfOrders?.some((period) => {
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);
        return now >= periodStart && now <= periodEnd;
      });

      // If hall is currently out of order and not active
      if (isCurrentlyOutOfOrder && !hall.isActive) {
        throw new ConflictException(
          `Hall '${hall.name}' is currently out of order`,
        );
      }

      // ── 7. CHECK FOR EXISTING BOOKINGS ────────────────────
      const conflictingBooking = await prisma.hallBooking.findFirst({
        where: {
          hallId: hall.id,
          bookingDate: booking,
          bookingTime: normalizedEventTime,
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

      // ── 8. CHECK FOR RESERVATIONS ─────────────────────────
      const conflictingReservation = await prisma.hallReservation.findFirst({
        where: {
          hallId: hall.id,
          AND: [
            { reservedFrom: { lte: booking } },
            { reservedTo: { gt: booking } },
          ],
          timeSlot: normalizedEventTime,
        },
      });

      if (conflictingReservation) {
        throw new ConflictException(
          `Hall '${hall.name}' is reserved from ${conflictingReservation.reservedFrom.toLocaleDateString()} to ${conflictingReservation.reservedTo.toLocaleDateString()} (${normalizedEventTime} time slot)`,
        );
      }

      // ── 9. CALCULATE PRICE ────────────────────────────────
      const basePrice =
        pricingType === 'member' ? hall.chargesMembers : hall.chargesGuests;
      const total = totalPrice ? Number(totalPrice) : Number(basePrice);

      // ── 10. PAYMENT CALCULATIONS ───────────────────────────
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
      const booked = await prisma.hallBooking.create({
        data: {
          memberId: member.Sno,
          hallId: hall.id,
          bookingDate: booking,
          totalPrice: total,
          paymentStatus: paymentStatus as any,
          pricingType,
          numberOfGuests: Number(numberOfGuests!),
          paidAmount: paid,
          pendingAmount: owed,
          eventType: eventType,
          bookingTime: normalizedEventTime,
          paidBy,
          guestName,
          guestContact: guestContact?.toString(),
        },
      });

      // ── 12. UPDATE HALL STATUS ────────────────────────────
      const isToday = booking.getTime() === todayNormalized.getTime();
      if (isToday) {
        await prisma.hall.update({
          where: { id: hall.id },
          data: { isBooked: true },
        });
      }

      // ── 13. UPDATE MEMBER LEDGER ──────────────────────────
      await prisma.member.update({
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

        await prisma.paymentVoucher.create({
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
    });
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
      numberOfGuests,
      paidBy,
      guestName,
      guestContact,
    } = payload;
    console.log(paidBy);
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

    const todayNormalized = new Date(today);
    todayNormalized.setHours(0, 0, 0, 0);

    // if (booking < todayNormalized) {
    //   throw new UnprocessableEntityException(
    //     'Booking date cannot be in the past',
    //   );
    // }

    // ── FETCH EXISTING BOOKING ───────────────────────────
    const existing = await this.prismaService.hallBooking.findUnique({
      where: { id: Number(id) },
      include: {
        member: true,
        hall: {
          include: {
            outOfOrders: true,
          },
        },
      },
    });
    if (!existing) throw new NotFoundException('Booking not found');

    // ── VALIDATE MEMBER ─────────────────────────────────
    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: membershipNo },
    });
    if (!member) throw new BadRequestException('Member not found');

    // Use transaction for atomic operations
    return await this.prismaService.$transaction(async (prisma) => {
      // ── VALIDATE HALL WITH OUT-OF-ORDER PERIODS ────────
      const hall = await prisma.hall.findFirst({
        where: { id: Number(entityId) },
        include: {
          outOfOrders: true,
        },
      });
      if (!hall) throw new BadRequestException('Hall not found');

      // ── CHECK OUT-OF-ORDER PERIODS ─────────────────────
      // Check for conflicts with out-of-order periods
      const conflictingOutOfOrder = hall.outOfOrders?.find((period) => {
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setHours(0, 0, 0, 0);

        return booking >= periodStart && booking <= periodEnd;
      });

      if (conflictingOutOfOrder) {
        const startDate = new Date(conflictingOutOfOrder.startDate);
        const endDate = new Date(conflictingOutOfOrder.endDate);

        throw new ConflictException(
          `Hall '${hall.name}' is out of order from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}: ${conflictingOutOfOrder.reason}`,
        );
      }

      // Check if hall is currently out of order (active period)
      const now = new Date();
      const isCurrentlyOutOfOrder = hall.outOfOrders?.some((period) => {
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);
        return now >= periodStart && now <= periodEnd;
      });

      // If hall is currently out of order and not active
      if (isCurrentlyOutOfOrder && !hall.isActive) {
        throw new ConflictException(
          `Hall '${hall.name}' is currently out of order`,
        );
      }

      // ── NORMALIZE EVENT TIME ────────────────────────────
      const normalizedEventTime = eventTime.toUpperCase() as
        | 'MORNING'
        | 'EVENING'
        | 'NIGHT';

      // ── CHECK HALL AVAILABILITY ────────────────────────
      if (
        existing.hallId !== Number(entityId) ||
        existing.bookingDate.getTime() !== booking.getTime() ||
        existing.bookingTime !== normalizedEventTime
      ) {
        // Check for conflicting bookings
        const conflictingBooking = await prisma.hallBooking.findFirst({
          where: {
            hallId: Number(entityId),
            bookingDate: booking,
            bookingTime: normalizedEventTime,
            id: { not: Number(id) },
          },
        });

        if (conflictingBooking) {
          throw new ConflictException(
            `Hall '${hall.name}' is already booked for ${booking.toLocaleDateString()} during ${normalizedEventTime.toLowerCase()} time slot`,
          );
        }

        // Check for conflicting reservations
        const conflictingReservation = await prisma.hallReservation.findFirst({
          where: {
            hallId: Number(entityId),
            AND: [
              { reservedFrom: { lte: booking } },
              { reservedTo: { gt: booking } },
            ],
            timeSlot: normalizedEventTime,
          },
        });

        if (conflictingReservation) {
          throw new ConflictException(
            `Hall '${hall.name}' is reserved from ${conflictingReservation.reservedFrom.toLocaleDateString()} to ${conflictingReservation.reservedTo.toLocaleDateString()} (${normalizedEventTime} time slot)`,
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

      // ── CALCULATE PAYMENT DIFFERENCES ────────────────────
      const prevPaid = Number(existing.paidAmount);
      const prevTotal = Number(existing.totalPrice);
      const prevOwed = prevTotal - prevPaid;

      const paidDiff = paid - prevPaid;
      const owedDiff = owed - prevOwed;

      // ── UPDATE HALL BOOKING ──────────────────────────────
      const updated = await prisma.hallBooking.update({
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
          numberOfGuests: Number(numberOfGuests!),
          eventType: eventType,
          bookingTime: normalizedEventTime,
          paidBy,
          guestName,
          guestContact: guestContact?.toString(),
        },
      });

      // ── UPDATE HALL STATUS ───────────────────────────────
      const isToday = booking.getTime() === todayNormalized.getTime();
      const wasToday =
        existing.bookingDate.getTime() === todayNormalized.getTime();

      if (isToday && !wasToday) {
        await prisma.hall.update({
          where: { id: hall.id },
          data: { isBooked: true },
        });
      } else if (wasToday && !isToday) {
        await prisma.hall.update({
          where: { id: hall.id },
          data: { isBooked: false },
        });
      }

      // ── UPDATE MEMBER LEDGER ─────────────────────────────
      if (paidDiff !== 0 || owedDiff !== 0) {
        await prisma.member.update({
          where: { Membership_No: membershipNo },
          data: {
            drAmount: { increment: paidDiff },
            crAmount: { increment: owedDiff },
            Balance: { increment: paidDiff - owedDiff },
            lastBookingDate: new Date(),
          },
        });
      }

      // ── CREATE PAYMENT VOUCHER ──────────────────────────
      if (paidDiff > 0) {
        let voucherType: VoucherType;
        let voucherAmount = paidDiff;

        const remainingPaymentBeforeUpdate = Number(existing.pendingAmount!);

        if (
          paymentStatus === ('PAID' as any) &&
          remainingPaymentBeforeUpdate > 0
        ) {
          voucherAmount = remainingPaymentBeforeUpdate;
        }

        if (paymentStatus === ('PAID' as any)) {
          voucherType = VoucherType.FULL_PAYMENT;
        } else {
          voucherType = VoucherType.HALF_PAYMENT;
        }

        let paymentDescription = '';
        if (paymentStatus === ('PAID' as any)) {
          paymentDescription = 'Full payment';
        } else {
          paymentDescription = `Payment of PKR ${voucherAmount.toLocaleString()}`;
        }

        const remarks = `${hall.name} | ${paymentDescription} | ${booking.toLocaleDateString()} (${eventType}) - ${normalizedEventTime}`;

        await prisma.paymentVoucher.create({
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
            issued_at: new Date(),
          },
        });
      }

      return updated;
    });
  }

  // member hall booking
  async cBookingHallMember(payload: any) {
    const {
      membershipNo,
      entityId,
      bookingDate,
      totalPrice,
      paymentStatus = 'PAID',
      pricingType,
      paidAmount,
      paymentMode = 'ONLINE',
      eventType,
      eventTime,
      specialRequests = '',
      paidBy = 'MEMBER',
      guestName,
      guestContact,
    } = payload;

    // ── 1. VALIDATE REQUIRED FIELDS ─────────────────────────
    if (!membershipNo)
      throw new BadRequestException('Membership number is required');
    if (!entityId) throw new BadRequestException('Hall ID is required');
    if (!bookingDate) throw new BadRequestException('Booking date is required');
    if (!eventType) throw new BadRequestException('Event type is required');
    if (!eventTime) throw new BadRequestException('Event time is required');

    // ── 2. VALIDATE BOOKING DATE ────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const booking = new Date(bookingDate);

    if (booking < today) {
      throw new ConflictException('Booking date cannot be in the past');
    }

    // ── 3. VALIDATE MEMBER ─────────────────────────────────
    const member = await this.prismaService.member.findUnique({
      where: { Membership_No: membershipNo.toString() },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // ── 4. VALIDATE EVENT TIME ─────────────────────────────
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

    // Use transaction for atomic operations
    return await this.prismaService.$transaction(async (prisma) => {
      // ── 5. VALIDATE HALL WITH OUT-OF-ORDER PERIODS ────────
      const hall = await prisma.hall.findFirst({
        where: { id: Number(entityId) },
        include: {
          outOfOrders: true,
        },
      });

      if (!hall) {
        throw new NotFoundException('Hall not found');
      }

      // Check if hall is on hold
      if (hall.onHold) {
        throw new ConflictException('Hall is currently on hold');
      }

      // ── 6. CHECK OUT-OF-ORDER PERIODS ─────────────────────
      // Check for conflicts with out-of-order periods
      const conflictingOutOfOrder = hall.outOfOrders?.find((period) => {
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setHours(0, 0, 0, 0);

        return booking >= periodStart && booking <= periodEnd;
      });

      if (conflictingOutOfOrder) {
        const startDate = new Date(conflictingOutOfOrder.startDate);
        const endDate = new Date(conflictingOutOfOrder.endDate);

        throw new ConflictException(
          `Hall '${hall.name}' is out of order from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}: ${conflictingOutOfOrder.reason}`,
        );
      }

      // Check if hall is currently out of order (active period)
      const now = new Date();
      const isCurrentlyOutOfOrder = hall.outOfOrders?.some((period) => {
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);
        return now >= periodStart && now <= periodEnd;
      });

      // If hall is currently out of order and not active
      if (isCurrentlyOutOfOrder && !hall.isActive) {
        throw new ConflictException(
          `Hall '${hall.name}' is currently out of order`,
        );
      }

      // ── 7. CHECK FOR BOOKING CONFLICTS ─────────────────────
      const conflictingBooking = await prisma.hallBooking.findFirst({
        where: {
          hallId: hall.id,
          bookingDate: booking,
          bookingTime: normalizedEventTime,
        },
      });

      if (conflictingBooking) {
        const timeSlotMap = {
          MORNING: 'Morning (8:00 AM - 2:00 PM)',
          EVENING: 'Evening (2:00 PM - 8:00 PM)',
          NIGHT: 'Night (8:00 PM - 12:00 AM)',
        };

        throw new ConflictException(
          `Hall '${hall.name}' is already booked for ${booking.toLocaleDateString()} during ${timeSlotMap[normalizedEventTime]}`,
        );
      }

      // ── 8. CHECK FOR RESERVATIONS ──────────────────────────
      const conflictingReservation = await prisma.hallReservation.findFirst({
        where: {
          hallId: hall.id,
          AND: [
            { reservedFrom: { lte: booking } },
            { reservedTo: { gt: booking } },
          ],
          timeSlot: normalizedEventTime,
        },
      });

      if (conflictingReservation) {
        throw new ConflictException(
          `Hall '${hall.name}' is reserved from ${conflictingReservation.reservedFrom.toLocaleDateString()} to ${conflictingReservation.reservedTo.toLocaleDateString()} (${normalizedEventTime} time slot)`,
        );
      }

      // ── 9. CALCULATE PRICE ────────────────────────────────
      const basePrice =
        pricingType === 'member' ? hall.chargesMembers : hall.chargesGuests;
      const total = totalPrice ? Number(totalPrice) : Number(basePrice);

      // ── 10. PAYMENT CALCULATIONS ────────────────────────────
      let paid = 0;
      let owed = total;

      if (paymentStatus === 'PAID') {
        paid = total;
        owed = 0;
      } else if (paymentStatus === 'HALF_PAID') {
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
      const booked = await prisma.hallBooking.create({
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
          bookingTime: normalizedEventTime,
          paidBy,
          guestName,
          guestContact: guestContact?.toString(),
        },
        include: {
          hall: {
            select: {
              name: true,
              capacity: true,
            },
          },
        },
      });

      // ── 12. UPDATE HALL STATUS ────────────────────────────
      const isToday = booking.getTime() === today.getTime();
      if (isToday) {
        await prisma.hall.update({
          where: { id: hall.id },
          data: {
            isBooked: true,
            onHold: false,
            holdExpiry: null,
            holdBy: null,
          },
        });
      }

      // ── 13. UPDATE MEMBER LEDGER ──────────────────────────
      await prisma.member.update({
        where: { Membership_No: membershipNo.toString() },
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
        let voucherType: VoucherType | null = null;
        if (paymentStatus === ('PAID' as unknown))
          voucherType = VoucherType.FULL_PAYMENT;
        else if (paymentStatus === ('HALF_PAID' as unknown))
          voucherType = VoucherType.HALF_PAYMENT;

        await prisma.paymentVoucher.create({
          data: {
            booking_type: 'HALL',
            booking_id: booked.id,
            membership_no: membershipNo.toString(),
            amount: paid,
            payment_mode: paymentMode as unknown as PaymentMode,
            voucher_type: voucherType!,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'member',
            remarks: `${hall.name} | ${booking.toLocaleDateString()} | ${eventType} (${normalizedEventTime})${specialRequests ? ` | Requests: ${specialRequests}` : ''}`,
          },
        });
      }

      return {
        success: true,
        message: `Successfully booked ${hall.name}`,
        booking: booked,
        totalAmount: total,
        paidAmount: paid,
        pendingAmount: owed,
      };
    });
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
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      paymentMode,
      numberOfGuests,
      eventTime,
      paidBy = "MEMBER",
      guestName,
      guestContact,
    } = payload;

    // ── 1. VALIDATE REQUIRED FIELDS ─────────────────────────
    if (!membershipNo)
      throw new BadRequestException('Membership number is required');
    if (!entityId) throw new BadRequestException('Lawn ID is required');
    if (!bookingDate) throw new BadRequestException('Booking date is required');
    if (!numberOfGuests)
      throw new BadRequestException('Number of guests is required');

    // ── 2. VALIDATE BOOKING DATE ────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    // ── 4. VALIDATE LAWN WITH OUT-OF-ORDER PERIODS ──────────
    const lawn = await this.prismaService.lawn.findFirst({
      where: { id: Number(entityId) },
      include: {
        outOfOrders: {
          orderBy: { startDate: 'asc' },
        },
      },
    });
    if (!lawn) throw new BadRequestException('Lawn not found');

    // Check if lawn is active
    if (!lawn.isActive) {
      throw new ConflictException('Lawn is not active');
    }

    // ── 5. CHECK MULTIPLE OUT OF SERVICE PERIODS ────────────
    // Check if lawn is currently out of service
    const isCurrentlyOutOfOrder = this.isCurrentlyOutOfOrder(lawn.outOfOrders);

    if (isCurrentlyOutOfOrder) {
      // Find the current out-of-order period
      const currentPeriod = this.getCurrentOutOfOrderPeriod(lawn.outOfOrders);
      if (currentPeriod) {
        throw new ConflictException(
          `Lawn '${lawn.description}' is currently out of service from ${currentPeriod.startDate.toLocaleDateString()} to ${currentPeriod.endDate.toLocaleDateString()}${currentPeriod.reason ? `: ${currentPeriod.reason}` : ''}`,
        );
      }
    }

    // Check if booking date falls within any out-of-order period
    if (lawn.outOfOrders && lawn.outOfOrders.length > 0) {
      const conflictingPeriod = lawn.outOfOrders.find((period) => {
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setHours(0, 0, 0, 0);

        return booking >= periodStart && booking <= periodEnd;
      });

      if (conflictingPeriod) {
        const startDate = new Date(conflictingPeriod.startDate);
        const endDate = new Date(conflictingPeriod.endDate);

        const isScheduled = startDate > today;

        if (isScheduled) {
          throw new ConflictException(
            `Lawn '${lawn.description}' has scheduled maintenance from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}${conflictingPeriod.reason ? `: ${conflictingPeriod.reason}` : ''}`,
          );
        } else {
          throw new ConflictException(
            `Lawn '${lawn.description}' is out of service from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}${conflictingPeriod.reason ? `: ${conflictingPeriod.reason}` : ''}`,
          );
        }
      }
    }

    // ── 6. CHECK GUEST COUNT AGAINST LAWN CAPACITY ─────────
    if (numberOfGuests < (lawn.minGuests || 0)) {
      throw new ConflictException(
        `Number of guests (${numberOfGuests}) is below the minimum requirement of ${lawn.minGuests} for this lawn`,
      );
    }

    if (numberOfGuests > lawn.maxGuests) {
      throw new ConflictException(
        `Number of guests (${numberOfGuests}) exceeds the maximum capacity of ${lawn.maxGuests} for this lawn`,
      );
    }

    // ── 7. CHECK DATE AVAILABILITY ─────────────────────────
    const conflictingBooking = await this.prismaService.lawnBooking.findFirst({
      where: {
        lawnId: lawn.id,
        bookingDate: booking,
        bookingTime: eventTime as BookingOpt,
      },
    });

    if (conflictingBooking) {
      const timeSlotMap = {
        MORNING: 'Morning (8:00 AM - 2:00 PM)',
        EVENING: 'Evening (2:00 PM - 8:00 PM)',
        NIGHT: 'Night (8:00 PM - 12:00 AM)',
      };

      throw new ConflictException(
        `Lawn '${lawn.description}' is already booked for ${booking.toLocaleDateString()} during ${timeSlotMap[eventTime as keyof typeof timeSlotMap] || eventTime}`,
      );
    }

    // ── 8. CALCULATE PRICE BASED ON PRICING TYPE ───────────
    const basePrice =
      pricingType === 'member' ? lawn.memberCharges : lawn.guestCharges;
    const total = totalPrice ? Number(totalPrice) : Number(basePrice);

    // ── 9. PAYMENT CALCULATIONS ────────────────────────────
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

    // ── 10. CREATE BOOKING ────────────────────────────────
    const booked = await this.prismaService.lawnBooking.create({
      data: {
        memberId: member.Sno,
        lawnId: lawn.id,
        bookingDate: booking,
        guestsCount: numberOfGuests!,
        totalPrice: total,
        paymentStatus: paymentStatus as any,
        pricingType,
        paidAmount: paid,
        pendingAmount: owed,
        bookingTime: eventTime as BookingOpt,
        paidBy,
        guestName,
        guestContact: guestContact?.toString(),
      },
    });

    // ── 11. UPDATE LAWN STATUS IF BOOKING IS FOR TODAY ────
    const isToday = booking.getTime() === today.getTime();

    if (isToday) {
      await this.prismaService.lawn.update({
        where: { id: lawn.id },
        data: {
          isBooked: true,
          onHold: false,
          holdBy: null,
          holdExpiry: null,
        },
      });
    } else {
      // Clear any existing holds
      await this.prismaService.lawn.update({
        where: { id: lawn.id },
        data: {
          onHold: false,
          holdBy: null,
          holdExpiry: null,
        },
      });
    }

    // ── 12. UPDATE MEMBER LEDGER ──────────────────────────
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

    // ── 13. CREATE PAYMENT VOUCHER ────────────────────────
    if (paid > 0) {
      let voucherType: VoucherType;
      if (paymentStatus === ('PAID' as any)) {
        voucherType = VoucherType.FULL_PAYMENT;
      } else {
        voucherType = VoucherType.HALF_PAYMENT;
      }

      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'LAWN',
          booking_id: booked.id,
          membership_no: membershipNo,
          amount: paid,
          payment_mode: paymentMode as any,
          voucher_type: voucherType,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'admin',
          remarks: `${lawn.description} | ${booking.toLocaleDateString()} | ${eventTime} | ${numberOfGuests} guests`,
        },
      });
    }

    return {
      ...booked,
      lawnName: lawn.description,
      outOfOrderPeriods: lawn.outOfOrders.map((period) => ({
        dates: `${new Date(period.startDate).toLocaleDateString()} - ${new Date(period.endDate).toLocaleDateString()}`,
        reason: period.reason,
      })),
    };
  }
  async uBookingLawn(payload: Partial<BookingDto>) {
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
      numberOfGuests,
      eventTime,
      paidBy = "MEMBER",
      guestName,
      guestContact
    } = payload;

    // ── VALIDATE REQUIRED FIELDS ─────────────────────────
    if (!id) throw new BadRequestException('Booking ID is required');
    if (!membershipNo)
      throw new BadRequestException('Membership number is required');
    if (!entityId) throw new BadRequestException('Lawn ID is required');
    if (!bookingDate) throw new BadRequestException('Booking date is required');
    if (!totalPrice) throw new BadRequestException('Total price is required');
    if (!numberOfGuests)
      throw new BadRequestException('Number of guests is required');

    // ── VALIDATE BOOKING DATE ────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const booking = new Date(bookingDate);

    if (booking < today) {
      throw new UnprocessableEntityException(
        'Booking date cannot be in the past',
      );
    }

    // ── FETCH EXISTING BOOKING ───────────────────────────
    const existing = await this.prismaService.lawnBooking.findUnique({
      where: { id: Number(id) },
      include: {
        member: true,
        lawn: {
          include: {
            outOfOrders: true,
          },
        },
      },
    });
    if (!existing) throw new NotFoundException('Booking not found');

    // ── VALIDATE MEMBER ─────────────────────────────────
    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: membershipNo },
    });
    if (!member) throw new BadRequestException('Member not found');

    // ── VALIDATE NEW LAWN WITH OUT-OF-ORDER PERIODS ─────
    const lawn = await this.prismaService.lawn.findFirst({
      where: { id: Number(entityId) },
      include: {
        outOfOrders: {
          orderBy: { startDate: 'asc' },
        },
      },
    });
    if (!lawn) throw new BadRequestException('Lawn not found');

    // Check if lawn is active
    if (!lawn.isActive) {
      throw new ConflictException('Lawn is not active');
    }

    // ── CHECK MULTIPLE OUT OF SERVICE PERIODS ────────────
    // Check if lawn is currently out of service
    const isCurrentlyOutOfOrder = this.isCurrentlyOutOfOrder(lawn.outOfOrders);

    if (isCurrentlyOutOfOrder) {
      // Find the current out-of-order period
      const currentPeriod = this.getCurrentOutOfOrderPeriod(lawn.outOfOrders);
      if (currentPeriod) {
        throw new ConflictException(
          `Lawn '${lawn.description}' is currently out of service from ${currentPeriod.startDate.toLocaleDateString()} to ${currentPeriod.endDate.toLocaleDateString()}${currentPeriod.reason ? `: ${currentPeriod.reason}` : ''}`,
        );
      }
    }

    // Check if booking date falls within any out-of-order period
    if (lawn.outOfOrders && lawn.outOfOrders.length > 0) {
      const conflictingPeriod = lawn.outOfOrders.find((period) => {
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setHours(0, 0, 0, 0);

        return booking >= periodStart && booking <= periodEnd;
      });

      if (conflictingPeriod) {
        const startDate = new Date(conflictingPeriod.startDate);
        const endDate = new Date(conflictingPeriod.endDate);

        const isScheduled = startDate > today;

        if (isScheduled) {
          throw new ConflictException(
            `Lawn '${lawn.description}' has scheduled maintenance from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}${conflictingPeriod.reason ? `: ${conflictingPeriod.reason}` : ''}`,
          );
        } else {
          throw new ConflictException(
            `Lawn '${lawn.description}' is out of service from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}${conflictingPeriod.reason ? `: ${conflictingPeriod.reason}` : ''}`,
          );
        }
      }
    }

    // ── CHECK GUEST COUNT AGAINST LAWN CAPACITY ─────────
    if (numberOfGuests < (lawn.minGuests || 0)) {
      throw new ConflictException(
        `Number of guests (${numberOfGuests}) is below the minimum requirement of ${lawn.minGuests} for this lawn`,
      );
    }

    if (numberOfGuests > lawn.maxGuests) {
      throw new ConflictException(
        `Number of guests (${numberOfGuests}) exceeds the maximum capacity of ${lawn.maxGuests} for this lawn`,
      );
    }

    // ── CHECK LAWN AVAILABILITY (excluding current booking) ──
    if (
      existing.lawnId !== Number(entityId) ||
      existing.bookingDate.getTime() !== booking.getTime() ||
      existing.bookingTime !== eventTime
    ) {
      const conflictingBooking = await this.prismaService.lawnBooking.findFirst(
        {
          where: {
            lawnId: Number(entityId),
            bookingDate: booking,
            bookingTime: eventTime as BookingOpt,
            id: { not: Number(id) }, // Exclude current booking
          },
        },
      );

      if (conflictingBooking) {
        const timeSlotMap = {
          MORNING: 'Morning (8:00 AM - 2:00 PM)',
          EVENING: 'Evening (2:00 PM - 8:00 PM)',
          NIGHT: 'Night (8:00 PM - 12:00 AM)',
        };

        throw new ConflictException(
          `Lawn '${lawn.description}' is already booked for ${booking.toLocaleDateString()} during ${timeSlotMap[eventTime as keyof typeof timeSlotMap] || eventTime}`,
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

    // ── UPDATE LAWN BOOKING ──────────────────────────────
    const updated = await this.prismaService.lawnBooking.update({
      where: { id: Number(id) },
      data: {
        lawnId: lawn.id,
        memberId: member.Sno,
        bookingDate: booking,
        guestsCount: Number(numberOfGuests!),
        totalPrice: total,
        paymentStatus: paymentStatus as any,
        pricingType,
        paidAmount: paid,
        pendingAmount: owed,
        bookingTime: eventTime as BookingOpt,
        paidBy,
        guestName,
        guestContact: guestContact?.toString()
      },
    });

    // ── UPDATE LAWN STATUSES ─────────────────────────────
    const isToday = booking.getTime() === today.getTime();
    const wasToday = existing.bookingDate.getTime() === today.getTime();

    // Clear holds for both lawns
    await this.prismaService.lawn.updateMany({
      where: {
        id: {
          in: [lawn.id, existing.lawnId].filter((id) => id !== null),
        },
      },
      data: {
        onHold: false,
        holdBy: null,
        holdExpiry: null,
      },
    });

    // Update isBooked status for new lawn
    if (isToday) {
      await this.prismaService.lawn.update({
        where: { id: lawn.id },
        data: { isBooked: true },
      });
    } else {
      await this.prismaService.lawn.update({
        where: { id: lawn.id },
        data: { isBooked: false },
      });
    }

    // Update isBooked status for old lawn
    if (wasToday) {
      await this.prismaService.lawn.update({
        where: { id: existing.lawnId },
        data: { isBooked: false },
      });
    } else {
      // Check if old lawn still has bookings for today
      const hasOtherBookingsToday =
        await this.prismaService.lawnBooking.findFirst({
          where: {
            lawnId: existing.lawnId,
            bookingDate: today,
            id: { not: Number(id) },
          },
        });

      if (!hasOtherBookingsToday) {
        await this.prismaService.lawn.update({
          where: { id: existing.lawnId },
          data: { isBooked: false },
        });
      }
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

    // ── CREATE NEW PAYMENT VOUCHER FOR PAYMENT UPDATES ───
    if (paidDiff > 0) {
      let voucherType: VoucherType;
      let voucherAmount = paidDiff;

      // Calculate remaining payment before update
      const remainingPaymentBeforeUpdate = Number(existing.pendingAmount);

      // Check if this is a final payment that completes the booking
      if (
        paymentStatus === ('PAID' as any) &&
        remainingPaymentBeforeUpdate > 0
      ) {
        // This is the final payment - use the actual remaining amount instead of the difference
        voucherAmount = remainingPaymentBeforeUpdate;
      }

      // Determine voucher type based on payment status
      if (paymentStatus === ('PAID' as any)) {
        voucherType = VoucherType.FULL_PAYMENT;
      } else {
        voucherType = VoucherType.HALF_PAYMENT;
      }

      // Determine remarks based on payment type and amount
      let paymentDescription = '';
      if (paymentStatus === ('PAID' as any)) {
        paymentDescription = 'Full payment';
      } else {
        paymentDescription = `Payment of PKR ${voucherAmount.toLocaleString()}`;
      }

      const remarks = `${lawn.description} | ${paymentDescription} | ${booking.toLocaleDateString()} | ${eventTime} | ${numberOfGuests} guests`;

      // Create a new voucher for each payment update
      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'LAWN',
          booking_id: updated.id,
          membership_no: membershipNo,
          amount: voucherAmount,
          payment_mode: paymentMode as any,
          voucher_type: voucherType,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'admin',
          remarks: remarks,
          issued_at: new Date(),
        },
      });
    }

    return {
      ...updated,
      lawnName: lawn.description,
      outOfOrderPeriods: lawn.outOfOrders.map((period) => ({
        dates: `${new Date(period.startDate).toLocaleDateString()} - ${new Date(period.endDate).toLocaleDateString()}`,
        reason: period.reason,
      })),
    };
  }
  async gBookingsLawn() {
    return await this.prismaService.lawnBooking.findMany({
      orderBy: { bookingDate: 'desc' },
      include: {
        lawn: { select: { id: true, description: true } },
        member: {
          select: { Membership_No: true, Name: true },
        },
      },
    });
  }
  async dBookingLawn(bookingId) {}

  // member lawn booking
  async cBookingLawnMember(payload: any) {
    const {
      membershipNo,
      entityId,
      bookingDate,
      totalPrice,
      paymentStatus = 'PAID',
      pricingType,
      paidAmount,
      paymentMode = 'ONLINE',
      numberOfGuests,
      eventTime,
      specialRequests = '',
      paidBy = "MEMBER",
      guestName,
      guestContact
    } = payload;

    // ── 1. VALIDATE REQUIRED FIELDS ─────────────────────────
    if (!membershipNo)
      throw new BadRequestException('Membership number is required');
    if (!entityId) throw new BadRequestException('Lawn ID is required');
    if (!bookingDate) throw new BadRequestException('Booking date is required');
    if (!numberOfGuests)
      throw new BadRequestException('Number of guests is required');
    if (!eventTime) throw new BadRequestException('Event time is required');

    // ── 2. VALIDATE BOOKING DATE ────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const booking = new Date(bookingDate);

    if (booking < today) {
      throw new ConflictException('Booking date cannot be in the past');
    }

    // ── 3. VALIDATE MEMBER ─────────────────────────────────
    const member = await this.prismaService.member.findUnique({
      where: { Membership_No: membershipNo.toString() },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // ── 4. VALIDATE EVENT TIME ─────────────────────────────
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

    // Use transaction for atomic operations
    return await this.prismaService.$transaction(async (prisma) => {
      // ── 5. VALIDATE LAWN WITH OUT-OF-ORDER PERIODS ──────────
      const lawn = await prisma.lawn.findFirst({
        where: { id: Number(entityId) },
        include: {
          outOfOrders: {
            orderBy: { startDate: 'asc' },
          },
        },
      });

      if (!lawn) {
        throw new NotFoundException('Lawn not found');
      }

      // Check if lawn is active
      if (!lawn.isActive) {
        throw new ConflictException('Lawn is not active');
      }

      // ── 6. CHECK MULTIPLE OUT OF SERVICE PERIODS ────────────
      // Check if lawn is currently out of service
      const isCurrentlyOutOfOrder = this.isCurrentlyOutOfOrder(
        lawn.outOfOrders,
      );

      if (isCurrentlyOutOfOrder) {
        // Find the current out-of-order period
        const currentPeriod = this.getCurrentOutOfOrderPeriod(lawn.outOfOrders);
        if (currentPeriod) {
          throw new ConflictException(
            `Lawn '${lawn.description}' is currently out of service from ${currentPeriod.startDate.toLocaleDateString()} to ${currentPeriod.endDate.toLocaleDateString()}${currentPeriod.reason ? `: ${currentPeriod.reason}` : ''}`,
          );
        }
      }

      // Check if booking date falls within any out-of-order period
      if (lawn.outOfOrders && lawn.outOfOrders.length > 0) {
        const conflictingPeriod = lawn.outOfOrders.find((period) => {
          const periodStart = new Date(period.startDate);
          const periodEnd = new Date(period.endDate);
          periodStart.setHours(0, 0, 0, 0);
          periodEnd.setHours(0, 0, 0, 0);

          return booking >= periodStart && booking <= periodEnd;
        });

        if (conflictingPeriod) {
          const startDate = new Date(conflictingPeriod.startDate);
          const endDate = new Date(conflictingPeriod.endDate);

          const isScheduled = startDate > today;

          if (isScheduled) {
            throw new ConflictException(
              `Lawn '${lawn.description}' has scheduled maintenance from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}${conflictingPeriod.reason ? `: ${conflictingPeriod.reason}` : ''}`,
            );
          } else {
            throw new ConflictException(
              `Lawn '${lawn.description}' is out of service from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}${conflictingPeriod.reason ? `: ${conflictingPeriod.reason}` : ''}`,
            );
          }
        }
      }

      // ── 7. CHECK GUEST COUNT AGAINST LAWN CAPACITY ─────────
      if (numberOfGuests < (lawn.minGuests || 0)) {
        throw new ConflictException(
          `Number of guests (${numberOfGuests}) is below the minimum requirement of ${lawn.minGuests} for this lawn`,
        );
      }

      if (numberOfGuests > lawn.maxGuests) {
        throw new ConflictException(
          `Number of guests (${numberOfGuests}) exceeds the maximum capacity of ${lawn.maxGuests} for this lawn`,
        );
      }

      // ── 8. CHECK FOR BOOKING CONFLICTS ─────────────────────
      const conflictingBooking = await prisma.lawnBooking.findFirst({
        where: {
          lawnId: lawn.id,
          bookingDate: booking,
          bookingTime: normalizedEventTime, // Strict time slot check
        },
      });

      if (conflictingBooking) {
        const timeSlotMap = {
          MORNING: 'Morning (8:00 AM - 2:00 PM)',
          EVENING: 'Evening (2:00 PM - 8:00 PM)',
          NIGHT: 'Night (8:00 PM - 12:00 AM)',
        };

        throw new ConflictException(
          `Lawn '${lawn.description}' is already booked for ${booking.toLocaleDateString()} during ${timeSlotMap[normalizedEventTime]}`,
        );
      }

      // ── 9. CALCULATE PRICE BASED ON PRICING TYPE ───────────
      const basePrice =
        pricingType === 'member' ? lawn.memberCharges : lawn.guestCharges;
      const total = totalPrice ? Number(totalPrice) : Number(basePrice);

      // ── 10. PAYMENT CALCULATIONS ────────────────────────────
      let paid = 0;
      let owed = total;

      if (paymentStatus === 'PAID') {
        paid = total;
        owed = 0;
      } else if (paymentStatus === 'HALF_PAID') {
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
      const booked = await prisma.lawnBooking.create({
        data: {
          memberId: member.Sno,
          lawnId: lawn.id,
          bookingDate: booking,
          guestsCount: numberOfGuests!,
          totalPrice: total,
          paymentStatus: paymentStatus as any,
          pricingType,
          paidAmount: paid,
          pendingAmount: owed,
          bookingTime: normalizedEventTime,
          paidBy,
          guestName,
          guestContact: guestContact?.toString()
        },
        include: {
          lawn: {
            select: {
              description: true,
              minGuests: true,
              maxGuests: true,
            },
          },
        },
      });

      // ── 12. UPDATE LAWN STATUS IF BOOKING IS FOR TODAY ────
      const todayCheck = new Date();
      todayCheck.setHours(0, 0, 0, 0);
      const isToday = booking.getTime() === todayCheck.getTime();

      if (isToday) {
        await prisma.lawn.update({
          where: { id: lawn.id },
          data: {
            isBooked: true,
            onHold: false,
            holdBy: null,
            holdExpiry: null,
          },
        });
      } else {
        // Clear any existing holds
        await prisma.lawn.update({
          where: { id: lawn.id },
          data: {
            onHold: false,
            holdBy: null,
            holdExpiry: null,
          },
        });
      }

      // ── 13. UPDATE MEMBER LEDGER ──────────────────────────
      await prisma.member.update({
        where: { Membership_No: membershipNo.toString() },
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
        let voucherType: VoucherType | null = null;
        if (paymentStatus === ('PAID' as unknown))
          voucherType = VoucherType.FULL_PAYMENT;
        else if (paymentStatus === ('HALF_PAID' as unknown))
          voucherType = VoucherType.HALF_PAYMENT;

        await prisma.paymentVoucher.create({
          data: {
            booking_type: 'LAWN',
            booking_id: booked.id,
            membership_no: membershipNo.toString(),
            amount: paid,
            payment_mode: paymentMode as unknown as PaymentMode,
            voucher_type: voucherType!,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'member',
            remarks: `${lawn.description} | ${booking.toLocaleDateString()} | ${normalizedEventTime} | ${numberOfGuests} guests${specialRequests ? ` | Requests: ${specialRequests}` : ''}`,
          },
        });
      }

      // ── 15. RETURN SUCCESS RESPONSE WITH OUT-OF-ORDER INFO ─
      return {
        success: true,
        message: `Successfully booked ${lawn.description}`,
        booking: booked,
        totalAmount: total,
        paidAmount: paid,
        pendingAmount: owed,
        capacity: {
          minGuests: lawn.minGuests,
          maxGuests: lawn.maxGuests,
        },
        outOfOrderPeriods: lawn.outOfOrders.map((period) => ({
          dates: `${new Date(period.startDate).toLocaleDateString()} - ${new Date(period.endDate).toLocaleDateString()}`,
          reason: period.reason,
        })),
      };
    });
  }

  // helper methods
  private isCurrentlyOutOfOrder(outOfOrders: any[]): boolean {
    if (!outOfOrders || outOfOrders.length === 0) return false;

    const now = new Date();
    return outOfOrders.some((period) => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      return start <= now && end >= now;
    });
  }

  private getCurrentOutOfOrderPeriod(outOfOrders: any[]): any | null {
    if (!outOfOrders || outOfOrders.length === 0) return null;

    const now = new Date();
    return outOfOrders.find((period) => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      return start <= now && end >= now;
    });
  }

  private hasScheduledMaintenance(outOfOrders: any[]): boolean {
    if (!outOfOrders || outOfOrders.length === 0) return false;

    const now = new Date();
    return outOfOrders.some((period) => {
      const start = new Date(period.startDate);
      return start > now;
    });
  }

  // photoshoot booking

  async cBookingPhotoshoot(payload: BookingDto) {
    const {
      membershipNo,
      entityId,
      checkIn,
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      paymentMode,
      timeSlot,
      paidBy = "MEMBER",
      guestName,
      guestContact
    } = payload;

    // 1. Validate Member
    const member = await this.prismaService.member.findUnique({
      where: { Membership_No: membershipNo },
    });
    if (!member) throw new NotFoundException('Member not found');

    // 2. Validate Photoshoot Service
    const photoshoot = await this.prismaService.photoshoot.findUnique({
      where: { id: Number(entityId) },
    });
    if (!photoshoot)
      throw new NotFoundException('Photoshoot service not found');

    // 3. Validate Date and Time
    if (!timeSlot) throw new BadRequestException('Time slot is required');

    // FIXED: Proper datetime parsing
    const startTime = new Date(timeSlot);

    // Validate the date is valid
    if (isNaN(startTime.getTime())) {
      throw new BadRequestException('Invalid time slot format');
    }

    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    // FIXED: Extract date part properly
    const bookingDate = new Date(startTime);

    const now = new Date();

    // Check if booking datetime is in the past
    if (startTime < now) {
      throw new ConflictException('Booking time cannot be in the past');
    }

    // Validate time slot is between 9am and 6pm (since booking is 2 hours, last slot ends at 8pm)
    const bookingHour = startTime.getHours();
    if (bookingHour < 9 && bookingHour > 6) {
      throw new BadRequestException(
        'Photoshoot bookings are only available between 9:00 AM and 6:00 PM',
      );
    }

    // 4. Calculate Amounts
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
      paid = 0;
      owed = total;
    }

    // 5. Create Booking
    const booking = await this.prismaService.photoshootBooking.create({
      data: {
        memberId: member.Sno,
        photoshootId: photoshoot.id,
        bookingDate: bookingDate,
        startTime: startTime,
        endTime: endTime,
        totalPrice: total,
        paymentStatus: paymentStatus as unknown as PaymentStatus,
        pricingType,
        paidAmount: paid,
        pendingAmount: owed,
        paidBy,
        guestName,
        guestContact
      },
    });

    // 6. Update Member Ledger
    await this.prismaService.member.update({
      where: { Sno: member.Sno },
      data: {
        totalBookings: { increment: 1 },
        lastBookingDate: new Date(),
        drAmount: { increment: paid },
        crAmount: { increment: owed },
        Balance: { increment: paid - owed },
      },
    });

    // 7. Create Voucher
    if (paid > 0) {
      let voucherType: VoucherType | null = null;
      if (paymentStatus === (PaymentStatus.PAID as unknown))
        voucherType = VoucherType.FULL_PAYMENT;
      else if (paymentStatus === (PaymentStatus.HALF_PAID as unknown))
        voucherType = VoucherType.HALF_PAYMENT;

      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'PHOTOSHOOT',
          booking_id: booking.id,
          membership_no: membershipNo,
          amount: paid,
          payment_mode: paymentMode as unknown as PaymentMode,
          voucher_type: voucherType!,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'admin',
          remarks: `Photoshoot | ${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()}`,
        },
      });
    }

    return booking;
  }

  async uBookingPhotoshoot(payload: Partial<BookingDto>) {
    const {
      id,
      membershipNo,
      entityId,
      checkIn,
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      paymentMode,
      timeSlot,
      paidBy = "MEMBER",
      guestName,
      guestContact
    } = payload;

    // 1. Fetch Existing Booking
    const booking = await this.prismaService.photoshootBooking.findUnique({
      where: { id: Number(id) },
      include: { member: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    // 2. Validate Date and Time
    let newStartTime = booking.startTime;
    let newBookingDate = booking.bookingDate;

    if (timeSlot) {
      newStartTime = parsePakistanDate(timeSlot);
      newBookingDate = new Date(newStartTime);
      newBookingDate.setHours(0, 0, 0, 0);
    } else if (checkIn) {
      const newDate = parsePakistanDate(checkIn);
      newStartTime = new Date(newDate);
      newStartTime.setHours(
        booking.startTime.getHours(),
        booking.startTime.getMinutes(),
        booking.startTime.getSeconds(),
        booking.startTime.getMilliseconds(),
      );
      newBookingDate = newDate;
    }

    const newEndTime = new Date(newStartTime.getTime() + 2 * 60 * 60 * 1000);
    const now = getPakistanDate();

    // Check if new booking datetime is in the past
    // if (newStartTime < now) {
    //   throw new ConflictException('Booking time cannot be in the past');
    // }

    // Validate time slot is between 9am and 6pm (since booking is 2 hours, last slot ends at 8pm)
    const bookingHour = newStartTime.getHours();
    if (bookingHour < 9 && bookingHour > 6) {
      throw new BadRequestException(
        'Photoshoot bookings are only available between 9:00 AM and 6:00 PM',
      );
    }

    // REMOVED: Time slot conflict check for updates

    // 3. Calculate Amounts
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
      newPaid = 0;
      newOwed = newTotal;
    }

    const oldPaid = Number(booking.paidAmount);
    const oldOwed = Number(booking.pendingAmount);
    const paidDiff = newPaid - oldPaid;
    const owedDiff = newOwed - oldOwed;

    // 4. Update Booking
    const updated = await this.prismaService.photoshootBooking.update({
      where: { id: booking.id },
      data: {
        memberId: booking.memberId,
        photoshootId: entityId ? Number(entityId) : booking.photoshootId,
        bookingDate: newBookingDate,
        startTime: newStartTime,
        endTime: newEndTime,
        totalPrice: newTotal,
        paymentStatus:
          (paymentStatus as unknown as PaymentStatus) ?? booking.paymentStatus,
        pricingType: pricingType ?? booking.pricingType,
        paidAmount: newPaid,
        pendingAmount: newOwed,
        paidBy,
        guestName,
        guestContact
      },
    });

    // 5. Update Member Ledger
    if (paidDiff !== 0 || owedDiff !== 0) {
      await this.prismaService.member.update({
        where: { Sno: booking.memberId },
        data: {
          drAmount: { increment: paidDiff },
          crAmount: { increment: owedDiff },
          Balance: { increment: paidDiff - owedDiff },
        },
      });
    }

    // 6. Create Voucher for diff
    if (paidDiff > 0) {
      let voucherType: VoucherType | null = null;
      let voucherAmount = paidDiff;
      const remainingPaymentBeforeUpdate = Number(booking.pendingAmount);

      if (
        paymentStatus === (PaymentStatus.PAID as unknown) &&
        remainingPaymentBeforeUpdate > 0
      ) {
        voucherAmount = remainingPaymentBeforeUpdate;
        voucherType = VoucherType.FULL_PAYMENT;
      } else if (paymentStatus === (PaymentStatus.HALF_PAID as unknown)) {
        voucherType = VoucherType.HALF_PAYMENT;
      }

      if (voucherType) {
        await this.prismaService.paymentVoucher.create({
          data: {
            booking_type: 'PHOTOSHOOT',
            booking_id: booking.id,
            membership_no: booking.member.Membership_No,
            amount: voucherAmount,
            payment_mode:
              (paymentMode as unknown as PaymentMode) ?? PaymentMode.CASH,
            voucher_type: voucherType,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'admin',
            remarks: `Photoshoot Update | ${newStartTime.toLocaleDateString()} ${newStartTime.toLocaleTimeString()}`,
          },
        });
      }
    }

    return updated;
  }

  async gBookingPhotoshoot() {
    return await this.prismaService.photoshootBooking.findMany({
      orderBy: { bookingDate: 'asc' },
      include: {
        member: {
          select: {
            Membership_No: true,
            Name: true,
            Balance: true,
          },
        },
        photoshoot: true,
      },
    });
  }

  // member photoshoot booking
  async cBookingPhotoshootMember(payload: any) {
    const {
      membershipNo,
      entityId,
      bookingDate,
      totalPrice,
      paymentStatus = 'PAID',
      pricingType,
      paidAmount,
      paymentMode = 'ONLINE',
      timeSlot,
      specialRequests = '',
      paidBy = "MEMBER",
      guestName,
      guestContact
    } = payload;

    // ── 1. VALIDATE REQUIRED FIELDS ─────────────────────────
    if (!membershipNo)
      throw new BadRequestException('Membership number is required');
    if (!entityId)
      throw new BadRequestException('Photoshoot service ID is required');
    if (!bookingDate) throw new BadRequestException('Booking date is required');
    if (!timeSlot) throw new BadRequestException('Time slot is required');

    // ── 2. VALIDATE BOOKING DATE & TIME ─────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const booking = new Date(bookingDate);

    if (booking < today) {
      throw new ConflictException('Booking date cannot be in the past');
    }

    const startTime = parsePakistanDate(timeSlot);
    const now = getPakistanDate();

    if (startTime < now) {
      throw new ConflictException('Booking time cannot be in the past');
    }

    // Validate time slot is between 9am and 6pm (since booking is 2 hours, last slot ends at 8pm)
    const bookingHour = startTime.getHours();
    if (bookingHour < 9 && bookingHour > 6) {
      throw new BadRequestException(
        'Photoshoot bookings are only available between 9:00 AM and 6:00 PM',
      );
    }

    // ── 3. VALIDATE MEMBER ─────────────────────────────────
    const member = await this.prismaService.member.findUnique({
      where: { Membership_No: membershipNo.toString() },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Use transaction for atomic operations
    return await this.prismaService.$transaction(async (prisma) => {
      // ── 4. VALIDATE PHOTOSHOOT SERVICE ────────────────────
      const photoshoot = await prisma.photoshoot.findFirst({
        where: { id: Number(entityId) },
      });

      if (!photoshoot) {
        throw new NotFoundException('Photoshoot service not found');
      }

      // ── 5. CALCULATE END TIME ────────────────────────────
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

      // REMOVED: Booking conflict check to allow same date/time

      // ── 6. CALCULATE PRICE BASED ON PRICING TYPE ──────────
      const basePrice =
        pricingType === 'member'
          ? photoshoot.memberCharges
          : photoshoot.guestCharges;
      const total = totalPrice ? Number(totalPrice) : Number(basePrice);

      // ── 7. PAYMENT CALCULATIONS ───────────────────────────
      let paid = 0;
      let owed = total;

      if (paymentStatus === 'PAID') {
        paid = total;
        owed = 0;
      } else if (paymentStatus === 'HALF_PAID') {
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

      // ── 8. CREATE BOOKING ───────────────────────────────
      const booked = await prisma.photoshootBooking.create({
        data: {
          memberId: member.Sno,
          photoshootId: photoshoot.id,
          bookingDate: booking,
          startTime: startTime,
          endTime: endTime,
          totalPrice: total,
          paymentStatus: paymentStatus as any,
          pricingType,
          paidAmount: paid,
          pendingAmount: owed,
          paidBy,
          guestName,
          guestContact
        },
        include: {
          photoshoot: {
            select: {
              description: true,
            },
          },
          member: {
            select: {
              Name: true,
              Membership_No: true,
            },
          },
        },
      });

      // ── 9. UPDATE MEMBER LEDGER ─────────────────────────
      await prisma.member.update({
        where: { Membership_No: membershipNo.toString() },
        data: {
          totalBookings: { increment: 1 },
          lastBookingDate: new Date(),
          drAmount: { increment: paid },
          crAmount: { increment: owed },
          Balance: { increment: paid - owed },
        },
      });

      // ── 10. CREATE PAYMENT VOUCHER ───────────────────────
      if (paid > 0) {
        let voucherType: VoucherType | null = null;
        if (paymentStatus === ('PAID' as unknown))
          voucherType = VoucherType.FULL_PAYMENT;
        else if (paymentStatus === ('HALF_PAID' as unknown))
          voucherType = VoucherType.HALF_PAYMENT;

        await prisma.paymentVoucher.create({
          data: {
            booking_type: 'PHOTOSHOOT',
            booking_id: booked.id,
            membership_no: membershipNo.toString(),
            amount: paid,
            payment_mode: paymentMode as unknown as PaymentMode,
            voucher_type: voucherType!,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'member',
            remarks: `Photoshoot: ${photoshoot.description} | ${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()}${specialRequests ? ` | Requests: ${specialRequests}` : ''}`,
          },
        });
      }

      return {
        success: true,
        message: `Successfully booked ${photoshoot.description} for ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}`,
        booking: {
          id: booked.id,
          memberName: booked.member.Name,
          membershipNo: booked.member.Membership_No,
          service: booked.photoshoot.description,
          date: booked.bookingDate.toLocaleDateString(),
          timeSlot: `${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`,
          duration: '2 hours',
          totalAmount: total,
          paidAmount: paid,
          pendingAmount: owed,
          paymentStatus: paymentStatus,
        },
        receipt: {
          bookingId: booked.id,
          service: photoshoot.description,
          date: startTime.toLocaleDateString(),
          time: startTime.toLocaleTimeString(),
          total: total,
          paid: paid,
          balance: owed,
        },
      };
    });
  }

  async dBookingPhotoshoot(bookingId: number) {
    console.log(`Delete request for photoshoot booking ID: ${bookingId}`);
    return { message: 'Delete skipped for now' };
  }

  // vouchers
  async getVouchersByBooking(bookingType: string, bookingId: number) {
    console.log(bookingId);
    return await this.prismaService.paymentVoucher.findMany({
      where: {
        booking_type: bookingType as BookingType,
        booking_id: bookingId,
      },
      orderBy: { issued_at: 'desc' },
    });
  }

  async getMemberBookings(membershipNo: string) {
    const [roomBookings, hallBookings, lawnBookings, photoshootBookings] =
      await Promise.all([
        this.prismaService.roomBooking.findMany({
          where: { Membership_No: membershipNo },
          include: {
            room: {
              include: {
                roomType: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prismaService.hallBooking.findMany({
          where: {
            member: {
              Membership_No: membershipNo,
            },
          },
          include: {
            hall: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prismaService.lawnBooking.findMany({
          where: {
            member: {
              Membership_No: membershipNo,
            },
          },
          include: {
            lawn: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prismaService.photoshootBooking.findMany({
          where: {
            member: {
              Membership_No: membershipNo,
            },
          },
          include: {
            photoshoot: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

    // Normalize and combine bookings
    const allBookings = [
      ...roomBookings.map((b) => ({
        id: b.id,
        type: 'Room',
        name: `Room ${b.room.roomNumber} (${b.room.roomType.type})`,
        date: `${new Date(b.checkIn).toLocaleDateString()} - ${new Date(b.checkOut).toLocaleDateString()}`,
        amount: b.totalPrice,
        status: b.paymentStatus,
        createdAt: b.createdAt,
      })),
      ...hallBookings.map((b) => ({
        id: b.id,
        type: 'Hall',
        name: b.hall.name,
        date: `${new Date(b.bookingDate).toLocaleDateString()} (${b.bookingTime})`,
        amount: b.totalPrice,
        status: b.paymentStatus,
        createdAt: b.createdAt,
      })),
      ...lawnBookings.map((b) => ({
        id: b.id,
        type: 'Lawn',
        name: b.lawn.description,
        date: `${new Date(b.bookingDate).toLocaleDateString()} (${b.bookingTime})`,
        amount: b.totalPrice,
        status: b.paymentStatus,
        createdAt: b.createdAt,
      })),
      ...photoshootBookings.map((b) => ({
        id: b.id,
        type: 'Photoshoot',
        name: b.photoshoot.description,
        date: `${new Date(b.bookingDate).toLocaleDateString()} (${b.startTime} - ${b.endTime})`,
        amount: b.totalPrice,
        status: b.paymentStatus,
        createdAt: b.createdAt,
      })),
    ];

    // Sort by date desc
    return allBookings.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }
}
