import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsNumber()
  phoneNo!: number;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
