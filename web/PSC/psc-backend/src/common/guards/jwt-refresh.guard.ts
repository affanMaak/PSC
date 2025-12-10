
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";


@Injectable()
export class JwtRefGuard extends AuthGuard("jwt-refresh"){}
