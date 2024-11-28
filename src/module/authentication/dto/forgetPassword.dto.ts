import { IsEmail, IsNumber, IsOptional } from "class-validator";

class ForgetPasswordDto {
    @IsOptional()
    @IsEmail()
    email!: string;

    @IsOptional()
    @IsNumber()
    phoneNo!: number;
}

export default ForgetPasswordDto;