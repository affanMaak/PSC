import {
    Body,
    Controller,
    Delete,
    Get,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { RolesEnum } from 'src/common/constants/roles.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAccGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PhotoShootDto } from './dtos/photoshoot.dto';
import { PhotoshootService } from './photoshoot.service';

@Controller('photoshoot')
export class PhotoshootController {

    constructor(private photo: PhotoshootService){}

    // photoshoot
    @UseGuards(JwtAccGuard, RolesGuard)
    @Roles(RolesEnum.SUPER_ADMIN)
    @Post('create/photoShoot')
    async createPhotoShoot(@Body() payload: PhotoShootDto) {
        return this.photo.createPhotoShoot(payload);
    }
    @UseGuards(JwtAccGuard, RolesGuard)
    @Roles(RolesEnum.SUPER_ADMIN)
    @Patch('update/photoShoot')
    async updatePhotoShoot(@Body() payload: Partial<PhotoShootDto>) {
        return this.photo.updatePhotoshoot(payload);
    }
    // @UseGuards(JwtAccGuard, RolesGuard)
    // @Roles(RolesEnum.SUPER_ADMIN)
    @UseGuards(JwtAccGuard)
    @Get('get/photoShoots')
    async getPhotoShoots() {
        return this.photo.getPhotoshoots();
    }
    // @UseGuards(JwtAccGuard, RolesGuard)
    // @Roles(RolesEnum.SUPER_ADMIN)
    @UseGuards(JwtAccGuard)
    @Get('get/photoShoots/available')
    async getAvailPhotoShoots() {
        return this.photo.getPhotoshoots();
    }
    @UseGuards(JwtAccGuard, RolesGuard)
    @Roles(RolesEnum.SUPER_ADMIN)
    @Delete('delete/photoShoot')
    async deletePhotoShoot(@Query('id') id: string) {
        return this.photo.deletePhotoshoot(Number(id));
    }
}
