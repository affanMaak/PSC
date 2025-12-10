import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";


enum AdminRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
}

export class CreateAdminDto {
    @IsString({message: "Name must be a string"})
    name: string;
    
    @IsEmail({}, {message: "Invalid email format"})
    email: string;
    
    @IsString({message: "Password must be a string"})
    password: string;
    
    @IsEnum(AdminRole, {message: "Role must be either SUPER_ADMIN or ADMIN"})
    role: AdminRole;

    @IsOptional()
    updates?: any
}


