import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BookingModule } from 'src/booking/booking.module';

@Module({
  imports:[PrismaModule, BookingModule],
  controllers: [PaymentController],
  providers: [PaymentService]
})
export class PaymentModule {}
