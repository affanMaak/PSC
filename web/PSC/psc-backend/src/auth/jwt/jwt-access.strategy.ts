import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { jwtExtractor } from "./jwt.extractor";



export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {

    constructor(){
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([jwtExtractor]),
            secretOrKey: process.env.JWT_ACCESS_SECRET!,
            ignoreExpiration: false
        })
    }

    async validate(payload: any) {
        return payload;        
    }

}

