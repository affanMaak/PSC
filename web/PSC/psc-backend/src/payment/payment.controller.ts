import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAccGuard } from 'src/common/guards/jwt-access.guard';
import { PaymentService } from './payment.service';
import { BookingService } from 'src/booking/booking.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private payment: PaymentService,
    private bookingService: BookingService,
  ) {}

  // generate invoice:

  @UseGuards(JwtAccGuard)
  @Post('generate/invoice/room')
  async generateInvoiceRoom(
    @Query('roomType') roomType: string,
    @Body() bookingData: any,
    @Req() req: { user: { id: string } },
  ) {
    // Prefer membership number coming from the frontend payload; fall back to JWT user id
    const membership_no = bookingData.membership_no ?? req.user?.id;
    return await this.payment.genInvoiceRoom(Number(roomType), {
      ...bookingData,
      membership_no,
    });
  }

  @UseGuards(JwtAccGuard)
  @Post('generate/invoice/hall')
  async generateInvoiceHall(
    @Query('hallId') hallId: string,
    @Body() bookingData: any,
    @Req() req: { user: { id: string } },
  ) {
    // Prefer membership number coming from the frontend payload; fall back to JWT user id
    const membership_no = bookingData.membership_no ?? req.user?.id;
    return await this.payment.genInvoiceHall(Number(hallId), {
      ...bookingData,
      membership_no,
    });
  }

  @UseGuards(JwtAccGuard)
  @Post('generate/invoice/lawn')
  async generateInvoiceLawn(
    @Query('lawnId') lawnId: string,
    @Body() bookingData: any,
    @Req() req: { user: { id: string } },
  ) {
    // Prefer membership number coming from the frontend payload; fall back to JWT user id
    const membership_no = bookingData.membership_no ?? req.user?.id;
    return await this.payment.genInvoiceLawn(Number(lawnId), {
      ...bookingData,
      membership_no,
    });
  }
  @UseGuards(JwtAccGuard)
  @Post('generate/invoice/photoshoot')
  async generateInvoicePhotoshoot(
    @Query('photoshootId') photoshootId: string,
    @Body() bookingData: any,
    @Req() req: { user: { id: string } },
  ) {
    // Prefer membership number coming from the frontend payload; fall back to JWT user id
    const membership_no = bookingData.membership_no ?? req.user?.id;
    return await this.payment.genInvoicePhotoshoot(Number(photoshootId), {
      ...bookingData,
      membership_no,
    });
  }


  ///////////////////////////////////////////////////////////////////////////////

  @Get('member/vouchers')
  async getMemberVouchers(@Query('membershipNo') membershipNo: string) {
    return await this.payment.getMemberVouchers(membershipNo);
  }

  @Get('voucher/booking')
  async getVouchersByBooking(
    @Query('bookingType') bookingType: string,
    @Query('bookingId') bookingId: string,
  ) {
    return await this.bookingService.getVouchersByBooking(
      bookingType,
      Number(bookingId),
    );
  }
}
