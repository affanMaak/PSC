import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { CreateMemberDto } from './dtos/create-member.dto';
import { JwtAccGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RolesEnum } from 'src/common/constants/roles.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { RoomTypeDto } from './dtos/room-type.dto';
import { RoomDto } from './dtos/room.dto';
import { HallDto } from './dtos/hall.dto';
import { LawnCategory } from './dtos/lawn-category.dto';
import { LawnDto } from './dtos/lawn.dto';
import { PhotoShootDto } from './dtos/photoshoot.dto';
import { CreateSportDto } from './dtos/sport.dto';
import { BookingDto } from './dtos/booking.dto';
import { PaymentMode } from '@prisma/client';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Get('get/admins')
  async getAdmins() {
    return this.adminService.getAdmins();
  }

}
