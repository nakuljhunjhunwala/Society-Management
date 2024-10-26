import mongoose, { Schema, Document } from 'mongoose';


interface IDeviceToken extends Document {
    userId: Schema.Types.ObjectId;
    deviceToken: string;
    deviceId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    isValid?: boolean;
}


const deviceTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    deviceToken: {
        type: String,
        required: true,
    },
    isValid: {
        type: Boolean,
        default: true,
    },
    deviceId: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const DeviceTokenModal = mongoose.model<IDeviceToken>('DeviceToken', deviceTokenSchema);

export { IDeviceToken, DeviceTokenModal };