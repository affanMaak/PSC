import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PhotoShootDto } from './dtos/photoshoot.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PhotoshootService {
    constructor(private prismaService: PrismaService) { }

    // ─────────────────────────── PHOTOSHOOT ───────────────────────────
    async createPhotoShoot(payload: PhotoShootDto) {
        return await this.prismaService.photoshoot.create({
            data: {
                description: payload.description,
                memberCharges: Number(payload.memberCharges),
                guestCharges: Number(payload.guestCharges),
            },
        });
    }

    async getPhotoshoots() {
        return await this.prismaService.photoshoot.findMany({
            include: {
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

    async updatePhotoshoot(payload: Partial<PhotoShootDto>) {
        if (!payload.id)
            throw new HttpException(
                'Photoshoot ID is required',
                HttpStatus.BAD_REQUEST,
            );

        return await this.prismaService.photoshoot.update({
            where: { id: Number(payload.id) },
            data: {
                description: payload.description,
                memberCharges: Number(payload.memberCharges),
                guestCharges: Number(payload.guestCharges),
            },
        });
    }

    async deletePhotoshoot(id: number) {
        return await this.prismaService.photoshoot.delete({
            where: { id },
        });
    }
}
