import { IsNotEmpty, IsOptional } from "class-validator";



export class LawnOutOfOrderDto {
  @IsOptional()
  id?: number;
  @IsNotEmpty({ message: "reason must be provided" })
  reason: string;
  @IsNotEmpty({ message: "start date must be provided" })
  startDate: string;
  @IsNotEmpty({ message: "end date must be provided" })
  endDate: string;
}

export class LawnDto {
  @IsOptional() id?: string;
  @IsOptional() description?: string;
  @IsNotEmpty() lawnCategoryId: string;
  @IsNotEmpty() minGuests: string;
  @IsNotEmpty() maxGuests: string;
  @IsNotEmpty() memberCharges: string;
  @IsNotEmpty() guestCharges: string;
  @IsNotEmpty({ message: "lawn activity must be provided" })
  isActive: boolean | string;
  @IsOptional()
  isOutOfService?: boolean;
  @IsOptional() outOfOrders?: LawnOutOfOrderDto[];
}