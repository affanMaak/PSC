import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LawnDto } from './dtos/lawn.dto';
import { LawnCategory } from './dtos/lawn-category.dto';

@Injectable()
export class LawnService {
    constructor(
        private prismaService: PrismaService,
        private cloudinaryService: CloudinaryService,
    ) { }

    // ─────────────────────────── LAWN CATEGORY ───────────────────────────
    async getLawnCategories() {
        return await this.prismaService.lawnCategory.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async getLawnNames(id: number) {
        return await this.prismaService.lawn.findMany({
            where: { lawnCategoryId: id },
            orderBy: { memberCharges: 'desc' },
        });
    }

    async createLawnCategory(payload: LawnCategory) {
        return await this.prismaService.lawnCategory.create({
            data: { category: payload.category },
        });
    }

    async updateLawnCategory(payload: LawnCategory) {
        if (!payload.id)
            throw new HttpException(
                'Lawn category ID is required',
                HttpStatus.BAD_REQUEST,
            );

        return await this.prismaService.lawnCategory.update({
            where: { id: Number(payload.id) },
            data: { category: payload.category },
        });
    }

    async deleteLawnCategory(catID: number) {
        return await this.prismaService.lawnCategory.delete({
            where: { id: catID },
        });
    }

    // ─────────────────────────── LAWNS ───────────────────────────
    async createLawn(payload: LawnDto, files: Express.Multer.File[] = []) {
        const uploadedImages: { url: string; publicId: string }[] = [];

        for (const file of files) {
            const result: any = await this.cloudinaryService.uploadFile(file);
            uploadedImages.push({
                url: result.secure_url || result.url,
                publicId: result.public_id,
            });
        }

        return this.prismaService.lawn.create({
            data: {
                lawnCategoryId: Number(payload.lawnCategoryId),
                description: payload.description?.trim() || 'Lawn',
                minGuests: Number(payload.minGuests) || 0,
                maxGuests: Number(payload.maxGuests) || 0,
                memberCharges: new Prisma.Decimal(payload.memberCharges || 0),
                guestCharges: new Prisma.Decimal(payload.guestCharges || 0),
                isActive: true,
                isOutOfService:
                    payload.isOutOfService === true || payload.isOutOfService === 'true',
                outOfServiceReason:
                    payload.isOutOfService === true || payload.isOutOfService === 'true'
                        ? payload.outOfServiceReason?.trim() || null
                        : null,
                outOfServiceFrom:
                    payload.isOutOfService === true || payload.isOutOfService === 'true'
                        ? new Date()
                        : null,
                outOfServiceTo:
                    payload.isOutOfService === true || payload.isOutOfService === 'true'
                        ? payload.outOfServiceUntil
                            ? new Date(payload.outOfServiceUntil)
                            : null
                        : null,
                images: uploadedImages,
            },
        });
    }

    async updateLawn(
        payload: Partial<LawnDto>,
        files: Express.Multer.File[] = [],
    ) {
        if (!payload.id) {
            throw new HttpException('Lawn ID is required', HttpStatus.BAD_REQUEST);
        }

        const lawnId = Number(payload.id);
        const existingLawn: any = await this.prismaService.lawn.findUnique({
            where: { id: lawnId },
            select: { images: true },
        });

        if (!existingLawn) {
            throw new HttpException('Lawn not found', HttpStatus.NOT_FOUND);
        }

        // Handle image preservation
        const keepPublicIds = Array.isArray(payload.existingimgs)
            ? payload.existingimgs
            : payload.existingimgs
                ? [payload.existingimgs]
                : [];

        const preservedImages: any[] = (existingLawn.images as any[])?.filter(
            (img: any) => keepPublicIds.includes(img.publicId),
        );

        // Delete removed images from Cloudinary
        const removedImages: any[] = (existingLawn.images as any[])?.filter(
            (img: any) => !keepPublicIds.includes(img.publicId),
        );

        for (const img of removedImages || []) {
            try {
                await this.cloudinaryService.removeFile(img.publicId);
            } catch (error) {
                console.warn('Failed to delete image from Cloudinary:', img.publicId);
            }
        }

        // Upload new images
        const newImages: any[] = [];
        for (const file of files) {
            const result: any = await this.cloudinaryService.uploadFile(file);
            newImages.push({
                url: result.secure_url || result.url,
                publicId: result.public_id,
            });
        }

        const finalImages = [...(preservedImages || []), ...newImages];

        return this.prismaService.lawn.update({
            where: { id: lawnId },
            data: {
                lawnCategoryId: payload.lawnCategoryId
                    ? Number(payload.lawnCategoryId)
                    : undefined,
                description: payload.description?.trim(),
                minGuests: payload.minGuests ? Number(payload.minGuests) : undefined,
                maxGuests: payload.maxGuests ? Number(payload.maxGuests) : undefined,
                memberCharges: payload.memberCharges
                    ? new Prisma.Decimal(payload.memberCharges)
                    : undefined,
                guestCharges: payload.guestCharges
                    ? new Prisma.Decimal(payload.guestCharges)
                    : undefined,
                isActive: payload.isOutOfService === 'true' ? false : true, // Auto-set
                isOutOfService:
                    payload.isOutOfService === true || payload.isOutOfService === 'true',
                outOfServiceReason:
                    payload.isOutOfService === true || payload.isOutOfService === 'true'
                        ? payload.outOfServiceReason?.trim() || null
                        : null,
                outOfServiceFrom:
                    payload.isOutOfService === true || payload.isOutOfService === 'true'
                        ? new Date()
                        : null,
                outOfServiceTo:
                    payload.isOutOfService === true || payload.isOutOfService === 'true'
                        ? payload.outOfServiceUntil
                            ? new Date(payload.outOfServiceUntil)
                            : null
                        : null,
                images: finalImages,
            },
        });
    }

    async getLawns() {
        return this.prismaService.lawn.findMany({
            where: { isBooked: false },
            include: { lawnCategory: { select: { id: true, category: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async deleteLawn(lawnID: number) {
        return await this.prismaService.lawn.delete({
            where: { id: lawnID },
        });
    }
}
