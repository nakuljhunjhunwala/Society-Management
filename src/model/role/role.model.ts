import mongoose, { Schema, Document } from 'mongoose';

interface IRole extends Document {
    society_id: Schema.Types.ObjectId;
    name: string;
    code: string;
    permissions: Array<{
        permission_id: Schema.Types.ObjectId;
        is_allowed: boolean;
    }>;
}

const roleSchema = new Schema({
    society_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Society',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    permissions: [{
        permission_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Permission',
            required: true
        },
        is_allowed: {
            type: Boolean,
            default: false
        }
    }]
}, {
    timestamps: true,
    indexes: [
        { fields: { society_id: 1, code: 1 }, unique: true }
    ]
});





const RoleModel = mongoose.model<IRole>('Role', roleSchema);