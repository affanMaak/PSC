import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LawnDto } from './dtos/lawn.dto';
import { LawnCategory } from './dtos/lawn-category.dto';
import { capitalizeWords } from 'src/utils/CapitalizeFirst';

@Injectable()
export class LawnService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // ─────────────────────────── LAWN CATEGORY ───────────────────────────
  async getLawnCategories() {
    return await this.prismaService.lawnCategory.findMany({
      include: { lawns: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  async getLawnNames(id: number) {
    return await this.prismaService.lawn.findMany({
      where: { lawnCategoryId: id, isActive: true },
      orderBy: { memberCharges: 'desc' },
    });
  }

  async createLawnCategory(
    payload: LawnCategory,
    files: Express.Multer.File[],
  ) {
    const uploadedImages: { url: string; publicId: string }[] = [];

    try {
      // Upload new images
      for (const file of files ?? []) {
        try {
          const img = await this.cloudinaryService.uploadFile(file);
          uploadedImages.push({
            url: img.url,
            publicId: img.public_id,
          });
        } catch (uploadError: any) {
          // Handle Cloudinary upload errors
          if (
            uploadError.http_code === 400 &&
            uploadError.message?.includes('File size too large')
          ) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const maxSizeMB = (10 * 1024 * 1024) / (1024 * 1024); // 10MB in MB

            throw new HttpException(
              `File "${file.originalname}" is too large (${fileSizeMB}MB). Maximum allowed size is ${maxSizeMB}MB.`,
              HttpStatus.BAD_REQUEST,
            );
          } else if (uploadError.http_code) {
            // Handle other Cloudinary-specific errors
            throw new HttpException(
              `Failed to upload image "${file.originalname}": ${uploadError.message}`,
              HttpStatus.BAD_REQUEST,
            );
          } else {
            // Handle generic upload errors
            throw new HttpException(
              `Failed to upload image "${file.originalname}": ${uploadError.message || 'Unknown error'}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }
      }

      // Validate required fields
      if (!payload.category) {
        throw new HttpException(
          'Category is a required field',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Create lawn category
      return await this.prismaService.lawnCategory.create({
        data: {
          category: capitalizeWords(payload.category),
          images: uploadedImages,
        },
      });
    } catch (error: any) {
      // If any upload fails, clean up already uploaded images
      if (uploadedImages.length > 0) {
        await this.cleanupUploadedImages(uploadedImages);
      }

      // Re-throw the error if it's already an HttpException
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle unexpected errors
      throw new HttpException(
        `Failed to create lawn category: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateLawnCategory(
    id: number,
    payload: Partial<LawnCategory>,
    files?: Express.Multer.File[],
  ) {
    // Fetch existing lawn category with images
    const existingLawnCategory =
      await this.prismaService.lawnCategory.findUnique({
        where: { id },
      });

    if (!existingLawnCategory) {
      throw new HttpException('Lawn category not found', HttpStatus.NOT_FOUND);
    }

    // Parse existing images safely
    const existingImages: { url: string; publicId: string }[] = [];
    try {
      if (
        existingLawnCategory.images &&
        Array.isArray(existingLawnCategory.images)
      ) {
        existingImages.push(
          ...(existingLawnCategory.images as any[]).filter(
            (img): img is { url: string; publicId: string } =>
              img &&
              typeof img === 'object' &&
              typeof img.url === 'string' &&
              typeof img.publicId === 'string',
          ),
        );
      }
    } catch (error) {
      console.error('Error parsing existing images:', error);
    }

    // Get images to keep from frontend
    const frontendImagePublicIds: string[] = payload.existingimgs || [];

    // Determine removed images
    const removedImages = existingImages.filter(
      (img) => !frontendImagePublicIds.includes(img.publicId),
    );

    // Delete removed images from cloudinary
    for (const img of removedImages) {
      try {
        await this.cloudinaryService.removeFile(img.publicId);
      } catch (error: any) {
        console.error(
          `Failed to delete image from Cloudinary: ${error.message}`,
        );
        // Continue with other operations even if deletion fails
      }
    }

    // Upload new images
    const newUploadedImages: { url: string; publicId: string }[] = [];

    try {
      for (const file of files ?? []) {
        try {
          const uploaded = await this.cloudinaryService.uploadFile(file);
          newUploadedImages.push({
            url: uploaded.url,
            publicId: uploaded.public_id,
          });
        } catch (uploadError: any) {
          // Handle Cloudinary upload errors (same as create)
          if (
            uploadError.http_code === 400 &&
            uploadError.message?.includes('File size too large')
          ) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            const maxSizeMB = (10 * 1024 * 1024) / (1024 * 1024);

            throw new HttpException(
              `File "${file.originalname}" is too large (${fileSizeMB}MB). Maximum allowed size is ${maxSizeMB}MB.`,
              HttpStatus.BAD_REQUEST,
            );
          } else if (uploadError.http_code) {
            throw new HttpException(
              `Failed to upload image "${file.originalname}": ${uploadError.message}`,
              HttpStatus.BAD_REQUEST,
            );
          } else {
            throw new HttpException(
              `Failed to upload image "${file.originalname}": ${uploadError.message || 'Unknown error'}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }
      }

      // Merge final images - keep existing ones that weren't removed, plus new ones
      const finalImages = [
        ...existingImages.filter((img) =>
          frontendImagePublicIds.includes(img.publicId),
        ),
        ...newUploadedImages,
      ];

      // Prepare update data
      const updateData: any = {
        images: finalImages,
      };

      // Only update category field if provided
      if (payload.category)
        updateData.category = capitalizeWords(payload.category);

      return await this.prismaService.lawnCategory.update({
        where: { id },
        data: updateData,
      });
    } catch (error: any) {
      // If any upload fails during update, clean up newly uploaded images
      if (newUploadedImages.length > 0) {
        await this.cleanupUploadedImages(newUploadedImages);
      }

      // Re-throw the error if it's already an HttpException
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle unexpected errors
      throw new HttpException(
        `Failed to update lawn category: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Add this helper method if it doesn't exist
  private async cleanupUploadedImages(
    images: { url: string; publicId: string }[],
  ) {
    for (const img of images) {
      try {
        await this.cloudinaryService.removeFile(img.publicId);
      } catch (error) {
        console.error(`Failed to cleanup image: ${img.publicId}`, error);
      }
    }
  }
  async deleteLawnCategory(catID: number) {
    return await this.prismaService.lawnCategory.delete({
      where: { id: catID },
    });
  }

  // ─────────────────────────── LAWNS ───────────────────────────

  private isCurrentlyOutOfOrder(outOfOrders: any[]): boolean {
    if (!outOfOrders || outOfOrders.length === 0) return false;
    
    const now = new Date();
    return outOfOrders.some(period => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      return start <= now && end >= now;
    });
  }

  async getLawnWithOutOfOrders(id: number) {
    const lawn = await this.prismaService.lawn.findUnique({
      where: { id },
      include: {
        lawnCategory: true,
        outOfOrders: {
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!lawn) return null;

    return {
      ...lawn,
      isOutOfService: this.isCurrentlyOutOfOrder(lawn.outOfOrders),
    };
  }
  async createLawn(payload: LawnDto) {
    // Calculate isOutOfService based on outOfOrders if provided
    const hasOutOfOrders =
      payload.outOfOrders && payload.outOfOrders.length > 0;

    const data: any = {
      lawnCategoryId: Number(payload.lawnCategoryId),
      description: payload.description?.trim() || 'Lawn',
      minGuests: Number(payload.minGuests) || 0,
      maxGuests: Number(payload.maxGuests) || 0,
      memberCharges: new Prisma.Decimal(payload.memberCharges || 0),
      guestCharges: new Prisma.Decimal(payload.guestCharges || 0),
      isActive: true,
    };

    const lawn = await this.prismaService.lawn.create({
      data,
      include: {
        outOfOrders: true,
        lawnCategory: true,
      },
    });

    // Create out-of-order periods if provided
    if (payload.outOfOrders && payload.outOfOrders.length > 0) {
      for (const oo of payload.outOfOrders) {
        await this.prismaService.lawnOutOfOrder.create({
          data: {
            lawnId: lawn.id,
            reason: oo.reason.trim(),
            startDate: new Date(oo.startDate),
            endDate: new Date(oo.endDate),
          },
        });
      }
    }

    return this.getLawnWithOutOfOrders(lawn.id);
  }

  async updateLawn(payload: Partial<LawnDto>) {
    if (!payload.id) {
      throw new HttpException('Lawn ID is required', HttpStatus.BAD_REQUEST);
    }

    const lawnId = Number(payload.id);
    const existingLawn = await this.prismaService.lawn.findUnique({
      where: { id: lawnId },
      include: { outOfOrders: true },
    });

    if (!existingLawn) {
      throw new HttpException('Lawn not found', HttpStatus.NOT_FOUND);
    }

    // Calculate isOutOfService based on outOfOrders if provided
    const hasOutOfOrders =
      payload.outOfOrders && payload.outOfOrders.length > 0;

    const data: any = {
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
      isActive: payload.isActive,
    };

    const updatedLawn = await this.prismaService.lawn.update({
      where: { id: lawnId },
      data,
    });

    // Handle out-of-order periods
    if (payload.outOfOrders) {
      // Delete existing periods
      await this.prismaService.lawnOutOfOrder.deleteMany({
        where: { lawnId },
      });

      // Create new periods
      for (const oo of payload.outOfOrders) {
        await this.prismaService.lawnOutOfOrder.create({
          data: {
            lawnId,
            reason: oo.reason.trim(),
            startDate: new Date(oo.startDate),
            endDate: new Date(oo.endDate),
          },
        });
      }
    }

    return this.getLawnWithOutOfOrders(lawnId);
  }

  async getLawns() {
    return this.prismaService.lawn.findMany({
      include: { outOfOrders: {orderBy: {startDate: "asc"}}, lawnCategory: { select: { id: true, category: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCalendarLawns() {
    return this.prismaService.lawn.findMany({
      include: {
        lawnCategory: { select: { id: true, category: true } },
        bookings: {
          include: {
            member: {
              select: { Name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteLawn(lawnID: number) {
    return await this.prismaService.lawn.delete({
      where: { id: lawnID },
    });
  }
}
