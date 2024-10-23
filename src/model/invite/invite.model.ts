import { InviteType } from '@constants/common.constants.js';
import mongoose, { Schema } from 'mongoose';

interface IInvite {
    societyId: Schema.Types.ObjectId;
    inviteType: InviteType;
    expireBy: Date;
    createdBy: Schema.Types.ObjectId;
    metadata: any;
    requiresApproval: boolean;
    updatedBy?: Schema.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const inviteSchema = new Schema({
    societyId: {
        type: Schema.Types.ObjectId,
        ref: 'Society',
        required: true,
    },
    inviteType: {
        type: String,
        enum: Object.values(InviteType),
        required: true,
    },
    expireBy: {
        type: Date,
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    metadata: {
        type: Schema.Types.Mixed,
        default: {},
    },
    requiresApproval: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

const InviteModel = mongoose.model<IInvite>('Invite', inviteSchema);

export { IInvite, InviteModel };
