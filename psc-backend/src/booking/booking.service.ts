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
  PaidBy,
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
  constructor(private prismaService: PrismaService) { }
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
      remarks,
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
            remarks: remarks!,
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

  async uBookingRoomMember(payload: any) {
    const {
      id, // Booking ID to update
      membershipNo,
      entityId,
      checkIn,
      checkOut,
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      paymentMode = 'ONLINE',
      numberOfAdults = 1,
      numberOfChildren = 0,
      specialRequests = '',
      paidBy = 'MEMBER',
      guestContact,
      guestName,
      remarks,
    } = payload;

    // Validate required fields
    if (!id) throw new BadRequestException('Booking ID is required');
    if (!membershipNo)
      throw new BadRequestException('Membership number is required');

    // Parse dates
    const newCheckIn = parsePakistanDate(checkIn);
    const newCheckOut = parsePakistanDate(checkOut);

    if (!checkIn || !checkOut || newCheckIn >= newCheckOut) {
      throw new ConflictException('Check-in must be before check-out');
    }

    // Get existing booking
    const booking = await this.prismaService.roomBooking.findUnique({
      where: { id: Number(id) },
      include: { room: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Get member
    const member = await this.prismaService.member.findUnique({
      where: { Membership_No: membershipNo.toString() },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Get room and validate
    const room = await this.prismaService.room.findFirst({
      where: { id: booking.roomId },
      include: { outOfOrders: true },
    });

    if (!room) throw new NotFoundException('Room not found');
    if (!room.isActive) {
      throw new ConflictException('Room is not active');
    }

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
        `Room has maintenance scheduled: ${conflictingPeriods}`,
      );
    }

    // Check for overlapping bookings (exclude current booking)
    const overlappingBooking = await this.prismaService.roomBooking.findFirst({
      where: {
        roomId: room.id,
        id: { not: Number(id) },
        AND: [
          { checkIn: { lt: newCheckOut } },
          { checkOut: { gt: newCheckIn } },
        ],
      },
    });

    if (overlappingBooking) {
      throw new ConflictException(
        `Room is already booked for the selected dates`,
      );
    }

    // Calculate pricing
    const roomType = await this.prismaService.roomType.findFirst({
      where: { id: room.roomTypeId },
    });

    if (!roomType) throw new NotFoundException('Room type not found');

    const pricePerNight =
      pricingType === 'member' ? roomType.priceMember : roomType.priceGuest;
    const nights = Math.ceil(
      (newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 60 * 60 * 24),
    );
    const newTotal = totalPrice
      ? Number(totalPrice)
      : Number(pricePerNight) * nights;

    // Get old values
    const oldTotal = Number(booking.totalPrice);
    const oldPaid = Number(booking.paidAmount);
    const oldOwed = Number(booking.pendingAmount);
    const oldPaymentStatus = booking.paymentStatus;

    // Calculate new payment amounts
    let newPaid = oldPaid;
    let newOwed = newTotal - oldPaid;
    let newPaymentStatus: any = paymentStatus || oldPaymentStatus;
    let refundAmount = 0;

    // SCENARIO 1A: Charges DECREASED - Automatic Refund
    if (newTotal < oldPaid) {
      refundAmount = oldPaid - newTotal;
      newPaid = newTotal;
      newOwed = 0;
      newPaymentStatus = 'PAID';

      // Cancel original payment voucher(s)
      await this.prismaService.paymentVoucher.updateMany({
        where: {
          booking_id: Number(id),
          booking_type: 'ROOM',
          voucher_type: {
            in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
          },
          status: VoucherStatus.CONFIRMED,
        },
        data: { status: VoucherStatus.CANCELLED },
      });

      // Create new payment voucher for remaining amount
      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'ROOM',
          booking_id: Number(id),
          membership_no: membershipNo.toString(),
          amount: newPaid,
          payment_mode: paymentMode as unknown as PaymentMode,
          voucher_type: VoucherType.FULL_PAYMENT,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'system',
          remarks: `Reissued after charge reduction | Room #${room.roomNumber} | ${formatPakistanDate(newCheckIn)} → ${formatPakistanDate(newCheckOut)}${remarks ? ` | ${remarks}` : ''}`,
        },
      });

      // Create refund voucher
      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'ROOM',
          booking_id: Number(id),
          membership_no: membershipNo.toString(),
          amount: refundAmount,
          payment_mode: paymentMode as unknown as PaymentMode,
          voucher_type: VoucherType.REFUND,
          status: VoucherStatus.PENDING,
          issued_by: 'system',
          remarks: `Refund for reduced charges | Original: ${oldTotal}, New: ${newTotal} | ${formatPakistanDate(newCheckIn)} → ${formatPakistanDate(newCheckOut)}${remarks ? ` | ${remarks}` : ''}`,
        },
      });

      // Update member ledger for refund
      await this.prismaService.member.update({
        where: { Membership_No: membershipNo.toString() },
        data: {
          crAmount: { increment: refundAmount },
          Balance: { increment: -refundAmount },
        },
      });
    }
    // SCENARIO 1B: Manual Payment Status Downgrade (PAID → HALF_PAID/UNPAID)
    else if (
      paymentStatus &&
      paymentStatus !== oldPaymentStatus &&
      oldPaymentStatus === 'PAID'
    ) {
      // Cancel original voucher
      await this.prismaService.paymentVoucher.updateMany({
        where: {
          booking_id: Number(id),
          booking_type: 'ROOM',
          voucher_type: VoucherType.FULL_PAYMENT,
          status: VoucherStatus.CONFIRMED,
        },
        data: { status: VoucherStatus.CANCELLED },
      });

      // Reissue voucher for new status
      if (paymentStatus === 'HALF_PAID') {
        newPaid = Number(paidAmount) || 0;
        newOwed = newTotal - newPaid;

        await this.prismaService.paymentVoucher.create({
          data: {
            booking_type: 'ROOM',
            booking_id: Number(id),
            membership_no: membershipNo.toString(),
            amount: newPaid,
            payment_mode: paymentMode as unknown as PaymentMode,
            voucher_type: VoucherType.HALF_PAYMENT,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'system',
            remarks: `Reissued after status change | ${formatPakistanDate(newCheckIn)} → ${formatPakistanDate(newCheckOut)}${remarks ? ` | ${remarks}` : ''}`,
          },
        });
      } else if (paymentStatus === 'UNPAID') {
        newPaid = 0;
        newOwed = newTotal;
      }
      // NO refund voucher for manual downgrade - admin handles refunds separately
    }
    // SCENARIO 2: Charges INCREASED (oldTotal < newTotal)
    else if (newTotal > oldTotal) {
      // If was PAID, automatically change to HALF_PAID and reissue voucher
      if (oldPaymentStatus === 'PAID') {
        newPaymentStatus = 'HALF_PAID';
        newPaid = oldPaid;
        newOwed = newTotal - oldPaid;

        // Cancel original FULL_PAYMENT voucher
        await this.prismaService.paymentVoucher.updateMany({
          where: {
            booking_id: Number(id),
            booking_type: 'ROOM',
            voucher_type: VoucherType.FULL_PAYMENT,
            status: VoucherStatus.CONFIRMED,
          },
          data: { status: VoucherStatus.CANCELLED },
        });

        // Create HALF_PAYMENT voucher
        await this.prismaService.paymentVoucher.create({
          data: {
            booking_type: 'ROOM',
            booking_id: Number(id),
            membership_no: membershipNo.toString(),
            amount: newPaid,
            payment_mode: paymentMode as unknown as PaymentMode,
            voucher_type: VoucherType.HALF_PAYMENT,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'system',
            remarks: `Reissued after charge increase | ${formatPakistanDate(newCheckIn)} → ${formatPakistanDate(newCheckOut)}${remarks ? ` | ${remarks}` : ''}`,
          },
        });
      } else {
        // Allow manual payment status override
        if (paymentStatus === 'PAID') {
          newPaid = newTotal;
          newOwed = 0;
        } else if (paymentStatus === 'HALF_PAID') {
          newPaid = Number(paidAmount) || oldPaid;
          newOwed = newTotal - newPaid;
        } else {
          // Keep existing paid amount, adjust owed
          newOwed = newTotal - oldPaid;
        }
      }
    }
    // SCENARIO 3: Charges UNCHANGED but manual status override
    else if (
      newTotal === oldTotal &&
      paymentStatus &&
      paymentStatus !== oldPaymentStatus
    ) {
      if (paymentStatus === 'PAID') {
        newPaid = newTotal;
        newOwed = 0;
      } else if (paymentStatus === 'HALF_PAID') {
        newPaid = Number(paidAmount) || 0;
        newOwed = newTotal - newPaid;
      } else if (paymentStatus === 'UNPAID') {
        newPaid = 0;
        newOwed = newTotal;
      }
    }

    const paidDiff = newPaid - oldPaid;
    const owedDiff = newOwed - oldOwed;

    // Update booking record
    const updated = await this.prismaService.roomBooking.update({
      where: { id: Number(id) },
      data: {
        Membership_No: membershipNo.toString(),
        roomId: room.id,
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        totalPrice: newTotal,
        paymentStatus: newPaymentStatus,
        pricingType,
        paidAmount: newPaid,
        pendingAmount: newOwed,
        numberOfAdults,
        numberOfChildren,
        specialRequests,
        remarks: remarks!,
        paidBy,
        guestName,
        guestContact: guestContact?.toString(),
        refundAmount,
        refundReturned: false,
      },
    });

    // Update existing vouchers if dates changed
    const datesChanged =
      booking.checkIn.getTime() !== newCheckIn.getTime() ||
      booking.checkOut.getTime() !== newCheckOut.getTime();

    if (
      datesChanged &&
      (newPaymentStatus === 'PAID' || newPaymentStatus === 'HALF_PAID')
    ) {
      await this.prismaService.paymentVoucher.updateMany({
        where: {
          booking_id: Number(id),
          booking_type: 'ROOM',
          status: VoucherStatus.CONFIRMED,
          voucher_type: {
            in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
          },
        },
        data: {
          remarks: `${formatPakistanDate(newCheckIn)} to ${formatPakistanDate(newCheckOut)}${remarks ? ` | ${remarks}` : ''}`,
        },
      });
    }

    // Update member ledger
    if (paidDiff !== 0 || owedDiff !== 0) {
      await this.prismaService.member.update({
        where: { Membership_No: membershipNo.toString() },
        data: {
          drAmount: { increment: paidDiff },
          crAmount: { increment: owedDiff },
          Balance: { increment: paidDiff - owedDiff },
          lastBookingDate: new Date(),
        },
      });
    }

    return {
      success: true,
      message: 'Booking updated successfully',
      booking: updated,
      refundAmount,
    };
  }

  async uBookingHallMember(payload: any) {
    const {
      id, // Booking ID to update
      membershipNo,
      entityId,
      bookingDate,
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      paymentMode = 'ONLINE',
      eventType,
      numberOfGuests,
      eventTime,
      paidBy = 'MEMBER',
      guestName,
      guestContact,
      remarks,
    } = payload;

    // Validate required fields
    if (!id) throw new BadRequestException('Booking ID is required');
    if (!membershipNo)
      throw new BadRequestException('Membership number is required');
    if (!entityId) throw new BadRequestException('Hall ID is required');
    if (!bookingDate)
      throw new BadRequestException('Booking date is required');
    if (!eventType) throw new BadRequestException('Event type is required');
    if (!eventTime) throw new BadRequestException('Event time is required');

    // Validate booking date
    const today = new Date();
    const booking = new Date(bookingDate);

    const todayNormalized = new Date(today);
    todayNormalized.setHours(0, 0, 0, 0);

    booking.setHours(0, 0, 0, 0);

    // Get existing booking
    const existing = await this.prismaService.hallBooking.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      throw new NotFoundException('Hall booking not found');
    }

    // Get member
    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: membershipNo },
    });

    if (!member) {
      throw new NotFoundException(`Member ${membershipNo} not found`);
    }

    // Use transaction for atomic operations
    return await this.prismaService.$transaction(async (prisma) => {
      // Validate Hall
      const hall = await prisma.hall.findFirst({
        where: { id: Number(entityId) },
        include: {
          outOfOrders: true,
        },
      });
      if (!hall) throw new BadRequestException('Hall not found');

      // Check out-of-order periods
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

      // Normalize event time
      const normalizedEventTime = eventTime.toUpperCase() as
        | 'MORNING'
        | 'EVENING'
        | 'NIGHT';

      // Check for conflicting bookings (exclude current booking)
      const conflictingBooking = await prisma.hallBooking.findFirst({
        where: {
          hallId: hall.id,
          id: { not: Number(id) },
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

      // Calculate price
      const basePrice =
        pricingType === 'member' ? hall.chargesMembers : hall.chargesGuests;
      const newTotal = totalPrice ? Number(totalPrice) : Number(basePrice);

      // Get old values
      const oldTotal = Number(existing.totalPrice);
      const oldPaid = Number(existing.paidAmount);
      const oldOwed = Number(existing.pendingAmount);
      const oldPaymentStatus = existing.paymentStatus;

      // Calculate new payment amounts
      let newPaid = oldPaid;
      let newOwed = newTotal - oldPaid;
      let newPaymentStatus: any = paymentStatus || oldPaymentStatus;
      let refundAmount = 0;

      // Detect manual status downgrade
      const isStatusDowngrade =
        paymentStatus &&
        paymentStatus !== oldPaymentStatus &&
        oldPaymentStatus === 'PAID';

      // SCENARIO 1A: Charges DECREASED - Automatic Refund
      if (newTotal < oldPaid && !isStatusDowngrade) {
        refundAmount = oldPaid - newTotal;
        newPaid = newTotal;
        newOwed = 0;
        newPaymentStatus = 'PAID';

        // Cancel original payment vouchers
        await prisma.paymentVoucher.updateMany({
          where: {
            booking_type: 'HALL',
            booking_id: Number(id),
            voucher_type: {
              in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
            },
            status: VoucherStatus.CONFIRMED,
          },
          data: {
            status: VoucherStatus.CANCELLED,
          },
        });

        // Create new payment voucher for remaining amount
        await prisma.paymentVoucher.create({
          data: {
            booking_type: 'HALL',
            booking_id: Number(id),
            membership_no: membershipNo,
            amount: newPaid,
            payment_mode: paymentMode as unknown as PaymentMode,
            voucher_type: VoucherType.FULL_PAYMENT,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'system',
            remarks: `Reissued after charge reduction | ${formatPakistanDate(booking)} - ${normalizedEventTime} - ${eventType}${remarks ? ` | ${remarks}` : ''}`,
          },
        });

        // Create refund voucher
        await prisma.paymentVoucher.create({
          data: {
            booking_type: 'HALL',
            booking_id: Number(id),
            membership_no: membershipNo,
            amount: refundAmount,
            payment_mode: paymentMode as unknown as PaymentMode,
            voucher_type: VoucherType.REFUND,
            status: VoucherStatus.PENDING,
            issued_by: 'system',
            remarks: `Refund for reduced charges | Original: ${oldTotal}, New: ${newTotal} | ${formatPakistanDate(booking)} - ${normalizedEventTime}${remarks ? ` | ${remarks}` : ''}`,
          },
        });

        // Update member ledger for refund
        await prisma.member.update({
          where: { Membership_No: membershipNo },
          data: {
            crAmount: { increment: refundAmount },
            Balance: { increment: -refundAmount },
          },
        });
      }
      // SCENARIO 1B: Manual Payment Status Downgrade (PAID → HALF_PAID/UNPAID)
      else if (isStatusDowngrade) {
        // Cancel original voucher
        await prisma.paymentVoucher.updateMany({
          where: {
            booking_type: 'HALL',
            booking_id: Number(id),
            voucher_type: {
              in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
            },
            status: VoucherStatus.CONFIRMED,
          },
          data: {
            status: VoucherStatus.CANCELLED,
          },
        });

        // Reissue voucher for new status
        if (paymentStatus === 'HALF_PAID') {
          newPaid = Number(paidAmount) || 0;
          newOwed = newTotal - newPaid;

          await prisma.paymentVoucher.create({
            data: {
              booking_type: 'HALL',
              booking_id: Number(id),
              membership_no: membershipNo,
              amount: newPaid,
              payment_mode: paymentMode as unknown as PaymentMode,
              voucher_type: VoucherType.HALF_PAYMENT,
              status: VoucherStatus.CONFIRMED,
              issued_by: 'system',
              remarks: `Reissued after status change | ${formatPakistanDate(booking)} - ${normalizedEventTime}${remarks ? ` | ${remarks}` : ''}`,
            },
          });
        } else if (paymentStatus === 'UNPAID') {
          newPaid = 0;
          newOwed = newTotal;
        }
        // NO refund voucher for manual downgrade
      }
      // SCENARIO 2: Charges INCREASED
      else if (newTotal > oldTotal) {
        // If was PAID, automatically change to HALF_PAID and reissue voucher
        if (oldPaymentStatus === 'PAID') {
          newPaymentStatus = 'HALF_PAID';
          newPaid = oldPaid;
          newOwed = newTotal - oldPaid;

          // Cancel original FULL_PAYMENT voucher
          await prisma.paymentVoucher.updateMany({
            where: {
              booking_type: 'HALL',
              booking_id: Number(id),
              voucher_type: VoucherType.FULL_PAYMENT,
              status: VoucherStatus.CONFIRMED,
            },
            data: {
              status: VoucherStatus.CANCELLED,
            },
          });

          // Create HALF_PAYMENT voucher
          await prisma.paymentVoucher.create({
            data: {
              booking_type: 'HALL',
              booking_id: Number(id),
              membership_no: membershipNo,
              amount: newPaid,
              payment_mode: paymentMode as unknown as PaymentMode,
              voucher_type: VoucherType.HALF_PAYMENT,
              status: VoucherStatus.CONFIRMED,
              issued_by: 'system',
              remarks: `Reissued after charge increase | ${formatPakistanDate(booking)} - ${normalizedEventTime}${remarks ? ` | ${remarks}` : ''}`,
            },
          });
        } else {
          // Allow manual payment status override
          if (paymentStatus === 'PAID') {
            newPaid = newTotal;
            newOwed = 0;
          } else if (paymentStatus === 'HALF_PAID') {
            newPaid = Number(paidAmount) || oldPaid;
            newOwed = newTotal - newPaid;
          } else {
            newOwed = newTotal - oldPaid;
          }
        }
      }
      // SCENARIO 3: Charges UNCHANGED but manual status override
      else if (
        newTotal === oldTotal &&
        paymentStatus &&
        paymentStatus !== oldPaymentStatus
      ) {
        if (paymentStatus === 'PAID') {
          newPaid = newTotal;
          newOwed = 0;
        } else if (paymentStatus === 'HALF_PAID') {
          newPaid = Number(paidAmount) || 0;
          newOwed = newTotal - newPaid;
        } else if (paymentStatus === 'UNPAID') {
          newPaid = 0;
          newOwed = newTotal;
        }
      }

      const paidDiff = newPaid - oldPaid;
      const owedDiff = newOwed - oldOwed;

      // Update Hall booking
      const updated = await prisma.hallBooking.update({
        where: { id: Number(id) },
        data: {
          hallId: hall.id,
          memberId: member.Sno,
          bookingDate: booking,
          totalPrice: newTotal,
          paymentStatus: newPaymentStatus,
          pricingType,
          paidAmount: newPaid,
          pendingAmount: newOwed,
          numberOfGuests: Number(numberOfGuests!),
          eventType: eventType,
          bookingTime: normalizedEventTime,
          paidBy,
          guestName,
          guestContact: guestContact?.toString(),
          refundAmount: refundAmount,
          refundReturned: false,
        },
      });

      // Update existing vouchers if date changed
      const dateChanged = existing.bookingDate.getTime() !== booking.getTime();
      if (
        dateChanged &&
        (newPaymentStatus === 'PAID' || newPaymentStatus === 'HALF_PAID')
      ) {
        await prisma.paymentVoucher.updateMany({
          where: {
            booking_id: Number(id),
            booking_type: 'HALL',
            status: VoucherStatus.CONFIRMED,
            voucher_type: {
              in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
            },
          },
          data: {
            remarks: `${formatPakistanDate(booking)} - ${normalizedEventTime} - ${eventType}${remarks ? ` | ${remarks}` : ''}`,
          },
        });
      }

      // Update Hall status
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

      // Update member ledger
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

      return {
        success: true,
        message: 'Hall booking updated successfully',
        booking: updated,
        refundAmount,
      };
    });
  }

  async uBookingLawnMember(payload: any) {
    const {
      id,
      membershipNo,
      entityId,
      bookingDate,
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      paymentMode = 'ONLINE',
      numberOfGuests,
      eventTime,
      specialRequests = '',
      paidBy = 'MEMBER',
      guestName,
      guestContact,
      remarks,
    } = payload;

    // Validate required fields
    if (!id) throw new BadRequestException('Booking ID is required');
    if (!membershipNo)
      throw new BadRequestException('Membership number is required');
    if (!entityId) throw new BadRequestException('Lawn ID is required');
    if (!bookingDate)
      throw new BadRequestException('Booking date is required');
    if (!numberOfGuests)
      throw new BadRequestException('Number of guests is required');
    if (!eventTime) throw new BadRequestException('Event time is required');

    // Validate booking date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const booking = new Date(bookingDate);
    booking.setHours(0, 0, 0, 0);

    // Get existing booking
    const existing = await this.prismaService.lawnBooking.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      throw new NotFoundException('Lawn booking not found');
    }

    // Get member
    const member = await this.prismaService.member.findUnique({
      where: { Membership_No: membershipNo },
    });

    if (!member) {
      throw new NotFoundException(`Member ${membershipNo} not found`);
    }

    // Validate Lawn
    const lawn = await this.prismaService.lawn.findFirst({
      where: { id: Number(entityId) },
      include: { outOfOrders: true },
    });

    if (!lawn) throw new NotFoundException('Lawn not found');

    // Check out-of-order periods
    const conflictingPeriod = lawn.outOfOrders?.find((period) => {
      const periodStart = new Date(period.startDate);
      const periodEnd = new Date(period.endDate);
      periodStart.setHours(0, 0, 0, 0);
      periodEnd.setHours(0, 0, 0, 0);
      return booking >= periodStart && booking <= periodEnd;
    });

    if (conflictingPeriod) {
      throw new ConflictException(
        `Lawn is out of service during selected dates`,
      );
    }

    // Normalize event time
    const normalizedEventTime = eventTime.toUpperCase() as
      | 'MORNING'
      | 'EVENING'
      | 'NIGHT';

    // Check for conflicting bookings (exclude current)
    const conflictingBooking = await this.prismaService.lawnBooking.findFirst({
      where: {
        lawnId: lawn.id,
        id: { not: Number(id) },
        bookingDate: booking,
        bookingTime: normalizedEventTime,
      },
    });

    if (conflictingBooking) {
      throw new ConflictException(
        `Lawn is already booked for this date and time slot`,
      );
    }

    // Check guest count
    if (numberOfGuests < (lawn.minGuests || 0)) {
      throw new ConflictException(
        `Number of guests below minimum (${lawn.minGuests})`,
      );
    }
    if (numberOfGuests > lawn.maxGuests) {
      throw new ConflictException(
        `Number of guests exceeds maximum (${lawn.maxGuests})`,
      );
    }

    // Calculate price
    const basePrice =
      pricingType === 'member' ? lawn.memberCharges : lawn.guestCharges;
    const newTotal = totalPrice ? Number(totalPrice) : Number(basePrice);

    // Get old values
    const oldTotal = Number(existing.totalPrice);
    const oldPaid = Number(existing.paidAmount);
    const oldOwed = Number(existing.pendingAmount);
    const oldPaymentStatus = existing.paymentStatus;

    // Calculate new values
    let newPaid = oldPaid;
    let newOwed = newTotal - oldPaid;
    let newPaymentStatus: any = paymentStatus || oldPaymentStatus;
    let refundAmount = 0;

    const isStatusDowngrade =
      paymentStatus &&
      paymentStatus !== oldPaymentStatus &&
      oldPaymentStatus === 'PAID';

    // SCENARIO 1A: Charges DECREASED
    if (newTotal < oldPaid && !isStatusDowngrade) {
      refundAmount = oldPaid - newTotal;
      newPaid = newTotal;
      newOwed = 0;
      newPaymentStatus = 'PAID';

      await this.prismaService.paymentVoucher.updateMany({
        where: {
          booking_type: 'LAWN',
          booking_id: Number(id),
          voucher_type: {
            in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
          },
          status: VoucherStatus.CONFIRMED,
        },
        data: { status: VoucherStatus.CANCELLED },
      });

      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'LAWN',
          booking_id: Number(id),
          membership_no: membershipNo,
          amount: newPaid,
          payment_mode: paymentMode as unknown as PaymentMode,
          voucher_type: VoucherType.FULL_PAYMENT,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'system',
          remarks: `Reissued | ${formatPakistanDate(booking)} - ${normalizedEventTime}${remarks ? ` | ${remarks}` : ''}`,
        },
      });

      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'LAWN',
          booking_id: Number(id),
          membership_no: membershipNo,
          amount: refundAmount,
          payment_mode: paymentMode as unknown as PaymentMode,
          voucher_type: VoucherType.REFUND,
          status: VoucherStatus.PENDING,
          issued_by: 'system',
          remarks: `Refund | Original: ${oldTotal}, New: ${newTotal}${remarks ? ` | ${remarks}` : ''}`,
        },
      });

      await this.prismaService.member.update({
        where: { Membership_No: membershipNo },
        data: {
          crAmount: { increment: refundAmount },
          Balance: { increment: -refundAmount },
        },
      });
    }
    // SCENARIO 1B: Manual downgrade
    else if (isStatusDowngrade) {
      await this.prismaService.paymentVoucher.updateMany({
        where: {
          booking_type: 'LAWN',
          booking_id: Number(id),
          voucher_type: {
            in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
          },
          status: VoucherStatus.CONFIRMED,
        },
        data: { status: VoucherStatus.CANCELLED },
      });

      if (paymentStatus === 'HALF_PAID') {
        newPaid = Number(paidAmount) || 0;
        newOwed = newTotal - newPaid;

        await this.prismaService.paymentVoucher.create({
          data: {
            booking_type: 'LAWN',
            booking_id: Number(id),
            membership_no: membershipNo,
            amount: newPaid,
            payment_mode: paymentMode as unknown as PaymentMode,
            voucher_type: VoucherType.HALF_PAYMENT,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'system',
            remarks: `Status change${remarks ? ` | ${remarks}` : ''}`,
          },
        });
      } else if (paymentStatus === 'UNPAID') {
        newPaid = 0;
        newOwed = newTotal;
      }
    }
    // SCENARIO 2: Charges INCREASED
    else if (newTotal > oldTotal) {
      if (oldPaymentStatus === 'PAID') {
        newPaymentStatus = 'HALF_PAID';
        newPaid = oldPaid;
        newOwed = newTotal - oldPaid;

        await this.prismaService.paymentVoucher.updateMany({
          where: {
            booking_type: 'LAWN',
            booking_id: Number(id),
            voucher_type: VoucherType.FULL_PAYMENT,
            status: VoucherStatus.CONFIRMED,
          },
          data: { status: VoucherStatus.CANCELLED },
        });

        await this.prismaService.paymentVoucher.create({
          data: {
            booking_type: 'LAWN',
            booking_id: Number(id),
            membership_no: membershipNo,
            amount: newPaid,
            payment_mode: paymentMode as unknown as PaymentMode,
            voucher_type: VoucherType.HALF_PAYMENT,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'system',
            remarks: `Charge increase${remarks ? ` | ${remarks}` : ''}`,
          },
        });
      } else {
        if (paymentStatus === 'PAID') {
          newPaid = newTotal;
          newOwed = 0;
        } else if (paymentStatus === 'HALF_PAID') {
          newPaid = Number(paidAmount) || oldPaid;
          newOwed = newTotal - newPaid;
        } else {
          newOwed = newTotal - oldPaid;
        }
      }
    }
    // SCENARIO 3: Manual override
    else if (
      newTotal === oldTotal &&
      paymentStatus &&
      paymentStatus !== oldPaymentStatus
    ) {
      if (paymentStatus === 'PAID') {
        newPaid = newTotal;
        newOwed = 0;
      } else if (paymentStatus === 'HALF_PAID') {
        newPaid = Number(paidAmount) || 0;
        newOwed = newTotal - newPaid;
      } else if (paymentStatus === 'UNPAID') {
        newPaid = 0;
        newOwed = newTotal;
      }
    }

    const paidDiff = newPaid - oldPaid;
    const owedDiff = newOwed - oldOwed;

    // Update booking
    const updated = await this.prismaService.lawnBooking.update({
      where: { id: Number(id) },
      data: {
        lawnId: lawn.id,
        memberId: member.Sno,
        bookingDate: booking,
        totalPrice: newTotal,
        paymentStatus: newPaymentStatus,
        pricingType,
        paidAmount: newPaid,
        pendingAmount: newOwed,
        guestsCount: Number(numberOfGuests),
        bookingTime: normalizedEventTime,
        paidBy,
        guestName,
        guestContact: guestContact?.toString(),
        refundAmount,
        refundReturned: false,
      },
    });

    // Update voucher if date changed
    const dateChanged = existing.bookingDate.getTime() !== booking.getTime();
    if (
      dateChanged &&
      (newPaymentStatus === 'PAID' || newPaymentStatus === 'HALF_PAID')
    ) {
      await this.prismaService.paymentVoucher.updateMany({
        where: {
          booking_id: Number(id),
          booking_type: 'LAWN',
          status: VoucherStatus.CONFIRMED,
          voucher_type: {
            in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
          },
        },
        data: {
          remarks: `${formatPakistanDate(booking)} - ${normalizedEventTime}${remarks ? ` | ${remarks}` : ''}`,
        },
      });
    }

    // Update member ledger
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

    return {
      success: true,
      message: 'Lawn booking updated successfully',
      booking: updated,
      refundAmount,
    };
  }

  async uBookingPhotoshootMember(payload: any) {
    const {
      id,
      membershipNo,
      entityId,
      bookingDate,
      startTime,
      endTime,
      totalPrice,
      paymentStatus,
      pricingType,
      paidAmount,
      paymentMode = 'ONLINE',
      specialRequests = '',
      paidBy = 'MEMBER',
      guestName,
      guestContact,
      remarks,
    } = payload;

    // Validate required fields
    if (!id) throw new BadRequestException('Booking ID is required');
    if (!membershipNo)
      throw new BadRequestException('Membership number is required');
    if (!entityId)
      throw new BadRequestException('Photoshoot service ID is required');
    if (!bookingDate)
      throw new BadRequestException('Booking date is required');
    if (!startTime) throw new BadRequestException('Start time is required');
    if (!endTime) throw new BadRequestException('End time is required');

    // Parse dates and times
    const booking = new Date(bookingDate);
    booking.setHours(0, 0, 0, 0);
    const newStartTime = new Date(startTime);
    const newEndTime = new Date(endTime);

    // Get existing booking
    const existing = await this.prismaService.photoshootBooking.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      throw new NotFoundException('Photoshoot booking not found');
    }

    // Get member
    const member = await this.prismaService.member.findUnique({
      where: { Membership_No: membershipNo },
    });

    if (!member) {
      throw new NotFoundException(`Member ${membershipNo} not found`);
    }

    // Validate photoshoot service
    const photoshoot = await this.prismaService.photoshoot.findFirst({
      where: { id: Number(entityId) },
    });

    if (!photoshoot) throw new NotFoundException('Photoshoot service not found');
    if (!photoshoot.isActive) {
      throw new ConflictException('Photoshoot service is not active');
    }

    // Check for conflicting bookings (exclude current)
    const conflictingBooking =
      await this.prismaService.photoshootBooking.findFirst({
        where: {
          photoshootId: photoshoot.id,
          id: { not: Number(id) },
          bookingDate: booking,
          OR: [
            {
              AND: [
                { startTime: { lt: newEndTime } },
                { endTime: { gt: newStartTime } },
              ],
            },
          ],
        },
      });

    if (conflictingBooking) {
      throw new ConflictException(
        `Photoshoot service already booked for this date and time slot`,
      );
    }

    // Calculate price
    const basePrice =
      pricingType === 'member'
        ? photoshoot.memberCharges
        : photoshoot.guestCharges;
    const newTotal = totalPrice ? Number(totalPrice) : Number(basePrice);

    // Get old values
    const oldTotal = Number(existing.totalPrice);
    const oldPaid = Number(existing.paidAmount);
    const oldOwed = Number(existing.pendingAmount);
    const oldPaymentStatus = existing.paymentStatus;

    // Calculate new values
    let newPaid = oldPaid;
    let newOwed = newTotal - oldPaid;
    let newPaymentStatus: any = paymentStatus || oldPaymentStatus;
    let refundAmount = 0;

    const isStatusDowngrade =
      paymentStatus &&
      paymentStatus !== oldPaymentStatus &&
      oldPaymentStatus === 'PAID';

    // SCENARIO 1A: Charges DECREASED
    if (newTotal < oldPaid && !isStatusDowngrade) {
      refundAmount = oldPaid - newTotal;
      newPaid = newTotal;
      newOwed = 0;
      newPaymentStatus = 'PAID';

      await this.prismaService.paymentVoucher.updateMany({
        where: {
          booking_type: 'PHOTOSHOOT',
          booking_id: Number(id),
          voucher_type: {
            in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
          },
          status: VoucherStatus.CONFIRMED,
        },
        data: { status: VoucherStatus.CANCELLED },
      });

      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'PHOTOSHOOT',
          booking_id: Number(id),
          membership_no: membershipNo,
          amount: newPaid,
          payment_mode: paymentMode as unknown as PaymentMode,
          voucher_type: VoucherType.FULL_PAYMENT,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'system',
          remarks: `Reissued | ${formatPakistanDate(booking)} - ${newStartTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} to ${newEndTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}${remarks ? ` | ${remarks}` : ''}`,
        },
      });

      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'PHOTOSHOOT',
          booking_id: Number(id),
          membership_no: membershipNo,
          amount: refundAmount,
          payment_mode: paymentMode as unknown as PaymentMode,
          voucher_type: VoucherType.REFUND,
          status: VoucherStatus.PENDING,
          issued_by: 'system',
          remarks: `Refund | Original: ${oldTotal}, New: ${newTotal}${remarks ? ` | ${remarks}` : ''}`,
        },
      });

      await this.prismaService.member.update({
        where: { Membership_No: membershipNo },
        data: {
          crAmount: { increment: refundAmount },
          Balance: { increment: -refundAmount },
        },
      });
    }
    // SCENARIO 1B: Manual downgrade
    else if (isStatusDowngrade) {
      await this.prismaService.paymentVoucher.updateMany({
        where: {
          booking_type: 'PHOTOSHOOT',
          booking_id: Number(id),
          voucher_type: {
            in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
          },
          status: VoucherStatus.CONFIRMED,
        },
        data: { status: VoucherStatus.CANCELLED },
      });

      if (paymentStatus === 'HALF_PAID') {
        newPaid = Number(paidAmount) || 0;
        newOwed = newTotal - newPaid;

        await this.prismaService.paymentVoucher.create({
          data: {
            booking_type: 'PHOTOSHOOT',
            booking_id: Number(id),
            membership_no: membershipNo,
            amount: newPaid,
            payment_mode: paymentMode as unknown as PaymentMode,
            voucher_type: VoucherType.HALF_PAYMENT,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'system',
            remarks: `Status change${remarks ? ` | ${remarks}` : ''}`,
          },
        });
      } else if (paymentStatus === 'UNPAID') {
        newPaid = 0;
        newOwed = newTotal;
      }
    }
    // SCENARIO 2: Charges INCREASED
    else if (newTotal > oldTotal) {
      if (oldPaymentStatus === 'PAID') {
        newPaymentStatus = 'HALF_PAID';
        newPaid = oldPaid;
        newOwed = newTotal - oldPaid;

        await this.prismaService.paymentVoucher.updateMany({
          where: {
            booking_type: 'PHOTOSHOOT',
            booking_id: Number(id),
            voucher_type: VoucherType.FULL_PAYMENT,
            status: VoucherStatus.CONFIRMED,
          },
          data: { status: VoucherStatus.CANCELLED },
        });

        await this.prismaService.paymentVoucher.create({
          data: {
            booking_type: 'PHOTOSHOOT',
            booking_id: Number(id),
            membership_no: membershipNo,
            amount: newPaid,
            payment_mode: paymentMode as unknown as PaymentMode,
            voucher_type: VoucherType.HALF_PAYMENT,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'system',
            remarks: `Charge increase${remarks ? ` | ${remarks}` : ''}`,
          },
        });
      } else {
        if (paymentStatus === 'PAID') {
          newPaid = newTotal;
          newOwed = 0;
        } else if (paymentStatus === 'HALF_PAID') {
          newPaid = Number(paidAmount) || oldPaid;
          newOwed = newTotal - newPaid;
        } else {
          newOwed = newTotal - oldPaid;
        }
      }
    }
    // SCENARIO 3: Manual override
    else if (
      newTotal === oldTotal &&
      paymentStatus &&
      paymentStatus !== oldPaymentStatus
    ) {
      if (paymentStatus === 'PAID') {
        newPaid = newTotal;
        newOwed = 0;
      } else if (paymentStatus === 'HALF_PAID') {
        newPaid = Number(paidAmount) || 0;
        newOwed = newTotal - newPaid;
      } else if (paymentStatus === 'UNPAID') {
        newPaid = 0;
        newOwed = newTotal;
      }
    }

    const paidDiff = newPaid - oldPaid;
    const owedDiff = newOwed - oldOwed;

    // Update booking
    const updated = await this.prismaService.photoshootBooking.update({
      where: { id: Number(id) },
      data: {
        photoshootId: photoshoot.id,
        memberId: member.Sno,
        bookingDate: booking,
        startTime: newStartTime,
        endTime: newEndTime,
        totalPrice: newTotal,
        paymentStatus: newPaymentStatus,
        pricingType,
        paidAmount: newPaid,
        pendingAmount: newOwed,
        paidBy,
        guestName,
        guestContact: guestContact?.toString(),
        refundAmount,
        refundReturned: false,
      },
    });

    // Update voucher if date or time changed
    const dateChanged = existing.bookingDate.getTime() !== booking.getTime();
    const timeChanged =
      existing.startTime.getTime() !== newStartTime.getTime() ||
      existing.endTime.getTime() !== newEndTime.getTime();

    if (
      (dateChanged || timeChanged) &&
      (newPaymentStatus === 'PAID' || newPaymentStatus === 'HALF_PAID')
    ) {
      await this.prismaService.paymentVoucher.updateMany({
        where: {
          booking_id: Number(id),
          booking_type: 'PHOTOSHOOT',
          status: VoucherStatus.CONFIRMED,
          voucher_type: {
            in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
          },
        },
        data: {
          remarks: `${formatPakistanDate(booking)} - ${newStartTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} to ${newEndTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}${remarks ? ` | ${remarks}` : ''}`,
        },
      });
    }

    // Update member ledger
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

    return {
      success: true,
      message: 'Photoshoot booking updated successfully',
      booking: updated,
      refundAmount,
    };
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
      remarks,
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

    // ── 7. CALCULATE PAYMENT AMOUNTS AND AUTO-ADJUST STATUS ────
    const oldPaid = Number(booking.paidAmount);
    const oldOwed = Number(booking.pendingAmount!);
    const oldTotal = Number(booking.totalPrice);

    const newTotal =
      totalPrice !== undefined
        ? Number(totalPrice)
        : Number(booking.totalPrice);

    let newPaid = oldPaid; // Start with what was already paid
    let newOwed = 0;
    let newPaymentStatus = booking.paymentStatus;
    let refundAmount = 0;

    // ── CHECK FOR PAYMENT STATUS DOWNGRADE (PAID → HALF_PAID/UNPAID) ──
    let isStatusDowngrade = false;
    if (
      booking.paymentStatus === PaymentStatus.PAID &&
      paymentStatus !== undefined &&
      (paymentStatus === (PaymentStatus.HALF_PAID as unknown) ||
        paymentStatus === (PaymentStatus.UNPAID as unknown))
    ) {
      isStatusDowngrade = true;
      // Calculate refund when downgrading status
      const newPaidValue = paidAmount !== undefined ? Number(paidAmount) : 0;
      if (newPaidValue < oldPaid) {
        refundAmount = oldPaid - newPaidValue;
      }
    }

    // ── SCENARIO 1A: Charges DECREASED (e.g., 4-6 became 4-5) ────
    if (newTotal < oldPaid && !isStatusDowngrade) {
      // Customer overpaid, issue refund
      refundAmount = oldPaid - newTotal;
      newPaid = newTotal; // All new charges are covered
      newOwed = 0;
      newPaymentStatus = PaymentStatus.PAID; // Mark as PAID since fully covered + refund

      // 1. Cancel original payment voucher(s)
      await this.prismaService.paymentVoucher.updateMany({
        where: {
          booking_type: 'ROOM',
          booking_id: booking.id,
          voucher_type: {
            in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
          },
          status: VoucherStatus.CONFIRMED,
        },
        data: {
          status: VoucherStatus.CANCELLED,
        },
      });

      // 2. Create new payment voucher for remaining amount
      if (newPaid > 0) {
        await this.prismaService.paymentVoucher.create({
          data: {
            booking_type: 'ROOM',
            booking_id: booking.id,
            membership_no: membershipNo ?? booking.Membership_No,
            amount: newPaid,
            payment_mode: PaymentMode.CASH,
            voucher_type: VoucherType.FULL_PAYMENT,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'admin',
            remarks:
              remarks ||
              `Reissued payment voucher (charges reduced from ${oldTotal} to ${newTotal}). Room #${room.roomNumber} | ${formatPakistanDate(newCheckIn)} → ${formatPakistanDate(newCheckOut)}`,
          },
        });
      }

      // 3. Create refund voucher
      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'ROOM',
          booking_id: booking.id,
          membership_no: membershipNo ?? booking.Membership_No,
          amount: refundAmount,
          payment_mode: PaymentMode.CASH,
          voucher_type: VoucherType.REFUND,
          status: VoucherStatus.PENDING,
          issued_by: 'admin',
          remarks:
            remarks ||
            `Refund for booking update - charges reduced from ${oldTotal} to ${newTotal}. Original: ${formatPakistanDate(booking.checkIn)} → ${formatPakistanDate(booking.checkOut)}. Updated: ${formatPakistanDate(newCheckIn)} → ${formatPakistanDate(newCheckOut)}`,
        },
      });

      // Update member ledger for refund
      await this.prismaService.member.update({
        where: { Membership_No: membershipNo ?? booking.Membership_No },
        data: {
          crAmount: { increment: refundAmount },
          Balance: { decrement: refundAmount },
        },
      });
    }
    // ── SCENARIO 1B: Payment STATUS DOWNGRADE (PAID → HALF_PAID/UNPAID) ────
    else if (isStatusDowngrade) {
      newPaymentStatus = paymentStatus as unknown as PaymentStatus;
      newPaid = paidAmount !== undefined ? Number(paidAmount) : 0;
      newOwed = newTotal - newPaid;

      // 1. Cancel original payment voucher(s)
      await this.prismaService.paymentVoucher.updateMany({
        where: {
          booking_type: 'ROOM',
          booking_id: booking.id,
          voucher_type: {
            in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
          },
          status: VoucherStatus.CONFIRMED,
        },
        data: {
          status: VoucherStatus.CANCELLED,
        },
      });

      // 2. Create new payment voucher for remaining amount (if HALF_PAID)
      if (newPaid > 0) {
        const newVoucherType =
          newPaymentStatus === (PaymentStatus.PAID as unknown)
            ? VoucherType.FULL_PAYMENT
            : VoucherType.HALF_PAYMENT;

        await this.prismaService.paymentVoucher.create({
          data: {
            booking_type: 'ROOM',
            booking_id: booking.id,
            membership_no: membershipNo ?? booking.Membership_No,
            amount: newPaid,
            payment_mode: PaymentMode.CASH,
            voucher_type: newVoucherType,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'admin',
            remarks:
              remarks ||
              `Payment voucher reissued (status manually changed from PAID to ${paymentStatus}). Room #${room.roomNumber} | ${formatPakistanDate(newCheckIn)} → ${formatPakistanDate(newCheckOut)}`,
          },
        });
      }

      // Note: No refund voucher or ledger update - admin handles refunds separately
    }
    // ── SCENARIO 2: Charges INCREASED (e.g., 4-5 became 4-6) ────
    else if (newTotal > oldPaid) {
      // Check if booking was previously PAID - need to adjust voucher
      const wasPreviouslyPaid = booking.paymentStatus === PaymentStatus.PAID;

      // Check if user manually provided a status (e.g. PAID)
      if (paymentStatus !== undefined) {
        newPaymentStatus = paymentStatus as unknown as PaymentStatus;

        if (newPaymentStatus === (PaymentStatus.PAID as unknown)) {
          newPaid = newTotal;
          newOwed = 0;
        } else if (newPaymentStatus === (PaymentStatus.HALF_PAID as unknown)) {
          newPaid = paidAmount !== undefined ? Number(paidAmount) : oldPaid;
          newOwed = newTotal - newPaid;
        } else {
          // UNPAID
          newPaid = 0;
          newOwed = newTotal;
        }
      } else {
        // Auto-calculate if no status provided
        newPaid = oldPaid;
        newOwed = newTotal - oldPaid;

        if (oldPaid === 0) {
          newPaymentStatus = PaymentStatus.UNPAID;
        } else if (oldPaid > 0 && newOwed > 0) {
          newPaymentStatus = PaymentStatus.HALF_PAID;
        }
      }

      // If booking was PAID and now becomes HALF_PAID, update voucher
      if (wasPreviouslyPaid && newPaymentStatus === PaymentStatus.HALF_PAID) {
        // 1. Cancel original FULL_PAYMENT voucher
        await this.prismaService.paymentVoucher.updateMany({
          where: {
            booking_type: 'ROOM',
            booking_id: booking.id,
            voucher_type: VoucherType.FULL_PAYMENT,
            status: VoucherStatus.CONFIRMED,
          },
          data: {
            status: VoucherStatus.CANCELLED,
          },
        });

        // 2. Create new HALF_PAYMENT voucher for the amount already paid
        await this.prismaService.paymentVoucher.create({
          data: {
            booking_type: 'ROOM',
            booking_id: booking.id,
            membership_no: membershipNo ?? booking.Membership_No,
            amount: oldPaid,
            payment_mode: PaymentMode.CASH,
            voucher_type: VoucherType.HALF_PAYMENT,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'admin',
            remarks:
              remarks ||
              `Reissued as half payment (charges increased from ${oldTotal} to ${newTotal}). Room #${room.roomNumber} | ${formatPakistanDate(newCheckIn)} → ${formatPakistanDate(newCheckOut)}`,
          },
        });
      }
    }
    // ── SCENARIO 3: Charges UNCHANGED ────────────────────────────
    else {
      // Total unchanged, keep existing payment status
      newPaid = oldPaid;
      newOwed = oldOwed;
      // Payment status can still be manually updated via paymentStatus parameter
      if (paymentStatus !== undefined) {
        newPaymentStatus = paymentStatus as unknown as PaymentStatus;

        // Recalculate based on new status if provided
        if (newPaymentStatus === (PaymentStatus.PAID as unknown)) {
          newPaid = newTotal;
          newOwed = 0;
        } else if (newPaymentStatus === (PaymentStatus.HALF_PAID as unknown)) {
          newPaid = paidAmount !== undefined ? Number(paidAmount) : oldPaid;
          newOwed = newTotal - newPaid;
        } else if (newPaymentStatus === (PaymentStatus.UNPAID as unknown)) {
          newPaid = 0;
          newOwed = newTotal;
        }
      }
    }

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
        paymentStatus: newPaymentStatus,
        pricingType: pricingType ?? booking.pricingType,
        paidAmount: newPaid,
        pendingAmount: newOwed,
        numberOfAdults: newNumberOfAdults,
        numberOfChildren: newNumberOfChildren,
        specialRequests: specialRequests ?? booking.specialRequests,
        remarks: remarks!,
        paidBy,
        guestName,
        guestContact: guestContact?.toString(),
        refundAmount: refundAmount,
        refundReturned: false,
      },
    });

    // ── 8B. UPDATE EXISTING VOUCHERS IF DATES CHANGED ─────────
    // If check-in/check-out dates changed and there are existing payment vouchers, update them
    const datesChanged =
      booking.checkIn.getTime() !== newCheckIn.getTime() ||
      booking.checkOut.getTime() !== newCheckOut.getTime();

    if (
      datesChanged &&
      (newPaymentStatus === 'PAID' || newPaymentStatus === 'HALF_PAID')
    ) {
      // Update all CONFIRMED payment vouchers for this booking with the new dates
      await this.prismaService.paymentVoucher.updateMany({
        where: {
          booking_id: booking.id,
          booking_type: 'ROOM',
          status: VoucherStatus.CONFIRMED,
          voucher_type: {
            in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
          },
        },
        data: {
          remarks: `${formatPakistanDate(newCheckIn)} to ${formatPakistanDate(newCheckOut)}${remarks ? ` | ${remarks}` : ''}`,
        },
      });
    }

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
      remarks,
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
          remarks: remarks!,
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
      remarks,
    } = payload;
    // console.log(paidBy);
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

      // ── PAYMENT CALCULATIONS AND AUTO-ADJUST STATUS ───────────
      const prevPaid = Number(existing.paidAmount);
      const prevTotal = Number(existing.totalPrice);
      const prevOwed = prevTotal - prevPaid;

      const total = Number(totalPrice);
      let paid = prevPaid; // Start with existing payment
      let owed = 0;
      let newPaymentStatus = existing.paymentStatus;
      let refundAmount = 0;

      // ── CHECK FOR PAYMENT STATUS DOWNGRADE (PAID → HALF_PAID/UNPAID) ──
      let isStatusDowngrade = false;
      if (
        existing.paymentStatus === PaymentStatus.PAID &&
        paymentStatus !== undefined &&
        (paymentStatus === ('HALF_PAID' as any) ||
          paymentStatus === ('UNPAID' as any))
      ) {
        isStatusDowngrade = true;
        const newPaidValue = paidAmount !== undefined ? Number(paidAmount) : 0;
        if (newPaidValue < prevPaid) {
          refundAmount = prevPaid - newPaidValue;
        }
      }

      // ── SCENARIO 1A: Charges DECREASED ──────────────────────────
      if (total < prevPaid && !isStatusDowngrade) {
        refundAmount = prevPaid - total;
        paid = total;
        owed = 0;
        newPaymentStatus = PaymentStatus.PAID; // Mark as PAID

        // 1. Cancel original payment voucher(s)
        await prisma.paymentVoucher.updateMany({
          where: {
            booking_type: 'HALL',
            booking_id: existing.id,
            voucher_type: {
              in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
            },
            status: VoucherStatus.CONFIRMED,
          },
          data: {
            status: VoucherStatus.CANCELLED,
          },
        });

        // 2. Create new payment voucher for remaining amount
        if (paid > 0) {
          await prisma.paymentVoucher.create({
            data: {
              booking_type: 'HALL',
              booking_id: existing.id,
              membership_no: membershipNo,
              amount: paid,
              payment_mode: PaymentMode.CASH,
              voucher_type: VoucherType.FULL_PAYMENT,
              status: VoucherStatus.CONFIRMED,
              issued_by: 'admin',
              remarks: `Reissued payment voucher (charges reduced from ${prevTotal} to ${total}). Hall: ${hall.name}, Date: ${booking.toLocaleDateString()}`,
            },
          });
        }

        // 3. Create refund voucher
        await prisma.paymentVoucher.create({
          data: {
            booking_type: 'HALL',
            booking_id: existing.id,
            membership_no: membershipNo,
            amount: refundAmount,
            payment_mode: PaymentMode.CASH,
            voucher_type: VoucherType.REFUND,
            status: VoucherStatus.PENDING,
            issued_by: 'admin',
            remarks: `Refund for hall booking update - charges reduced from ${prevTotal} to ${total}. Hall: ${hall.name}, Date: ${booking.toLocaleDateString()}`,
          },
        });

        // Update member ledger for refund
        await prisma.member.update({
          where: { Membership_No: membershipNo },
          data: {
            crAmount: { increment: refundAmount },
            Balance: { decrement: refundAmount },
          },
        });
      }
      // ── SCENARIO 1B: Payment STATUS DOWNGRADE (PAID → HALF_PAID/UNPAID) ────
      else if (isStatusDowngrade) {
        newPaymentStatus = paymentStatus as any;
        paid = Number(paidAmount) || 0;
        owed = total - paid;

        // 1. Cancel original payment voucher(s)
        await prisma.paymentVoucher.updateMany({
          where: {
            booking_type: 'HALL',
            booking_id: existing.id,
            voucher_type: {
              in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
            },
            status: VoucherStatus.CONFIRMED,
          },
          data: {
            status: VoucherStatus.CANCELLED,
          },
        });

        // 2. Create new payment voucher for remaining amount (if HALF_PAID)
        if (paid > 0) {
          const newVoucherType =
            newPaymentStatus === ('PAID' as any)
              ? VoucherType.FULL_PAYMENT
              : VoucherType.HALF_PAYMENT;

          await prisma.paymentVoucher.create({
            data: {
              booking_type: 'HALL',
              booking_id: existing.id,
              membership_no: membershipNo,
              amount: paid,
              payment_mode: PaymentMode.CASH,
              voucher_type: newVoucherType,
              status: VoucherStatus.CONFIRMED,
              issued_by: 'admin',
              remarks: `Payment voucher reissued (status manually changed from PAID to ${paymentStatus}). Hall: ${hall.name}, Date: ${booking.toLocaleDateString()}`,
            },
          });
        }

        // Note: No refund voucher or ledger update - admin handles refunds separately
      }
      // ── SCENARIO 2: Charges INCREASED ──────────────────────────
      else if (total > prevPaid) {
        // Check if booking was previously PAID - need to adjust voucher
        const wasPreviouslyPaid = existing.paymentStatus === PaymentStatus.PAID;

        if (paymentStatus !== undefined) {
          newPaymentStatus = paymentStatus as any;
          if (newPaymentStatus === ('PAID' as any)) {
            paid = total;
            owed = 0;
          } else if (newPaymentStatus === ('HALF_PAID' as any)) {
            paid = Number(paidAmount) || prevPaid;
            owed = total - paid;
          } else {
            paid = 0;
            owed = total;
          }
        } else {
          paid = prevPaid;
          owed = total - prevPaid;

          if (prevPaid === 0) {
            newPaymentStatus = PaymentStatus.UNPAID;
          } else if (prevPaid > 0 && owed > 0) {
            newPaymentStatus = PaymentStatus.HALF_PAID;
          }
        }

        // If booking was PAID and now becomes HALF_PAID, update voucher
        if (wasPreviouslyPaid && newPaymentStatus === ('HALF_PAID' as any)) {
          // 1. Cancel original FULL_PAYMENT voucher
          await prisma.paymentVoucher.updateMany({
            where: {
              booking_type: 'HALL',
              booking_id: existing.id,
              voucher_type: VoucherType.FULL_PAYMENT,
              status: VoucherStatus.CONFIRMED,
            },
            data: {
              status: VoucherStatus.CANCELLED,
            },
          });

          // 2. Create new HALF_PAYMENT voucher for the amount already paid
          await prisma.paymentVoucher.create({
            data: {
              booking_type: 'HALL',
              booking_id: existing.id,
              membership_no: membershipNo,
              amount: prevPaid,
              payment_mode: PaymentMode.CASH,
              voucher_type: VoucherType.HALF_PAYMENT,
              status: VoucherStatus.CONFIRMED,
              issued_by: 'admin',
              remarks: `Reissued as half payment (charges increased from ${prevTotal} to ${total}). Hall: ${hall.name}, Date: ${booking.toLocaleDateString()}`,
            },
          });
        }
      }
      // ── SCENARIO 3: Charges UNCHANGED ──────────────────────────
      else {
        paid = prevPaid;
        owed = prevOwed;
        // Allow manual status update if provided
        if (paymentStatus !== undefined) {
          newPaymentStatus = paymentStatus as any;
          if (newPaymentStatus === ('PAID' as any)) {
            paid = total;
            owed = 0;
          } else if (newPaymentStatus === ('HALF_PAID' as any)) {
            paid = Number(paidAmount) || prevPaid;
            owed = total - paid;
          } else if (newPaymentStatus === ('UNPAID' as any)) {
            paid = 0;
            owed = total;
          }
        }
      }

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
          paymentStatus: newPaymentStatus,
          pricingType,
          paidAmount: paid,
          pendingAmount: owed,
          numberOfGuests: Number(numberOfGuests!),
          eventType: eventType,
          bookingTime: normalizedEventTime,
          paidBy,
          guestName,
          guestContact: guestContact?.toString(),
          refundAmount: refundAmount,
          refundReturned: false,
        },
      });

      // ── UPDATE EXISTING VOUCHERS IF DATE CHANGED ─────────
      // If booking date changed and there are existing payment vouchers, update them
      const dateChanged = existing.bookingDate.getTime() !== booking.getTime();
      if (
        dateChanged &&
        (newPaymentStatus === 'PAID' || newPaymentStatus === 'HALF_PAID')
      ) {
        // Update all CONFIRMED payment vouchers for this booking with the new date
        await prisma.paymentVoucher.updateMany({
          where: {
            booking_id: Number(id),
            booking_type: 'HALL',
            status: VoucherStatus.CONFIRMED,
            voucher_type: {
              in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
            },
          },
          data: {
            remarks: `${formatPakistanDate(booking)} - ${normalizedEventTime} - ${eventType}${remarks ? ` | ${remarks}` : ''}`,
          },
        });
      }

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
      paidBy = 'MEMBER',
      guestName,
      guestContact,
    } = payload;
    console.log(paidBy)

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
  async gBookingsLawn() {
    return await this.prismaService.lawnBooking.findMany({
      orderBy: { bookingDate: 'desc' },
      include: {
        lawn: { include: {lawnCategory: true} },
        member: {
          select: { Membership_No: true, Name: true },
        },
      },
    });
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
      paymentMode = 'CASH',
      numberOfGuests,
      eventTime,
      paidBy = 'MEMBER',
      guestName,
      guestContact,
      remarks,
    } = payload;

    // Validate required fields
    if (!id) throw new BadRequestException('Booking ID is required');
    if (!membershipNo)
      throw new BadRequestException('Membership number is required');
    if (!entityId) throw new BadRequestException('Lawn ID is required');
    if (!bookingDate)
      throw new BadRequestException('Booking date is required');
    if (!numberOfGuests)
      throw new BadRequestException('Number of guests is required');
    if (!eventTime) throw new BadRequestException('Event time is required');

    // Get existing booking
    const existing = await this.prismaService.lawnBooking.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      throw new NotFoundException('Lawn booking not found');
    }

    // Get member
    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: membershipNo },
    });

    if (!member) {
      throw new NotFoundException(`Member ${membershipNo} not found`);
    }

    // Use transaction for atomic operations
    return await this.prismaService.$transaction(async (prisma) => {
      // Validate Lawn
      const lawn = await prisma.lawn.findFirst({
        where: { id: Number(entityId) },
        include: { outOfOrders: true },
      });

      if (!lawn) throw new NotFoundException('Lawn not found');

      // Check out-of-order periods
      const bookingDateObj = new Date(bookingDate);
      bookingDateObj.setHours(0, 0, 0, 0);

      const conflictingPeriod = lawn.outOfOrders?.find((period) => {
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setHours(0, 0, 0, 0);
        return (
          bookingDateObj >= periodStart && bookingDateObj <= periodEnd
        );
      });

      if (conflictingPeriod) {
        throw new ConflictException(
          `Lawn is out of service during selected dates`,
        );
      }

      // Normalize event time
      const normalizedEventTime = eventTime.toUpperCase() as
        | 'MORNING'
        | 'EVENING'
        | 'NIGHT';

      // Check for conflicting bookings (exclude current)
      const conflictingBooking = await prisma.lawnBooking.findFirst({
        where: {
          lawnId: lawn.id,
          id: { not: Number(id) },
          bookingDate: bookingDateObj,
          bookingTime: normalizedEventTime,
        },
      });

      if (conflictingBooking) {
        throw new ConflictException(
          `Lawn is already booked for this date and time slot`,
        );
      }

      // Check guest count
      if (numberOfGuests < (lawn.minGuests || 0)) {
        throw new ConflictException(
          `Number of guests below minimum (${lawn.minGuests})`,
        );
      }
      if (numberOfGuests > lawn.maxGuests) {
        throw new ConflictException(
          `Number of guests exceeds maximum (${lawn.maxGuests})`,
        );
      }

      // Calculate price
      const basePrice =
        pricingType === 'member' ? lawn.memberCharges : lawn.guestCharges;
      const newTotal = totalPrice ? Number(totalPrice) : Number(basePrice);

      // Get old values
      const oldTotal = Number(existing.totalPrice);
      const oldPaid = Number(existing.paidAmount);
      const oldOwed = Number(existing.pendingAmount);
      const oldPaymentStatus = existing.paymentStatus;

      // Calculate new values
      let newPaid = oldPaid;
      let newOwed = 0;
      let newPaymentStatus = oldPaymentStatus;
      let refundAmount = 0;

      // Detect manual status downgrade
      const isStatusDowngrade =
        paymentStatus &&
        paymentStatus as any as PaymentStatus !== oldPaymentStatus as PaymentStatus &&
        oldPaymentStatus === PaymentStatus.PAID;

      // SCENARIO 1A: Charges DECREASED - Automatic Refund
      if (newTotal < oldPaid && !isStatusDowngrade) {
        refundAmount = oldPaid - newTotal;
        newPaid = newTotal;
        newOwed = 0;
        newPaymentStatus = PaymentStatus.PAID;

        // Cancel original payment vouchers
        await prisma.paymentVoucher.updateMany({
          where: {
            booking_type: 'LAWN',
            booking_id: Number(id),
            voucher_type: {
              in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
            },
            status: VoucherStatus.CONFIRMED,
          },
          data: { status: VoucherStatus.CANCELLED },
        });

        // Create new payment voucher for remaining amount
        await prisma.paymentVoucher.create({
          data: {
            booking_type: 'LAWN',
            booking_id: Number(id),
            membership_no: membershipNo,
            amount: newPaid,
            payment_mode: paymentMode as unknown as PaymentMode,
            voucher_type: VoucherType.FULL_PAYMENT,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'system',
            remarks: `Reissued after charge reduction | ${formatPakistanDate(bookingDateObj)} - ${normalizedEventTime}${remarks ? ` | ${remarks}` : ''}`,
          },
        });

        // Create refund voucher
        await prisma.paymentVoucher.create({
          data: {
            booking_type: 'LAWN',
            booking_id: Number(id),
            membership_no: membershipNo,
            amount: refundAmount,
            payment_mode: paymentMode as unknown as PaymentMode,
            voucher_type: VoucherType.REFUND,
            status: VoucherStatus.PENDING,
            issued_by: 'system',
            remarks: `Refund for reduced charges | Original: ${oldTotal}, New: ${newTotal}${remarks ? ` | ${remarks}` : ''}`,
          },
        });

        // Update member ledger for refund
        await prisma.member.update({
          where: { Membership_No: membershipNo },
          data: {
            crAmount: { increment: refundAmount },
            Balance: { increment: -refundAmount },
          },
        });
      }
      // SCENARIO 1B: Manual Payment Status Downgrade (PAID → HALF_PAID/UNPAID)
      else if (isStatusDowngrade) {
        newPaymentStatus = paymentStatus as any;
        newPaid = Number(paidAmount) || 0;
        newOwed = newTotal - newPaid;

        // Cancel original payment voucher
        await prisma.paymentVoucher.updateMany({
          where: {
            booking_type: 'LAWN',
            booking_id: Number(id),
            voucher_type: {
              in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
            },
            status: VoucherStatus.CONFIRMED,
          },
          data: { status: VoucherStatus.CANCELLED },
        });

        // Create new payment voucher for remaining amount (if HALF_PAID)
        if (newPaid > 0) {
          const newVoucherType =
            newPaymentStatus === (PaymentStatus.PAID as any)
              ? VoucherType.FULL_PAYMENT
              : VoucherType.HALF_PAYMENT;

          await prisma.paymentVoucher.create({
            data: {
              booking_type: 'LAWN',
              booking_id: Number(id),
              membership_no: membershipNo,
              amount: newPaid,
              payment_mode: paymentMode as unknown as PaymentMode,
              voucher_type: newVoucherType,
              status: VoucherStatus.CONFIRMED,
              issued_by: 'admin',
              remarks: `Reissued after status change | ${formatPakistanDate(bookingDateObj)} - ${normalizedEventTime}${remarks ? ` | ${remarks}` : ''}`,
            },
          });
        }
        // NO refund voucher for manual downgrade
      }
      // SCENARIO 2: Charges INCREASED
      else if (newTotal > oldPaid) {
        const wasPreviouslyPaid =
          existing.paymentStatus === PaymentStatus.PAID;

        if (paymentStatus !== undefined) {
          newPaymentStatus = paymentStatus as any;
          if (newPaymentStatus === (PaymentStatus.PAID as any)) {
            newPaid = newTotal;
            newOwed = 0;
          } else if (newPaymentStatus === (PaymentStatus.HALF_PAID as any)) {
            newPaid = Number(paidAmount) || oldPaid;
            newOwed = newTotal - newPaid;
          } else {
            newPaid = 0;
            newOwed = newTotal;
          }
        } else {
          if (wasPreviouslyPaid) {
            // Auto-convert to HALF_PAID
            newPaymentStatus = PaymentStatus.HALF_PAID;
            newPaid = oldPaid;
            newOwed = newTotal - oldPaid;

            // Cancel FULL_PAYMENT voucher
            await prisma.paymentVoucher.updateMany({
              where: {
                booking_type: 'LAWN',
                booking_id: Number(id),
                voucher_type: VoucherType.FULL_PAYMENT,
                status: VoucherStatus.CONFIRMED,
              },
              data: { status: VoucherStatus.CANCELLED },
            });

            // Create HALF_PAYMENT voucher
            await prisma.paymentVoucher.create({
              data: {
                booking_type: 'LAWN',
                booking_id: Number(id),
                membership_no: membershipNo,
                amount: newPaid,
                payment_mode: paymentMode as unknown as PaymentMode,
                voucher_type: VoucherType.HALF_PAYMENT,
                status: VoucherStatus.CONFIRMED,
                issued_by: 'system',
                remarks: `Reissued after charge increase | ${formatPakistanDate(bookingDateObj)} - ${normalizedEventTime}${remarks ? ` | ${remarks}` : ''}`,
              },
            });
          } else {
            newOwed = newTotal - oldPaid;
          }
        }
      }
      // SCENARIO 3: Manual status override with same charges
      else if (
        newTotal === oldTotal &&
        paymentStatus &&
        paymentStatus as any as PaymentStatus !== oldPaymentStatus as PaymentStatus
      ) {
        newPaymentStatus = paymentStatus as any;
        if (newPaymentStatus === (PaymentStatus.PAID as any)) {
          newPaid = newTotal;
          newOwed = 0;
        } else if (newPaymentStatus === (PaymentStatus.HALF_PAID as any)) {
          newPaid = Number(paidAmount) || 0;
          newOwed = newTotal - newPaid;
        } else if (newPaymentStatus === (PaymentStatus.UNPAID as any)) {
          newPaid = 0;
          newOwed = newTotal;
        }
      }

      const paidDiff = newPaid - oldPaid;
      const owedDiff = newOwed - oldOwed;

      // Update booking
      const updated = await prisma.lawnBooking.update({
        where: { id: Number(id) },
        data: {
          lawnId: lawn.id,
          memberId: member.Sno,
          bookingDate: bookingDateObj,
          totalPrice: newTotal,
          paymentStatus: newPaymentStatus,
          pricingType,
          paidAmount: newPaid,
          pendingAmount: newOwed,
          guestsCount: Number(numberOfGuests),
          bookingTime: normalizedEventTime,
          paidBy,
          guestName,
          guestContact: guestContact?.toString(),
          refundAmount,
          refundReturned: false,
        },
      });

      // Update voucher if date changed
      const dateChanged =
        existing.bookingDate.getTime() !== bookingDateObj.getTime();
      if (
        dateChanged &&
        (newPaymentStatus === PaymentStatus.PAID ||
          newPaymentStatus === PaymentStatus.HALF_PAID)
      ) {
        await prisma.paymentVoucher.updateMany({
          where: {
            booking_id: Number(id),
            booking_type: 'LAWN',
            status: VoucherStatus.CONFIRMED,
            voucher_type: {
              in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
            },
          },
          data: {
            remarks: `${formatPakistanDate(bookingDateObj)} - ${normalizedEventTime}${remarks ? ` | ${remarks}` : ''}`,
          },
        });
      }

      // Update member ledger
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

      return {
        success: true,
        message: 'Lawn booking updated successfully',
        booking: updated,
        refundAmount,
      };
    });
  }
  
  async dBookingLawn(bookingId) { }

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
      paidBy = 'MEMBER',
      guestName,
      guestContact,
    } = payload;
    console.log(paidBy)

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
          guestContact: guestContact?.toString(),
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
      paidBy = 'MEMBER',
      guestName,
      guestContact,
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
        guestContact,
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
      paidBy = 'MEMBER',
      guestName,
      guestContact,
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
    // Validate time slot is between 9am and 6pm (since booking is 2 hours, last slot ends at 8pm)
    const bookingHour = newStartTime.getHours();
    if (bookingHour < 9 && bookingHour > 6) {
      throw new BadRequestException(
        'Photoshoot bookings are only available between 9:00 AM and 6:00 PM',
      );
    }
    // 3. Calculate Amounts and Auto-Adjust Status
    const oldPaid = Number(booking.paidAmount);
    const oldOwed = Number(booking.pendingAmount);
    const oldTotal = Number(booking.totalPrice);
    const oldPaymentStatus = booking.paymentStatus;
    const newTotal =
      totalPrice !== undefined
        ? Number(totalPrice)
        : Number(booking.totalPrice);
    let newPaid = oldPaid;
    let newOwed = 0;
    let newPaymentStatus = oldPaymentStatus;
    let refundAmount = 0;
    // Detect manual status downgrade
    const isStatusDowngrade =
      paymentStatus &&
      paymentStatus as unknown as PaymentStatus !== oldPaymentStatus &&
      oldPaymentStatus === PaymentStatus.PAID;
    // ── SCENARIO 1A: Charges DECREASED - Automatic Refund ──────────
    if (newTotal < oldPaid && !isStatusDowngrade) {
      refundAmount = oldPaid - newTotal;
      newPaid = newTotal;
      newOwed = 0;
      newPaymentStatus = PaymentStatus.PAID;
      // Cancel original payment vouchers
      await this.prismaService.paymentVoucher.updateMany({
        where: {
          booking_type: 'PHOTOSHOOT',
          booking_id: booking.id,
          voucher_type: {
            in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
          },
          status: VoucherStatus.CONFIRMED,
        },
        data: { status: VoucherStatus.CANCELLED },
      });
      // Create new payment voucher for remaining amount
      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'PHOTOSHOOT',
          booking_id: booking.id,
          membership_no: booking.member.Membership_No,
          amount: newPaid,
          payment_mode: (paymentMode as unknown as PaymentMode) || PaymentMode.CASH,
          voucher_type: VoucherType.FULL_PAYMENT,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'system',
          remarks: `Reissued after charge reduction | ${newStartTime.toLocaleDateString()} ${newStartTime.toLocaleTimeString()}`,
        },
      });
      // Create refund voucher
      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'PHOTOSHOOT',
          booking_id: booking.id,
          membership_no: booking.member.Membership_No,
          amount: refundAmount,
          payment_mode: PaymentMode.CASH,
          voucher_type: VoucherType.REFUND,
          status: VoucherStatus.PENDING,
          issued_by: 'system',
          remarks: `Refund for photoshoot booking update - charges reduced from ${oldTotal} to ${newTotal}. Date: ${newBookingDate.toLocaleDateString()}, Time: ${newStartTime.toLocaleTimeString()}`,
        },
      });
      // Update member ledger for refund
      await this.prismaService.member.update({
        where: { Sno: booking.memberId },
        data: {
          crAmount: { increment: refundAmount },
          Balance: { decrement: refundAmount },
        },
      });
    }
    // ── SCENARIO 1B: Manual Payment Status Downgrade (PAID → HALF_PAID/UNPAID) ──
    else if (isStatusDowngrade) {
      newPaymentStatus = paymentStatus as unknown as PaymentStatus;
      newPaid = Number(paidAmount) || 0;
      newOwed = newTotal - newPaid;
      // Cancel original payment voucher
      await this.prismaService.paymentVoucher.updateMany({
        where: {
          booking_type: 'PHOTOSHOOT',
          booking_id: booking.id,
          voucher_type: {
            in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
          },
          status: VoucherStatus.CONFIRMED,
        },
        data: { status: VoucherStatus.CANCELLED },
      });
      // Create new payment voucher for remaining amount (if > 0)
      if (newPaid > 0) {
        const newVoucherType =
          newPaymentStatus === (PaymentStatus.PAID as unknown as PaymentStatus)
            ? VoucherType.FULL_PAYMENT
            : VoucherType.HALF_PAYMENT;
        await this.prismaService.paymentVoucher.create({
          data: {
            booking_type: 'PHOTOSHOOT',
            booking_id: booking.id,
            membership_no: booking.member.Membership_No,
            amount: newPaid,
            payment_mode: (paymentMode as unknown as PaymentMode) || PaymentMode.CASH,
            voucher_type: newVoucherType,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'admin',
            remarks: `Reissued after status change | ${newStartTime.toLocaleDateString()} ${newStartTime.toLocaleTimeString()}`,
          },
        });
      }
      // NO refund voucher for manual downgrade
    }
    // ── SCENARIO 2: Charges INCREASED ──────────────────────────
    else if (newTotal > oldPaid) {
      const wasPreviouslyPaid = oldPaymentStatus === PaymentStatus.PAID;
      if (paymentStatus !== undefined) {
        newPaymentStatus = paymentStatus as unknown as PaymentStatus;
        if (newPaymentStatus === (PaymentStatus.PAID as unknown)) {
          newPaid = newTotal;
          newOwed = 0;
        } else if (newPaymentStatus === (PaymentStatus.HALF_PAID as unknown)) {
          newPaid = paidAmount !== undefined ? Number(paidAmount) : oldPaid;
          newOwed = newTotal - newPaid;
        } else {
          newPaid = 0;
          newOwed = newTotal;
        }
      } else {
        if (wasPreviouslyPaid) {
          // Auto-convert to HALF_PAID
          newPaymentStatus = PaymentStatus.HALF_PAID;
          newPaid = oldPaid;
          newOwed = newTotal - oldPaid;
          // Cancel FULL_PAYMENT voucher
          await this.prismaService.paymentVoucher.updateMany({
            where: {
              booking_type: 'PHOTOSHOOT',
              booking_id: booking.id,
              voucher_type: VoucherType.FULL_PAYMENT,
              status: VoucherStatus.CONFIRMED,
            },
            data: { status: VoucherStatus.CANCELLED },
          });
          // Create HALF_PAYMENT voucher
          await this.prismaService.paymentVoucher.create({
            data: {
              booking_type: 'PHOTOSHOOT',
              booking_id: booking.id,
              membership_no: booking.member.Membership_No,
              amount: newPaid,
              payment_mode: (paymentMode as unknown as PaymentMode) || PaymentMode.CASH,
              voucher_type: VoucherType.HALF_PAYMENT,
              status: VoucherStatus.CONFIRMED,
              issued_by: 'system',
              remarks: `Reissued after charge increase | ${newStartTime.toLocaleDateString()} ${newStartTime.toLocaleTimeString()}`,
            },
          });
        } else {
          newPaid = oldPaid;
          newOwed = newTotal - oldPaid;
          
          if (oldPaid === 0) {
            newPaymentStatus = PaymentStatus.UNPAID;
          } else if (oldPaid > 0 && newOwed > 0) {
            newPaymentStatus = PaymentStatus.HALF_PAID;
          }
        }
      }
    }
    // ── SCENARIO 3: Charges UNCHANGED ──────────────────────────
    else {
      // Handle manual status change with same charges
      if (paymentStatus && paymentStatus as unknown as PaymentStatus !== oldPaymentStatus) {
         newPaymentStatus = paymentStatus as unknown as PaymentStatus;
         if (newPaymentStatus === (PaymentStatus.PAID as unknown)) {
           newPaid = newTotal;
           newOwed = 0;
         } else if (newPaymentStatus === (PaymentStatus.HALF_PAID as unknown)) {
           newPaid = paidAmount !== undefined ? Number(paidAmount) : 0;
           newOwed = newTotal - newPaid;
         } else if (newPaymentStatus === (PaymentStatus.UNPAID as unknown)) {
           newPaid = 0;
           newOwed = newTotal;
         }
      } else {
        newPaid = oldPaid;
        newOwed = oldOwed;
      }
    }
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
        paymentStatus: newPaymentStatus,
        pricingType: pricingType ?? booking.pricingType,
        paidAmount: newPaid,
        pendingAmount: newOwed,
        paidBy,
        guestName,
        guestContact,
        refundAmount: refundAmount,
        refundReturned: false,
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
    // 6. Create Voucher for diff (Only for increases, decreases handled in scenarios)
    if (paidDiff > 0 && !isStatusDowngrade && newTotal >= oldPaid) {
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
      } else {
        // Fallback
        voucherType = VoucherType.HALF_PAYMENT;
      }
      if (voucherType) {
        await this.prismaService.paymentVoucher.create({
          data: {
            booking_type: 'PHOTOSHOOT',
            booking_id: booking.id,
            membership_no: booking.member.Membership_No,
            amount: voucherAmount,
            payment_mode: (paymentMode as unknown as PaymentMode) || PaymentMode.CASH,
            voucher_type: voucherType,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'admin',
            remarks: `Photoshoot | ${newStartTime.toLocaleDateString()} ${newStartTime.toLocaleTimeString()}`,
          },
        });
      }
    }
    
    // 7. Update voucher remarks if date/time changed
    const dateChanged = booking.startTime.getTime() !== newStartTime.getTime();
    if (dateChanged && (newPaymentStatus === PaymentStatus.PAID || newPaymentStatus === PaymentStatus.HALF_PAID)) {
       await this.prismaService.paymentVoucher.updateMany({
          where: {
            booking_id: booking.id,
            booking_type: 'PHOTOSHOOT',
            status: VoucherStatus.CONFIRMED,
            voucher_type: { in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT] }
          },
          data: {
            remarks: `Photoshoot | ${newStartTime.toLocaleDateString()} ${newStartTime.toLocaleTimeString()}`
          }
       });
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
      paidBy = 'MEMBER',
      guestName,
      guestContact,
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
          guestContact,
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
            lawn: {
              include: {
                lawnCategory: true
              }
            },
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
  // ── VOUCHER MANAGEMENT ─────────────────────────────────────
  async getVouchersByBooking(bookingType: string, bookingId: number) {
    return await this.prismaService.paymentVoucher.findMany({
      where: {
        booking_type: bookingType as BookingType,
        booking_id: bookingId,
      },
      orderBy: {
        issued_at: 'desc',
      },
    });
  }

  async updateVoucherStatus(
    voucherId: number,
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED',
  ) {
    const voucher = await this.prismaService.paymentVoucher.findUnique({
      where: { id: voucherId },
    });

    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    return await this.prismaService.paymentVoucher.update({
      where: { id: voucherId },
      data: {
        status: status as VoucherStatus,
      },
    });
  }
}
