import { IsNotEmpty, IsOptional } from "class-validator";



export class NotificationDto {
    @IsNotEmpty({ message: "title is required" })
    title: string;
    @IsNotEmpty({ message: "description is required" })
    description: string;
    @IsOptional()
    recipients?: string[] | string;
    @IsOptional()
    sendToAll?: boolean;
    @IsOptional()
    sendToActive?: boolean;
    @IsOptional()
    sendToDeactivated?: boolean;
    @IsOptional()
    sendToBlocked?: boolean;

}