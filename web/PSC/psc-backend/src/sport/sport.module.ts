import { Module } from '@nestjs/common';
import { SportController } from './sport.controller';
import { SportService } from './sport.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [SportController],
  providers: [SportService]
})
export class SportModule { }
