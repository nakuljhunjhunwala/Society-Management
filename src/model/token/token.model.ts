import { TokenType } from '@constants/common.constants.js';
import mongoose, { Schema, Document } from 'mongoose';

interface IToken extends Document {
  userId: Schema.Types.ObjectId;
  deviceId: string;
  token: string;
  valid: boolean;
  ipAddress: string;
  type: TokenType;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tokenSchema = new Schema<IToken>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  deviceId: { type: String, required: true },
  token: { type: String, required: true },
  valid: { type: Boolean, default: true },
  ipAddress: { type: String },
  type: {
    type: String,
    enum: Object.values(TokenType),
    default: TokenType.REFRESH_TOKEN,
  },
  expiresAt: { type: Date },
}, {
  timestamps: true,
});

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const twoMonthsInSeconds = 2 * 30 * 24 * 60 * 60;
tokenSchema.index({ updatedAt: 1 }, { expireAfterSeconds: twoMonthsInSeconds });

const Token = mongoose.model<IToken>('Token', tokenSchema);
export { Token, IToken };
