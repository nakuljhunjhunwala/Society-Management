import { IsArray, IsNotEmpty, IsString } from "class-validator";

class UpdateFlatsDto {
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    flatNos!: string[];
}

export default UpdateFlatsDto;