import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsNumber,
  IsDate,
  ValidateNested,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { maintenancePaymentStatus } from '@constants/common.constants.js';


class AddMaintenancePaymentDto {
  @IsString()
  @IsNotEmpty()
  societyId!: string;

  @IsString()
  @IsNotEmpty()
  flatId!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  paymentDate!: Date;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  coversPeriodTo!: Date;

  @IsString()
  @IsOptional()
  @IsEnum(maintenancePaymentStatus)
  paymentStatus: maintenancePaymentStatus = maintenancePaymentStatus.PENDING;

  @IsString()
  @IsNotEmpty()
  paymentMethod!: string;

  @IsNumber()
  @IsOptional()
  appliedDiscount: number = 0;

  @IsString()
  @IsOptional()
  discountReason: string = 'No discount applied';
}

export default AddMaintenancePaymentDto;