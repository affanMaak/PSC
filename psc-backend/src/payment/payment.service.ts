import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentService {

    constructor(private prismaService: PrismaService){}

    
  // kuick pay
  // Mock payment gateway call - replace with actual integration
  private async callPaymentGateway(paymentData: any) {
    // Simulate API call to payment gateway
    console.log('Calling payment gateway with:', paymentData);

    // This would be your actual payment gateway integration
    // For example:
    // const response = await axios.post('https://payment-gateway.com/invoice', paymentData);
    // return response.data;

    // Mock successful response
    return {
      success: true,
      transactionId:
        'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    };
  }

  // generateInvoice
  async genInvoiceRoom(roomType: number, bookingData: any) {
    console.log('Booking data received:', bookingData);

    // Validate room type exists
    const typeExists = await this.prismaService.roomType.findFirst({
      where: { id: roomType },
    });
    if (!typeExists) throw new NotFoundException(`Room type not found`);

    // Parse dates
    const checkIn = new Date(bookingData.from);
    const checkOut = new Date(bookingData.to);

    // Validate dates
    if (checkIn >= checkOut) {
      throw new BadRequestException(
        'Check-out date must be after check-in date',
      );
    }

    if (checkIn < new Date()) {
      throw new BadRequestException('Check-in date cannot be in the past');
    }

    // Calculate number of nights
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Calculate total price
    const pricePerNight =
      bookingData.pricingType === 'member'
        ? typeExists.priceMember
        : typeExists.priceGuest;
    const totalPrice = Number(pricePerNight) * nights * bookingData.numberOfRooms;

    // Check for available rooms
    const availableRooms = await this.prismaService.room.findMany({
      where: {
        roomTypeId: roomType,
        isActive: true,
        isOutOfOrder: false,
        isBooked: false,
        OR: [
          // Rooms with no reservations or on hold (expired holds are considered available)
          {
            onHold: false,
          },
          // Rooms with expired holds
          {
            onHold: true,
            holdExpiry: { lt: new Date() },
          },
          // Rooms with reservations that don't conflict with selected dates
          {
            reservations: {
              none: {
                OR: [
                  // Reservation starts during booking period
                  {
                    reservedFrom: {
                      gte: checkIn,
                      lt: checkOut,
                    },
                  },
                  // Reservation ends during booking period
                  {
                    reservedTo: {
                      gt: checkIn,
                      lte: checkOut,
                    },
                  },
                  // Reservation spans the entire booking period
                  {
                    reservedFrom: { lte: checkIn },
                    reservedTo: { gte: checkOut },
                  },
                ],
              },
            },
          },
        ],
      },
      include: {
        reservations: {
          where: {
            OR: [
              { reservedTo: { gte: new Date() } }, // Current and future reservations
            ],
          },
        },
      },
    });

    // Filter out rooms that are currently reserved or on hold (not expired)
    const trulyAvailableRooms = availableRooms.filter(
      (room) =>
        !room.isReserved &&
        !room.isBooked &&
        (!room.onHold || room.holdExpiry! < new Date()),
    );

    console.log(
      `Found ${trulyAvailableRooms.length} available rooms out of ${availableRooms.length} total rooms of this type`,
    );

    // Check if enough rooms are available
    if (trulyAvailableRooms.length < bookingData.numberOfRooms) {
      throw new ConflictException(
        `Only ${trulyAvailableRooms.length} room(s) available. Requested: ${bookingData.numberOfRooms}`,
      );
    }

    // Check for overlapping bookings
    const overlappingBookings = await this.prismaService.roomBooking.findMany({
      where: {
        room: {
          roomTypeId: roomType,
        },
        OR: [
          // Booking starts during selected period
          {
            checkIn: {
              gte: checkIn,
              lt: checkOut,
            },
          },
          // Booking ends during selected period
          {
            checkOut: {
              gt: checkIn,
              lte: checkOut,
            },
          },
          // Booking spans the entire selected period
          {
            checkIn: { lte: checkIn },
            checkOut: { gte: checkOut },
          },
        ],
      },
    });

    if (overlappingBookings.length > 0) {
      throw new ConflictException(
        `There are ${overlappingBookings.length} overlapping booking(s) for the selected dates`,
      );
    }

    // Check for out-of-order rooms during the selected period
    const outOfOrderRooms = await this.prismaService.room.findMany({
      where: {
        roomTypeId: roomType,
        isOutOfOrder: true,
        OR: [
          {
            outOfOrderFrom: { lte: checkOut },
            outOfOrderTo: { gte: checkIn },
          },
        ],
      },
    });

    if (outOfOrderRooms.length > 0) {
      console.log(
        `Warning: ${outOfOrderRooms.length} room(s) are out of order during selected period`,
      );
    }

    // Select specific rooms for booking (first X available rooms)
    const selectedRooms = trulyAvailableRooms.slice(
      0,
      bookingData.numberOfRooms,
    );

    // Calculate expiry time (3 minutes from now)
    const holdExpiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes in milliseconds
    const invoiceDueDate = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes in milliseconds

    // Put rooms on hold with 3-minute expiry
    try {
      const holdPromises = selectedRooms.map((room) =>
        this.prismaService.room.update({
          where: { id: room.id },
          data: {
            onHold: true,
            holdExpiry: holdExpiry,
          },
        }),
      );

      await Promise.all(holdPromises);
      console.log(
        `Put ${selectedRooms.length} rooms on hold until ${holdExpiry}`,
      );
    } catch (holdError) {
      console.error('Failed to put rooms on hold:', holdError);
      throw new InternalServerErrorException(
        'Failed to reserve rooms temporarily',
      );
    }

    // Create temporary reservations to hold the rooms
    try {
      const reservationPromises = selectedRooms.map((room) =>
        this.prismaService.roomReservation.create({
          data: {
            roomId: room.id,
            reservedFrom: checkIn,
            reservedTo: checkOut,
          },
        }),
      );

      await Promise.all(reservationPromises);
      console.log(
        `Created temporary reservations for ${selectedRooms.length} rooms`,
      );
    } catch (reservationError) {
      // Clean up room holds if reservation fails
      try {
        const cleanupPromises = selectedRooms.map((room) =>
          this.prismaService.room.update({
            where: { id: room.id },
            data: {
              onHold: false,
              holdExpiry: null,
            },
          }),
        );
        await Promise.all(cleanupPromises);
        console.log('Cleaned up room holds after reservation failure');
      } catch (cleanupError) {
        console.error('Failed to clean up room holds:', cleanupError);
      }

      console.error(
        'Failed to create temporary reservations:',
        reservationError,
      );
      throw new InternalServerErrorException(
        'Failed to reserve rooms temporarily',
      );
    }

    // Prepare booking data for database (to be created after successful payment)
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
    };

    console.log('Booking record prepared:', bookingRecord);

    // Call payment gateway to generate invoice
    try {
      const invoiceResponse = await this.callPaymentGateway({
        amount: totalPrice,
        consumerInfo: {
          roomType: typeExists.type,
          nights: nights,
          rooms: bookingData.numberOfRooms,
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
            CheckIn: bookingData.from,
            CheckOut: bookingData.to,
            Nights: nights,
            Rooms: bookingData.numberOfRooms,
            Adults: bookingData.numberOfAdults,
            Children: bookingData.numberOfChildren,
            PricePerNight: pricePerNight.toString(),
            TotalAmount: totalPrice.toString(),
            HoldExpiresAt: holdExpiry.toISOString(),
          },
        },
        // Include temporary data for cleanup if payment fails
        TemporaryData: {
          reservationIds: selectedRooms.map((room) => room.id),
          holdExpiry: holdExpiry,
          roomIds: selectedRooms.map((room) => room.id),
        },
      };
    } catch (paymentError) {
      // Clean up temporary reservations and room holds if payment gateway fails
      try {
        // Remove reservations
        await this.prismaService.roomReservation.deleteMany({
          where: {
            roomId: { in: selectedRooms.map((room) => room.id) },
            reservedFrom: checkIn,
            reservedTo: checkOut,
          },
        });

        // Remove room holds
        await this.prismaService.room.updateMany({
          where: {
            id: { in: selectedRooms.map((room) => room.id) },
          },
          data: {
            onHold: false,
            holdExpiry: null,
          },
        });

        console.log(
          'Cleaned up temporary reservations and room holds after payment failure',
        );
      } catch (cleanupError) {
        console.error('Failed to clean up temporary data:', cleanupError);
      }

      throw new InternalServerErrorException(
        'Failed to generate invoice with payment gateway',
      );
    }
  }


}
