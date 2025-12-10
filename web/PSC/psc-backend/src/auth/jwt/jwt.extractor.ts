import {Request} from "express"

export const jwtExtractor = (req: Request): string |null=>{
    // authorization bearer -- mobile
    if(req.headers.authorization?.startsWith("Bearer ")){
        return req.headers.authorization.split(" ")[1];
    }

    // cookie -- web
    // if(req.cookies?.psc){
    //     return req.cookies.psc
    // }
    if(req.cookies?.access_token){
        return req.cookies.access_token
    }

    return null
}