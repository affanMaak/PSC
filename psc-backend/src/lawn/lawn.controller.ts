import { Body, Controller, Delete, Get, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { LawnService } from './lawn.service';
import { JwtAccGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from 'src/common/constants/roles.enum';
import { LawnCategory } from './dtos/lawn-category.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { LawnDto } from './dtos/lawn.dto';

@Controller('lawn')
export class LawnController {


    constructor(private lawn: LawnService) { }

    // lawn cateogry
    @UseGuards(JwtAccGuard, RolesGuard)
    @Roles(RolesEnum.SUPER_ADMIN)
    @Get('get/lawn/categories')
    async getLawnCategories() {
        return this.lawn.getLawnCategories();
    }
    @UseGuards(JwtAccGuard, RolesGuard)
    @Roles(RolesEnum.SUPER_ADMIN)
    @Get('get/lawn/categories/names')
    async getLawnNames(@Query() catId: { catId: string }) {
        return this.lawn.getLawnNames(Number(catId.catId));
    }

    @UseGuards(JwtAccGuard, RolesGuard)
    @Roles(RolesEnum.SUPER_ADMIN)
    @Post('create/lawn/category')
    async createLawnCategory(@Body() payload: LawnCategory) {
        return this.lawn.createLawnCategory(payload);
    }

    @UseGuards(JwtAccGuard, RolesGuard)
    @Roles(RolesEnum.SUPER_ADMIN)
    @Patch('update/lawn/category')
    async updateLawnCategory(@Body() payload: LawnCategory) {
        return this.lawn.updateLawnCategory(payload);
    }

    @UseGuards(JwtAccGuard, RolesGuard)
    @Roles(RolesEnum.SUPER_ADMIN)
    @Delete('delete/lawn/category')
    async deleteLawnCategory(@Query('catID') catID: string) {
        return this.lawn.deleteLawnCategory(Number(catID));
    }

    // lawns
    @UseGuards(JwtAccGuard, RolesGuard)
    @UseInterceptors(FilesInterceptor('files'))
    @Roles(RolesEnum.SUPER_ADMIN)
    @Post('create/lawn')
    async createLawn(
        @Body() payload: LawnDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        return this.lawn.createLawn(payload, files);
    }
    @UseGuards(JwtAccGuard, RolesGuard)
    @Roles(RolesEnum.SUPER_ADMIN)
    @UseInterceptors(FilesInterceptor('files'))
    @Patch('update/lawn')
    async updateLawn(
        @Body() payload: Partial<LawnDto>,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        return this.lawn.updateLawn(payload, files);
    }
    @UseGuards(JwtAccGuard, RolesGuard)
    @Roles(RolesEnum.SUPER_ADMIN)
    @Get('get/lawns')
    async getLawns() {
        return this.lawn.getLawns();
    }
    @UseGuards(JwtAccGuard, RolesGuard)
    @Roles(RolesEnum.SUPER_ADMIN)
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
}
