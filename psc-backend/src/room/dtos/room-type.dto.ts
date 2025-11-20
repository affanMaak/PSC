import { IsNotEmpty, IsOptional } from "class-validator";



export class RoomTypeDto {

    @IsNotEmpty({message: "Room type cannot be empty"})
    type: string;

    @IsNotEmpty({message: "Price for Member must be provided"})
    priceMember: number
    @IsNotEmpty({message: "Price for Guest must be provided"})
    priceGuest: number
    @IsOptional()
    existingimgs?: string[]
}
