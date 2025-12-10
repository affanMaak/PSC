
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";


@Injectable()
export class JwtAccGuard extends AuthGuard("jwt-access"){}
