import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from './jwt/jwt-access.strategy';
import { JwtRefreshStrategy } from './jwt/jwt-refresh.strategy';
import { PassportModule } from '@nestjs/passport';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [PrismaModule, PassportModule, MailerModule, JwtModule.register({})],
  providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
