import { IsNotEmpty, IsOptional } from "class-validator";

export class LawnDto {
  @IsOptional() id?: string;
  @IsNotEmpty() description: string;
  @IsNotEmpty() lawnCategoryId: string;
  @IsNotEmpty() minGuests: string;
  @IsNotEmpty() maxGuests: string;
  @IsNotEmpty() memberCharges: string;
  @IsNotEmpty() guestCharges: string;
  @IsOptional() isOutOfService?: string | boolean;
  @IsOptional() outOfServiceReason?: string;
  @IsOptional() outOfServiceUntil?: string;
  @IsOptional() existingimgs?: string | string[];
  @IsOptional() files?: Express.Multer.File[];
}