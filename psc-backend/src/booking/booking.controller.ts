import {
    Body,
    Controller,
    Delete,
    Get,
    Patch,
    Post,
    Query,
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


}
