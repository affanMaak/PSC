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

    // ── VALIDATION ───────────────────────────────────────────
    const checkInDate = parsePakistanDate(checkIn!);
    const checkOutDate = parsePakistanDate(checkOut!);

    const now = getPakistanDate();
    now.setHours(0, 0, 0, 0);

    const normalizedCheckIn = new Date(checkInDate);
    normalizedCheckIn.setHours(0, 0, 0, 0);

    if (!checkIn || !checkOut || checkInDate >= checkOutDate)
      throw new ConflictException('Check-in must be before check-out');
    if (normalizedCheckIn < now)
      throw new ConflictException('Check-in date cannot be in the past');
    if (numberOfAdults < 1)
      throw new ConflictException('At least one adult is required');
    if (numberOfAdults + numberOfChildren > 6)
      throw new ConflictException(
        'Maximum room capacity exceeded (6 guests total)',
      );

    if (pricingType === 'guest') {
      if (!guestName || !guestContact) {
        throw new ConflictException(
          'Guest name and contact are required for guest pricing',
        );
      }
    }

    // ── ROOM VALIDATION ──────────────────────────────────────
    const room = await this.prismaService.room.findFirst({
      where: { id: Number(entityId) },
      include: {
        reservations: {
          where: {
            reservedFrom: { lt: checkOutDate },
            reservedTo: { gt: checkInDate },
          },
        },
        outOfOrders: {
          where: {
            startDate: { lt: checkOutDate },
            endDate: { gt: checkInDate },
          },
        },
      },
    });

    if (!room) throw new NotFoundException('Room not found');
    if (!room.isActive) throw new ConflictException('Room is not active');

    // Check holdings
    const roomHold = await this.prismaService.roomHoldings.findFirst({
      where: { roomId: room.id, onHold: true, holdExpiry: { gt: new Date() } },
    });
    if (roomHold) throw new ConflictException('Room is currently on hold');

    if (room.outOfOrders.length > 0) {
      const conflicts = room.outOfOrders
        .map(
          (oo) =>
            `${formatPakistanDate(oo.startDate)} to ${formatPakistanDate(oo.endDate)}`,
        )
        .join(', ');
      throw new ConflictException(`Room has maintenance: ${conflicts}`);
    }

    if (room.reservations.length > 0) {
      const r = room.reservations[0];
      throw new ConflictException(
        `Room reserved: ${formatPakistanDate(r.reservedFrom)} to ${formatPakistanDate(r.reservedTo)}`,
      );
    }

    // ── BOOKING CONFLICT CHECK ───────────────────────────────
    const existingBooking = await this.prismaService.roomBooking.findFirst({
      where: {
        roomId: room.id,
        checkIn: { lt: checkOutDate },
        checkOut: { gt: checkInDate },
      },
    });
    if (existingBooking)
      throw new ConflictException('Room already booked for selected dates');

    // ── PAYMENT CALCULATION ──────────────────────────────────
    const total = Number(totalPrice);
    let paid = 0,
      owed = total;

    if (paymentStatus === (PaymentStatus.PAID as unknown)) {
      paid = total;
      owed = 0;
    } else if (paymentStatus === (PaymentStatus.HALF_PAID as unknown)) {
      paid = Number(paidAmount) || 0;
      if (paid <= 0 || paid >= total)
        throw new ConflictException(
          'Paid amount must be >0 and <total for half-paid',
        );
      owed = total - paid;
    } else if (paymentStatus === (PaymentStatus.TO_BILL as unknown)) {
      paid = Number(paidAmount) || 0;
      owed = total - paid; // We calculate owed here, but we will move it to Balance
    }

    const isToBill = paymentStatus === (PaymentStatus.TO_BILL as unknown);
    const amountToBalance = isToBill ? owed : 0;
    const finalOwed = isToBill ? 0 : owed;

    // ── CREATE BOOKING ───────────────────────────────────────
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
        pendingAmount: finalOwed,
        numberOfAdults,
        numberOfChildren,
        specialRequests,
        paidBy,
        guestName,
        guestContact: guestContact?.toString(),
      },
    });

    // ── UPDATE ROOM STATUS ───────────────────────────────────
    if (checkInDate <= now && checkOutDate > now) {
      await this.prismaService.room.update({
        where: { id: room.id },
        data: { isBooked: true },
      });
    }

    // ── UPDATE MEMBER LEDGER ─────────────────────────────────


    await this.prismaService.member.update({
      where: { Membership_No: membershipNo },
      data: {
        totalBookings: { increment: 1 },
        lastBookingDate: now,
        bookingAmountPaid: { increment: Math.round(Number(paid)) },
        bookingAmountDue: { increment: Math.round(Number(finalOwed)) },
        bookingBalance: { increment: Math.round(Number(paid) - Number(finalOwed)) },
        Balance: { increment: Math.round(amountToBalance) },
        drAmount: { increment: Math.round(amountToBalance) },
      },
    });

    // We also need to set pendingAmount to 0 in the booking record if it's TO_BILL
    // Handled in creation above

    // ── CREATE PAYMENT VOUCHER ───────────────────────────────
    if (paid > 0) {
      const voucherType =
        paymentStatus === (PaymentStatus.PAID as unknown)
          ? VoucherType.FULL_PAYMENT
          : VoucherType.HALF_PAYMENT;

      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'ROOM',
          booking_id: booking.id,
          membership_no: membershipNo,
          amount: paid,
          payment_mode: paymentMode as unknown as PaymentMode,
          voucher_type: voucherType,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'admin',
          remarks: `Room #${room.roomNumber} | ${formatPakistanDate(checkInDate)} → ${formatPakistanDate(checkOutDate)} | Guests: ${numberOfAdults}A/${numberOfChildren}C${specialRequests ? ` | ${specialRequests}` : ''}`,
        },
      });
    }

    return booking;
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

    if (!id) throw new BadRequestException('Booking ID required');

    // ── FETCH EXISTING ──────────────────────────────────────
    const booking = await this.prismaService.roomBooking.findUnique({
      where: { id: Number(id) },
      include: { room: true },
    });
    if (!booking) throw new UnprocessableEntityException('Booking not found');

    // ── DATE VALIDATION ─────────────────────────────────────
    const newCheckIn = checkIn ? parsePakistanDate(checkIn) : booking.checkIn;
    const newCheckOut = checkOut
      ? parsePakistanDate(checkOut)
      : booking.checkOut;
    const now = getPakistanDate();
    now.setHours(0, 0, 0, 0);

    const normalizedCheckIn = new Date(newCheckIn);
    normalizedCheckIn.setHours(0, 0, 0, 0);

    if (newCheckIn >= newCheckOut)
      throw new ConflictException('Check-in must be before check-out');
    // if (normalizedCheckIn < now)
    //   throw new ConflictException('Check-in date cannot be in the past');

    // ── GUEST COUNT VALIDATION ──────────────────────────────
    const newAdults = numberOfAdults ?? booking.numberOfAdults;
    const newChildren = numberOfChildren ?? booking.numberOfChildren;
    if (newAdults < 1)
      throw new ConflictException('At least one adult is required');
    if (newAdults + newChildren > 6)
      throw new ConflictException('Max capacity: 6 guests');

    const newPricingType = pricingType ?? booking.pricingType;
    if (newPricingType === 'guest') {
      const newGuestName = guestName ?? booking.guestName;
      const newGuestContact = guestContact ?? booking.guestContact;
      if (!newGuestName || !newGuestContact) {
        throw new ConflictException(
          'Guest name and contact are required for guest pricing',
        );
      }
    }

    // ── ROOM VALIDATION ─────────────────────────────────────
    const newRoomId = entityId ? Number(entityId) : booking.roomId;
    const room = await this.prismaService.room.findFirst({
      where: { id: newRoomId },
      include: {
        outOfOrders: {
          where: {
            startDate: { lt: newCheckOut },
            endDate: { gt: newCheckIn },
          },
        },
        reservations: {
          where: {
            reservedFrom: { lt: newCheckOut },
            reservedTo: { gt: newCheckIn },
          },
        },
      },
    });

    if (!room) throw new NotFoundException('Room not found');
    // if (!room.isActive) throw new ConflictException('Room not active');

    // Check holdings
    const roomHold = await this.prismaService.roomHoldings.findFirst({
      where: { roomId: room.id, onHold: true, holdExpiry: { gt: new Date() } },
    });
    if (roomHold) throw new ConflictException('Room is currently on hold');

    if (room.outOfOrders.length > 0) {
      const conflicts = room.outOfOrders
        .map(
          (oo) =>
            `${formatPakistanDate(oo.startDate)} to ${formatPakistanDate(oo.endDate)}`,
        )
        .join(', ');
      throw new ConflictException(`Room has maintenance: ${conflicts}`);
    }

    if (room.reservations.length > 0) {
      const r = room.reservations[0];
      throw new ConflictException(
        `Room reserved: ${formatPakistanDate(r.reservedFrom)} to ${formatPakistanDate(r.reservedTo)}`,
      );
    }

    // ── BOOKING CONFLICT CHECK ───────────────────────────────
    const overlapping = await this.prismaService.roomBooking.findFirst({
      where: {
        roomId: newRoomId,
        id: { not: booking.id },
        checkIn: { lt: newCheckOut },
        checkOut: { gt: newCheckIn },
      },
    });
    if (overlapping)
      throw new ConflictException('Room already booked for selected dates');

    // ── PAYMENT RECALCULATION ────────────────────────────────
    const oldTotal = Number(booking.totalPrice);
    const oldPaid = Number(booking.paidAmount);
    const oldOwed = Number(booking.pendingAmount!);
    const oldStatus = booking.paymentStatus;

    const newTotal = totalPrice !== undefined ? Number(totalPrice) : oldTotal;
    let newPaid = oldPaid,
      newOwed = newTotal - oldPaid;
    let newPaymentStatus =
      (paymentStatus as unknown as PaymentStatus) ?? oldStatus;
    let refundAmount = 0;
    let amountToBalance = 0;

    // Scenario 1: Charges decreased
    if (newTotal < oldPaid && oldStatus === PaymentStatus.PAID) {
      refundAmount = oldPaid - newTotal;
      newPaid = newTotal;
      newOwed = 0;
      newPaymentStatus = PaymentStatus.PAID;

      await this.handleVoucherUpdate(
        booking.id,
        membershipNo ?? booking.Membership_No,
        room,
        VoucherType.FULL_PAYMENT,
        newPaid,
        newCheckIn,
        newCheckOut,
        remarks,
        true,
        refundAmount,
      );
    }
    // Scenario 2: Manual status downgrade
    else if (
      paymentStatus &&
      oldStatus === PaymentStatus.PAID &&
      [paymentStatus].some((s: any) =>
        [PaymentStatus.HALF_PAID, PaymentStatus.UNPAID].includes(s),
      )
    ) {
      newPaid =
        (paymentStatus as unknown as PaymentStatus) === PaymentStatus.HALF_PAID
          ? Number(paidAmount) || 0
          : 0;
      newOwed = newTotal - newPaid;

      if (
        (paymentStatus as unknown as PaymentStatus) === PaymentStatus.HALF_PAID
      ) {
        await this.handleVoucherUpdate(
          booking.id,
          membershipNo ?? booking.Membership_No,
          room,
          VoucherType.HALF_PAYMENT,
          newPaid,
          newCheckIn,
          newCheckOut,
          remarks,
        );
      }
    }
    // Scenario 3: Charges increased
    else if (newTotal > oldTotal) {
      if (oldStatus === PaymentStatus.PAID) {
        newPaymentStatus = PaymentStatus.HALF_PAID;
        newOwed = newTotal - oldPaid;
        await this.handleVoucherUpdate(
          booking.id,
          membershipNo ?? booking.Membership_No,
          room,
          VoucherType.HALF_PAYMENT,
          oldPaid,
          newCheckIn,
          newCheckOut,
          remarks,
        );
      }
    }
    // Scenario 4: Manual status override
    else if (paymentStatus && newTotal === oldTotal) {
      if ((paymentStatus as unknown as PaymentStatus) === PaymentStatus.PAID) {
        newPaid = newTotal;
        newOwed = 0;
      } else if (
        (paymentStatus as unknown as PaymentStatus) === PaymentStatus.HALF_PAID
      ) {
        newPaid = Number(paidAmount) || oldPaid;
        newOwed = newTotal - newPaid;
      } else if (
        (paymentStatus as unknown as PaymentStatus) === PaymentStatus.UNPAID
      ) {
        newPaid = 0;
        newOwed = newTotal;
      } else if (
        (paymentStatus as unknown as PaymentStatus) === PaymentStatus.TO_BILL
      ) {
        newPaid = Number(paidAmount) || oldPaid;
        newOwed = newTotal - newPaid;
      }
    }

    const isToBill = newPaymentStatus === PaymentStatus.TO_BILL;
    if (isToBill) {
      amountToBalance = newOwed;
      newOwed = 0;
    }

    const paidDiff = newPaid - oldPaid;
    const owedDiff = newOwed - oldOwed;

    // ── UPDATE BOOKING ──────────────────────────────────────
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
        numberOfAdults: newAdults,
        numberOfChildren: newChildren,
        specialRequests: specialRequests ?? booking.specialRequests,
        remarks: remarks!,
        paidBy,
        guestName,
        guestContact: guestContact?.toString(),
        refundAmount,
        refundReturned: false,
      },
    });

    // ── UPDATE DATES IN VOUCHERS ────────────────────────────
    const datesChanged =
      booking.checkIn.getTime() !== newCheckIn.getTime() ||
      booking.checkOut.getTime() !== newCheckOut.getTime();
    if (
      datesChanged &&
      (newPaymentStatus === 'PAID' || newPaymentStatus === 'HALF_PAID')
    ) {
      await this.updateVoucherDates(
        booking.id,
        newCheckIn,
        newCheckOut,
        remarks,
      );
    }

    // ── UPDATE ROOM STATUS ───────────────────────────────────
    await this.updateRoomStatus(
      booking.roomId,
      newRoomId,
      newCheckIn,
      newCheckOut,
    );

    // ── UPDATE MEMBER LEDGER ─────────────────────────────────
    if (paidDiff !== 0 || owedDiff !== 0 || amountToBalance !== 0) {
      await this.prismaService.member.update({
        where: { Membership_No: membershipNo ?? booking.Membership_No },
        data: {
          bookingAmountPaid: { increment: Math.round(Number(paidDiff)) },
          bookingAmountDue: { increment: Math.round(Number(owedDiff)) },
          bookingBalance: { increment: Math.round(Number(paidDiff) - Number(owedDiff)) },
          lastBookingDate: new Date(),
          Balance: { increment: Math.round(amountToBalance) },
          drAmount: { increment: Math.round(amountToBalance) },
        },
      });
    }

    // ── CREATE PAYMENT VOUCHER ──────────────────────────────
    if (paidDiff > 0) {
      const voucherType =
        newPaymentStatus === PaymentStatus.PAID
          ? VoucherType.FULL_PAYMENT
          : VoucherType.HALF_PAYMENT;

      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'ROOM',
          booking_id: updated.id,
          membership_no: membershipNo ?? booking.Membership_No,
          amount: paidDiff,
          payment_mode:
            (paymentMode as unknown as PaymentMode) ?? PaymentMode.CASH,
          voucher_type: voucherType,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'admin',
          remarks: `Room #${room.roomNumber} | Payment Update | ${formatPakistanDate(newCheckIn)} → ${formatPakistanDate(newCheckOut)}`,
        },
      });
    }

    return { ...updated, prevRoomId: booking.roomId };
  }

  // Helper methods for uBookingRoom
  private async handleVoucherUpdate(
    bookingId: number,
    memberId: string,
    room: any,
    voucherType: VoucherType,
    amount: number,
    checkIn: Date,
    checkOut: Date,
    remarks?: string,
    createRefund = false,
    refundAmount = 0,
  ) {
    // Cancel existing vouchers
    await this.prismaService.paymentVoucher.updateMany({
      where: {
        booking_id: bookingId,
        booking_type: 'ROOM',
        voucher_type: {
          in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
        },
        status: VoucherStatus.CONFIRMED,
      },
      data: { status: VoucherStatus.CANCELLED },
    });

    // Create new voucher
    if (amount > 0) {
      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'ROOM',
          booking_id: bookingId,
          membership_no: memberId,
          amount,
          payment_mode: PaymentMode.CASH,
          voucher_type: voucherType,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'admin',
          remarks: `Room #${room.roomNumber} | ${formatPakistanDate(checkIn)} → ${formatPakistanDate(checkOut)}${remarks ? ` | ${remarks}` : ''}`,
        },
      });
    }

    // Create refund voucher if needed
    if (createRefund && refundAmount > 0) {
      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'ROOM',
          booking_id: bookingId,
          membership_no: memberId,
          amount: refundAmount,
          payment_mode: PaymentMode.CASH,
          voucher_type: VoucherType.REFUND,
          status: VoucherStatus.PENDING,
          issued_by: 'admin',
          remarks: `Refund for reduced charges | ${formatPakistanDate(checkIn)} → ${formatPakistanDate(checkOut)}`,
        },
      });

      await this.prismaService.member.update({
        where: { Membership_No: memberId },
        data: {
          bookingAmountDue: { increment: Math.round(Number(refundAmount)) },
          bookingBalance: { decrement: Math.round(Number(refundAmount)) },
        },
      });
    }
  }

  private async updateVoucherDates(
    bookingId: number,
    checkIn: Date,
    checkOut: Date,
    remarks?: string,
  ) {
    await this.prismaService.paymentVoucher.updateMany({
      where: {
        booking_id: bookingId,
        booking_type: 'ROOM',
        status: VoucherStatus.CONFIRMED,
        voucher_type: {
          in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
        },
      },
      data: {
        remarks: `${formatPakistanDate(checkIn)} to ${formatPakistanDate(checkOut)}${remarks ? ` | ${remarks}` : ''}`,
      },
    });
  }

  private async updateRoomStatus(
    oldRoomId: number,
    newRoomId: number,
    checkIn: Date,
    checkOut: Date,
  ) {
    const now = getPakistanDate();
    const isCurrentlyBooked = checkIn <= now && checkOut > now;

    const updates = [
      this.prismaService.room.update({
        where: { id: newRoomId },
        data: { isBooked: isCurrentlyBooked },
      }),
    ];

    if (oldRoomId !== newRoomId) {
      updates.push(
        this.prismaService.room.update({
          where: { id: oldRoomId },
          data: { isBooked: false },
        }),
      );
    }

    await Promise.all(updates);
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
      remarks = '',
    } = payload;

    // ── VALIDATION ───────────────────────────────────────────
    const checkInDate = parsePakistanDate(checkIn);
    const checkOutDate = parsePakistanDate(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!checkIn || !checkOut || checkInDate >= checkOutDate)
      throw new ConflictException('Check-in must be before check-out');
    if (new Date(checkInDate).setHours(0, 0, 0, 0) < today.getTime())
      throw new ConflictException('Check-in date cannot be in the past');
    if (numberOfAdults < 1)
      throw new ConflictException('At least one adult required');

    if (pricingType === 'guest') {
      if (!guestName || !guestContact) {
        throw new ConflictException(
          'Guest name and contact are required for guest pricing',
        );
      }
    }

    const member = await this.prismaService.member.findUnique({
      where: { Membership_No: membershipNo.toString() },
    });
    if (!member) throw new NotFoundException('Member not found');

    // ── PROCESS IN TRANSACTION ───────────────────────────────
    return await this.prismaService.$transaction(async (prisma) => {
      const roomType = await prisma.roomType.findFirst({
        where: { id: Number(entityId) },
      });
      if (!roomType) throw new NotFoundException('Room type not found');

      const pricePerNight =
        pricingType === 'member' ? roomType.priceMember : roomType.priceGuest;
      const nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) /
        (1000 * 60 * 60 * 24),
      );
      const pricePerRoom = Number(pricePerNight) * nights;

      const bookings: any[] = [];
      const totalPaid = Number(paidAmount) || Number(totalPrice);
      const totalOwed =
        paymentStatus === 'PAID' ? 0 : Number(totalPrice) - totalPaid;
      const paidPerRoom = totalPaid / selectedRoomIds.length;

      // ── PROCESS EACH ROOM ──────────────────────────────────
      for (const roomId of selectedRoomIds) {
        const room = await prisma.room.findFirst({
          where: { id: Number(roomId) },
          include: {
            outOfOrders: {
              where: {
                startDate: { lte: checkOutDate },
                endDate: { gte: checkInDate },
              },
            },
            holdings: {
              where: {
                id: roomId,
                onHold: true,
                holdExpiry: { gt: new Date() },
                NOT: { holdBy: member.Membership_No }
              }
            }
          },
        });

        if (room?.holdings?.length! > 0) throw new ConflictException('Hall is currently on hold');
        if (!room) throw new NotFoundException(`Room ${roomId} not found`);
        if (!room.isActive)
          throw new ConflictException(`Room ${room.roomNumber} not active`);


        if (room.outOfOrders.length > 0) {
          const conflicts = room.outOfOrders
            .map(
              (oo) =>
                `${formatPakistanDate(oo.startDate)} to ${formatPakistanDate(oo.endDate)}`,
            )
            .join(', ');
          throw new ConflictException(
            `Room ${room.roomNumber} has maintenance: ${conflicts}`,
          );
        }

        const overlapping = await prisma.roomBooking.findFirst({
          where: {
            roomId: room.id,
            checkIn: { lt: checkOutDate },
            checkOut: { gt: checkInDate },
          },
        });
        if (overlapping)
          throw new ConflictException(`Room ${room.roomNumber} already booked`);

        // ── CREATE BOOKING ──────────────────────────────────
        const booking = await prisma.roomBooking.create({
          data: {
            Membership_No: membershipNo.toString(),
            roomId: room.id,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            totalPrice: pricePerRoom,
            paymentStatus: paymentStatus as any,
            pricingType,
            paidAmount: paidPerRoom,
            pendingAmount:
              paymentStatus === 'PAID' ? 0 : pricePerRoom - paidPerRoom,
            numberOfAdults,
            numberOfChildren,
            specialRequests,
            remarks,
            paidBy,
            guestName,
            guestContact: guestContact?.toString(),
          },
          include: {
            room: {
              select: {
                roomNumber: true,
                roomType: { select: { type: true } },
              },
            },
          },
        });

        bookings.push(booking);


        await prisma.room.update({
          where: { id: room.id },
          data: { isBooked: true },
        });

        // ── CREATE VOUCHER ──────────────────────────────────
        if (paidPerRoom > 0) {
          const voucherType =
            paymentStatus === 'PAID'
              ? VoucherType.FULL_PAYMENT
              : VoucherType.HALF_PAYMENT;
          await prisma.paymentVoucher.create({
            data: {
              booking_type: 'ROOM',
              booking_id: booking.id,
              membership_no: membershipNo.toString(),
              amount: paidPerRoom,
              payment_mode: paymentMode as unknown as PaymentMode,
              voucher_type: voucherType,
              status: VoucherStatus.CONFIRMED,
              issued_by: 'system',
              remarks: `Room #${room.roomNumber} | ${formatPakistanDate(checkInDate)} → ${formatPakistanDate(checkOutDate)} | Guests: ${numberOfAdults}A/${numberOfChildren}C`,
            },
          });
        }
      }

      // ── UPDATE MEMBER LEDGER ──────────────────────────────
      await prisma.member.update({
        where: { Membership_No: membershipNo.toString() },
        data: {
          totalBookings: { increment: selectedRoomIds.length },
          lastBookingDate: new Date(),
          bookingAmountPaid: { increment: Math.round(Number(totalPaid)) },
          bookingAmountDue: { increment: Math.round(Number(totalOwed)) },
          bookingBalance: { increment: Math.round(Number(totalPaid) - Number(totalOwed)) },
        },
      });

      // delete roomholding
      await prisma.roomHoldings.deleteMany({
        where: { roomId: { in: selectedRoomIds.map((id: any) => Number(id)) } }
      })

      return {
        success: true,
        message: `Booked ${selectedRoomIds.length} room(s)`,
        bookings,
        totalAmount: Number(totalPrice),
        paidAmount: totalPaid,
        pendingAmount: totalOwed,
      };
    });
  }

  async uBookingRoomMember(payload: any) {
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
      paymentMode = 'ONLINE',
      numberOfAdults = 1,
      numberOfChildren = 0,
      specialRequests = '',
      paidBy = 'MEMBER',
      guestContact,
      guestName,
      remarks,
    } = payload;

    if (!id || !membershipNo)
      throw new BadRequestException('Booking ID and membership required');

    const newCheckIn = parsePakistanDate(checkIn);
    const newCheckOut = parsePakistanDate(checkOut);

    if (!checkIn || !checkOut || newCheckIn >= newCheckOut)
      throw new ConflictException('Check-in must be before check-out');

    // ── FETCH EXISTING ──────────────────────────────────────
    const booking = await this.prismaService.roomBooking.findUnique({
      where: { id: Number(id) },
      include: { room: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const member = await this.prismaService.member.findUnique({
      where: { Membership_No: membershipNo.toString() },
    });
    if (!member) throw new NotFoundException('Member not found');

    const room = await this.prismaService.room.findFirst({
      where: { id: booking.roomId },
      include: {
        outOfOrders: {
          where: {
            startDate: { lte: newCheckOut },
            endDate: { gte: newCheckIn },
          },
        },
      },
    });
    if (!room || !room.isActive)
      throw new ConflictException('Room not available');

    // Check holdings
    const roomHold = await this.prismaService.roomHoldings.findFirst({
      where: { roomId: room.id, onHold: true, holdExpiry: { gt: new Date() } },
    });
    if (roomHold) throw new ConflictException('Room is currently on hold');

    if (room.outOfOrders.length > 0) {
      const conflicts = room.outOfOrders
        .map(
          (oo) =>
            `${formatPakistanDate(oo.startDate)} to ${formatPakistanDate(oo.endDate)}`,
        )
        .join(', ');
      throw new ConflictException(`Room has maintenance: ${conflicts}`);
    }

    const overlapping = await this.prismaService.roomBooking.findFirst({
      where: {
        roomId: room.id,
        id: { not: Number(id) },
        checkIn: { lt: newCheckOut },
        checkOut: { gt: newCheckIn },
      },
    });
    if (overlapping) throw new ConflictException('Room already booked');

    // ── PAYMENT RECALCULATION ────────────────────────────────
    const oldTotal = Number(booking.totalPrice);
    const oldPaid = Number(booking.paidAmount);
    const oldStatus = booking.paymentStatus;

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

    let newPaid = oldPaid,
      newOwed = newTotal - oldPaid;
    let newPaymentStatus: any = paymentStatus || oldStatus;
    let refundAmount = 0;

    // Reuse the same payment scenarios logic from uBookingRoom
    if (newTotal < oldPaid) {
      refundAmount = oldPaid - newTotal;
      newPaid = newTotal;
      newOwed = 0;
      newPaymentStatus = 'PAID';

      await this.handleVoucherUpdate(
        Number(id),
        membershipNo.toString(),
        room,
        VoucherType.FULL_PAYMENT,
        newPaid,
        newCheckIn,
        newCheckOut,
        remarks,
        true,
        refundAmount,
      );
    } else if (
      paymentStatus &&
      oldStatus === 'PAID' &&
      ['HALF_PAID', 'UNPAID'].includes(paymentStatus)
    ) {
      newPaid = paymentStatus === 'HALF_PAID' ? Number(paidAmount) || 0 : 0;
      newOwed = newTotal - newPaid;

      if (paymentStatus === 'HALF_PAID') {
        await this.handleVoucherUpdate(
          Number(id),
          membershipNo.toString(),
          room,
          VoucherType.HALF_PAYMENT,
          newPaid,
          newCheckIn,
          newCheckOut,
          remarks,
        );
      }
    } else if (paymentStatus && newTotal === oldTotal) {
      if (paymentStatus === 'PAID') {
        newPaid = newTotal;
        newOwed = 0;
      } else if (paymentStatus === 'HALF_PAID') {
        newPaid = Number(paidAmount) || oldPaid;
        newOwed = newTotal - newPaid;
      } else if (paymentStatus === 'UNPAID') {
        newPaid = 0;
        newOwed = newTotal;
      }
    }

    const paidDiff = newPaid - oldPaid;
    const owedDiff = newOwed - Number(booking.pendingAmount);

    // ── UPDATE BOOKING ──────────────────────────────────────
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

    // ── UPDATE MEMBER LEDGER ─────────────────────────────────
    if (paidDiff !== 0 || owedDiff !== 0) {
      await this.prismaService.member.update({
        where: { Membership_No: membershipNo.toString() },
        data: {
          bookingAmountPaid: { increment: Math.round(Number(paidDiff)) },
          bookingAmountDue: { increment: Math.round(Number(owedDiff)) },
          bookingBalance: { increment: Math.round(Number(paidDiff) - Number(owedDiff)) },
          lastBookingDate: new Date(),
        },
      });
    }

    // ── CREATE PAYMENT VOUCHER ─────────────────────────────
    if (paidDiff > 0) {
      const voucherType =
        newPaymentStatus === 'PAID'
          ? VoucherType.FULL_PAYMENT
          : VoucherType.HALF_PAYMENT;
      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'ROOM',
          booking_id: updated.id,
          membership_no: membershipNo.toString(),
          amount: paidDiff,
          payment_mode: paymentMode as unknown as PaymentMode,
          voucher_type: voucherType,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'member',
          remarks: `Room #${room.roomNumber} | ${formatPakistanDate(newCheckIn)} → ${formatPakistanDate(newCheckOut)}`,
        },
      });
    }

    return {
      success: true,
      message: 'Booking updated',
      booking: updated,
      refundAmount,
    };
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

    // ── VALIDATION ───────────────────────────────────────────
    if (!membershipNo || !entityId || !bookingDate || !eventType || !eventTime)
      throw new BadRequestException('Required fields missing');

    const booking = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (booking < today)
      throw new UnprocessableEntityException('Booking date cannot be in past');

    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: membershipNo },
    });
    if (!member) throw new BadRequestException('Member not found');

    // ── PROCESS IN TRANSACTION ───────────────────────────────
    return await this.prismaService.$transaction(async (prisma) => {
      const hall = await prisma.hall.findFirst({
        where: { id: Number(entityId) },
        include: { outOfOrders: true },
      });
      if (!hall) throw new BadRequestException('Hall not found');

      // Check holdings
      const hallHold = await prisma.hallHoldings.findFirst({
        where: {
          hallId: hall.id,
          onHold: true,
          holdExpiry: { gt: new Date() },
        },
      });
      if (hallHold) throw new ConflictException('Hall is currently on hold');

      // ── TIME VALIDATION ────────────────────────────────────
      const normalizedEventTime = eventTime.toUpperCase() as
        | 'MORNING'
        | 'EVENING'
        | 'NIGHT';
      if (!['MORNING', 'EVENING', 'NIGHT'].includes(normalizedEventTime))
        throw new BadRequestException('Invalid event time');

      // ── CONFLICT CHECKS ────────────────────────────────────
      const outOfOrderConflict = hall.outOfOrders?.find((period) => {
        const start = new Date(period.startDate).setHours(0, 0, 0, 0);
        const end = new Date(period.endDate).setHours(0, 0, 0, 0);
        const bookingDate = booking.getTime();
        return bookingDate >= start && bookingDate <= end;
      });

      if (outOfOrderConflict) {
        const start = new Date(outOfOrderConflict.startDate);
        const end = new Date(outOfOrderConflict.endDate);
        throw new ConflictException(
          `Hall '${hall.name}' out of order: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
        );
      }

      const existingBooking = await prisma.hallBooking.findFirst({
        where: {
          hallId: hall.id,
          bookingDate: booking,
          bookingTime: normalizedEventTime,
        },
      });
      if (existingBooking)
        throw new ConflictException(`Hall '${hall.name}' already booked`);

      const existingReservation = await prisma.hallReservation.findFirst({
        where: {
          hallId: hall.id,
          reservedFrom: { lte: booking },
          reservedTo: { gt: booking },
          timeSlot: normalizedEventTime,
        },
      });
      if (existingReservation)
        throw new ConflictException(`Hall '${hall.name}' reserved`);

      // ── PAYMENT CALCULATION ────────────────────────────────
      const basePrice =
        pricingType === 'member' ? hall.chargesMembers : hall.chargesGuests;
      const total = totalPrice ? Number(totalPrice) : Number(basePrice);
      let paid = 0,
        owed = total;

      if ((paymentStatus as unknown as PaymentStatus) === 'PAID') {
        paid = total;
        owed = 0;
      } else if (
        (paymentStatus as unknown as PaymentStatus) === 'HALF_PAID'
      ) {
        paid = Number(paidAmount) || 0;
        if (paid <= 0 || paid >= total)
          throw new ConflictException(
            'For half-paid: paid amount must be >0 and <total',
          );
        owed = total - paid;
      } else if (
        (paymentStatus as unknown as PaymentStatus) === 'TO_BILL'
      ) {
        paid = Number(paidAmount) || 0;
        owed = total - paid;
      }

      const isToBill = (paymentStatus as unknown as PaymentStatus) === 'TO_BILL';
      const finalOwed = isToBill ? 0 : owed;
      const amountToBalance = isToBill ? owed : 0;

      // ── CREATE BOOKING ─────────────────────────────────────
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
          pendingAmount: finalOwed,
          eventType,
          bookingTime: normalizedEventTime,
          paidBy,
          guestName,
          guestContact: guestContact?.toString(),
          remarks: remarks!,
        },
      });

      // ── UPDATE HALL STATUS ─────────────────────────────────
      if (booking.getTime() === today.getTime()) {
        await prisma.hall.update({
          where: { id: hall.id },
          data: { isBooked: true },
        });
      }

      // ── UPDATE MEMBER LEDGER ───────────────────────────────
      await prisma.member.update({
        where: { Membership_No: membershipNo },
        data: {
          totalBookings: { increment: 1 },
          lastBookingDate: new Date(),
          bookingAmountPaid: { increment: Math.round(Number(paid)) },
          bookingAmountDue: { increment: Math.round(Number(finalOwed)) },
          bookingBalance: { increment: Math.round(Number(paid) - Number(finalOwed)) },
          Balance: { increment: Math.round(amountToBalance) },
          drAmount: { increment: Math.round(amountToBalance) },
        },
      });

      // ── CREATE PAYMENT VOUCHER ─────────────────────────────
      if (paid > 0) {
        const voucherType =
          (paymentStatus as unknown as PaymentStatus) === 'PAID'
            ? VoucherType.FULL_PAYMENT
            : VoucherType.HALF_PAYMENT;
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
            remarks: `${hall.name} | ${formatPakistanDate(booking)} (${eventType}) - ${normalizedEventTime}`,
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

    if (
      !id ||
      !membershipNo ||
      !entityId ||
      !bookingDate ||
      !eventType ||
      !eventTime
    )
      throw new BadRequestException('Required fields missing');

    const booking = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prismaService.hallBooking.findUnique({
      where: { id: Number(id) },
      include: { hall: { include: { outOfOrders: true } }, member: true },
    });
    if (!existing) throw new NotFoundException('Booking not found');

    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: membershipNo },
    });
    if (!member) throw new BadRequestException('Member not found');

    // ── PROCESS IN TRANSACTION ───────────────────────────────
    return await this.prismaService.$transaction(async (prisma) => {
      const hall = await prisma.hall.findFirst({
        where: { id: Number(entityId) },
        include: { outOfOrders: true },
      });
      if (!hall) throw new BadRequestException('Hall not found');

      // ── CONFLICT CHECKS ────────────────────────────────────
      const outOfOrderConflict = hall.outOfOrders?.find((period) => {
        const start = new Date(period.startDate).setHours(0, 0, 0, 0);
        const end = new Date(period.endDate).setHours(0, 0, 0, 0);
        return booking.getTime() >= start && booking.getTime() <= end;
      });
      if (outOfOrderConflict)
        throw new ConflictException(`Hall '${hall.name}' out of order`);

      const normalizedEventTime = eventTime.toUpperCase() as
        | 'MORNING'
        | 'EVENING'
        | 'NIGHT';

      // Check for conflicts only if details changed
      const detailsChanged =
        existing.hallId !== Number(entityId) ||
        existing.bookingDate.getTime() !== booking.getTime() ||
        existing.bookingTime !== normalizedEventTime;

      if (detailsChanged) {
        const existingBooking = await prisma.hallBooking.findFirst({
          where: {
            hallId: Number(entityId),
            bookingDate: booking,
            bookingTime: normalizedEventTime,
            id: { not: Number(id) },
          },
        });
        if (existingBooking)
          throw new ConflictException(`Hall '${hall.name}' already booked`);

        const existingReservation = await prisma.hallReservation.findFirst({
          where: {
            hallId: Number(entityId),
            reservedFrom: { lte: booking },
            reservedTo: { gt: booking },
            timeSlot: normalizedEventTime,
          },
        });
        if (existingReservation)
          throw new ConflictException(`Hall '${hall.name}' reserved`);
      }

      // ── PAYMENT RECALCULATION ──────────────────────────────
      const oldTotal = Number(existing.totalPrice);
      const oldPaid = Number(existing.paidAmount);
      const oldStatus = existing.paymentStatus;

      const total = Number(totalPrice);
      let newPaid = oldPaid,
        newOwed = total - oldPaid;
      let newPaymentStatus = (paymentStatus as any) ?? oldStatus;
      let refundAmount = 0;
      let amountToBalance = 0;

      // Reuse payment scenario logic from room bookings
      if (
        total < oldPaid &&
        oldStatus === 'PAID' &&
        (paymentStatus as unknown as PaymentStatus) !== 'HALF_PAID' &&
        (paymentStatus as unknown as PaymentStatus) !== 'UNPAID'
      ) {
        refundAmount = oldPaid - total;
        newPaid = total;
        newOwed = 0;
        newPaymentStatus = 'PAID';
        await this.handleHallVoucherUpdate(
          Number(id),
          membershipNo,
          hall,
          VoucherType.FULL_PAYMENT,
          newPaid,
          booking,
          normalizedEventTime,
          eventType,
          true,
          refundAmount,
        );
      } else if (
        paymentStatus &&
        oldStatus === 'PAID' &&
        ['HALF_PAID', 'UNPAID'].includes(
          paymentStatus as unknown as PaymentStatus,
        )
      ) {
        newPaymentStatus = paymentStatus;
        newPaid =
          (paymentStatus as unknown as PaymentStatus) === 'HALF_PAID'
            ? Number(paidAmount) || 0
            : 0;
        newOwed = total - newPaid;

        if ((paymentStatus as unknown as PaymentStatus) === 'HALF_PAID') {
          await this.handleHallVoucherUpdate(
            Number(id),
            membershipNo,
            hall,
            VoucherType.HALF_PAYMENT,
            newPaid,
            booking,
            normalizedEventTime,
            eventType,
            false,
            0,
          );
        }
      } else if (paymentStatus && total === oldTotal) {
        if ((paymentStatus as unknown as PaymentStatus) === 'PAID') {
          newPaid = total;
          newOwed = 0;
        } else if (
          (paymentStatus as unknown as PaymentStatus) === 'HALF_PAID'
        ) {
          newPaid = Number(paidAmount) || oldPaid;
          newOwed = total - newPaid;
        } else if ((paymentStatus as unknown as PaymentStatus) === 'UNPAID') {
          newPaid = 0;
          newOwed = total;
        } else if ((paymentStatus as unknown as PaymentStatus) === 'TO_BILL') {
          newPaid = Number(paidAmount) || oldPaid;
          newOwed = total - newPaid;
        }
      }

      const isToBill = newPaymentStatus === 'TO_BILL';
      if (isToBill) {
        amountToBalance = newOwed;
        newOwed = 0;
      }

      const paidDiff = newPaid - oldPaid;
      const owedDiff = newOwed - (oldTotal - oldPaid);

      // ── UPDATE BOOKING ─────────────────────────────────────
      const updated = await prisma.hallBooking.update({
        where: { id: Number(id) },
        data: {
          hallId: hall.id,
          memberId: member.Sno,
          bookingDate: booking,
          totalPrice: total,
          paymentStatus: newPaymentStatus,
          pricingType,
          paidAmount: newPaid,
          pendingAmount: newOwed,
          numberOfGuests: Number(numberOfGuests!),
          eventType,
          bookingTime: normalizedEventTime,
          paidBy,
          guestName,
          guestContact: guestContact?.toString(),
          refundAmount,
          refundReturned: false,
        },
      });

      // ── UPDATE VOUCHER DATES ───────────────────────────────
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

      // ── UPDATE HALL STATUS ─────────────────────────────────
      const isToday = booking.getTime() === today.getTime();
      const wasToday = existing.bookingDate.getTime() === today.getTime();

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

      // ── UPDATE MEMBER LEDGER ───────────────────────────────
      if (paidDiff !== 0 || owedDiff !== 0) {
        await prisma.member.update({
          where: { Membership_No: membershipNo },
          data: {
            bookingAmountPaid: { increment: Math.round(Number(paidDiff)) },
            bookingAmountDue: { increment: Math.round(Number(owedDiff)) },
            bookingBalance: { increment: Math.round(Number(paidDiff) - Number(owedDiff)) },
            lastBookingDate: new Date(),
            Balance: { increment: Math.round(amountToBalance) },
            drAmount: { increment: Math.round(amountToBalance) },
          },
        });
      }

      // ── CREATE PAYMENT VOUCHER ─────────────────────────────
      if (paidDiff > 0) {
        const voucherType =
          newPaymentStatus === 'PAID'
            ? VoucherType.FULL_PAYMENT
            : VoucherType.HALF_PAYMENT;
        await prisma.paymentVoucher.create({
          data: {
            booking_type: 'HALL',
            booking_id: updated.id,
            membership_no: membershipNo,
            amount: paidDiff,
            payment_mode: paymentMode as any,
            voucher_type: voucherType,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'admin',
            remarks: `${hall.name} | Payment Update | ${formatPakistanDate(booking)} (${eventType})`,
          },
        });
      }

      return updated;
    });
  }

  // Helper method for hall voucher updates
  private async handleHallVoucherUpdate(
    bookingId: number,
    memberId: string,
    hall: any,
    voucherType: VoucherType,
    amount: number,
    bookingDate: Date,
    eventTime: string,
    eventType: string,
    createRefund = false,
    refundAmount = 0,
  ) {
    // Cancel existing vouchers
    await this.prismaService.paymentVoucher.updateMany({
      where: {
        booking_id: bookingId,
        booking_type: 'HALL',
        voucher_type: {
          in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
        },
        status: VoucherStatus.CONFIRMED,
      },
      data: { status: VoucherStatus.CANCELLED },
    });

    // Create new voucher
    if (amount > 0) {
      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'HALL',
          booking_id: bookingId,
          membership_no: memberId,
          amount,
          payment_mode: PaymentMode.CASH,
          voucher_type: voucherType,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'admin',
          remarks: `${hall.name} | ${formatPakistanDate(bookingDate)} (${eventType}) - ${eventTime}`,
        },
      });
    }

    // Create refund voucher if needed
    if (createRefund && refundAmount > 0) {
      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'HALL',
          booking_id: bookingId,
          membership_no: memberId,
          amount: refundAmount,
          payment_mode: PaymentMode.CASH,
          voucher_type: VoucherType.REFUND,
          status: VoucherStatus.PENDING,
          issued_by: 'admin',
          remarks: `Refund for ${hall.name} booking`,
        },
      });

      await this.prismaService.member.update({
        where: { Membership_No: memberId },
        data: {
          bookingAmountDue: { increment: Math.round(Number(refundAmount)) },
          bookingBalance: { decrement: Math.round(Number(refundAmount)) },
        },
      });
    }
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

    // ── VALIDATION ───────────────────────────────────────────
    if (!membershipNo || !entityId || !bookingDate || !eventType || !eventTime)
      throw new BadRequestException('Required fields missing');

    const booking = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (booking < today)
      throw new ConflictException('Booking date cannot be in past');

    const member = await this.prismaService.member.findUnique({
      where: { Membership_No: membershipNo.toString() },
    });
    if (!member) throw new NotFoundException('Member not found');

    const normalizedEventTime = eventTime.toUpperCase() as
      | 'MORNING'
      | 'EVENING'
      | 'NIGHT';
    if (!['MORNING', 'EVENING', 'NIGHT'].includes(normalizedEventTime))
      throw new BadRequestException('Invalid event time');

    // ── PROCESS IN TRANSACTION ───────────────────────────────
    return await this.prismaService.$transaction(async (prisma) => {
      const hall = await prisma.hall.findFirst({
        where: { id: Number(entityId) },
        include: { outOfOrders: true },
      });
      if (!hall) throw new NotFoundException('Hall not found');

      // Check holdings
      const hallHold: any = await prisma.hallHoldings.findFirst({
        where: {
          hallId: hall.id,
          onHold: true,
          holdExpiry: { gt: new Date() },
          NOT: { holdBy: member.Membership_No }
        },
      });
      if (hallHold) throw new ConflictException('Hall is currently on hold');

      // ── CONFLICT CHECKS ────────────────────────────────────
      const outOfOrderConflict = hall.outOfOrders?.find((period) => {
        const start = new Date(period.startDate).setHours(0, 0, 0, 0);
        const end = new Date(period.endDate).setHours(0, 0, 0, 0);
        return booking.getTime() >= start && booking.getTime() <= end;
      });
      if (outOfOrderConflict)
        throw new ConflictException(`Hall '${hall.name}' out of order`);

      const existingBooking = await prisma.hallBooking.findFirst({
        where: {
          hallId: hall.id,
          bookingDate: booking,
          bookingTime: normalizedEventTime,
        },
      });
      if (existingBooking)
        throw new ConflictException(`Hall '${hall.name}' already booked`);

      const existingReservation = await prisma.hallReservation.findFirst({
        where: {
          hallId: hall.id,
          reservedFrom: { lte: booking },
          reservedTo: { gt: booking },
          timeSlot: normalizedEventTime,
        },
      });
      if (existingReservation)
        throw new ConflictException(`Hall '${hall.name}' reserved`);

      // ── PAYMENT CALCULATION ────────────────────────────────
      const basePrice =
        pricingType === 'member' ? hall.chargesMembers : hall.chargesGuests;
      const total = totalPrice ? Number(totalPrice) : Number(basePrice);
      let paid = 0,
        owed = total;

      if (paymentStatus === 'PAID') {
        paid = total;
        owed = 0;
      } else if (paymentStatus === 'HALF_PAID') {
        paid = Number(paidAmount) || 0;
        if (paid <= 0 || paid >= total)
          throw new ConflictException(
            'For half-paid: paid amount must be >0 and <total',
          );
        owed = total - paid;
      }

      // ── CREATE BOOKING ─────────────────────────────────────
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
          eventType,
          bookingTime: normalizedEventTime,
          paidBy,
          guestName,
          guestContact: guestContact?.toString(),
        },
        include: { hall: { select: { name: true, capacity: true } } },
      });

      // ── UPDATE HALL STATUS ─────────────────────────────────
      if (booking.getTime() === today.getTime()) {
        await prisma.hall.update({
          where: { id: hall.id },
          data: {
            isBooked: true,
          },
        });
        await prisma.hallHoldings.update({
          where: { id: hallHold?.id },
          data: {
            onHold: false,
            holdExpiry: null,
            holdBy: null,
          },
        });
      }

      // ── UPDATE MEMBER LEDGER ───────────────────────────────
      await prisma.member.update({
        where: { Membership_No: membershipNo.toString() },
        data: {
          totalBookings: { increment: 1 },
          lastBookingDate: new Date(),
          bookingAmountPaid: { increment: Math.round(Number(paid)) },
          bookingAmountDue: { increment: Math.round(Number(owed)) },
          bookingBalance: { increment: Math.round(Number(paid) - Number(owed)) },
        },
      });

      // ── CREATE PAYMENT VOUCHER ─────────────────────────────
      if (paid > 0) {
        const voucherType =
          paymentStatus === 'PAID'
            ? VoucherType.FULL_PAYMENT
            : VoucherType.HALF_PAYMENT;
        await prisma.paymentVoucher.create({
          data: {
            booking_type: 'HALL',
            booking_id: booked.id,
            membership_no: membershipNo.toString(),
            amount: paid,
            payment_mode: paymentMode as unknown as PaymentMode,
            voucher_type: voucherType,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'member',
            remarks: `${hall.name} | ${formatPakistanDate(booking)} | ${eventType} (${normalizedEventTime})${specialRequests ? ` | ${specialRequests}` : ''}`,
          },
        });
      }

      return {
        success: true,
        message: `Booked ${hall.name}`,
        booking: booked,
        totalAmount: total,
        paidAmount: paid,
        pendingAmount: owed,
      };
    });
  }

  async uBookingHallMember(payload: any) {
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
      eventType,
      numberOfGuests,
      eventTime,
      paidBy = 'MEMBER',
      guestName,
      guestContact,
      remarks,
    } = payload;

    if (
      !id ||
      !membershipNo ||
      !entityId ||
      !bookingDate ||
      !eventType ||
      !eventTime
    )
      throw new BadRequestException('Required fields missing');

    const booking = new Date(bookingDate);
    booking.setHours(0, 0, 0, 0);

    const existing = await this.prismaService.hallBooking.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) throw new NotFoundException('Hall booking not found');

    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: membershipNo },
    });
    if (!member) throw new NotFoundException('Member not found');

    // ── PROCESS IN TRANSACTION ───────────────────────────────
    return await this.prismaService.$transaction(async (prisma) => {
      const hall = await prisma.hall.findFirst({
        where: { id: Number(entityId) },
        include: { outOfOrders: true },
      });
      if (!hall) throw new BadRequestException('Hall not found');

      // ── CONFLICT CHECKS ────────────────────────────────────
      const outOfOrderConflict = hall.outOfOrders?.find((period) => {
        const start = new Date(period.startDate).setHours(0, 0, 0, 0);
        const end = new Date(period.endDate).setHours(0, 0, 0, 0);
        return booking.getTime() >= start && booking.getTime() <= end;
      });
      if (outOfOrderConflict)
        throw new ConflictException(`Hall '${hall.name}' out of order`);

      const normalizedEventTime = eventTime.toUpperCase() as
        | 'MORNING'
        | 'EVENING'
        | 'NIGHT';

      const conflictingBooking = await prisma.hallBooking.findFirst({
        where: {
          hallId: hall.id,
          id: { not: Number(id) },
          bookingDate: booking,
          bookingTime: normalizedEventTime,
        },
      });
      if (conflictingBooking)
        throw new ConflictException(`Hall '${hall.name}' already booked`);

      // ── PAYMENT RECALCULATION ──────────────────────────────
      const oldTotal = Number(existing.totalPrice);
      const oldPaid = Number(existing.paidAmount);
      const oldStatus = existing.paymentStatus;

      const basePrice =
        pricingType === 'member' ? hall.chargesMembers : hall.chargesGuests;
      const newTotal = totalPrice ? Number(totalPrice) : Number(basePrice);

      let newPaid = oldPaid,
        newOwed = newTotal - oldPaid;
      let newPaymentStatus: any = paymentStatus || oldStatus;
      let refundAmount = 0;

      // Reuse payment scenarios logic (same as admin version but simplified)
      if (
        newTotal < oldPaid &&
        oldStatus === 'PAID' &&
        paymentStatus !== 'HALF_PAID' &&
        paymentStatus !== 'UNPAID'
      ) {
        refundAmount = oldPaid - newTotal;
        newPaid = newTotal;
        newOwed = 0;
        newPaymentStatus = 'PAID';

        await this.handleHallVoucherUpdate(
          Number(id),
          membershipNo,
          hall,
          VoucherType.FULL_PAYMENT,
          newPaid,
          booking,
          normalizedEventTime,
          eventType,
          true,
          refundAmount,
        );
      } else if (
        paymentStatus &&
        oldStatus === 'PAID' &&
        ['HALF_PAID', 'UNPAID'].includes(paymentStatus)
      ) {
        newPaymentStatus = paymentStatus;
        newPaid = paymentStatus === 'HALF_PAID' ? Number(paidAmount) || 0 : 0;
        newOwed = newTotal - newPaid;

        if (paymentStatus === 'HALF_PAID') {
          await this.handleHallVoucherUpdate(
            Number(id),
            membershipNo,
            hall,
            VoucherType.HALF_PAYMENT,
            newPaid,
            booking,
            normalizedEventTime,
            eventType,
            false,
            0,
          );
        }
      } else if (paymentStatus && newTotal === oldTotal) {
        if (paymentStatus === 'PAID') {
          newPaid = newTotal;
          newOwed = 0;
        } else if (paymentStatus === 'HALF_PAID') {
          newPaid = Number(paidAmount) || oldPaid;
          newOwed = newTotal - newPaid;
        } else if (paymentStatus === 'UNPAID') {
          newPaid = 0;
          newOwed = newTotal;
        }
      }

      const paidDiff = newPaid - oldPaid;
      const owedDiff = newOwed - (oldTotal - oldPaid);

      // ── UPDATE BOOKING ─────────────────────────────────────
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
          eventType,
          bookingTime: normalizedEventTime,
          paidBy,
          guestName,
          guestContact: guestContact?.toString(),
          refundAmount,
          refundReturned: false,
        },
      });

      // ── UPDATE HALL STATUS ─────────────────────────────────
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isToday = booking.getTime() === today.getTime();
      const wasToday = existing.bookingDate.getTime() === today.getTime();

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

      // ── CREATE PAYMENT VOUCHER ─────────────────────────────
      if (paidDiff > 0) {
        const voucherType =
          newPaymentStatus === 'PAID'
            ? VoucherType.FULL_PAYMENT
            : VoucherType.HALF_PAYMENT;
        await prisma.paymentVoucher.create({
          data: {
            booking_type: 'HALL',
            booking_id: updated.id,
            membership_no: membershipNo,
            amount: paidDiff,
            payment_mode: paymentMode as any,
            voucher_type: voucherType,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'member',
            remarks: `${hall.name} | ${formatPakistanDate(booking)} | ${eventType} (${normalizedEventTime})`,
          },
        });
      }

      return {
        success: true,
        message: 'Hall booking updated',
        booking: updated,
        refundAmount,
      };
    });
  }

  async dBookingHall(bookingId: number) {
    return await this.prismaService.hallBooking.delete({
      where: { id: bookingId },
    });
  }

  // lawn booking
  async gBookingsLawn() {
    return await this.prismaService.lawnBooking.findMany({
      orderBy: { bookingDate: 'desc' },
      include: {
        lawn: { include: { lawnCategory: true } },
        member: {
          select: { Membership_No: true, Name: true },
        },
      },
    });
  }
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
      eventType,
    } = payload;

    // ── VALIDATION ───────────────────────────────────────────
    if (!membershipNo || !entityId || !bookingDate || !numberOfGuests || !eventType)
      throw new BadRequestException('Required fields missing');

    const booking = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (booking < today)
      throw new UnprocessableEntityException('Booking date cannot be in past');

    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: membershipNo },
    });
    if (!member) throw new BadRequestException('Member not found');

    const lawn = await this.prismaService.lawn.findFirst({
      where: { id: Number(entityId) },
      include: { outOfOrders: { orderBy: { startDate: 'asc' } } },
    });
    if (!lawn) throw new BadRequestException('Lawn not found');
    if (!lawn.isActive) throw new ConflictException('Lawn is not active');

    // Check holdings
    const lawnHold = await this.prismaService.lawnHoldings.findFirst({
      where: { lawnId: lawn.id, onHold: true, holdExpiry: { gt: new Date() } },
    });
    if (lawnHold) throw new ConflictException('Lawn is currently on hold');

    // ── OUT OF ORDER CHECK ───────────────────────────────────
    const outOfOrderConflict = lawn.outOfOrders?.find((period) => {
      const start = new Date(period.startDate).setHours(0, 0, 0, 0);
      const end = new Date(period.endDate).setHours(0, 0, 0, 0);
      const bookingDate = booking.getTime();
      return bookingDate >= start && bookingDate <= end;
    });

    if (outOfOrderConflict) {
      const start = new Date(outOfOrderConflict.startDate);
      const end = new Date(outOfOrderConflict.endDate);
      const isScheduled = start > today;
      throw new ConflictException(
        `Lawn '${lawn.description}' ${isScheduled ? 'has scheduled maintenance' : 'is out of service'} from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}${outOfOrderConflict.reason ? `: ${outOfOrderConflict.reason}` : ''}`,
      );
    }

    // ── CAPACITY CHECK ───────────────────────────────────────
    if (numberOfGuests < (lawn.minGuests || 0))
      throw new ConflictException(
        `Guests (${numberOfGuests}) below minimum ${lawn.minGuests}`,
      );
    if (numberOfGuests > lawn.maxGuests)
      throw new ConflictException(
        `Guests (${numberOfGuests}) exceeds maximum ${lawn.maxGuests}`,
      );

    // ── CONFLICT CHECK ───────────────────────────────────────
    const conflictingBooking = await this.prismaService.lawnBooking.findFirst({
      where: {
        lawnId: lawn.id,
        bookingDate: booking,
        bookingTime: eventTime as BookingOpt,
      },
    });
    if (conflictingBooking)
      throw new ConflictException(`Lawn '${lawn.description}' already booked`);

    // ── PAYMENT CALCULATION ──────────────────────────────────
    const basePrice =
      pricingType === 'member' ? lawn.memberCharges : lawn.guestCharges;
    const total = totalPrice ? Number(totalPrice) : Number(basePrice);
    let paid = 0,
      owed = total;

    let amountToBalance = 0;
    const isToBill = (paymentStatus as unknown as string) === 'TO_BILL';

    if ((paymentStatus as unknown as PaymentStatus) === 'PAID') {
      paid = total;
      owed = 0;
    } else if ((paymentStatus as unknown as PaymentStatus) === 'HALF_PAID') {
      paid = Number(paidAmount) || 0;
      if (paid <= 0 || paid >= total)
        throw new ConflictException(
          'For half-paid: paid amount must be >0 and <total',
        );
      owed = total - paid;
    }

    if (isToBill) {
      amountToBalance = owed;
      owed = 0;
    }

    // ── CREATE BOOKING ───────────────────────────────────────
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
        eventType,
      },
    });

    // ── UPDATE LAWN STATUS ───────────────────────────────────
    const updateData: any = { onHold: false, holdBy: null, holdExpiry: null };
    if (booking.getTime() === today.getTime()) updateData.isBooked = true;

    await this.prismaService.lawn.update({
      where: { id: lawn.id },
      data: updateData,
    });

    // ── UPDATE MEMBER LEDGER ─────────────────────────────────
    await this.prismaService.member.update({
      where: { Membership_No: membershipNo },
      data: {
        totalBookings: { increment: 1 },
        lastBookingDate: new Date(),
        bookingAmountPaid: { increment: Math.round(Number(paid)) },
        bookingAmountDue: { increment: Math.round(Number(owed)) },
        bookingBalance: { increment: Math.round(Number(paid) - Number(owed)) },
        Balance: { increment: Math.round(amountToBalance) },
        drAmount: { increment: Math.round(amountToBalance) },
      },
    });

    // ── CREATE PAYMENT VOUCHER ───────────────────────────────
    if (paid > 0) {
      const voucherType =
        (paymentStatus as unknown as PaymentStatus) === 'PAID'
          ? VoucherType.FULL_PAYMENT
          : VoucherType.HALF_PAYMENT;
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
          remarks: `${lawn.description} | ${formatPakistanDate(booking)} | ${eventTime} | ${numberOfGuests} guests`,
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
      paymentMode = 'CASH',
      numberOfGuests,
      eventTime,
      paidBy = 'MEMBER',
      guestName,
      guestContact,
      remarks,
      eventType,
    } = payload;

    if (
      !id ||
      !membershipNo ||
      !entityId ||
      !bookingDate ||
      !numberOfGuests ||
      !eventTime ||
      !eventType
    )
      throw new BadRequestException('Required fields missing');

    const existing = await this.prismaService.lawnBooking.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) throw new NotFoundException('Lawn booking not found');

    const member = await this.prismaService.member.findFirst({
      where: { Membership_No: membershipNo },
    });
    if (!member) throw new NotFoundException('Member not found');

    // ── PROCESS IN TRANSACTION ───────────────────────────────
    return await this.prismaService.$transaction(async (prisma) => {
      const lawn = await prisma.lawn.findFirst({
        where: { id: Number(entityId) },
        include: { outOfOrders: true },
      });
      if (!lawn) throw new NotFoundException('Lawn not found');

      // ── VALIDATION CHECKS ──────────────────────────────────
      const bookingDateObj = new Date(bookingDate);
      bookingDateObj.setHours(0, 0, 0, 0);

      const outOfOrderConflict = lawn.outOfOrders?.find((period) => {
        const start = new Date(period.startDate).setHours(0, 0, 0, 0);
        const end = new Date(period.endDate).setHours(0, 0, 0, 0);
        return (
          bookingDateObj.getTime() >= start && bookingDateObj.getTime() <= end
        );
      });
      if (outOfOrderConflict)
        throw new ConflictException('Lawn out of service');

      const normalizedEventTime = eventTime.toUpperCase() as
        | 'MORNING'
        | 'EVENING'
        | 'NIGHT';

      const conflictingBooking = await prisma.lawnBooking.findFirst({
        where: {
          lawnId: lawn.id,
          id: { not: Number(id) },
          bookingDate: bookingDateObj,
          bookingTime: normalizedEventTime,
        },
      });
      if (conflictingBooking)
        throw new ConflictException('Lawn already booked');

      if (numberOfGuests < (lawn.minGuests || 0))
        throw new ConflictException(`Guests below minimum ${lawn.minGuests}`);
      if (numberOfGuests > lawn.maxGuests)
        throw new ConflictException(`Guests exceeds maximum ${lawn.maxGuests}`);

      // ── PAYMENT RECALCULATION ──────────────────────────────
      const oldTotal = Number(existing.totalPrice);
      const oldPaid = Number(existing.paidAmount);
      const oldStatus = existing.paymentStatus;

      const basePrice =
        pricingType === 'member' ? lawn.memberCharges : lawn.guestCharges;
      const newTotal = totalPrice ? Number(totalPrice) : Number(basePrice);

      let newPaid = oldPaid,
        newOwed = newTotal - oldPaid;
      let newPaymentStatus = (paymentStatus as any) ?? oldStatus;
      let refundAmount = 0;

      // Reuse payment scenario logic from hall bookings
      if (
        newTotal < oldPaid &&
        oldStatus === 'PAID' &&
        (paymentStatus as unknown as PaymentStatus) !== 'HALF_PAID' &&
        (paymentStatus as unknown as PaymentStatus) !== 'UNPAID'
      ) {
        refundAmount = oldPaid - newTotal;
        newPaid = newTotal;
        newOwed = 0;
        newPaymentStatus = 'PAID';
        await this.handleLawnVoucherUpdate(
          Number(id),
          membershipNo,
          lawn,
          VoucherType.FULL_PAYMENT,
          newPaid,
          bookingDateObj,
          normalizedEventTime,
          true,
          refundAmount,
          remarks,
        );
      } else if (
        paymentStatus &&
        oldStatus === 'PAID' &&
        ['HALF_PAID', 'UNPAID'].includes(
          paymentStatus as unknown as PaymentStatus,
        )
      ) {
        newPaymentStatus = paymentStatus;
        newPaid =
          (paymentStatus as unknown as PaymentStatus) === 'HALF_PAID'
            ? Number(paidAmount) || 0
            : 0;
        newOwed = newTotal - newPaid;

        if ((paymentStatus as unknown as PaymentStatus) === 'HALF_PAID') {
          await this.handleLawnVoucherUpdate(
            Number(id),
            membershipNo,
            lawn,
            VoucherType.HALF_PAYMENT,
            newPaid,
            bookingDateObj,
            normalizedEventTime,
            false,
            0,
            remarks,
          );
        }
      } else if (paymentStatus && newTotal === oldTotal) {
        if ((paymentStatus as unknown as PaymentStatus) === 'PAID') {
          newPaid = newTotal;
          newOwed = 0;
        } else if (
          (paymentStatus as unknown as PaymentStatus) === 'HALF_PAID'
        ) {
          newPaid = Number(paidAmount) || oldPaid;
          newOwed = newTotal - newPaid;
        } else if ((paymentStatus as unknown as PaymentStatus) === 'UNPAID') {
          newPaid = 0;
          newOwed = newTotal;
        } else if ((paymentStatus as unknown as string) === 'TO_BILL') {
          newPaid = Number(paidAmount) || oldPaid;
          newOwed = newTotal - newPaid;
        }
      }

      let amountToBalance = 0;
      if (newPaymentStatus === 'TO_BILL') {
        amountToBalance = newOwed;
        newOwed = 0;
      }

      const paidDiff = newPaid - oldPaid;
      const owedDiff = newOwed - (oldTotal - oldPaid);

      // ── UPDATE BOOKING ─────────────────────────────────────
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
          eventType,
          refundAmount,
          refundReturned: false,
        },
      });

      // ── UPDATE VOUCHER DATES ───────────────────────────────
      const dateChanged =
        existing.bookingDate.getTime() !== bookingDateObj.getTime();
      if (
        dateChanged &&
        (newPaymentStatus === 'PAID' || newPaymentStatus === 'HALF_PAID')
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
        // ── CREATE PAYMENT VOUCHER ──────────────────────────────
        if (paidDiff > 0) {
          const voucherType =
            newPaymentStatus === 'PAID'
              ? VoucherType.FULL_PAYMENT
              : VoucherType.HALF_PAYMENT;

          await prisma.paymentVoucher.create({
            data: {
              booking_type: 'LAWN',
              booking_id: updated.id,
              membership_no: membershipNo,
              amount: paidDiff,
              payment_mode: (paymentMode as any) ?? PaymentMode.CASH,
              voucher_type: voucherType,
              status: VoucherStatus.CONFIRMED,
              issued_by: 'admin',
              remarks: `${lawn.description} | Payment Update | ${formatPakistanDate(bookingDateObj)} (${normalizedEventTime})`,
            },
          });
        }

        return {
          success: true,
          message: 'Lawn booking updated',
          booking: updated,
          refundAmount,
        };
      }
    })
  
  }

  // Helper method for lawn voucher updates
  private async handleLawnVoucherUpdate(
    bookingId: number,
    memberId: string,
    lawn: any,
    voucherType: VoucherType,
    amount: number,
    bookingDate: Date,
    eventTime: string,
    createRefund = false,
    refundAmount = 0,
    remarks?: string,
  ) {
    // Cancel existing vouchers
    await this.prismaService.paymentVoucher.updateMany({
      where: {
        booking_id: bookingId,
        booking_type: 'LAWN',
        voucher_type: {
          in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
        },
        status: VoucherStatus.CONFIRMED,
      },
      data: { status: VoucherStatus.CANCELLED },
    });

    // Create new voucher
    if (amount > 0) {
      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'LAWN',
          booking_id: bookingId,
          membership_no: memberId,
          amount,
          payment_mode: PaymentMode.CASH,
          voucher_type: voucherType,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'admin',
          remarks: `${lawn.description} | ${formatPakistanDate(bookingDate)} - ${eventTime}${remarks ? ` | ${remarks}` : ''}`,
        },
      });
    }

    // Create refund voucher if needed
    if (createRefund && refundAmount > 0) {
      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'LAWN',
          booking_id: bookingId,
          membership_no: memberId,
          amount: refundAmount,
          payment_mode: PaymentMode.CASH,
          voucher_type: VoucherType.REFUND,
          status: VoucherStatus.PENDING,
          issued_by: 'admin',
          remarks: `Refund for ${lawn.description} booking${remarks ? ` | ${remarks}` : ''}`,
        },
      });

      await this.prismaService.member.update({
        where: { Membership_No: memberId },
        data: {
          bookingAmountDue: { increment: Math.round(Number(refundAmount)) },
          bookingBalance: { decrement: Math.round(Number(refundAmount)) },
        },
      });
    }
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
      eventType,
    } = payload;

    console.log(payload)

    // ── VALIDATION ───────────────────────────────────────────
    if (
      !membershipNo ||
      !entityId ||
      !bookingDate ||
      !numberOfGuests ||
      !eventTime
    )
      throw new BadRequestException('Required fields missing');

    const booking = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (booking < today)
      throw new ConflictException('Booking date cannot be in past');

    const member = await this.prismaService.member.findUnique({
      where: { Membership_No: membershipNo.toString() },
    });
    if (!member) throw new NotFoundException('Member not found');

    const normalizedEventTime = eventTime.toUpperCase() as
      | 'MORNING'
      | 'EVENING'
      | 'NIGHT';
    if (!['MORNING', 'EVENING', 'NIGHT'].includes(normalizedEventTime))
      throw new BadRequestException('Invalid event time');

    // ── PROCESS IN TRANSACTION ───────────────────────────────
    return await this.prismaService.$transaction(async (prisma) => {
      const lawn = await prisma.lawn.findFirst({
        where: { id: Number(entityId) },
        include: { outOfOrders: { orderBy: { startDate: 'asc' } } },
      });
      if (!lawn) throw new NotFoundException('Lawn not found');
      if (!lawn.isActive) throw new ConflictException('Lawn is not active');

      // Check holdings
      const lawnHold = await prisma.lawnHoldings.findFirst({
        where: {
          lawnId: lawn.id,
          onHold: true,
          holdExpiry: { gt: new Date() },
          NOT: { holdBy: member.Membership_No }
        },
      });
      if (lawnHold) throw new ConflictException('Lawn is currently on hold');

      // ── OUT OF ORDER CHECK ─────────────────────────────────
      const outOfOrderConflict = lawn.outOfOrders?.find((period) => {
        const start = new Date(period.startDate).setHours(0, 0, 0, 0);
        const end = new Date(period.endDate).setHours(0, 0, 0, 0);
        const bookingDate = booking.getTime();
        return bookingDate >= start && bookingDate <= end;
      });

      if (outOfOrderConflict) {
        const start = new Date(outOfOrderConflict.startDate);
        const end = new Date(outOfOrderConflict.endDate);
        const isScheduled = start > today;
        throw new ConflictException(
          `Lawn '${lawn.description}' ${isScheduled ? 'has scheduled maintenance' : 'is out of service'} from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
        );
      }

      // ── CAPACITY CHECK ─────────────────────────────────────
      if (numberOfGuests < (lawn.minGuests || 0))
        throw new ConflictException(
          `Guests (${numberOfGuests}) below minimum ${lawn.minGuests}`,
        );
      if (numberOfGuests > lawn.maxGuests)
        throw new ConflictException(
          `Guests (${numberOfGuests}) exceeds maximum ${lawn.maxGuests}`,
        );

      // ── CONFLICT CHECK ─────────────────────────────────────
      const conflictingBooking = await prisma.lawnBooking.findFirst({
        where: {
          lawnId: lawn.id,
          bookingDate: booking,
          bookingTime: normalizedEventTime,
        },
      });
      if (conflictingBooking)
        throw new ConflictException(
          `Lawn '${lawn.description}' already booked`,
        );

      // ── PAYMENT CALCULATION ────────────────────────────────
      const basePrice =
        pricingType === 'member' ? lawn.memberCharges : lawn.guestCharges;
      const total = totalPrice ? Number(totalPrice) : Number(basePrice);
      let paid = 0,
        owed = total;

      if (paymentStatus === 'PAID') {
        paid = total;
        owed = 0;
      } else if (paymentStatus === 'HALF_PAID') {
        paid = Number(paidAmount) || 0;
        if (paid <= 0 || paid >= total)
          throw new ConflictException(
            'For half-paid: paid amount must be >0 and <total',
          );
        owed = total - paid;
      }

      // ── CREATE BOOKING ─────────────────────────────────────
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
          eventType,
        },
        include: {
          lawn: {
            select: { description: true, minGuests: true, maxGuests: true },
          },
        },
      });

      // ── UPDATE LAWN STATUS ─────────────────────────────────
      const updateData: any = { onHold: false, holdBy: null, holdExpiry: null };
      if (booking.getTime() === today.getTime()) updateData.isBooked = true;

      // ── UPDATE MEMBER LEDGER ───────────────────────────────
      await prisma.member.update({
        where: { Membership_No: membershipNo.toString() },
        data: {
          totalBookings: { increment: 1 },
          lastBookingDate: new Date(),
          bookingAmountPaid: { increment: Math.round(Number(paid)) },
          bookingAmountDue: { increment: Math.round(Number(owed)) },
          bookingBalance: { increment: Math.round(Number(paid) - Number(owed)) },
        },
      });

      // ── CREATE PAYMENT VOUCHER ─────────────────────────────
      if (paid > 0) {
        const voucherType =
          paymentStatus === 'PAID'
            ? VoucherType.FULL_PAYMENT
            : VoucherType.HALF_PAYMENT;
        await prisma.paymentVoucher.create({
          data: {
            booking_type: 'LAWN',
            booking_id: booked.id,
            membership_no: membershipNo.toString(),
            amount: paid,
            payment_mode: paymentMode as unknown as PaymentMode,
            voucher_type: voucherType,
            status: VoucherStatus.CONFIRMED,
            issued_by: 'member',
            remarks: `${lawn.description} | ${formatPakistanDate(booking)} | ${normalizedEventTime} | ${numberOfGuests} guests${specialRequests ? ` | ${specialRequests}` : ''}`,
          },
        });
      }

      // remove onhold
      await this.prismaService.lawnHoldings.deleteMany({
        where: { lawnId: booked.lawnId }
      })
      console.log("::::", booked)

      return {
        success: true,
        message: `Booked ${lawn.description}`,
        booking: booked,
        totalAmount: total,
        paidAmount: paid,
        pendingAmount: owed,
        capacity: { minGuests: lawn.minGuests, maxGuests: lawn.maxGuests },
        outOfOrderPeriods: lawn.outOfOrders.map((period) => ({
          dates: `${new Date(period.startDate).toLocaleDateString()} - ${new Date(period.endDate).toLocaleDateString()}`,
          reason: period.reason,
        })),
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
      eventType,
    } = payload;

    if (
      !id ||
      !membershipNo ||
      !entityId ||
      !bookingDate ||
      !numberOfGuests ||
      !eventTime
    )
      throw new BadRequestException('Required fields missing');

    const booking = new Date(bookingDate);
    booking.setHours(0, 0, 0, 0);

    const existing = await this.prismaService.lawnBooking.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) throw new NotFoundException('Lawn booking not found');

    const member = await this.prismaService.member.findUnique({
      where: { Membership_No: membershipNo },
    });
    if (!member) throw new NotFoundException('Member not found');

    const lawn = await this.prismaService.lawn.findFirst({
      where: { id: Number(entityId) },
      include: { outOfOrders: true },
    });
    if (!lawn) throw new NotFoundException('Lawn not found');

    // ── VALIDATION CHECKS ────────────────────────────────────
    const outOfOrderConflict = lawn.outOfOrders?.find((period) => {
      const start = new Date(period.startDate).setHours(0, 0, 0, 0);
      const end = new Date(period.endDate).setHours(0, 0, 0, 0);
      return booking.getTime() >= start && booking.getTime() <= end;
    });
    if (outOfOrderConflict) throw new ConflictException('Lawn out of service');

    const normalizedEventTime = eventTime.toUpperCase() as
      | 'MORNING'
      | 'EVENING'
      | 'NIGHT';

    const conflictingBooking = await this.prismaService.lawnBooking.findFirst({
      where: {
        lawnId: lawn.id,
        id: { not: Number(id) },
        bookingDate: booking,
        bookingTime: normalizedEventTime,
      },
    });
    if (conflictingBooking) throw new ConflictException('Lawn already booked');

    if (numberOfGuests < (lawn.minGuests || 0))
      throw new ConflictException(`Guests below minimum ${lawn.minGuests}`);
    if (numberOfGuests > lawn.maxGuests)
      throw new ConflictException(`Guests exceeds maximum ${lawn.maxGuests}`);

    // ── PAYMENT RECALCULATION ────────────────────────────────
    const oldTotal = Number(existing.totalPrice);
    const oldPaid = Number(existing.paidAmount);
    const oldStatus = existing.paymentStatus;

    const basePrice =
      pricingType === 'member' ? lawn.memberCharges : lawn.guestCharges;
    const newTotal = totalPrice ? Number(totalPrice) : Number(basePrice);

    let newPaid = oldPaid,
      newOwed = newTotal - oldPaid;
    let newPaymentStatus: any = paymentStatus || oldStatus;
    let refundAmount = 0;

    // Same payment scenarios as admin version
    if (
      newTotal < oldPaid &&
      oldStatus === 'PAID' &&
      paymentStatus !== 'HALF_PAID' &&
      paymentStatus !== 'UNPAID'
    ) {
      refundAmount = oldPaid - newTotal;
      newPaid = newTotal;
      newOwed = 0;
      newPaymentStatus = 'PAID';

      await this.handleLawnVoucherUpdate(
        Number(id),
        membershipNo,
        lawn,
        VoucherType.FULL_PAYMENT,
        newPaid,
        booking,
        normalizedEventTime,
        true,
        refundAmount,
        remarks,
      );
    } else if (
      paymentStatus &&
      oldStatus === 'PAID' &&
      ['HALF_PAID', 'UNPAID'].includes(paymentStatus)
    ) {
      newPaymentStatus = paymentStatus;
      newPaid = paymentStatus === 'HALF_PAID' ? Number(paidAmount) || 0 : 0;
      newOwed = newTotal - newPaid;

      if (paymentStatus === 'HALF_PAID') {
        await this.handleLawnVoucherUpdate(
          Number(id),
          membershipNo,
          lawn,
          VoucherType.HALF_PAYMENT,
          newPaid,
          booking,
          normalizedEventTime,
          false,
          0,
          remarks,
        );
      }
    } else if (paymentStatus && newTotal === oldTotal) {
      if (paymentStatus === 'PAID') {
        newPaid = newTotal;
        newOwed = 0;
      } else if (paymentStatus === 'HALF_PAID') {
        newPaid = Number(paidAmount) || oldPaid;
        newOwed = newTotal - newPaid;
      } else if (paymentStatus === 'UNPAID') {
        newPaid = 0;
        newOwed = newTotal;
      }
    }

    const paidDiff = newPaid - oldPaid;
    const owedDiff = newOwed - (oldTotal - oldPaid);

    // ── UPDATE BOOKING ───────────────────────────────────────
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
        eventType,
        refundAmount,
        refundReturned: false,
      },
    });

    // ── UPDATE VOUCHER DATES ─────────────────────────────────
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

    // ── CREATE PAYMENT VOUCHER ─────────────────────────────
    if (paidDiff > 0) {
      const voucherType =
        newPaymentStatus === 'PAID'
          ? VoucherType.FULL_PAYMENT
          : VoucherType.HALF_PAYMENT;
      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'LAWN',
          booking_id: updated.id,
          membership_no: membershipNo,
          amount: paidDiff,
          payment_mode: paymentMode as any,
          voucher_type: voucherType,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'member',
          remarks: `${lawn.description} | ${formatPakistanDate(booking)} | ${normalizedEventTime}`,
        },
      });
    }

    return {
      success: true,
      message: 'Lawn booking updated',
      booking: updated,
      refundAmount,
    };
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

    const total = Number(totalPrice);
    let paid = 0;
    let owed = total;

    let amountToBalance = 0;
    const isToBill = (paymentStatus as unknown as string) === 'TO_BILL';

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
    } else if (isToBill) {
      paid = 0; // or Number(paidAmount) || 0 if partial payment is allowed with TO_BILL
      owed = total - paid;
      amountToBalance = owed;
      owed = 0;
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
        bookingAmountPaid: { increment: Math.round(Number(paid)) },
        bookingAmountDue: { increment: Math.round(Number(owed)) },
        bookingBalance: { increment: Math.round(Number(paid) - Number(owed)) },
        Balance: { increment: Math.round(amountToBalance) },
        drAmount: { increment: Math.round(amountToBalance) },
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
      (paymentStatus as unknown as PaymentStatus) !== oldPaymentStatus &&
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
          payment_mode:
            (paymentMode as unknown as PaymentMode) || PaymentMode.CASH,
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
          bookingAmountDue: { increment: Math.round(Number(refundAmount)) },
          bookingBalance: { decrement: Math.round(Number(refundAmount)) },
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
            payment_mode:
              (paymentMode as unknown as PaymentMode) || PaymentMode.CASH,
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
              payment_mode:
                (paymentMode as unknown as PaymentMode) || PaymentMode.CASH,
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
      if (
        paymentStatus &&
        (paymentStatus as unknown as PaymentStatus) !== oldPaymentStatus
      ) {
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

    let amountToBalance = 0;
    if (newPaymentStatus === 'TO_BILL') {
      amountToBalance = newOwed;
      newOwed = 0;
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
        refundAmount,
        paidBy,
        guestName,
        guestContact,
        refundReturned: false,
      },
    });
    // 5. Update Member Ledger
    if (paidDiff !== 0 || owedDiff !== 0) {
      await this.prismaService.member.update({
        where: { Sno: booking.memberId },
        data: {
          bookingAmountPaid: { increment: Math.round(Number(paidDiff)) },
          bookingAmountDue: { increment: Math.round(Number(owedDiff)) },
          bookingBalance: { increment: Math.round(Number(paidDiff) - Number(owedDiff)) },
          Balance: { increment: Math.round(amountToBalance) },
          drAmount: { increment: Math.round(amountToBalance) },
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
            payment_mode:
              (paymentMode as unknown as PaymentMode) || PaymentMode.CASH,
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
    if (
      dateChanged &&
      (newPaymentStatus === PaymentStatus.PAID ||
        newPaymentStatus === PaymentStatus.HALF_PAID)
    ) {
      await this.prismaService.paymentVoucher.updateMany({
        where: {
          booking_id: booking.id,
          booking_type: 'PHOTOSHOOT',
          status: VoucherStatus.CONFIRMED,
          voucher_type: {
            in: [VoucherType.FULL_PAYMENT, VoucherType.HALF_PAYMENT],
          },
        },
        data: {
          remarks: `Photoshoot | ${newStartTime.toLocaleDateString()} ${newStartTime.toLocaleTimeString()}`,
        },
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
    // if (bookingHour < 9 && bookingHour > 6) {
    //   throw new BadRequestException(
    //     'Photoshoot bookings are only available between 9:00 AM and 6:00 PM',
    //   );
    // }

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
          bookingAmountPaid: { increment: Math.round(Number(paid)) },
          bookingAmountDue: { increment: Math.round(Number(owed)) },
          bookingBalance: { increment: Math.round(Number(paid) - Number(owed)) },
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
      // console.log(booked);
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
    if (!bookingDate) throw new BadRequestException('Booking date is required');
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

    if (!photoshoot)
      throw new NotFoundException('Photoshoot service not found');
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
          bookingAmountDue: { increment: Math.round(Number(refundAmount)) },
          bookingBalance: { decrement: Math.round(Number(refundAmount)) },
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

    let amountToBalance = 0;
    if (newPaymentStatus === 'TO_BILL') {
      amountToBalance = newOwed;
      newOwed = 0;
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
        refundAmount,
        paidBy,
        guestName,
        guestContact: guestContact?.toString(),
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

    // ── CREATE PAYMENT VOUCHER ─────────────────────────────
    if (paidDiff > 0) {
      const voucherType =
        newPaymentStatus === 'PAID'
          ? VoucherType.FULL_PAYMENT
          : VoucherType.HALF_PAYMENT;
      await this.prismaService.paymentVoucher.create({
        data: {
          booking_type: 'PHOTOSHOOT',
          booking_id: updated.id,
          membership_no: membershipNo,
          amount: paidDiff,
          payment_mode: paymentMode as any,
          voucher_type: voucherType,
          status: VoucherStatus.CONFIRMED,
          issued_by: 'member',
          remarks: `Photoshoot: ${photoshoot.description} | ${formatPakistanDate(booking)}`,
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
                lawnCategory: true,
              },
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

  // member bookings
  async memberBookings(Membership_No: string, type: 'Room' | 'Hall' | 'Lawn' | 'Photoshoot') {
    const member = await this.prismaService.member.findFirst({
      where: { Membership_No }
    })
    if (!member) throw new NotFoundException(`Membership number not found`)

    if (type === "Room") {
      return await this.prismaService.roomBooking.findMany({
        where: { Membership_No }
      })
    } else if (type === "Hall") {
      return await this.prismaService.hallBooking.findMany({
        where: { memberId: member.Sno }
      })
    } else if (type === "Lawn") {
      return await this.prismaService.lawnBooking.findMany({
        where: { memberId: member.Sno }
      })
    } else if (type === "Photoshoot") {
      return await this.prismaService.photoshootBooking.findMany({
        where: { memberId: member.Sno }
      })
    }

  }


}



