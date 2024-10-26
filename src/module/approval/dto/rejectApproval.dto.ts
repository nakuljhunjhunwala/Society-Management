import {
    IsNotEmpty,
    IsString,
} from 'class-validator';

class RejectApprovalDto {
    @IsNotEmpty()
    @IsString()
    reason!: string;
}

export default RejectApprovalDto;