
import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, UploadedFile, UploadedFiles, Patch } from '@nestjs/common';
import { ContentService } from './content.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('content')
export class ContentController {
    constructor(private readonly contentService: ContentService) { }

    // --- Events ---
    @Post('events')
    @UseInterceptors(FilesInterceptor('images', 5)) // Max 5 images
    createEvent(@Body() data: any, @UploadedFiles() files: Array<Express.Multer.File>) {
        return this.contentService.createEvent(data, files);
    }

    @Get('events')
    getEvents() {
        return this.contentService.getAllEvents();
    }

    @Put('events/:id')
    @UseInterceptors(FilesInterceptor('images', 5))
    updateEvent(@Param('id') id: string, @Body() data: any, @UploadedFiles() files: Array<Express.Multer.File>) {
        return this.contentService.updateEvent(+id, data, files);
    }

    @Delete('events/:id')
    deleteEvent(@Param('id') id: string) {
        return this.contentService.deleteEvent(+id);
    }

    // --- Club Rules ---
    @Post('rules')
    createRule(@Body() data: any) {
        return this.contentService.createClubRule(data);
    }

    @Get('rules')
    getRules() {
        return this.contentService.getClubRules();
    }

    @Put('rules/:id')
    updateRule(@Param('id') id: string, @Body() data: any) {
        return this.contentService.updateClubRule(+id, data);
    }

    @Delete('rules/:id')
    deleteRule(@Param('id') id: string) {
        return this.contentService.deleteClubRule(+id);
    }

    // --- Announcements ---
    @Post('announcements')
    createAnnouncement(@Body() data: any) {
        return this.contentService.createAnnouncement(data);
    }

    @Get('announcements')
    getAnnouncements() {
        return this.contentService.getAnnouncements();
    }

    @Put('announcements/:id')
    updateAnnouncement(@Param('id') id: string, @Body() data: any) {
        return this.contentService.updateAnnouncement(+id, data);
    }

    @Delete('announcements/:id')
    deleteAnnouncement(@Param('id') id: string) {
        return this.contentService.deleteAnnouncement(+id);
    }

    // --- About Us ---
    @Post('about-us')
    upsertAboutUs(@Body() data: any) {
        return this.contentService.upsertAboutUs(data);
    }

    @Get('about-us')
    getAboutUs() {
        return this.contentService.getAboutUs();
    }

    // --- Club History ---
    @Post('history')
    @UseInterceptors(FileInterceptor('image'))
    createHistory(@Body() data: any, @UploadedFile() file: Express.Multer.File) {
        return this.contentService.createClubHistory(data, file);
    }

    @Get('history')
    getHistory() {
        return this.contentService.getClubHistory();
    }

    @Put('history/:id')
    @UseInterceptors(FileInterceptor('image'))
    updateHistory(@Param('id') id: string, @Body() data: any, @UploadedFile() file: Express.Multer.File) {
        return this.contentService.updateClubHistory(+id, data, file);
    }

    @Delete('history/:id')
    deleteHistory(@Param('id') id: string) {
        return this.contentService.deleteClubHistory(+id);
    }

    // --- Promotional Ads ---
    @Post('ads')
    @UseInterceptors(FileInterceptor('image'))
    createAd(@Body() data: any, @UploadedFile() file: Express.Multer.File) {
        return this.contentService.createAd(data, file);
    }

    @Get('ads')
    getAds() {
        return this.contentService.getAds();
    }

    @Put('ads/:id')
    @UseInterceptors(FileInterceptor('image'))
    updateAd(@Param('id') id: string, @Body() data: any, @UploadedFile() file: Express.Multer.File) {
        return this.contentService.updateAd(+id, data, file);
    }

    @Delete('ads/:id')
    deleteAd(@Param('id') id: string) {
        return this.contentService.deleteAd(+id);
    }
}
