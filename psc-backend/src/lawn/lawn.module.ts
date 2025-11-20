import { Module } from '@nestjs/common';
import { LawnController } from './lawn.controller';
import { LawnService } from './lawn.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [LawnController],
  providers: [LawnService]
})
export class LawnModule {}
