import { IsNotEmpty } from 'class-validator';

export class SendOtpDto {
  @IsNotEmpty()
  memberID: string;
}
