import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LawnService } from './lawn.service';
import { JwtAccGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from 'src/common/constants/roles.enum';
import { LawnCategory } from './dtos/lawn-category.dto';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { LawnDto } from './dtos/lawn.dto';

@Controller('lawn')
export class LawnController {
  constructor(private lawn: LawnService) { }

  // lawn cateogry
  @UseGuards(JwtAccGuard)
  // @UseGuards(JwtAccGuard, RolesGuard)
  // @Roles(RolesEnum.SUPER_ADMIN)
  @Get('get/lawn/categories')
  async getLawnCategories() {
    return this.lawn.getLawnCategories();
  }
  // @UseGuards(JwtAccGuard, RolesGuard)
  // @Roles(RolesEnum.SUPER_ADMIN)
  @UseGuards(JwtAccGuard)
  @Get('get/lawn/categories/names')
  async getLawnNames(@Query() catId: { catId: string }) {
    return this.lawn.getLawnNames(Number(catId.catId));
  }

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 5 }]))
  @Post('create/lawn/category')
  async createLawnCategory(
    @Body() payload: any,
    @UploadedFiles() files: { files?: Express.Multer.File[] },
  ) {
    // Parse form data fields correctly
    const lawnCategoryPayload: LawnCategory = {
      category: payload.category,
      existingimgs: payload.existingimgs || [], // For create, this should usually be empty
    };
    return await this.lawn.createLawnCategory(
      lawnCategoryPayload,
      files?.files || [],
    );
  }

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Patch('update/lawn/category')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 5 }]))
  async updateLawnCategory(
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

    const lawnCategoryPayload: Partial<LawnCategory> = {
      category: payload.category,
      existingimgs: existingimgs,
    };

    return await this.lawn.updateLawnCategory(
      Number(payload.id),
      lawnCategoryPayload,
      files?.files || [],
    );
  }

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Delete('delete/lawn/category')
  async deleteLawnCategory(@Query('catID') catID: string) {
    return this.lawn.deleteLawnCategory(Number(catID));
  }

  // lawns
  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Post('create/lawn')
  async createLawn(@Body() payload: LawnDto) {
    return this.lawn.createLawn(payload);
  }

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Patch('update/lawn')
  async updateLawn(@Body() payload: Partial<LawnDto>) {
    return this.lawn.updateLawn(payload);
  }

  // @UseGuards(JwtAccGuard, RolesGuard)
  // @Roles(RolesEnum.SUPER_ADMIN)
  @UseGuards(JwtAccGuard)
  @Get('get/lawns')
  async getLawns() {
    return this.lawn.getLawns();
  }

  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  @Get('get/lawns/calendar')
  async getCalendarLawns() {
    return this.lawn.getCalendarLawns();
  }

  // @UseGuards(JwtAccGuard, RolesGuard)
  // @Roles(RolesEnum.SUPER_ADMIN)
  @UseGuards(JwtAccGuard)
  @Get('get/lawns/available')
  async getAvailLawns(@Query('catId') catId: string) {
    return this.lawn.getLawnNames(Number(catId));
  }
  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @Delete('delete/lawn')
  async deleteLawn(@Query('id') id: string) {
    return this.lawn.deleteLawn(Number(id));
  }

  // ─────────────────────────── LAWN RESERVATIONS ───────────────────────────
  @UseGuards(JwtAccGuard, RolesGuard)
  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  @Patch('reserve/lawns')
  async reserveLawns(
    @Req() req,
    @Body()
    payload: {
      lawnIds: number[];
      reserve: boolean;
      reserveFrom?: string;
      reserveTo?: string;
      timeSlot: string;
    },
  ) {
    return await this.lawn.reserveLawns(
      payload.lawnIds,
      payload.reserve,
      req.user.id,
      payload.timeSlot,
      payload.reserveFrom,
      payload.reserveTo,
    );
  }
}
