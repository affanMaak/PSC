import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HallDto } from './dtos/hall.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { capitalizeWords } from 'src/utils/CapitalizeFirst';

@Injectable()
export class HallService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // ─────────────────────────── HALLS ───────────────────────────
  async getHalls() {
    return await this.prismaService.hall.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
  async getAvailHalls() {
    return await this.prismaService.hall.findMany({
      where: { isActive: true, isBooked: false },
      orderBy: { createdAt: 'desc' },
    });
  }
  async createHall(payload: HallDto, files: Express.Multer.File[]) {
    const uploadedImages: { url: string; publicId: string }[] = [];

    for (const file of files ?? []) {
      const img = await this.cloudinaryService.uploadFile(file);
      uploadedImages.push({
        url: img.url,
        publicId: img.public_id,
      });
    }

    return await this.prismaService.hall.create({
      data: {
        name: capitalizeWords(payload.name),
        description: payload.description,
        capacity: Number(payload.capacity),
        chargesGuests: Number(payload.chargesGuests),
        chargesMembers: Number(payload.chargesMembers),
        isActive: payload.isActive == 'true' || payload.isActive === true,
        isOutOfService:
          payload.isOutOfService == 'true' || payload.isOutOfService === true,

        outOfServiceReason: payload.outOfServiceReason,
        outOfServiceFrom: payload.isOutOfService ? new Date() : null,
        outOfServiceTo: payload.outOfServiceUntil
          ? new Date(payload.outOfServiceUntil)
          : null,

        images: uploadedImages,
      },
    });
  }

  async updateHall(payload: HallDto, files: Express.Multer.File[] = []) {
    if (!payload.id) {
      throw new HttpException('Hall ID is required', HttpStatus.BAD_REQUEST);
    }

    const hallId = Number(payload.id);

    const hall: any = await this.prismaService.hall.findUnique({
      where: { id: hallId },
      select: { images: true },
    });

    if (!hall) {
      throw new HttpException('Hall not found', HttpStatus.NOT_FOUND);
    }

    // Extract only safe fields
    const keepImagePublicIds = Array.isArray(payload.existingimgs)
      ? payload.existingimgs
      : payload.existingimgs
        ? [payload.existingimgs]
        : [];

    const filteredExistingImages = hall?.images?.filter((img: any) =>
      keepImagePublicIds.includes(img.publicId),
    );

    // Upload new images
    const newUploadedImages: any[] = [];
    for (const file of files) {
      const result: any = await this.cloudinaryService.uploadFile(file);
      newUploadedImages.push({
        url: result.secure_url || result.url,
        publicId: result.public_id,
      });
    }

    const finalImages = [...filteredExistingImages, ...newUploadedImages];

    // Update with CLEAN DATA ONLY
    return this.prismaService.hall.update({
      where: { id: hallId },
      data: {
        name: payload.name?.trim(),
        description: payload.description?.trim(),
        capacity: Number(payload.capacity) || 0,
        chargesMembers: Number(payload.chargesMembers) || 0,
        chargesGuests: Number(payload.chargesGuests) || 0,
        isActive: payload.isActive === true || payload.isActive === 'true',
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

  async deleteHall(id: number): Promise<void> {
    const hall = await this.prismaService.hall.findFirst({ where: { id } });

    if (!hall) {
      throw new Error(`Hall with ID ${id} not found`);
    }

    // Delete images
    if (Array.isArray(hall.images)) {
      const deletePromises = hall.images
        .filter((img: { publicId: string }) => img?.publicId)
        .map((img: { publicId: string }) =>
          this.cloudinaryService
            .removeFile(img.publicId)
            .catch((error) =>
              console.error(`Failed to delete image ${img.publicId}:`, error),
            ),
        );

      await Promise.all(deletePromises);
    }

    // Delete hall record
    await this.prismaService.hall.delete({ where: { id } });
  }
}
