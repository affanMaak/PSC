import { IsNotEmpty, IsOptional } from "class-validator";

export class PhotoShootDto{
    @IsOptional()
    id?: string;
    @IsNotEmpty({message: "Description should be provided"})
    description: string;
    @IsNotEmpty({message: "Member Charges should be provided"})
    memberCharges: string;
    @IsNotEmpty({message: "Guest Charges should be provided"})
    guestCharges: string;
}