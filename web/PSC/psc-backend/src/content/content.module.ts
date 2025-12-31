
import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [CloudinaryModule, PrismaModule],
    controllers: [ContentController],
    providers: [ContentService],
})
export class ContentModule { }
