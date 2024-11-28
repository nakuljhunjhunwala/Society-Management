import mongoose, { Schema, Document } from 'mongoose';


const permissionSchema = new Schema({
    permission_id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    plans: []
}, {
    timestamps: true
});

interface IPermission extends Document {
    permission_id: number;
    name: string;
    code: string;
    category: string;
    description: string;
    plans: any[];
}

const PermissionModel = mongoose.model<IPermission>('Permission', permissionSchema);

