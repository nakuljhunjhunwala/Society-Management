import { IsEmail, IsNotEmpty } from "class-validator";


export class AddEmailDto {
    @IsNotEmpty()
    @IsEmail()
    email!: string;
}