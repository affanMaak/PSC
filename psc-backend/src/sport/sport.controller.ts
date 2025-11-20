import { Body, Controller, Delete, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RolesEnum } from 'src/common/constants/roles.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAccGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateSportDto } from './dtos/sport.dto';
import { SportService } from './sport.service';

@Controller('sport')
export class SportController {

    constructor(private sport: SportService) { }

    // sports
    @UseGuards(JwtAccGuard, RolesGuard)
    @Roles(RolesEnum.SUPER_ADMIN)
    @Post('create/sport')
    async createSport(@Body() payload: CreateSportDto) {
        return this.sport.createSport(payload);
    }
    @UseGuards(JwtAccGuard, RolesGuard)
    @Roles(RolesEnum.SUPER_ADMIN)
    @Patch('update/sport')
    async updateSport(@Body() payload: Partial<CreateSportDto>) {
        return this.sport.updateSport(payload);
    }
    @UseGuards(JwtAccGuard, RolesGuard)
    @Roles(RolesEnum.SUPER_ADMIN)
    @Get('get/sports')
    async getSports() {
        return this.sport.getSports();
    }
    @UseGuards(JwtAccGuard, RolesGuard)
    @Roles(RolesEnum.SUPER_ADMIN)
    @Delete('delete/sport')
    async deleteSport(@Query() sportID: { sportID: string }) {
        return this.sport.deleteSport(Number(sportID.sportID));
    }



}
