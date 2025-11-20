import { IsNotEmpty, IsOptional } from "class-validator";


export class LawnCategory{
    @IsOptional()
    id?: string;
    @IsNotEmpty()
    category: string;
}