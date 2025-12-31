import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAccGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from 'src/common/constants/roles.enum';
import { BookingDto } from './dtos/booking.dto';
import { PaymentMode } from '@prisma/client';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Get('lock')
  async lockBookings() {
    return await this.bookingService.lock();
  }

  @Get('voucher')
  async getVouchers(
    @Query('bookingType') bookingType: string,
    @Query('bookingId') bookingId: string,
  ) {
    return await this.bookingService.getVouchersByBooking(
      bookingType,
      Number(bookingId),
    );
  }

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  @Patch('voucher/update-status')
  async updateVoucherStatus(
    @Body() payload: { voucherId: number; status: string },
  ) {
    return await this.bookingService.updateVoucherStatus(
      payload.voucherId,
      payload.status as 'PENDING' | 'CONFIRMED' | 'CANCELLED',
    );
  }

  // booking //

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  @Post('create/booking')
  async createBooking(@Body() payload: BookingDto) {
    // console.log(payload)
    if (payload.category === 'Room')
      return await this.bookingService.cBookingRoom({
        ...payload,
        paymentMode: PaymentMode.CASH,
      });
    else if (payload.category === 'Hall')
      return await this.bookingService.cBookingHall({
        ...payload,
        paymentMode: PaymentMode.CASH,
      });
    else if (payload.category === 'Lawn')
      return await this.bookingService.cBookingLawn({
        ...payload,
        paymentMode: PaymentMode.CASH,
      });
    else if (payload.category === 'Photoshoot')
      return await this.bookingService.cBookingPhotoshoot({
        ...payload,
        paymentMode: PaymentMode.CASH,
      });
  }

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  @Patch('update/booking')
  async updateBooking(@Body() payload: Partial<BookingDto>) {
    if (payload.category === 'Room')
      return await this.bookingService.uBookingRoom({
        ...payload,
        paymentMode: PaymentMode.CASH,
      });
    else if (payload.category === 'Hall')
      return await this.bookingService.uBookingHall({
        ...payload,
        paymentMode: PaymentMode.CASH,
      });
    else if (payload.category === 'Lawn')
      return await this.bookingService.uBookingLawn({
        ...payload,
        paymentMode: PaymentMode.CASH,
      });
    else if (payload.category === 'Photoshoot')
      return await this.bookingService.uBookingPhotoshoot({
        ...payload,
        paymentMode: PaymentMode.CASH,
      });
  }

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  @Get('get/bookings/all')
  async getBookings(@Query('bookingsFor') bookingFor: string) {
    if (bookingFor === 'rooms') return this.bookingService.gBookingsRoom();
    if (bookingFor === 'halls') return this.bookingService.gBookingsHall();
    if (bookingFor === 'lawns') return this.bookingService.gBookingsLawn();
    if (bookingFor === 'photoshoots')
      return this.bookingService.gBookingPhotoshoot();
  }

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Delete('delete/booking')
  async deleteBooking(
    @Query('bookingFor') bookingFor: string,
    @Query() bookID: { bookID: string },
  ) {
    if (bookingFor === 'rooms')
      return this.bookingService.dBookingRoom(Number(bookID.bookID));
    if (bookingFor === 'halls')
      return this.bookingService.dBookingHall(Number(bookID.bookID));
    if (bookingFor === 'lawns')
      return this.bookingService.dBookingLawn(Number(bookID.bookID));
    if (bookingFor === 'photoshoots')
      return this.bookingService.dBookingPhotoshoot(Number(bookID.bookID));
  }

  @Get('member/bookings')
  async getMemberBookings(@Query('membershipNo') membershipNo: string) {
    return await this.bookingService.getMemberBookings(membershipNo);
  }

  ////////////////////////////////////////////////////////////////////////////
  // member bookings
  @Post('member/booking/room')
  async memberBookingRoom(@Body() payload: any) {
    const { membership_no } = payload.consumerInfo;
    const {
      checkIn,
      checkOut,
      numberOfRooms,
      numberOfAdults,
      numberOfChildren,
      pricingType,
      specialRequest,
      totalPrice,
      selectedRoomIds,
      roomTypeId,
      paidBy = 'MEMBER',
      guestName,
      guestContact,
    } = payload.bookingData;
    console.log(payload);

    if (!membership_no) {
      throw new NotFoundException('Membership number must be provided');
    }

    // Validate required fields
    if (!roomTypeId || !selectedRoomIds || !selectedRoomIds.length) {
      throw new BadRequestException(
        'Room type and selected rooms are required',
      );
    }

    const data = {
      membershipNo: membership_no,
      entityId: roomTypeId, // This should be roomTypeId for member booking
      category: 'Room',
      checkIn: checkIn,
      checkOut: checkOut,
      numberOfRooms: numberOfRooms,
      numberOfAdults: numberOfAdults,
      numberOfChildren: numberOfChildren,
      pricingType: pricingType,
      specialRequests: specialRequest || '',
      totalPrice: totalPrice,
      selectedRoomIds: selectedRoomIds,
      paymentStatus: 'PAID',
      paidAmount: totalPrice,
      pendingAmount: 0,
      paymentMode: 'ONLINE',
      paidBy,
      guestName,
      guestContact,
    };

    return await this.bookingService.cBookingRoomMember(data);
  }

  @Post('member/booking/hall')
  async memberBookingHall(@Body() payload: any) {
    const { membership_no } = payload.consumerInfo;
    const {
      hallId,
      bookingDate,
      eventTime,
      eventType,
      pricingType,
      specialRequest,
      totalPrice,

      paidBy = 'MEMBER',
      guestName,
      guestContact,
    } = payload.bookingData;

    if (!membership_no) {
      throw new NotFoundException('Membership number must be provided');
    }

    // Validate required fields
    if (!hallId) {
      throw new BadRequestException('Hall ID is required');
    }
    if (!bookingDate) {
      throw new BadRequestException('Booking date is required');
    }
    if (!eventTime) {
      throw new BadRequestException('Event time slot is required');
    }
    if (!eventType) {
      throw new BadRequestException('Event type is required');
    }

    const data = {
      membershipNo: membership_no,
      entityId: hallId,
      bookingDate: bookingDate,
      eventTime: eventTime, // MORNING, EVENING, or NIGHT
      eventType: eventType,
      pricingType: pricingType,
      specialRequests: specialRequest || '',
      totalPrice: totalPrice,
      paymentStatus: 'PAID',
      paidAmount: totalPrice,
      pendingAmount: 0,
      paymentMode: 'ONLINE',

      paidBy,
      guestName,
      guestContact,
    };
    console.log('data:', data);

    return await this.bookingService.cBookingHallMember(data);
  }

  @Post('member/booking/lawn')
  async memberBookingLawn(@Body() payload: any) {
    console.log("test:", payload)
    const { membership_no } = payload.consumerInfo;
    const {
      lawnId,
      bookingDate,
      eventTime,
      eventType,
      pricingType,
      numberOfGuests,
      specialRequest,
      totalPrice,

      paidBy = 'MEMBER',
      guestName,
      guestContact,
    } = payload.bookingData;

    if (!membership_no) {
      throw new NotFoundException('Membership number must be provided');
    }

    // Validate required fields
    if (!lawnId) {
      throw new BadRequestException('Lawn ID is required');
    }
    if (!bookingDate) {
      throw new BadRequestException('Booking date is required');
    }
    if (!eventTime) {
      throw new BadRequestException('Event time slot is required');
    }
    if (!eventType) {
      throw new BadRequestException('Event type is required');
    }

    const data = {
      membershipNo: membership_no,
      entityId: lawnId,
      bookingDate: bookingDate,
      eventTime: eventTime, // MORNING, EVENING, or NIGHT
      eventType: eventType,
      pricingType: pricingType,
      specialRequests: specialRequest || '',
      totalPrice: totalPrice,
      paymentStatus: 'PAID',
      paidAmount: totalPrice,
      pendingAmount: 0,
      paymentMode: 'ONLINE',
      numberOfGuests,
      paidBy,
      guestName,
      guestContact,
    };

    return await this.bookingService.cBookingLawnMember(data);
  }

  @Post('member/booking/photoshoot')
  async memberBookingPhotoshoot(@Body() payload: any) {
    const { membership_no } = payload.consumerInfo;
    const {
      photoshootId,
      bookingDate,
      startTime,
      pricingType,
      specialRequest,
      totalPrice,

      paidBy = 'MEMBER',
      guestName,
      guestContact,
    } = payload.bookingData;
    // console.log(payload)

    if (!membership_no) {
      throw new NotFoundException('Membership number must be provided');
    }

    // Validate required fields
    if (!photoshootId) {
      throw new BadRequestException('Photoshoot ID is required');
    }
    if (!bookingDate) {
      throw new BadRequestException('Booking date is required');
    }
    if (!startTime) {
      throw new BadRequestException('Event start time slot is required');
    }

    const data = {
      membershipNo: membership_no,
      entityId: photoshootId,
      bookingDate: bookingDate,
      timeSlot: startTime,
      pricingType: pricingType,
      specialRequests: specialRequest || '',
      totalPrice: totalPrice,
      paymentStatus: 'PAID',
      paidAmount: totalPrice,
      pendingAmount: 0,
      paymentMode: 'ONLINE',

      paidBy,
      guestName,
      guestContact,
    };
    console.log('data:', data);

    const done = await this.bookingService.cBookingPhotoshootMember(data);
    // console.log(done)
    return done;
  }

  @UseGuards(JwtAccGuard)
  @Get('member/bookings/all')
  async memberBookings(
    @Req() req: { user: { id: string } },
    @Query('type') type: 'Room' | 'Hall' | 'Lawn' | 'Photoshoot',
    @Query('membership_no') membership_no?: string
  ) {

    const memberId = membership_no ? membership_no : req.user?.id;
    return await this.bookingService.memberBookings(memberId, type)

  }
}
