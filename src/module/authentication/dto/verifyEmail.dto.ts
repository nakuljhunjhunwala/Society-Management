import { IsNotEmpty, IsString } from "class-validator";


export class VerifyEmailDto {
    @IsNotEmpty()
    @IsString()
    sessionId!: string;

    @IsNotEmpty()
    @IsString()
    otp!: string;
}