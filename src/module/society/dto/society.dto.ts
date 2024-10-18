import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsNumber,
  IsDate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  @IsNotEmpty()
  street!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @IsNotEmpty()
  country!: string;

  @IsString()
  @IsNotEmpty()
  zipCode!: string;
}

class MaintenanceRateDto {
  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsDate()
  @Type(() => Date)
  effectiveFrom: Date = new Date();
}

export class CreateSocietyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  address!: AddressDto;

  @IsObject()
  @ValidateNested()
  @Type(() => MaintenanceRateDto)
  @IsNotEmpty()
  maintenanceRate!: MaintenanceRateDto;
}
