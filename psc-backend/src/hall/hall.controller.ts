import { Body, Controller, Get, Patch, Post, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
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

    constructor(private hall: HallService){}

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
}
