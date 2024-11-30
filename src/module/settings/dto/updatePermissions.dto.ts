import { roles } from '@constants/common.constants.js';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString, IsBoolean, IsEnum, ValidateNested } from 'class-validator';

export class PermissionsDto {
    @IsEnum(roles)
    role!: roles;

    @IsString()
    @IsNotEmpty()
    permission_code!: string;

    @IsBoolean()
    is_allowed!: boolean;
}

export default class UpdatePermissionsDto {
    @IsArray()
    @IsNotEmpty({ each: true })
    @ArrayMinSize(1)
    @ValidateNested()
    @Type(() => PermissionsDto)
    permissions!: PermissionsDto[];

    @IsString()
    @IsNotEmpty()
    societyId!: string;
}