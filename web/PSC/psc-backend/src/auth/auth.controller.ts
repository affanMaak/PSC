import {
    Body,
    Controller,
    Patch,
    Post,
    Get,
    Query,
    Req,
    Res,
    UseGuards,
    Delete,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { AuthService } from './auth.service';
import { LoginAdminDto } from './dtos/login-admin.dto';
import { JwtRefGuard } from 'src/common/guards/jwt-refresh.guard';
import { JwtAccGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from 'src/common/constants/roles.enum';
import { OTP_MSG } from './utils/messages';
import { generateRandomNumber } from './utils/genOTP';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('create/super-admin')
    async createSuperAdmin(@Body() payload: CreateAdminDto) {
        return await this.authService.createSuperAdmin(payload);
    }

    @UseGuards(JwtAccGuard, RolesGuard)
    @Roles(RolesEnum.SUPER_ADMIN)
    @Patch('update/admin')
    async updateAdmin(
        @Query() adminID: { adminID: string },
        @Body() payload: Partial<CreateAdminDto>,
    ) {
        return await this.authService.updateAdmin(
            Number(adminID?.adminID),
            payload,
        );
    }

    @UseGuards(JwtAccGuard, RolesGuard)
    @Roles(RolesEnum.SUPER_ADMIN)
    @Post('create/admin')
    async createAdmin(@Body() payload: CreateAdminDto) {
        return await this.authService.createAdmin(payload);
    }

    @UseGuards(JwtAccGuard, RolesGuard)
    @Roles(RolesEnum.SUPER_ADMIN)
    @Delete('remove/admin')
    async removeAdmin(@Query() adminID: { adminID: string }) {
        return await this.authService.removeAdmin(Number(adminID?.adminID));
    }

    @Post('login/admin')
    async loginAdmin(
        @Body() payload: LoginAdminDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const clientType = req.headers['client-type'] || 'web';
        const admin = await this.authService.loginAdmin(payload);
        // return jwt cookie if clientType == web || return jwt/json object if clientType == native/mobile
        const { access_token, refresh_token } =
            await this.authService.generateTokens({ ...admin, permissions: Array.isArray(admin.permissions) ? admin.permissions : [] });
        if (clientType === 'web') {
            res.cookie('access_token', access_token, {
                httpOnly: true,
                // secure: process.env.NODE_ENV === 'production',
                // sameSite: true,
                sameSite: 'lax',
                secure: false,
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            });
            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                // secure: process.env.NODE_ENV === 'production',
                // sameSite: true,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            return res.status(200).json({ message: 'Login successful' });
        }
        return res.status(200).json({
            access_token,
            refresh_token,
        });
    }

    @Post('logout')
    async logoutAdmin(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const clientType = req.headers['client-type'] || 'web';
        if (clientType === 'web') {
            res.clearCookie('access_token');
            res.clearCookie('refresh_token');
            return { message: 'Logout successful' };
        }
        return { message: 'Logout successful' };
    }

    @UseGuards(JwtRefGuard)
    @Post('refresh-tokens')
    async refreshTokens(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const clientType = req.headers['client-type'] || 'web';
        const { id, name, email, role, permissions } = req.user as {
            id: string | number;
            name: string;
            email: string;
            role: string;
            permissions?: any[];
        };
        const { access_token, refresh_token } =
            await this.authService.refreshTokens({ id, name, email, role, permissions: Array.isArray(permissions) ? permissions : [] });
        // for web
        if (clientType === 'web') {
            res.cookie('access_token', access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: true,
                maxAge: 24 * 60 * 60 * 1000,
            });
            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return { message: 'Login successful' };
        }
        // for mobile
        return { refresh_token: refresh_token, access_token: access_token };
    }

    @UseGuards(JwtAccGuard)
    @Get('user-who')
    async userWho(
        @Req() req: { user: { id: string | undefined; role: string | undefined, permissions: any[] } },
    ) {
        if (req?.user?.role != RolesEnum.ADMIN) {
            if (req?.user?.role != RolesEnum.SUPER_ADMIN) {

                const activeUser = await this.authService.checkActive(req.user?.id!);
                if (!activeUser) {
                    throw new HttpException(
                        'User is not active. Please contact support.',
                        HttpStatus.FORBIDDEN,
                    );
                }
            }
        }
        return { id: req.user?.id, role: req.user?.role, permissions: req.user?.permissions };
    }

    // members

    @Post('sendOTP/member')
    async sendOTP(@Body() payload: { memberID: string }) {
        const member = await this.authService.getMember(payload?.memberID);

        // Check if member is blocked - prevent login
        if (member.Status === 'BLOCKED') {
            throw new HttpException(
                'Your account has been blocked. Please contact the club administration for assistance.',
                HttpStatus.FORBIDDEN,
            );
        }

        // generate an OTP and combine with OTP_MSG
        const otp = generateRandomNumber(4) || 1234;
        // store in member table
        await this.authService.storeOTP(member?.Membership_No, otp);
        return this.authService.sendOTP(
            member?.Email!,
            'Login Request',
            `${OTP_MSG} <br/>
                <p style="
                background-color:#FE9A00;
                color:#ffffff;
                font-size:24px;
                font-weight:bold;
                border-radius:8px;
                padding:12px 24px;
                text-align:center;
                position:absolute;
                top:50%;
                left:50%;
                transform:translate(-50%, -50%);
                margin:0;
                ">
                ${otp}
                </p>`,
        );
    }

    @Post('login/member')
    async loginMember(@Body() payload: { memberID: string, otp: string }, @Req() req: Request, @Res() res: Response,) {
        const clientType = req.headers['client-type'] || 'web';
        const authenticated = await this.authService.loginMember(payload?.memberID, Number(payload?.otp))
        if (!authenticated) {
            return res.status(500).json({ message: 'Login un-successful' });
        }

        const { Name, Email, Status, Membership_No } = authenticated;

        // return jwt cookie if clientType == web || return jwt/json object if clientType == native/mobile
        const { access_token, refresh_token } =
            await this.authService.generateTokens({ name: Name, email: Email!, status: Status, id: Membership_No });
        if (clientType === 'web') {
            res.cookie('access_token', access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: true,
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            });
            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: true,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            return res.status(200).json({ message: 'Login successful' });
        }
        return res.status(200).json({
            access_token,
            refresh_token,
        });
    }
}
