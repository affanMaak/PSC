import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HallDto } from './dtos/hall.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from 'src/common/constants/roles.enum';
import { JwtAccGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { HallService } from './hall.service';
import type { Response } from 'express';

@Controller('hall')
export class HallController {
  constructor(private hall: HallService) {}

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Get('get/halls')
  async getHalls() {
    return this.hall.getHalls();
  }
  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Get('get/halls/available')
  async getAvailHalls() {
    return this.hall.getAvailHalls();
  }

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @UseInterceptors(FilesInterceptor('files'))
  @Post('create/hall')
  async createHall(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() payload: HallDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { isActive, isOutOfService } = payload;
    if (isActive === isOutOfService)
      return res.status(400).send({
        cause: 'hall activity and out-of-order cannot be at the same time',
      });
    return this.hall.createHall(payload, files);
  }

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @UseInterceptors(FilesInterceptor('files'))
  @Patch('update/hall')
  async updateHall(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() payload: HallDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { isActive, isOutOfService } = payload;

    if (isActive === isOutOfService)
      return res.status(400).send({
        cause: 'hall activity and out-of-service cannot be at the same time',
      });

    return this.hall.updateHall(payload, files);
  }

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @UseInterceptors(FilesInterceptor('files'))
  @Delete('delete/hall')
  async deleteHall(@Query('hallId') hallId: string) {
    return this.hall.deleteHall(Number(hallId));
  }

  // reserve halls
  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Patch('reserve/halls')
  async createHallReservation(
    @Req() req: { user: { id: string } },
    @Body()
    payload: {
      hallIds: string[];
      reserve: boolean;
      timeSlot: string;
      reserveFrom?: string;
      reserveTo?: string;
    },
  ) {
    return await this.hall.reserveHalls(
      payload.hallIds.map((id) => Number(id)),
      payload.reserve,
      req.user?.id,
      payload.timeSlot,
      payload.reserveFrom,
      payload.reserveTo,
    );
  }
}
