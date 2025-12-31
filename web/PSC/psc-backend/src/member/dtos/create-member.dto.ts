import { IsNotEmpty, IsOptional } from "class-validator";


export class CreateMemberDto {
    @IsOptional()
    Sno?: number
    @IsNotEmpty({message: "Member ID cannot be empty"})
    Membership_No: string;

    @IsNotEmpty({message: "Name cannot be empty"})
    Name: string;
    
    @IsNotEmpty({message: "Email cannot be empty"})
    Email: string;
    
    @IsNotEmpty({message: "Phone cannot be empty"})
    Contact_No: string;
    
    @IsNotEmpty({message: "Status cannot be empty"})
    Status: "ACTIVE" | "DEACTIVATED" | "BLOCKED"
    
    @IsOptional()
    Balance?: string;
    @IsOptional()
    Other_Details?: string;
    
    @IsOptional()
    otp?: string;
    @IsOptional()
    otpExpiry?: String;


}
