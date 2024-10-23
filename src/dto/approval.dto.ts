import { roles } from "@constants/common.constants.js";
import { IsArray, IsEnum, IsString } from "class-validator";

export class JoinSocietyApprovalDto {
    @IsArray()
    @IsString({ each: true })
    flatNos!: string[];

    @IsString()
    @IsEnum(roles)
    role!: string;
}