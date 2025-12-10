import { IsNotEmpty, IsOptional } from "class-validator";


export class OutOfOrderPeriod {
  @IsOptional()
  id?: string;
  @IsNotEmpty({message: "reason must be provided"})
  reason: string;
  @IsNotEmpty({message: "start date must be provided"})
  startDate: string;
  @IsNotEmpty({message: "end date must be provided"})
  endDate: string;
  @IsOptional()
  hallId?: string;
  @IsOptional()
  createdAt?: string;
  @IsOptional()
  updatedAt?: string;
}

export class HallDto {
    @IsOptional()
    id?: string
    @IsNotEmpty({message: "hall name must be provided"})
    name: string;
    @IsOptional()
    description?: string;

    @IsNotEmpty({message: "hall capacity must be provided"})
    capacity: string;
    @IsNotEmpty({message: "hall charges for members must be provided"})
    chargesMembers: string;
    @IsNotEmpty({message: "hall charges for guests must be provided"})
    chargesGuests: string;

    @IsNotEmpty({message: "hall activity must be provided"})
    isActive: boolean | string;
    @IsOptional()
    outOfOrders?: OutOfOrderPeriod[];
    @IsOptional()
    existingimgs?: string[]; 
    @IsOptional()
    files?: Express.Multer.File[];
   
}