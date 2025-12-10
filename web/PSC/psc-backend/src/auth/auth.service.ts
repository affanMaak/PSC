import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { LoginAdminDto } from './dtos/login-admin.dto';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private mailer: MailerService,
    ) { }

    async generateTokens(payload: {
        id: number | string;
        name: string;
        email: string;
        role?: string;
        status?: string;
        permissions?: any[];
    }) {
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET!,
            expiresIn: '1d',
        });
        const refresh_token = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET!,
            expiresIn: '7d',
        });
        return { access_token: accessToken, refresh_token: refresh_token };
    }

    async refreshTokens(payload: {
        id: number | string;
        name: string;
        email: string;
        role?: string;
        status?: string;
        permissions?: any[];
    }) {
        return this.generateTokens(payload);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async createSuperAdmin(payload: CreateAdminDto) {
        const { name, email, password } = payload;
        // check if email exists
        const existingAdmin = await this.prisma.admin.findUnique({
            where: { email: email },
        });
        if (existingAdmin) {
            throw new HttpException(
                'Super Admin with this email already exists',
                HttpStatus.BAD_REQUEST,
            );
        }
        // hash the password
        const hashedPass = await bcrypt.hash(password, 10);
        return this.prisma.admin.create({
            data: {
                name,
                password: hashedPass,
                email,
                role: 'SUPER_ADMIN',
            },
        });
    }

    async removeAdmin(adminID: number) {
        const existingAdmin = await this.prisma.admin.findUnique({
            where: { id: adminID },
        });
        if (!existingAdmin) {
            throw new HttpException('Admin not found', HttpStatus.BAD_REQUEST);
        }
        return this.prisma.admin.delete({ where: { id: adminID } });
    }
    async createAdmin(payload: CreateAdminDto) {
        const { name, email, password } = payload;
        const existingAdmin = await this.prisma.admin.findUnique({
            where: { email: email },
        });
        if (existingAdmin) {
            throw new HttpException(
                'Admin with this email already exists',
                HttpStatus.BAD_REQUEST,
            );
        }

        // hash pass
        const hashedPass = await bcrypt.hash(password, 10);
        return this.prisma.admin.create({
            data: {
                name,
                password: hashedPass,
                email,
                role: 'ADMIN',
            },
        });
    }

    async updateAdmin(
        adminID: number,
        payload: Partial<CreateAdminDto> & { updates?: { permissions?: string[] } },
    ) {
        const admin = await this.prisma.admin.findUnique({
            where: { id: adminID },
        });

        if (!admin) {
            throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
        }

        const updateData: any = {};

        // Update password if provided
        if (payload.password) {
            updateData.password = await bcrypt.hash(payload.password, 10);
        }

        // Update permissions if provided in payload.updates
        if (payload.updates?.permissions) {
            if (!Array.isArray(payload.updates.permissions)) {
                throw new HttpException(
                    'Permissions must be an array',
                    HttpStatus.BAD_REQUEST,
                );
            }
            updateData.permissions = payload.updates.permissions;
        }

        // Copy over other fields (name, email, role, etc.)
        Object.keys(payload).forEach((key) => {
            if (key !== 'password' && key !== 'updates') {
                updateData[key] = payload[key];
            }
        });

        return this.prisma.admin.update({
            where: { id: adminID },
            data: updateData,
        });
    }

    async loginAdmin(payload: LoginAdminDto) {
        const { email, password } = payload;
        // find the admin email
        const admin = await this.prisma.admin.findUnique({
            where: { email: email },
        });
        if (!admin) {
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }

        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) {
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }

        return admin;
    }

    // members
    async getMember(memberID: string) {
        const member = await this.prisma.member.findUnique({
            where: { Membership_No: String(memberID) },
        });
        if (!member) {
            throw new HttpException('member not found', HttpStatus.BAD_REQUEST);
        }
        return member;
    }
    async checkActive(Membership_No: string){
        return await this.prisma.member.findFirst({where: {Membership_No, Status: "ACTIVE"}})
    }

    async sendOTP(to: string, subject: string, body: string) {
        return await this.mailer.sendMail(to, subject, body);
    }
    async storeOTP(memberID: string, otp: number) {
        const otpSaved = await this.prisma.member.update({
            where: { Membership_No: String(memberID) },
            data: { otp },
        });
        if (!otpSaved) {
            throw new HttpException(
                'Unknow Error while saving otp for member',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
        return otpSaved;
    }

    async loginMember(memberID: string, otp: number) {
        // check otp against the memberID
        const matched = await this.prisma.member.findFirst({
            where: { Membership_No: String(memberID), otp },
        });
        if (!matched) {
            throw new HttpException("OTP Didn't match", HttpStatus.NOT_ACCEPTABLE);
        }
        await this.prisma.member.update({
            where: { Membership_No: String(memberID) },
            data: { otp: null },
        });
        return matched;
    }
}
