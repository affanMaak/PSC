
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContentService {
    constructor(
        private prisma: PrismaService,
        private cloudinary: CloudinaryService,
    ) { }

    // --- Events ---
    async createEvent(data: any, files: Array<Express.Multer.File>) {
        const imageUrls: string[] = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const upload = await this.cloudinary.uploadFile(file);
                imageUrls.push(upload.url);
            }
        }

        return this.prisma.event.create({
            data: {
                title: data.title,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                time: data.time,
                venue: data.venue,
                description: data.description,
                images: JSON.stringify(imageUrls),
            },
        });
    }

    async getAllEvents() {
        const events = await this.prisma.event.findMany({ orderBy: { createdAt: 'desc' } });
        return events.map(e => ({
            ...e,
            images: JSON.parse(e.images as string || '[]')
        }))
    }

    async updateEvent(id: number, data: any, files: Array<Express.Multer.File>) {
        let imageUrls: string[] = [];
        if (data.existingImages) {
            try {
                const parsed = typeof data.existingImages === 'string' ? JSON.parse(data.existingImages) : data.existingImages;
                imageUrls = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
                // If parse fails but it's a single string URL, potentially use it (though likely JSON)
                imageUrls = typeof data.existingImages === 'string' ? [data.existingImages] : [];
            }
        } else if (data.images) {
            // Fallback if frontend sends existing images as 'images' field string/array
            try {
                const parsed = typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
                if (Array.isArray(parsed)) imageUrls = parsed;
            } catch (e) { }
        }


        if (files && files.length > 0) {
            for (const file of files) {
                const upload = await this.cloudinary.uploadFile(file);
                imageUrls.push(upload.url);
            }
        }

        return this.prisma.event.update({
            where: { id },
            data: {
                title: data.title,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                time: data.time,
                venue: data.venue,
                description: data.description,
                images: JSON.stringify(imageUrls),
            },
        });
    }

    async deleteEvent(id: number) {
        return this.prisma.event.delete({ where: { id } });
    }

    // --- Club Rules ---
    // We'll manage a single active rule set or multiple, let's just do standard CRUD.
    async createClubRule(data: any) {
        return this.prisma.clubRule.create({
            data: {
                content: data.content,
                isActive: data.isActive === 'true' || data.isActive === true,
            },
        });
    }

    async getClubRules() {
        return this.prisma.clubRule.findMany({ orderBy: { createdAt: 'desc' } });
    }

    async updateClubRule(id: number, data: any) {
        return this.prisma.clubRule.update({
            where: { id },
            data: {
                content: data.content,
                isActive: data.isActive === 'true' || data.isActive === true,
            },
        });
    }

    async deleteClubRule(id: number) {
        return this.prisma.clubRule.delete({ where: { id } });
    }

    // --- Announcements ---
    async createAnnouncement(data: any) {
        return this.prisma.announcement.create({
            data: {
                title: data.title,
                description: data.description,
                date: new Date(data.date),
                isActive: data.isActive === 'true' || data.isActive === true,
            },
        });
    }

    async getAnnouncements() {
        return this.prisma.announcement.findMany({ orderBy: { date: 'desc' } });
    }

    async updateAnnouncement(id: number, data: any) {
        return this.prisma.announcement.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                date: data.date ? new Date(data.date) : undefined,
                isActive: data.isActive !== undefined ? (data.isActive === 'true' || data.isActive === true) : undefined,
            },
        });
    }

    async deleteAnnouncement(id: number) {
        return this.prisma.announcement.delete({ where: { id } });
    }

    // --- About Us ---
    async upsertAboutUs(data: any) {
        // Assuming only one record matters, but we'll use findFirst or allow multiple.
        // If ID provided update, else create
        if (data.id) {
            return this.prisma.aboutUs.update({
                where: { id: Number(data.id) },
                data: { clubInfo: data.clubInfo }
            })
        }
        return this.prisma.aboutUs.create({
            data: { clubInfo: data.clubInfo }
        });
    }

    async getAboutUs() {
        return this.prisma.aboutUs.findFirst({ orderBy: { createdAt: 'desc' } });
    }


    // --- Club History ---
    async createClubHistory(data: any, file?: Express.Multer.File) {
        let imageUrl = null;
        if (file) {
            const upload = await this.cloudinary.uploadFile(file);
            imageUrl = upload.url;
        }

        return this.prisma.clubHistory.create({
            data: {
                description: data.description,
                image: imageUrl,
            },
        });
    }

    async getClubHistory() {
        return this.prisma.clubHistory.findMany({ orderBy: { createdAt: 'desc' } });
    }

    async updateClubHistory(id: number, data: any, file?: Express.Multer.File) {
        let imageUrl = data.image; // Keep existing if not replaced
        if (file) {
            const upload = await this.cloudinary.uploadFile(file);
            imageUrl = upload.url;
        }

        return this.prisma.clubHistory.update({
            where: { id },
            data: {
                description: data.description,
                image: imageUrl,
            },
        });
    }

    async deleteClubHistory(id: number) {
        return this.prisma.clubHistory.delete({ where: { id } });
    }

    // --- Promotional Ads ---
    async createAd(data: any, file: Express.Multer.File) {
        let imageUrl = null;
        if (file) {
            const upload = await this.cloudinary.uploadFile(file);
            imageUrl = upload.url;
        } else {
            throw new BadRequestException("Image is required for Ads");
        }

        return this.prisma.promotionalAd.create({
            data: {
                title: data.title,
                description: data.description,
                image: imageUrl!,
                isActive: data.isActive === 'true' || data.isActive === true,
            },
        });
    }

    async getAds() {
        return this.prisma.promotionalAd.findMany({ orderBy: { createdAt: 'desc' } });
    }

    async updateAd(id: number, data: any, file?: Express.Multer.File) {
        let imageUrl = data.image;
        if (file) {
            const upload = await this.cloudinary.uploadFile(file);
            imageUrl = upload.url;
        }

        return this.prisma.promotionalAd.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                image: imageUrl,
                isActive: data.isActive !== undefined ? (data.isActive === 'true' || data.isActive === true) : undefined,
            },
        });
    }

    async deleteAd(id: number) {
        return this.prisma.promotionalAd.delete({ where: { id } });
    }
}
