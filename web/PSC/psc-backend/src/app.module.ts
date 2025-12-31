import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config"
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { MemberModule } from './member/member.module';
import { BookingModule } from './booking/booking.module';
import { NotificationModule } from './notification/notification.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailerModule } from './mailer/mailer.module';
import { MailerService } from './mailer/mailer.service';
import { SchedularModule } from './schedular/schedular.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { RoomModule } from './room/room.module';
import { HallModule } from './hall/hall.module';
import { LawnModule } from './lawn/lawn.module';
import { PhotoshootModule } from './photoshoot/photoshoot.module';
import { SportModule } from './sport/sport.module';
import { PaymentModule } from './payment/payment.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AffiliationModule } from './affiliation/affiliation.module';
import { ContentModule } from './content/content.module';

@Module({
  imports: [AuthModule, AdminModule, MemberModule, BookingModule, NotificationModule, PrismaModule, ConfigModule.forRoot({
    isGlobal: true
  }), MailerModule, SchedularModule, ScheduleModule.forRoot(), CloudinaryModule, RoomModule, HallModule, LawnModule, PhotoshootModule, SportModule, PaymentModule, DashboardModule, AffiliationModule, ContentModule],
  controllers: [],
  providers: [MailerService],
})
export class AppModule { }
