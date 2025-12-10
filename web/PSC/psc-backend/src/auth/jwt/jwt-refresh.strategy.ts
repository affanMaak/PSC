// src/auth/strategies/jwt-refresh.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';

const refreshTokenExtractor = (req: Request): string | null => {
  // Mobile:
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }

  // Web: 
  if (req.cookies?.refresh_token) {
    return req.cookies.refresh_token;
  }

  return null;
};

export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([refreshTokenExtractor]),
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
      const refreshToken =
      req.cookies?.refresh_token ||
      req.headers.authorization?.split(' ')[1];

    if (!refreshToken) throw new UnauthorizedException();

    return payload;
  }
}
