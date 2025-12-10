import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMemberDto } from './dtos/create-member.dto';
import { RoomTypeDto } from './dtos/room-type.dto';
import { capitalizeWords } from 'src/utils/CapitalizeFirst';
import { RoomDto } from './dtos/room.dto';
import { HallDto } from './dtos/hall.dto';
import { LawnCategory } from './dtos/lawn-category.dto';
import { LawnDto } from './dtos/lawn.dto';
import { PhotoShootDto } from './dtos/photoshoot.dto';
import { CreateSportDto } from './dtos/sport.dto';
import { Prisma, MemberStatus as prismaMemberStatus } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class AdminService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) { }

 
  async getAdmins() {
    const admins = await this.prismaService.admin.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return admins.sort((a, b) => {
      if (a.role === 'SUPER_ADMIN' && b.role !== 'SUPER_ADMIN') return -1;
      if (b.role === 'SUPER_ADMIN' && a.role !== 'SUPER_ADMIN') return 1;
      return 0;
    });
  }
}
