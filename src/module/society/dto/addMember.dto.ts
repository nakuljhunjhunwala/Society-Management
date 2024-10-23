import { roles } from "@constants/common.constants.js";
import { IsArray, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class AddMemberDto {
    @IsNotEmpty()
    @IsString()
    userId!: string;

    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    flatNos!: string[];

    @IsNotEmpty()
    @IsString()
    @IsEnum(roles)
    role!: roles;
}