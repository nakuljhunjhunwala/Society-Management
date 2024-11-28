import { TokenType } from '@constants/common.constants.js';
import mongoose, { Schema, Document } from 'mongoose';

interface IToken extends Document {
  userId: Schema.Types.ObjectId;
  deviceId: string;
  token: string;
  valid: boolean;
  ipAddress: string;
  type: TokenType;
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
  }
}, {
  timestamps: true,
});

const Token = mongoose.model<IToken>('Token', tokenSchema);
export { Token, IToken };
