import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { roles } from '@constants/common.constants.js';
export interface ISocietyMembership {
  societyId: Schema.Types.ObjectId;
  role: roles;
  joinedAt: Date;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  societies: ISocietyMembership[];
  createdAt: Date;
  updatedAt: Date;
  profilePhoto: string;
}

const SocietyMembershipSchema: Schema = new Schema({
  societyId: {
    type: Schema.Types.ObjectId,
    ref: 'Society',
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(roles),
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    societies: [SocietyMembershipSchema],
  },
  { timestamps: true },
);

// Pre-save hook to hash password
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.pre<IUser>('updateOne', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
