import { IsNotEmpty, IsString } from "class-validator";


export class ResetPasswordDto {
    @IsNotEmpty()
    @IsString()
    sessionId!: string;

    @IsNotEmpty()
    @IsString()
    otp!: string;

    @IsNotEmpty()
    @IsString()
    password!: string;

    @IsNotEmpty()
    @IsString()
    userId!: string;
}