import { approvalActions, approvalStatus, ApproverType, roles } from '@constants/common.constants.js';
import { JoinSocietyApprovalDto } from '@dto/approval.dto.js';
import { isValidInstance } from '@utils/common.util.js';
import mongoose, { Schema, Document } from 'mongoose';


interface IApproval extends Document {
    requestedBy: Schema.Types.ObjectId;
    societyId: Schema.Types.ObjectId;
    approverType: ApproverType;
    approvers: string[];
    status: approvalStatus;
    approvedBy?: Schema.Types.ObjectId;
    approvedAt?: Date;
    action: approvalActions;
    metadata: JoinSocietyApprovalDto | any;
    reason?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const approvalSchema = new Schema({
    requestedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    societyId: {
        type: Schema.Types.ObjectId,
        ref: 'Society',
        required: true,
    },
    approverType: {
        type: String,
        enum: Object.values(ApproverType),
        required: true,
    },
    approvers: {
        type: [String],
        required: true,
        validate: {
            validator: function (approvers: any[]) {
                if ((this as any).approverType === ApproverType.USER) {
                    return approvers.every(approver => (approver instanceof Schema.Types.ObjectId || typeof approver === 'string'));
                } else if ((this as any).approverType === 'Role') {
                    return approvers.every(approver => typeof approver === 'string' && Object.values(roles).includes(approver as roles));
                }
                return false;
            },
            message: function () {
                return (this as any).approverType === ApproverType.USER
                    ? 'Approvers must be an array of valid user ObjectId\'s.'
                    : 'Approvers must be an array of valid roles.';
            },
        },
    },
    status: {
        type: String,
        enum: Object.values(approvalStatus),
        default: approvalStatus.PENDING,
    },
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    approvedAt: {
        type: Date,
    },
    reason: {
        type: String,
    },
    action: {
        type: String,
        enum: Object.values(approvalActions),
        required: true,
    },
    metadata: {
        type: Schema.Types.Mixed,
        validate: {
            validator: function (metadata: any) {
                return validateMetadata(this, metadata);
            },
            message: 'Invalid metadata for the action'
        }
    }
}, {
    timestamps: true,
});

function validateMetadata(_this: any, metadata: any) {
    const { action } = _this;
    if (action === approvalActions.JOIN_SOCIETY) {
        return isValidInstance(JoinSocietyApprovalDto, metadata);
    }
    return true;
}

const ApprovalModal = mongoose.model<IApproval>('Approval', approvalSchema);
export { ApprovalModal, IApproval };



