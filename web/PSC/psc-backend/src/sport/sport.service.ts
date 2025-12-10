import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSportDto } from './dtos/sport.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SportService {

    constructor(private prismaService: PrismaService){}

    // --------------------------- SPORTS ---------------------------------
    async getSports() {
        return await this.prismaService.sport.findMany({
            include: { sportCharge: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createSport(payload: CreateSportDto) {
        return await this.prismaService.sport.create({
            data: {
                activity: payload.activity,
                description: payload.description,
                isActive: Boolean(payload.isActive),
                sportCharge: {
                    create: payload.sportCharge.map((c) => ({
                        chargeType: c.chargeType,
                        memberCharges: c.memberCharges?.toString(),
                        spouseCharges: c.spouseCharges?.toString(),
                        childrenCharges: c.childrenCharges?.toString(),
                        guestCharges: c.guestCharges?.toString(),
                        affiliatedClubCharges: c.affiliatedClubCharges?.toString(),
                    })),
                },
            },
            include: { sportCharge: true },
        });
    }
    async updateSport(payload: Partial<CreateSportDto>) {
        if (!payload.id)
            throw new HttpException(
                'Sport/Activity ID is required',
                HttpStatus.BAD_REQUEST,
            );
        return await this.prismaService.sport.update({
            where: { id: Number(payload.id) },
            data: {
                activity: payload.activity,
                description: payload.description,
                isActive: payload.isActive,
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
        });
    }
    async deleteSport(payload) {
        console.log(payload);
    }
}
