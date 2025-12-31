import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSportDto } from './dtos/sport.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class SportService {

    constructor(
        private prismaService: PrismaService,
        private cloudinaryService: CloudinaryService,
    ) { }

    // --------------------------- SPORTS ---------------------------------
    async getSports() {
        return await this.prismaService.sport.findMany({
            include: { sportCharge: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async createSport(payload: CreateSportDto, files: Express.Multer.File[] = []) {
        // Upload new images to Cloudinary
        const uploadedImages: string[] = [];
        for (const file of files) {
            const result = await this.cloudinaryService.uploadFile(file);
            uploadedImages.push(result.url);
        }

        return await this.prismaService.sport.create({
            data: {
                activity: payload.activity,
                description: payload.description,
                isActive: Boolean(payload.isActive),
                images: uploadedImages,
                timing: payload.timing || {},
                timingLadies: payload.timingLadies || {},
                dressCodeDos: payload.dressCodeDos,
                dressCodeDonts: payload.dressCodeDonts,
                dos: payload.dos,
                donts: payload.donts,
                sportCharge: {
                    create: payload.sportCharge?.map((c) => ({
                        chargeType: c.chargeType,
                        memberCharges: c.memberCharges?.toString(),
                        spouseCharges: c.spouseCharges?.toString(),
                        childrenCharges: c.childrenCharges?.toString(),
                        guestCharges: c.guestCharges?.toString(),
                        affiliatedClubCharges: c.affiliatedClubCharges?.toString(),
                    })) || [],
                },
            },
            include: { sportCharge: true },
        });
    }

    async updateSport(id: number, payload: Partial<CreateSportDto>, files: Express.Multer.File[] = []) {
        // Get existing sport to compare images
        const existingSport = await this.prismaService.sport.findUnique({
            where: { id },
        });

        if (!existingSport) {
            throw new HttpException('Sport not found', HttpStatus.NOT_FOUND);
        }

        const existingImages = (existingSport.images as string[]) || [];
        const keepImages = payload.existingimgs || [];

        // Find images to delete (were in DB but not in keepImages)
        const imagesToDelete = existingImages.filter(img => !keepImages.includes(img));

        // Delete removed images from Cloudinary
        for (const imageUrl of imagesToDelete) {
            try {
                // Extract public_id from URL
                const urlParts = imageUrl.split('/');
                const filename = urlParts[urlParts.length - 1];
                const publicId = `psc/${filename.split('.')[0]}`;
                await this.cloudinaryService.removeFile(publicId);
            } catch (error) {
                console.error('Error deleting image from Cloudinary:', error);
            }
        }

        // Upload new images
        const newImageUrls: string[] = [];
        for (const file of files) {
            const result = await this.cloudinaryService.uploadFile(file);
            newImageUrls.push(result.url);
        }

        // Combine kept images with new uploads
        const finalImages = [...keepImages, ...newImageUrls];

        return await this.prismaService.sport.update({
            where: { id },
            data: {
                activity: payload.activity,
                description: payload.description,
                isActive: payload.isActive,
                images: finalImages,
                timing: payload.timing,
                timingLadies: payload.timingLadies,
                dressCodeDos: payload.dressCodeDos,
                dressCodeDonts: payload.dressCodeDonts,
                dos: payload.dos,
                donts: payload.donts,
                sportCharge: {
                    deleteMany: {},
                    create: payload.sportCharge?.map((c) => ({
                        chargeType: c.chargeType,
                        memberCharges: c.memberCharges,
                        spouseCharges: c.spouseCharges,
                        childrenCharges: c.childrenCharges,
                        guestCharges: c.guestCharges,
                        affiliatedClubCharges: c.affiliatedClubCharges,
                    })),
                },
            },
            include: { sportCharge: true },
        });
    }

    async deleteSport(id: number) {
        // Get sport to delete its images
        const sport = await this.prismaService.sport.findUnique({
            where: { id },
        });

        if (!sport) {
            throw new HttpException('Sport not found', HttpStatus.NOT_FOUND);
        }

        // Delete images from Cloudinary
        const images = (sport.images as string[]) || [];
        for (const imageUrl of images) {
            try {
                const urlParts = imageUrl.split('/');
                const filename = urlParts[urlParts.length - 1];
                const publicId = `psc/${filename.split('.')[0]}`;
                await this.cloudinaryService.removeFile(publicId);
            } catch (error) {
                console.error('Error deleting image from Cloudinary:', error);
            }
        }

        // Delete sport charges first (due to relation)
        await this.prismaService.sportCharge.deleteMany({
            where: { activityId: id },
        });

        // Delete the sport
        return await this.prismaService.sport.delete({
            where: { id },
        });
    }
}
