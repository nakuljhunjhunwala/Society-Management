import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { roles } from '@constants/common.constants.js';
export interface ISocietyMembership {
  societyId: Schema.Types.ObjectId;
  role: roles;
  joinedAt: Date;
  flats: string[];
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
  phoneNo: number;
  countryCode: string;
  hasRegistered: boolean;
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
  flats: {
    type: [String],
    default: [],
  }
}, { _id: false });

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: Number,
      required: true,
      unique: true,
      min: 1000000000,
      max: 9999999999,
    },
    countryCode: {
      type: String,
      required: true,
      default: '+91',
    },
    hasRegistered: {
      type: Boolean,
      default: false,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    societies: [SocietyMembershipSchema],
  },
  { timestamps: true },
);

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;
  if (!update) {
    return next();
  }
  if (update.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
      this.setUpdate(update);
      next();
    } catch (err) {
      next(err as any);
    }
  } else {
    next();
  }
});

SocietyMembershipSchema.pre<ISocietyMembership>('save', function (next) {
  this.flats = this.flats.map((flat) => flat.toUpperCase());
  next();
});

SocietyMembershipSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;
  if (!update) {
    return next();
  }
  if (update.flats) {
    update.flats = update.flats.map((flat: string) => flat.toUpperCase());
    this.setUpdate(update);
  }
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
