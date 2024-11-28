import { OtpType } from '@constants/common.constants.js';
import mongoose, { Schema, Document } from 'mongoose';

interface IOtp extends Document {
    userId: Schema.Types.ObjectId;
    otp: string;
    createdAt?: Date;
    updatedAt?: Date;
    expiresAt?: Date;
    sessionId?: string;
    isValid?: boolean;
    metadata?: any;
    otpType?: OtpType;
}


const otpSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    otp: {
        type: String,
    },
    isValid: {
        type: Boolean,
        default: true,
    },
    expiresAt: {
        type: Date,
        default: new Date(Date.now() + 15 * 60000),
        index: { expires: '15m' },
    },
    sessionId: {
        type: String,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    otpType: {
        type: Object.values(OtpType),
        default: OtpType.NONE,
    }
}, { timestamps: true });

const OtpModal = mongoose.model<IOtp>('Otp', otpSchema);

export { IOtp, OtpModal };