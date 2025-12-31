import { Module } from '@nestjs/common';
import { AffiliationController } from './affiliation.controller';
import { AffiliationService } from './affiliation.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, MailerModule, CloudinaryModule],
  controllers: [AffiliationController],
  providers: [AffiliationService],
})
export class AffiliationModule { }
