import { PlatForm } from '@constants/common.constants.js';
import mongoose, { Schema, Document } from 'mongoose';


interface IAppVersion extends Document {
    platform: PlatForm;
    version: string;
    minSuitableVersion: string;
    releaseDate: Date;
    updateMessage: string;
    updateUrl: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const appVersionSchema = new Schema({
    platform: {
        type: String,
        enum: Object.values(PlatForm),
        required: true,
    },
    version: {
        type: String,
        required: true,
    },
    minSuitableVersion: {
        type: String,
        required: true,
    },
    releaseDate: {
        type: Date,
        required: true,
    },
    updateMessage: {
        type: String,
        required: true,
    },
    updateUrl: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const AppVersionModal = mongoose.model('AppVersion', appVersionSchema);

export { IAppVersion, AppVersionModal };
