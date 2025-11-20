import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMemberDto } from './dtos/create-member.dto';

import { Prisma, MemberStatus as prismaMemberStatus } from '@prisma/client';

@Injectable()
export class MemberService {
  constructor(private prismaService: PrismaService) {}

  async createMember(payload: CreateMemberDto) {
    const { Name, Email, Membership_No, Contact_No, Balance, Other_Details } =
      payload;

    const existingMember = await this.prismaService.member.findFirst({
      where: { OR: [{ Email }, { Contact_No }] },
    });
    if (existingMember)
      throw new HttpException('Member already exists', HttpStatus.BAD_REQUEST);

    return this.prismaService.member.create({
      data: { Name, Email, Membership_No, Contact_No, Balance, Other_Details },
    });
  }

  async createBulk(payload: CreateMemberDto[]) {
    const operations = payload.map((row) =>
      this.prismaService.member.upsert({
        where: { Membership_No: row.Membership_No!.toString() },
        update: {
          Name: row.Name!,
          Email: row.Email!,
          Contact_No: row.Contact_No!.toString(),
          Status:
            prismaMemberStatus[row.Status as keyof typeof prismaMemberStatus],
          Balance: Number(row.Balance!),
          Other_Details: row.Other_Details!,
        },
        create: {
          Membership_No: row.Membership_No!.toString(),
          Name: row.Name!,
          Email: row.Email!,
          Contact_No: row.Contact_No!.toString(),
          Status:
            prismaMemberStatus[row.Status as keyof typeof prismaMemberStatus],
          Balance: Number(row.Balance!),
          Other_Details: row.Other_Details!,
        },
      }),
    );

    await this.prismaService.$transaction(operations);
  }

  async updateMember(memberID: string, payload: Partial<CreateMemberDto>) {
    const memberExists = await this.prismaService.member.findFirst({
      where: { Membership_No: memberID.toString() },
    });
    if (!memberExists)
      throw new HttpException('Member not found', HttpStatus.NOT_FOUND);
    // console.log(payload)
    return this.prismaService.member.update({
      where: { Membership_No: memberID },
      data: {
        // Sno: Number(payload.Sno),
        Membership_No: payload.Membership_No,
        Name: payload.Name,
        Email: payload.Email,
        Contact_No: payload.Contact_No,
        Status: payload.Status,
        Other_Details: payload.Other_Details,
      },
    });
  }

  async removeMember(memberID: string) {
    return 'member deleted';
  }

  async getMembers({ page, limit, search, status }) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { Membership_No: { contains: search } },
        { Name: { contains: search } },
      ];
    }
    if (status && status !== 'all') {
      where.Status = { equals: status.toUpperCase() };
    }

    const [members, total] = await Promise.all([
      this.prismaService.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.member.count({ where }),
    ]);

    return {
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
      },
    };
  }

  async searchMembers(searchFor: string) {
    // Trim and avoid empty or too short searches
    const query = searchFor.trim();
    console.log(query);
    if (!query) return [];

    return await this.prismaService.member.findMany({
      where: {
        OR: [
          {
            Membership_No: {
              startsWith: query,
            },
          },
          {
            Name: {
              startsWith: query,
            },
          },
        ],
      },
      select: {
        Name: true,
        Balance: true,
        Membership_No: true,
        Status: true,
        Sno: true,
      },
      orderBy: {
        Membership_No: 'asc',
      },
      take: 15,
    });
  }
}
