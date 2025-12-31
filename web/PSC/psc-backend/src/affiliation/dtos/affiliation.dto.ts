import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateAffiliatedClubDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    contactNo?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @Type(()=> Boolean)
    @IsNotEmpty()
    isActive?: boolean;
}

export class UpdateAffiliatedClubDto {
    @Type(()=> Number)
    @IsNumber()
    id: number;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    contactNo?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @Type(()=> Boolean)
    @IsNotEmpty()
    isActive?: boolean;
}

export enum RequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export class CreateAffiliatedClubRequestDto {
    @IsNotEmpty({message: "membership number must be provided"})
    @Type(()=> String)
    membershipNo: string;
    
    @IsNotEmpty({message: "affiliated club must be selected"})
    @Type(()=> Number)
    affiliatedClubId: number;

    @IsNotEmpty({ message: "requested date must be provided" })
    requestedDate: string
}

export class UpdateRequestStatusDto {
    @IsNumber()
    id: number;

    @IsEnum(RequestStatus)
    status: RequestStatus;
}
