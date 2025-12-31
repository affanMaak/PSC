import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  formatPakistanDate,
  getPakistanDate,
  parsePakistanDate,
} from 'src/utils/time';

@Injectable()
export class PaymentService {
  constructor(private prismaService: PrismaService) { }

  // kuick pay
  // Mock payment gateway call - replace with actual integration
  private async callPaymentGateway(paymentData: any) {
    // Simulate API call to payment gateway
    // console.log('Calling payment gateway with:', paymentData);

    // This would be your actual payment gateway integration
    // For example:
    // const response = await axios.post('https://payment-gateway.com/invoice', paymentData);
    // return response.data;

    // the kuickpay api will call member booking api once payment is done
    paymentData.type === 'room' &&
      (await fetch('http://localhost:3000/booking/member/booking/room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      }));
    const bookHall = async (paymentData) => {
      const done = await fetch(
        'http://localhost:3000/booking/member/booking/hall',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        },
      );
      console.log(done);
    };
    paymentData.type === 'hall' && bookHall(paymentData);
    paymentData.type === 'lawn' &&
      (await fetch('http://localhost:3000/booking/member/booking/lawn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      }));

    const bookPhoto = async (paymentData) => {
      const done = await fetch(
        'http://localhost:3000/booking/member/booking/photoshoot',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        },
      );
      // console.log(done)
    };
    paymentData.type === 'photoshoot' && bookPhoto(paymentData);

    // Mock successful response
    return {
      success: true,
      transactionId:
        'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    };
  }

  ///////////////////////////////////////////////////////////////////////
  // generateInvoice
  async genInvoiceRoom(roomType: number, bookingData: any) {
    // Validate room type exists
    const typeExists = await this.prismaService.roomType.findFirst({
      where: { id: roomType },
    });
    if (!typeExists) throw new NotFoundException(`Room type not found`);
    // console.log(bookingData)
    // Parse dates
    const checkIn = parsePakistanDate(bookingData.from);
    const checkOut = parsePakistanDate(bookingData.to);

    // Validate dates
    if (checkIn >= checkOut) {
      throw new BadRequestException(
        'Check-out date must be after check-in date',
      );
    }

    const today = getPakistanDate();
    today.setHours(0, 0, 0, 0);

    const checkInDateOnly = new Date(checkIn);
    checkInDateOnly.setHours(0, 0, 0, 0);

    if (checkInDateOnly < today) {
      throw new BadRequestException('Check-in date cannot be in the past');
    }

    // Calculate number of nights and price
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );
    const pricePerNight =
      bookingData.pricingType === 'member'
        ? typeExists.priceMember
        : typeExists.priceGuest;
    const totalPrice =
      Number(pricePerNight) * nights * bookingData.numberOfRooms;

    // Get available rooms with a single complex query
    const availableRooms = await this.prismaService.room.findMany({
      where: {
        roomTypeId: roomType,
        isActive: true,
        holdings: {
          none: {
            holdBy: bookingData.membership_no.toString(),
            onHold: true,
            holdExpiry: { gt: new Date() },
          },
        },
        // No reservations during requested period
        reservations: {
          none: {
            reservedFrom: { lt: checkOut },
            reservedTo: { gt: checkIn },
          },
        },
        // No bookings during requested period
        bookings: {
          none: {
            checkIn: { lt: checkOut },
            checkOut: { gt: checkIn },
          },
        },
        // No out-of-order periods during requested period
        outOfOrders: {
          none: {
            AND: [
              { startDate: { lte: checkOut } },
              { endDate: { gte: checkIn } },
            ],
          },
        },
      },
      orderBy: {
        roomNumber: 'asc',
      },
    });

    // Check if enough rooms are available
    if (availableRooms.length < bookingData.numberOfRooms) {
      // Get total count of rooms of this type for better error message
      const totalRoomsOfType = await this.prismaService.room.count({
        where: { roomTypeId: roomType, isActive: true },
      });

      const unavailableCount = totalRoomsOfType - availableRooms.length;

      throw new ConflictException(
        `Only ${availableRooms.length} room(s) available. Requested: ${bookingData.numberOfRooms}. ` +
        `${unavailableCount} room(s) are either reserved, booked, on maintenance, or on active hold.`,
      );
    }

    // Select specific rooms for booking
    const selectedRooms = availableRooms.slice(0, bookingData.numberOfRooms);

    // Calculate expiry time (3 minutes from now)
    const holdExpiry = new Date(Date.now() + 3 * 60 * 1000);
    const invoiceDueDate = new Date(Date.now() + 3 * 60 * 1000);

    // Put rooms on hold
    try {
      const membershipNoString = String(bookingData.membership_no);

      const holdPromises = selectedRooms.map((room) =>
        this.prismaService.roomHoldings.create({
          data: {
            roomId: room.id,
            onHold: true,
            holdExpiry: holdExpiry,
            holdBy: membershipNoString,
          },
        }),
      );

      await Promise.all(holdPromises);
    } catch (holdError) {
      console.error('Failed to put rooms on hold:', holdError);
      throw new InternalServerErrorException(
        'Failed to reserve rooms temporarily',
      );
    }

    // Prepare booking data
    const bookingRecord = {
      roomTypeId: roomType,
      checkIn,
      checkOut,
      numberOfRooms: bookingData.numberOfRooms,
      numberOfAdults: bookingData.numberOfAdults,
      numberOfChildren: bookingData.numberOfChildren,
      pricingType: bookingData.pricingType,
      specialRequest: bookingData.specialRequest || '',
      totalPrice,
      selectedRoomIds: selectedRooms.map((room) => room.id),
      selectedRoomNumbers: selectedRooms.map((room) => room.roomNumber),
      guestName: bookingData.guestName,
      guestContact: bookingData.guestContact,
    };

    // Call payment gateway
    try {
      const invoiceResponse = await this.callPaymentGateway({
        type: 'room',
        amount: totalPrice,
        consumerInfo: {
          membership_no: String(bookingData.membership_no),
          roomType: typeExists.type,
          nights: nights,
          rooms: bookingData.numberOfRooms,
          selectedRooms: selectedRooms.map((room) => room.roomNumber),
          checkIn: formatPakistanDate(checkIn),
          checkOut: formatPakistanDate(checkOut),
        },
        bookingData: bookingRecord,
      });

      return {
        ResponseCode: '00',
        ResponseMessage: 'Invoice Created Successfully',
        Data: {
          ConsumerNumber: '7701234567',
          InvoiceNumber:
            'INV-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          DueDate: invoiceDueDate.toISOString(),
          Amount: totalPrice.toString(),
          Instructions:
            'Complete payment within 3 minutes to confirm your booking',
          PaymentChannels: [
            'JazzCash',
            'Easypaisa',
            'HBL',
            'Meezan',
            'UBL',
            'ATM',
            'Internet Banking',
          ],
          BookingSummary: {
            RoomType: typeExists.type,
            CheckIn: formatPakistanDate(checkIn),
            CheckOut: formatPakistanDate(checkOut),
            Nights: nights,
            Rooms: bookingData.numberOfRooms,
            SelectedRooms: selectedRooms.map((room) => room.roomNumber),
            Adults: bookingData.numberOfAdults,
            Children: bookingData.numberOfChildren,
            PricePerNight: pricePerNight.toString(),
            TotalAmount: totalPrice.toString(),
            HoldExpiresAt: holdExpiry.toISOString(),
          },
        },
        TemporaryData: {
          roomIds: selectedRooms.map((room) => room.id),
          holdExpiry: holdExpiry,
        },
      };
    } catch (paymentError) {
      // Clean up room holds if payment gateway fails
      try {
        await this.prismaService.roomHoldings.deleteMany({
          where: {
            roomId: { in: selectedRooms.map((room) => room.id) },
            holdExpiry: holdExpiry, // Match the exact hold we just created
          },
        });
      } catch (cleanupError) {
        console.error('Failed to clean up room holds:', cleanupError);
      }

      throw new InternalServerErrorException(
        'Failed to generate invoice with payment gateway',
      );
    }
  }

  async genInvoiceHall(hallId: number, bookingData: any) {
    console.log('Hall booking data received:', bookingData);

    // ── 1. VALIDATE HALL EXISTS ─────────────────────────────
    const hallExists = await this.prismaService.hall.findFirst({
      where: { id: hallId },
      include: {
        outOfOrders: true, // Include out-of-order periods
        holdings: {
          where: {
            holdBy: bookingData.membership_no,
            onHold: true,
            holdExpiry: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!hallExists) {
      throw new NotFoundException(`Hall not found`);
    }

    // ── 2. VALIDATE REQUIRED FIELDS ─────────────────────────
    if (!bookingData.bookingDate) {
      throw new BadRequestException('Booking date is required');
    }
    if (!bookingData.eventTime) {
      throw new BadRequestException('Event time slot is required');
    }
    if (!bookingData.eventType) {
      throw new BadRequestException('Event type is required');
    }

    // ── 3. PARSE AND VALIDATE BOOKING DATE ──────────────────
    const bookingDate = new Date(bookingData.bookingDate);
    bookingDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      throw new BadRequestException('Booking date cannot be in the past');
    }

    // ── 4. VALIDATE EVENT TIME SLOT ─────────────────────────
    const normalizedEventTime = bookingData.eventTime.toUpperCase() as
      | 'MORNING'
      | 'EVENING'
      | 'NIGHT';
    const validEventTimes = ['MORNING', 'EVENING', 'NIGHT'];

    if (!validEventTimes.includes(normalizedEventTime)) {
      throw new BadRequestException(
        'Invalid event time. Must be MORNING, EVENING, or NIGHT',
      );
    }

    // ── 5. CHECK IF HALL IS ON HOLD ─────────────────────────
    if (hallExists.holdings && hallExists.holdings.length > 0) {
      const activeHold = hallExists.holdings[0];
      // Check if the hold is by a different user
      if (activeHold.holdBy !== bookingData.membership_no?.toString()) {
        throw new ConflictException(
          `Hall '${hallExists.name}' is currently on hold by another user`,
        );
      }
    }

    // ── 6. CHECK OUT-OF-ORDER PERIODS ──────────────────────
    // Check for conflicts with out-of-order periods
    const conflictingOutOfOrder = hallExists.outOfOrders?.find((period) => {
      const periodStart = new Date(period.startDate);
      const periodEnd = new Date(period.endDate);
      periodStart.setHours(0, 0, 0, 0);
      periodEnd.setHours(0, 0, 0, 0);

      return bookingDate >= periodStart && bookingDate <= periodEnd;
    });

    if (conflictingOutOfOrder) {
      const startDate = new Date(conflictingOutOfOrder.startDate);
      const endDate = new Date(conflictingOutOfOrder.endDate);

      throw new ConflictException(
        `Hall '${hallExists.name}' is out of order from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}: ${conflictingOutOfOrder.reason}`,
      );
    }

    // Check if hall is currently out of order (active period)
    const now = new Date();
    const isCurrentlyOutOfOrder = hallExists.outOfOrders?.some((period) => {
      const periodStart = new Date(period.startDate);
      const periodEnd = new Date(period.endDate);
      return now >= periodStart && now <= periodEnd;
    });

    // If hall is currently out of order and not active
    if (isCurrentlyOutOfOrder && !hallExists.isActive) {
      throw new ConflictException(
        `Hall '${hallExists.name}' is currently out of order`,
      );
    }

    // ── 7. CHECK FOR EXISTING BOOKINGS ──────────────────────
    const existingBooking = await this.prismaService.hallBooking.findFirst({
      where: {
        hallId: hallExists.id,
        bookingDate: bookingDate,
        bookingTime: normalizedEventTime,
      },
    });

    if (existingBooking) {
      const timeSlotMap = {
        MORNING: 'Morning (8:00 AM - 2:00 PM)',
        EVENING: 'Evening (2:00 PM - 8:00 PM)',
        NIGHT: 'Night (8:00 PM - 12:00 AM)',
      };

      throw new ConflictException(
        `Hall '${hallExists.name}' is already booked for ${bookingDate.toLocaleDateString()} during ${timeSlotMap[normalizedEventTime]}`,
      );
    }

    // ── 8. CHECK FOR RESERVATIONS ───────────────────────────
    const conflictingReservation =
      await this.prismaService.hallReservation.findFirst({
        where: {
          hallId: hallExists.id,
          AND: [
            { reservedFrom: { lte: bookingDate } },
            { reservedTo: { gt: bookingDate } },
          ],
          timeSlot: normalizedEventTime,
        },
      });

    if (conflictingReservation) {
      throw new ConflictException(
        `Hall '${hallExists.name}' is reserved from ${conflictingReservation.reservedFrom.toLocaleDateString()} to ${conflictingReservation.reservedTo.toLocaleDateString()} (${normalizedEventTime} time slot)`,
      );
    }

    // ── 9. CALCULATE TOTAL PRICE ────────────────────────────
    const basePrice =
      bookingData.pricingType === 'member'
        ? hallExists.chargesMembers
        : hallExists.chargesGuests;
    const totalPrice = Number(basePrice);

    // ── 10. CALCULATE HOLD EXPIRY ───────────────────────────
    const holdExpiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes
    const invoiceDueDate = new Date(Date.now() + 3 * 60 * 1000);

    // ── 11. PUT HALL ON HOLD ────────────────────────────────
    try {
      await this.prismaService.hallHoldings.create({
        data: {
          hallId: hallExists.id,
          onHold: true,
          holdExpiry: holdExpiry,
          holdBy: String(bookingData.membership_no),
        },
      });

      console.log(`Put hall '${hallExists.name}' on hold until ${holdExpiry}`);
    } catch (holdError) {
      console.error('Failed to put hall on hold:', holdError);
      throw new InternalServerErrorException(
        'Failed to reserve hall temporarily',
      );
    }

    // ── 12. PREPARE BOOKING DATA ────────────────────────────
    const bookingRecord = {
      hallId: hallExists.id,
      bookingDate: bookingData.bookingDate,
      eventTime: normalizedEventTime,
      eventType: bookingData.eventType,
      numberOfGuests: bookingData.numberOfGuests || 0,
      pricingType: bookingData.pricingType,
      specialRequest: bookingData.specialRequest || '',
      guestName: bookingData.guestName,
      guestContact: bookingData.guestContact,
      totalPrice,
    };

    console.log('Booking record prepared:', bookingRecord);

    // ── 13. GENERATE INVOICE ────────────────────────────────
    try {
      const timeSlotMap = {
        MORNING: 'Morning (8:00 AM - 2:00 PM)',
        EVENING: 'Evening (2:00 PM - 8:00 PM)',
        NIGHT: 'Night (8:00 PM - 12:00 AM)',
      };

      const invoiceResponse = await this.callPaymentGateway({
        type: 'hall',
        amount: totalPrice,
        consumerInfo: {
          membership_no: bookingData.membership_no,
          hallName: hallExists.name,
          eventType: bookingData.eventType,
          bookingDate: bookingData.bookingDate,
        },
        bookingData: bookingRecord,
      });

      return {
        ResponseCode: '00',
        ResponseMessage: 'Invoice Created Successfully',
        Data: {
          ConsumerNumber: '7701234567',
          InvoiceNumber:
            'INV-HALL-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          DueDate: invoiceDueDate.toISOString(),
          Amount: totalPrice.toString(),
          Instructions:
            'Complete payment within 3 minutes to confirm your hall booking',
          PaymentChannels: [
            'JazzCash',
            'Easypaisa',
            'HBL',
            'Meezan',
            'UBL',
            'ATM',
            'Internet Banking',
          ],
          BookingSummary: {
            HallName: hallExists.name,
            Capacity: hallExists.capacity,
            BookingDate: bookingData.bookingDate,
            TimeSlot: timeSlotMap[normalizedEventTime],
            EventType: bookingData.eventType,
            NumberOfGuests: bookingData.numberOfGuests || 0,
            PricingType:
              bookingData.pricingType === 'member'
                ? 'Member Rate'
                : 'Guest Rate',
            BasePrice: basePrice.toString(),
            TotalAmount: totalPrice.toString(),
            HoldExpiresAt: holdExpiry.toISOString(),
          },
        },
        // Include temporary data for cleanup if payment fails
        TemporaryData: {
          hallId: hallExists.id,
          holdExpiry: holdExpiry,
        },
      };
    } catch (paymentError) {
      // ── 14. CLEANUP ON FAILURE ──────────────────────────────
      console.error('Payment gateway error:', paymentError);

      try {
        await this.prismaService.hallHoldings.deleteMany({
          where: {
            hallId: hallExists.id,
            holdExpiry: holdExpiry,
          },
        });

        console.log('Cleaned up hall hold after payment failure');
      } catch (cleanupError) {
        console.error('Failed to clean up hall hold:', cleanupError);
      }

      throw new InternalServerErrorException(
        'Failed to generate invoice with payment gateway',
      );
    }
  }

  async genInvoiceLawn(lawnId: number, bookingData: any) {
    console.log('Lawn booking data received:', bookingData);

    // ── 1. VALIDATE LAWN EXISTS ─────────────────────────────
    const lawnExists = await this.prismaService.lawn.findFirst({
      where: { id: lawnId },
      include: {
        lawnCategory: true,
        outOfOrders: {
          orderBy: { startDate: 'asc' },
        },
        holdings: {
          where: {
            holdBy: bookingData.membership_no,
            onHold: true,
            holdExpiry: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!lawnExists) {
      throw new NotFoundException(`Lawn not found`);
    }

    // ── 2. VALIDATE REQUIRED FIELDS ─────────────────────────
    if (!bookingData.bookingDate) {
      throw new BadRequestException('Booking date is required');
    }
    if (!bookingData.eventTime) {
      throw new BadRequestException('Event time slot is required');
    }
    if (!bookingData.numberOfGuests) {
      throw new BadRequestException('Number of guests is required');
    }

    // ── 3. PARSE AND VALIDATE BOOKING DATE ──────────────────
    const bookingDate = new Date(bookingData.bookingDate);
    bookingDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      throw new BadRequestException('Booking date cannot be in the past');
    }

    // ── 4. VALIDATE EVENT TIME SLOT ─────────────────────────
    const normalizedEventTime = bookingData.eventTime.toUpperCase() as
      | 'MORNING'
      | 'EVENING'
      | 'NIGHT';
    const validEventTimes = ['MORNING', 'EVENING', 'NIGHT'];

    if (!validEventTimes.includes(normalizedEventTime)) {
      throw new BadRequestException(
        'Invalid event time. Must be MORNING, EVENING, or NIGHT',
      );
    }

    // ── 5. CHECK IF LAWN IS ACTIVE ──────────────────────────
    if (!lawnExists.isActive) {
      throw new ConflictException(
        `Lawn '${lawnExists.description}' is not active for bookings`,
      );
    }

    // ── 6. CHECK IF LAWN IS ON HOLD ─────────────────────────
    if (lawnExists.holdings && lawnExists.holdings.length > 0) {
      const activeHold = lawnExists.holdings[0];
      // Check if the hold is by a different user
      if (activeHold.holdBy !== bookingData.membership_no?.toString()) {
        throw new ConflictException(
          `Lawn '${lawnExists.description}' is currently on hold by another user`,
        );
      }
    }

    // ── 7. CHECK MULTIPLE OUT OF SERVICE PERIODS ─────────────────────
    // First, check if lawn is currently out of service (based on current periods)
    const isCurrentlyOutOfOrder = this.isCurrentlyOutOfOrder(
      lawnExists.outOfOrders,
    );

    if (isCurrentlyOutOfOrder) {
      // Find the current out-of-order period
      const currentPeriod = this.getCurrentOutOfOrderPeriod(
        lawnExists.outOfOrders,
      );
      if (currentPeriod) {
        throw new ConflictException(
          `Lawn '${lawnExists.description}' is currently out of service from ${currentPeriod.startDate.toLocaleDateString()} to ${currentPeriod.endDate.toLocaleDateString()}${currentPeriod.reason ? `: ${currentPeriod.reason}` : ''}`,
        );
      }
    }

    // ── 8. CHECK IF BOOKING DATE FALLS WITHIN ANY OUT-OF-ORDER PERIOD ──
    if (lawnExists.outOfOrders && lawnExists.outOfOrders.length > 0) {
      const conflictingPeriod = lawnExists.outOfOrders.find((period) => {
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setHours(0, 0, 0, 0);

        return bookingDate >= periodStart && bookingDate <= periodEnd;
      });

      if (conflictingPeriod) {
        const startDate = new Date(conflictingPeriod.startDate);
        const endDate = new Date(conflictingPeriod.endDate);

        const isScheduled = startDate > today;

        if (isScheduled) {
          throw new ConflictException(
            `Lawn '${lawnExists.description}' has scheduled maintenance from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}${conflictingPeriod.reason ? `: ${conflictingPeriod.reason}` : ''}`,
          );
        } else {
          throw new ConflictException(
            `Lawn '${lawnExists.description}' is out of service from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}${conflictingPeriod.reason ? `: ${conflictingPeriod.reason}` : ''}`,
          );
        }
      }
    }

    // ── 9. CHECK GUEST COUNT AGAINST CAPACITY ───────────────
    if (bookingData.numberOfGuests < (lawnExists.minGuests || 0)) {
      throw new ConflictException(
        `Number of guests (${bookingData.numberOfGuests}) is below the minimum requirement of ${lawnExists.minGuests} for this lawn`,
      );
    }

    if (bookingData.numberOfGuests > lawnExists.maxGuests) {
      throw new ConflictException(
        `Number of guests (${bookingData.numberOfGuests}) exceeds the maximum capacity of ${lawnExists.maxGuests} for this lawn`,
      );
    }

    // ── 10. CHECK FOR EXISTING BOOKINGS ──────────────────────
    const existingBooking = await this.prismaService.lawnBooking.findFirst({
      where: {
        lawnId: lawnExists.id,
        bookingDate: bookingDate,
        bookingTime: normalizedEventTime,
      },
    });

    if (existingBooking) {
      const timeSlotMap = {
        MORNING: 'Morning (8:00 AM - 2:00 PM)',
        EVENING: 'Evening (2:00 PM - 8:00 PM)',
        NIGHT: 'Night (8:00 PM - 12:00 AM)',
      };

      throw new ConflictException(
        `Lawn '${lawnExists.description}' is already booked for ${bookingDate.toLocaleDateString()} during ${timeSlotMap[normalizedEventTime]}`,
      );
    }

    // ── 11. CALCULATE TOTAL PRICE ───────────────────────────
    const basePrice =
      bookingData.pricingType === 'member'
        ? lawnExists.memberCharges
        : lawnExists.guestCharges;
    const totalPrice = Number(basePrice);

    // ── 12. CALCULATE HOLD EXPIRY ───────────────────────────
    const holdExpiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes
    const invoiceDueDate = new Date(Date.now() + 3 * 60 * 1000);

    // ── 13. PUT LAWN ON HOLD ────────────────────────────────
    try {
      await this.prismaService.lawnHoldings.create({
        data: {
          lawnId: lawnExists.id,
          onHold: true,
          holdExpiry: holdExpiry,
          holdBy: String(bookingData.membership_no),
        },
      });

      console.log(
        `Put lawn '${lawnExists.description}' on hold until ${holdExpiry}`,
      );
    } catch (holdError) {
      console.error('Failed to put lawn on hold:', holdError);
      throw new InternalServerErrorException(
        'Failed to reserve lawn temporarily',
      );
    }

    // ── 14. PREPARE BOOKING DATA ────────────────────────────
    const bookingRecord = {
      lawnId: lawnExists.id,
      bookingDate: bookingData.bookingDate,
      eventTime: normalizedEventTime,
      numberOfGuests: bookingData.numberOfGuests,
      pricingType: bookingData.pricingType,
      eventType: bookingData.eventType || '',
      specialRequest: bookingData.specialRequest || '',
      totalPrice,
      guestName: bookingData.guestName,
      guestContact: bookingData.guestContact,
    };

    // console.log('Lawn booking record prepared:', bookingRecord);

    // ── 15. GENERATE INVOICE ────────────────────────────────
    try {
      const timeSlotMap = {
        MORNING: 'Morning (8:00 AM - 2:00 PM)',
        EVENING: 'Evening (2:00 PM - 8:00 PM)',
        NIGHT: 'Night (8:00 PM - 12:00 AM)',
      };
      const invoiceResponse = await this.callPaymentGateway({
        type: 'lawn',
        amount: totalPrice,
        consumerInfo: {
          membership_no: bookingData.membership_no,
          lawnName: lawnExists.description,
          category: lawnExists.lawnCategory?.category || 'Standard',
          bookingDate: bookingData.bookingDate,
        },
        bookingData: bookingRecord,
      });

      return {
        ResponseCode: '00',
        ResponseMessage: 'Lawn Booking Invoice Created Successfully',
        Data: {
          ConsumerNumber: '7701234567',
          InvoiceNumber:
            'INV-LAWN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          DueDate: invoiceDueDate.toISOString(),
          Amount: totalPrice.toString(),
          Instructions:
            'Complete payment within 3 minutes to confirm your lawn booking',
          PaymentChannels: [
            'JazzCash',
            'Easypaisa',
            'HBL',
            'Meezan',
            'UBL',
            'ATM',
            'Internet Banking',
          ],
          BookingSummary: {
            LawnName: lawnExists.description,
            Category: lawnExists.lawnCategory?.category,
            Capacity: `${lawnExists.minGuests || 0} - ${lawnExists.maxGuests} guests`,
            BookingDate: bookingData.bookingDate,
            TimeSlot: timeSlotMap[normalizedEventTime],
            NumberOfGuests: bookingData.numberOfGuests,
            PricingType:
              bookingData.pricingType === 'member'
                ? 'Member Rate'
                : 'Guest Rate',
            BasePrice: basePrice.toString(),
            TotalAmount: totalPrice.toString(),
            HoldExpiresAt: holdExpiry.toISOString(),
            MaintenancePeriods:
              lawnExists.outOfOrders.length > 0
                ? lawnExists.outOfOrders.map((period) => ({
                  dates: `${new Date(period.startDate).toLocaleDateString()} - ${new Date(period.endDate).toLocaleDateString()}`,
                  reason: period.reason,
                }))
                : [],
          },
        },
        // Include temporary data for cleanup if payment fails
        TemporaryData: {
          lawnId: lawnExists.id,
          holdExpiry: holdExpiry,
        },
      };
    } catch (paymentError) {
      // ── 16. CLEANUP ON FAILURE ──────────────────────────────
      console.error('Payment gateway error:', paymentError);

      try {
        await this.prismaService.lawnHoldings.deleteMany({
          where: {
            lawnId: lawnExists.id,
            holdExpiry: holdExpiry,
          },
        });
        console.log('Cleaned up lawn hold after payment failure');
      } catch (cleanupError) {
        console.error('Failed to clean up lawn hold:', cleanupError);
      }

      throw new InternalServerErrorException(
        'Failed to generate invoice with payment gateway',
      );
    }
  }

  // Helper methods
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

  async genInvoicePhotoshoot(photoshootId: number, bookingData: any) {
    // console.log('Photoshoot booking data received:', bookingData);

    // ── 1. VALIDATE PHOTOSHOOT EXISTS ───────────────────────
    const photoshootExists = await this.prismaService.photoshoot.findFirst({
      where: { id: photoshootId },
    });

    if (!photoshootExists) {
      throw new NotFoundException(`Photoshoot service not found`);
    }

    // ── 2. VALIDATE REQUIRED FIELDS ─────────────────────────
    if (!bookingData.bookingDate) {
      throw new BadRequestException('Booking date is required');
    }
    if (!bookingData.timeSlot) {
      throw new BadRequestException('Time slot is required');
    }
    if (!bookingData.membership_no) {
      throw new BadRequestException('Membership number is required');
    }

    // ── 3. VALIDATE MEMBER EXISTS ───────────────────────────
    const member = await this.prismaService.member.findUnique({
      where: { Membership_No: bookingData.membership_no.toString() },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // ── 4. PARSE AND VALIDATE BOOKING DATE & TIME ───────────
    const bookingDate = new Date(bookingData.bookingDate);
    bookingDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      throw new BadRequestException('Booking date cannot be in the past');
    }

    const startTime = parsePakistanDate(bookingData.timeSlot);
    const now = getPakistanDate();

    if (startTime < now) {
      throw new BadRequestException('Booking time cannot be in the past');
    }

    // Validate time slot is between 9am and 6pm (since booking is 2 hours, last slot ends at 8pm)
    const bookingHour = startTime.getHours();
    if (bookingHour < 9 || bookingHour >= 18) {
      throw new BadRequestException(
        'Photoshoot bookings are only available between 9:00 AM and 6:00 PM',
      );
    }

    // ── 5. CALCULATE END TIME ───────────────────────────────
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    // REMOVED: Existing booking check to allow same date/time

    // ── 6. CALCULATE TOTAL PRICE ────────────────────────────
    const basePrice =
      bookingData.pricingType === 'member'
        ? photoshootExists.memberCharges
        : photoshootExists.guestCharges;
    const totalPrice = Number(basePrice);

    // ── 7. PREPARE BOOKING DATA ─────────────────────────────
    const bookingRecord = {
      photoshootId: photoshootExists.id,
      bookingDate: bookingDate,
      startTime: startTime,
      endTime: endTime,
      pricingType: bookingData.pricingType,
      specialRequest: bookingData.specialRequest || '',
      totalPrice,
      memberId: member.Sno,
      membershipNo: bookingData.membership_no,
      paidBy: bookingData.paidBy,
      guestName: bookingData.guestName,
      guestContact: bookingData.guestContact,
    };

    // console.log('Photoshoot booking record prepared:', bookingRecord);

    // ── 8. GENERATE INVOICE VIA PAYMENT GATEWAY ─────────────
    try {
      const invoiceDueDate = new Date(Date.now() + 3 * 60 * 1000);

      const invoiceResponse = await this.callPaymentGateway({
        type: 'photoshoot',
        amount: totalPrice,
        consumerInfo: {
          membership_no: bookingData.membership_no,
          member_name: member.Name,
          serviceName: photoshootExists.description,
          serviceType: 'Photoshoot Session',
          bookingDate: bookingDate.toISOString(),
          bookingTime: startTime.toISOString(),
        },
        bookingData: bookingRecord,
      });

      return {
        ResponseCode: '00',
        ResponseMessage: 'Photoshoot Booking Invoice Created Successfully',
        Data: {
          ConsumerNumber: '7701234567',
          InvoiceNumber:
            'INV-PHOTO-' +
            Math.random().toString(36).substr(2, 9).toUpperCase(),
          DueDate: invoiceDueDate.toISOString(),
          Amount: totalPrice.toString(),
          Instructions:
            'Complete payment within 3 minutes to confirm your photoshoot booking',
          PaymentChannels: [
            'JazzCash',
            'Easypaisa',
            'HBL',
            'Meezan',
            'UBL',
            'ATM',
            'Internet Banking',
          ],
          BookingSummary: {
            ServiceName: photoshootExists.description,
            BookingDate: bookingDate.toLocaleDateString(),
            Time: startTime.toLocaleTimeString(),
            Duration: '2 hours',
            PricingType:
              bookingData.pricingType === 'member'
                ? 'Member Rate'
                : 'Guest Rate',
            BasePrice: basePrice.toString(),
            TotalAmount: totalPrice.toString(),
          },
        },
      };
    } catch (paymentError) {
      console.error('Payment gateway error:', paymentError);
      throw new InternalServerErrorException(
        'Failed to generate invoice with payment gateway',
      );
    }
  }

  /////////////////////////////////////////////////////////////////////

  async getMemberVouchers(membershipNo: string) {
    return await this.prismaService.paymentVoucher.findMany({
      where: { membership_no: membershipNo },
      include: {
        member: true,
      },
      orderBy: { issued_at: 'desc' },
    });
  }



  // check idempotency
  async checkIdempo(idempotencyKey: string) {
    console.log(idempotencyKey)
  }
}
