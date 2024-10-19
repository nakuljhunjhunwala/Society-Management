import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class RegisterUserDto {
  @IsOptional()
  @IsString()
  username!: string;

  @IsNotEmpty()
  @IsNumber()
  phoneNo!: number;

  @IsNotEmpty()
  @IsString()
  countryCode!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
