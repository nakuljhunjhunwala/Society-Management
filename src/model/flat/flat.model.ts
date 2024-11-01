import { OccupancyStatus } from '@constants/common.constants.js';
import mongoose, { Schema, Document } from 'mongoose';


interface IFlat extends Document {
    owner: Schema.Types.ObjectId;
    flatNo: string;
    society: Schema.Types.ObjectId;
    emergencyContact: string;
    occupancyStatus: OccupancyStatus;
}

const FlatSchema: Schema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    flatNo: {
        type: String,
        required: true,
        uppercase: true,
    },
    society: {
        type: Schema.Types.ObjectId,
        ref: 'Society',
    },
    emergencyContact: {
        type: String,
    },
    occupancyStatus: {
        type: String,
        enum: Object.values(OccupancyStatus),
        default: OccupancyStatus.OCCUPIED,
    }
});

const FlatModel = mongoose.model<IFlat>('Flat', FlatSchema);

export { IFlat, FlatModel };