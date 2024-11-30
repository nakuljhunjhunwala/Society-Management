import { TokenType } from '@constants/common.constants.js';
import { Token, IToken } from './token.model.js';

export class TokenModelRespository {
  constructor() { }

  async getRefreshToken(userId: string, deviceId: string, refreshToken: string) {
    return await Token.findOne({
      userId: userId,
      deviceId: deviceId,
      token: refreshToken,
      valid: true,
      type: TokenType.REFRESH_TOKEN,
    });
  }

  async getToken(userId: string, deviceId: string, token: string, type: TokenType) {
    return await Token.findOne({
      userId: userId,
      deviceId: deviceId,
      token: token,
      valid: true,
      type: type,
    });
  }

  async addToken(data: Partial<IToken>) {
    return await new Token(data).save();
  }

  async revokeAllToken(userId: string) {
    return await Token.updateMany({ userId, valid: true }, { valid: false, expiresAt: new Date() });
  }

  async revokeTokenBasedOnDeviceId(userId: string, deviceId: string, type: TokenType = TokenType.REFRESH_TOKEN) {
    return await Token.updateMany(
      { userId: userId, deviceId: deviceId, valid: true, type: type },
      { valid: false, expiresAt: new Date() },
    );
  }

  async updateTokenBasedOnId(id: String, data: Partial<IToken>) {
    return await Token.updateOne({ _id: id }, data);
  }
}
