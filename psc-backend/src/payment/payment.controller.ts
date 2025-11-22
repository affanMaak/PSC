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
        return await this.payment.genInvoiceRoom(Number(roomType), {...bookingData, membership_no: Number(req.user?.id)});
    }

}
