import { Module } from '@nestjs/common';
import { SchedularService } from './schedular.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [SchedularService]
})
export class SchedularModule { }
