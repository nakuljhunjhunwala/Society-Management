import { IsNotEmpty, IsString } from "class-validator";


export class VerifyOtpForResetPasswordDto {
    @IsNotEmpty()
    @IsString()
    sessionId!: string;

    @IsNotEmpty()
    @IsString()
    otp!: string;

    @IsNotEmpty()
    @IsString()
    userId!: string;
}