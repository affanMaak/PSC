import { $Enums } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumberString,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

export enum ChargeType {
    PER_DAY,
    PER_MONTH,
    PER_GAME,
    PER_HOUR,
}

export class SportChargeDto {
    @IsOptional()
    id?: string;
    @IsEnum(ChargeType)
    chargeType: $Enums.ChargeType;

    @IsOptional()
    memberCharges?: string | null;

    @IsOptional()
    spouseCharges?: string | null;

    @IsOptional()
    childrenCharges?: string | null;

    @IsOptional()
    guestCharges?: string | null;

    @IsOptional()
    affiliatedClubCharges?: string | null;
}

export class CreateSportDto {
    @IsOptional()
    id?: string;
    @IsString()
    @IsNotEmpty()
    activity: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    isActive: boolean;

    @IsOptional()
    timing?: any;  // JSON object for weekly schedule (Gents)

    @IsOptional()
    timingLadies?: any;  // JSON object for weekly schedule (Ladies)

    @IsString()
    @IsOptional()
    dressCodeDos?: string;

    @IsString()
    @IsOptional()
    dressCodeDonts?: string;

    @IsString()
    @IsOptional()
    dos?: string;

    @IsString()
    @IsOptional()
    donts?: string;

    @IsOptional()
    existingimgs?: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SportChargeDto)
    sportCharge: SportChargeDto[];
}
