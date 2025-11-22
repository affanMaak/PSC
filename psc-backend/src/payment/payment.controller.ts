import { Body, Controller, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAccGuard } from 'src/common/guards/jwt-access.guard';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {

    constructor(private payment: PaymentService){}


    // generate invoice:
    
    @UseGuards(JwtAccGuard)
    @Post('generate/invoice/room')
    async generateInvoice(
        @Query('roomType') roomType: string,
        @Body() bookingData: any,
        @Req() req: {user: {id: string}}
    ) {
        // Prefer membership number coming from the frontend payload; fall back to JWT user id
        const membership_no = bookingData.membership_no ?? req.user?.id;
        return await this.payment.genInvoiceRoom(Number(roomType), { ...bookingData, membership_no });
    }

}
