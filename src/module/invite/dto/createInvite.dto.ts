import {
  IsNotEmpty,
  IsObject,
  IsDate,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { InviteType, maintenancePaymentStatus } from '@constants/common.constants.js';

class CreateInviteDto {
  @IsNotEmpty()
  @IsEnum(InviteType)
  inviteType!: InviteType;

  @IsNotEmpty()
  @IsDate()
  expireBy!: Date;

  @IsObject()
  @IsOptional()
  metadata: any = {};

  @IsNotEmpty()
  @IsBoolean()
  requiresApproval: boolean = false;

}

export default CreateInviteDto;