import {
  IsNotEmpty,
  IsObject,
  IsDate,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsString,
  IsArray,
} from 'class-validator';
import { approvalActions, approvalStatus, ApproverType, InviteType, maintenancePaymentStatus } from '@constants/common.constants.js';

class CreateApprovalDto {
  @IsNotEmpty()
  @IsString()
  societyId!: string;

  @IsNotEmpty()
  @IsEnum(ApproverType)
  approverType!: ApproverType;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  approvers!: string[];

  @IsEnum(approvalStatus)
  status: approvalStatus = approvalStatus.PENDING;

  @IsNotEmpty()
  @IsEnum(approvalActions)
  action: approvalActions = approvalActions.JOIN_SOCIETY;

  @IsOptional()
  @IsObject()
  metadata: any = {};

}

export default CreateApprovalDto;