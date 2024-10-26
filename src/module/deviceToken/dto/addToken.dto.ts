import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

class AddDeviceTokenDto {
  @IsString()
  @IsNotEmpty()
  deviceToken!: string;
}

export default AddDeviceTokenDto;