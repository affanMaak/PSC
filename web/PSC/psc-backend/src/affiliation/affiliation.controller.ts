import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    Patch,
    UseGuards,
    Req,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { AffiliationService } from './affiliation.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    CreateAffiliatedClubDto,
    UpdateAffiliatedClubDto,
    CreateAffiliatedClubRequestDto,
    UpdateRequestStatusDto,
} from './dtos/affiliation.dto';
import { JwtAccGuard } from 'src/common/guards/jwt-access.guard';

@Controller('affiliation')
export class AffiliationController {
    constructor(private affiliationService: AffiliationService) { }

    // -------------------- AFFILIATED CLUBS --------------------

    @Get('clubs')
    async getAffiliatedClubs() {
        return await this.affiliationService.getAffiliatedClubs();
    }

    @Get('clubs/active')
    async getAffiliatedClubsActive() {
        return await this.affiliationService.getAffiliatedClubsActive();
    }

    @Get('clubs/:id')
    async getAffiliatedClubById(@Param('id') id: string) {
        return await this.affiliationService.getAffiliatedClubById(Number(id));
    }

    @Post('clubs')
    @UseInterceptors(FileInterceptor('image'))
    async createAffiliatedClub(
        @Body() body: CreateAffiliatedClubDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return await this.affiliationService.createAffiliatedClub(body, file);
    }

    @Put('clubs')
    @UseInterceptors(FileInterceptor('image'))
    async updateAffiliatedClub(
        @Body() body: UpdateAffiliatedClubDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return await this.affiliationService.updateAffiliatedClub(body, file);
    }

    @Delete('clubs/:id')
    async deleteAffiliatedClub(@Param('id') id: string) {
        return await this.affiliationService.deleteAffiliatedClub(Number(id));
    }

    // -------------------- AFFILIATED CLUB REQUESTS --------------------

    @Get('requests')
    async getAffiliatedClubRequests() {
        return await this.affiliationService.getAffiliatedClubRequests();
    }

    @Get('requests/:id')
    async getRequestById(@Param('id') id: string) {
        return await this.affiliationService.getRequestById(Number(id));
    }

    @UseGuards(JwtAccGuard)
    @Post('requests')
    async createRequest(@Body() body: any, @Req() req: { user: { id: string } }) {
        return await this.affiliationService.createRequest({ ...body, membershipNo: req.user.id })
    }
}

