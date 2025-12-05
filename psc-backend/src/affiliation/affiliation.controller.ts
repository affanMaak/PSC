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
} from '@nestjs/common';
import { AffiliationService } from './affiliation.service';
import {
    CreateAffiliatedClubDto,
    UpdateAffiliatedClubDto,
    CreateAffiliatedClubRequestDto,
    UpdateRequestStatusDto,
} from './dtos/affiliation.dto';

@Controller('affiliation')
export class AffiliationController {
    constructor(private affiliationService: AffiliationService) { }

    // -------------------- AFFILIATED CLUBS --------------------

    @Get('clubs')
    async getAffiliatedClubs() {
        return await this.affiliationService.getAffiliatedClubs();
    }

    @Get('clubs/:id')
    async getAffiliatedClubById(@Param('id') id: string) {
        return await this.affiliationService.getAffiliatedClubById(Number(id));
    }

    @Post('clubs')
    async createAffiliatedClub(@Body() body: CreateAffiliatedClubDto) {
        return await this.affiliationService.createAffiliatedClub(body);
    }

    @Put('clubs')
    async updateAffiliatedClub(@Body() body: UpdateAffiliatedClubDto) {
        return await this.affiliationService.updateAffiliatedClub(body);
    }

    @Delete('clubs/:id')
    async deleteAffiliatedClub(@Param('id') id: string) {
        return await this.affiliationService.deleteAffiliatedClub(Number(id));
    }

    // -------------------- AFFILIATED CLUB REQUESTS --------------------

    @Get('requests')
    async getAffiliatedClubRequests(@Query('status') status?: string) {
        return await this.affiliationService.getAffiliatedClubRequests(status);
    }

    @Get('requests/:id')
    async getRequestById(@Param('id') id: string) {
        return await this.affiliationService.getRequestById(Number(id));
    }

    @Post('requests')
    async createRequest(@Body() body: CreateAffiliatedClubRequestDto) {
        return await this.affiliationService.createRequest(body);
    }

    @Put('requests/status')
    async updateRequestStatus(@Body() body: UpdateRequestStatusDto) {
        return await this.affiliationService.updateRequestStatus(body);
    }

    @Delete('requests/:id')
    async deleteRequest(@Param('id') id: string) {
        return await this.affiliationService.deleteRequest(Number(id));
    }



    // handle approval/rejection
    @Patch('request/action')
    async handleAction(@Query('requestId') requestId: number, @Query('status') status: "APPROVED" | "REJECTED"){
        return await this.affiliationService.handleAction(status, Number(requestId))
    }
}

