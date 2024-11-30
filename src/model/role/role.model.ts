import mongoose, { Schema, Document } from 'mongoose';

interface IRole extends Document {
    society_id: Schema.Types.ObjectId;
    name: string;
    role: string;
    permissions: Array<{
        permission_code: string;
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
    role: {
        type: String,
        required: true
    },
    permissions: [{
        permission_code: {
            type: String,
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

export { RoleModel, IRole };