import { IsNotEmpty, IsOptional } from "class-validator";

export class HallDto {
    @IsOptional()
    id?: string
    @IsNotEmpty({message: "hall name must be provided"})
    name: string;
    @IsNotEmpty({message: "description must be provided"})
    description: string;

    @IsNotEmpty({message: "hall capacity must be provided"})
    capacity: string;
    @IsNotEmpty({message: "hall charges for members must be provided"})
    chargesMembers: string;
    @IsNotEmpty({message: "hall charges for guests must be provided"})
    chargesGuests: string;

    @IsNotEmpty({message: "hall activity must be provided"})
    isActive: boolean | string;
    @IsNotEmpty({message: "hall activity must be provided"})
    isOutOfService: boolean | string;

    @IsOptional()
    outOfServiceReason?: string;
    @IsOptional()
    outOfServiceFrom?: string;
    @IsOptional()
    outOfServiceUntil?: string;

    @IsOptional()
    existingimgs?: string[]; 
    @IsOptional()
    files?: Express.Multer.File[];
   
}