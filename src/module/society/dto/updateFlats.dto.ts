import { IsArray, IsNotEmpty, IsString } from "class-validator";

class UpdateFlatsDto {
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    flatIds!: string[];
}

export default UpdateFlatsDto;