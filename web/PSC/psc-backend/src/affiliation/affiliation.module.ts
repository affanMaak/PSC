import { Module } from '@nestjs/common';
import { AffiliationController } from './affiliation.controller';
import { AffiliationService } from './affiliation.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [PrismaModule, MailerModule],
  controllers: [AffiliationController],
  providers: [AffiliationService],
})
export class AffiliationModule { }
