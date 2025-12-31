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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { RolesEnum } from 'src/common/constants/roles.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAccGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RoomTypeDto } from './dtos/room-type.dto';
import { RoomService } from './room.service';
import { RoomDto } from './dtos/room.dto';
import type { Response } from 'express';

@Controller('room')
export class RoomController {
  constructor(private room: RoomService) { }

  // room types //

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 5 }]))
  @Post('create/roomType')
  async createRoomType(
    @Body() payload: any,
    @UploadedFiles() files: { files?: Express.Multer.File[] },
  ) {
    // Parse form data fields correctly
    const roomTypePayload: RoomTypeDto = {
      type: payload.type,
      priceMember: payload.priceMember,
      priceGuest: payload.priceGuest,
      existingimgs: payload.existingimgs || [], // For create, this should usually be empty
    };

    return await this.room.createRoomType(roomTypePayload, files?.files || []);
  }

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Patch('update/roomType')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 5 }]))
  async updateRoomType(
    @Query('id') id: string,
    @Body() payload: any,
    @UploadedFiles() files: { files?: Express.Multer.File[] },
  ) {
    // Handle existingimgs as array - frontend sends multiple fields with same name
    let existingimgs: string[] = [];

    if (payload.existingimgs) {
      // If it's an array, use it directly
      if (Array.isArray(payload.existingimgs)) {
        existingimgs = payload.existingimgs;
      }
      // If it's a string, check if it's JSON or comma-separated
      else if (typeof payload.existingimgs === 'string') {
        try {
          // Try to parse as JSON first
          existingimgs = JSON.parse(payload.existingimgs);
        } catch {
          // If not JSON, treat as single value
          existingimgs = [payload.existingimgs];
        }
      }
    }

    const roomTypePayload: Partial<RoomTypeDto> = {
      type: payload.type,
      priceMember: payload.priceMember,
      priceGuest: payload.priceGuest,
      existingimgs: existingimgs,
    };

    return await this.room.updateRoomType(
      Number(id),
      roomTypePayload,
      files?.files || [],
    );
  }

  @UseGuards(JwtAccGuard)
  // @UseGuards(JwtAccGuard, RolesGuard)
  // @Roles(RolesEnum.SUPER_ADMIN)
  @Get('get/roomTypes')
  async getRoomTypes() {
    return await this.room.getRoomTypes();
  }
  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Delete('delete/roomType')
  async deleteRoomType(@Query('id') id: string) {
    return await this.room.deleteRoomType(Number(id));
  }

  // rooms //
  // @UseGuards(JwtAccGuard, RolesGuard)
  // @Roles(RolesEnum.SUPER_ADMIN)
  @UseGuards(JwtAccGuard)
  @Get('get/rooms')
  async getRooms() {
    return await this.room.getRooms();
  }
  // @UseGuards(JwtAccGuard, RolesGuard)
  // @Roles(RolesEnum.SUPER_ADMIN)
  @UseGuards(JwtAccGuard)
  @Get('get/rooms/categories')
  async getRoomCategories() {
    return await this.room.getRoomCategories();
  }
  // @UseGuards(JwtAccGuard, RolesGuard)
  // @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  @UseGuards(JwtAccGuard)
  @Get('get/rooms/available')
  async getAvailRooms(@Query() roomTypeId: { roomTypeId: string }) {
    return await this.room.getAvailRooms(Number(roomTypeId.roomTypeId));
  }

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Post('create/room')
  async createRoom(
    @Body() payload: RoomDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.room.createRoom(payload);
  }

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Patch('update/room')
  async updateRoom(
    @Body() payload: RoomDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    payload.isActive = payload.isActive === 'true' || payload.isActive === true;
    return await this.room.updateRoom(payload);
  }

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Delete('delete/room')
  async deleteRoom(@Query('id') id: string) {
    return await this.room.deleteRoom(Number(id));
  }



  // reserve room(s)
  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Patch('reserve/rooms')
  async reserveRooms(
    @Req() req: { user: { id: string } },
    @Body()
    payload: {
      roomIds: string[];
      reserve: boolean;
      reserveFrom?: string;
      reserveTo?: string;
      remarks?: string;
    },
  ) {
    console.log(payload)
    return await this.room.reserveRooms(
      payload.roomIds.map((id) => Number(id)),
      payload.reserve,
      req.user?.id,
      payload.reserveFrom,
      payload.reserveTo,
      payload.remarks,
    );
  }

  // member rooms //
  @UseGuards(JwtAccGuard)
  @Post('member/check/rooms/available')
  async getMemberRoomsAvailable(@Query("roomType") roomType: string, @Body() dates: { to: string, from: string }) {
    return await this.room.getMemberRoomsForDate(dates.from, dates.to, Number(roomType));
  }


  // room logs
  @UseGuards(JwtAccGuard)
  @Get('logs')
  async getRoomLogs(
    @Query('roomId') roomId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return await this.room.getRoomLogs(Number(roomId), from, to);
  }

  // calendar
  @UseGuards(JwtAccGuard)
  @Get('calendar')
  async roomCalendar() {
    return await this.room.roomCalendar();
  }

}
