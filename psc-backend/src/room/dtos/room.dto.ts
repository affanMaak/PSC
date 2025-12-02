import { IsNotEmpty, IsOptional } from 'class-validator';


export class RoomOutOfOrderDto {
    id: string;
  reason: string;
  startDate: string;
  endDate: string;
}

export class RoomDto {
    @IsOptional()
    id?: string | number
    @IsNotEmpty({message: "Room Number must be provied"})
    roomNumber: string;
    @IsNotEmpty({message: "Room type must be provided"})
    roomTypeId: string;
    @IsNotEmpty({message: "Description must be provided"})
    description: string;
    
    @IsNotEmpty({message: "Activity must be provided"})
    isActive: boolean | string;
    @IsOptional()
    existingimgs?: string[]; 
    @IsOptional()
    files?: Express.Multer.File[];
    @IsOptional()
    outOfOrders?: RoomOutOfOrderDto[];
}
