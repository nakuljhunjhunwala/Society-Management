import { IsNotEmpty, IsString } from "class-validator";
import { Express } from "express";

export class BulkFileUploadDto {
    // @IsNotEmpty()
    // file!: Express.Multer.File;

    @IsNotEmpty()
    @IsString()
    societyId!: string;
}