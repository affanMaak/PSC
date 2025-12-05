import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum } from 'class-validator';

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
    description?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateAffiliatedClubDto {
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
    description?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export enum RequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export class CreateAffiliatedClubRequestDto {
    @IsString()
    membershipNo: string;

    @IsNumber()
    affiliatedClubId: number;

    @IsOptional()
    @IsNumber()
    guestCount?: number;

    @IsOptional()
    @IsString()
    purpose?: string;
}

export class UpdateRequestStatusDto {
    @IsNumber()
    id: number;

    @IsEnum(RequestStatus)
    status: RequestStatus;
}
