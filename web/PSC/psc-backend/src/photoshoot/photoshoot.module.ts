import { Module } from '@nestjs/common';
import { PhotoshootController } from './photoshoot.controller';
import { PhotoshootService } from './photoshoot.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports:[PrismaModule],
  controllers: [PhotoshootController],
  providers: [PhotoshootService]
})
export class PhotoshootModule {}
