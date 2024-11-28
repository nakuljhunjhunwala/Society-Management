import { OtpType, TokenType } from '@constants/common.constants.js';
import { OtpModelRespository } from '@model/otp/otp.respository.js';
import { IToken } from '@model/token/token.model.js';
import { TokenModelRespository } from '@model/token/token.respository.js';
import { IUser } from '@model/user/user.model.js';
import { UserModelRepository } from '@model/user/user.respository.js';

export class AuthRepository {
  private userRespository: UserModelRepository;
  private tokenRespository: TokenModelRespository;
  private otpRepository: OtpModelRespository;

  constructor() {
    this.userRespository = new UserModelRepository();
    this.tokenRespository = new TokenModelRespository();
    this.otpRepository = new OtpModelRespository();
  }

  async createUser(user: Partial<IUser>): Promise<IUser> {
    return this.userRespository.createUser(user);
  }

  async comparePassword(phoneNo: number, password: string): Promise<IUser> {
    try {
      const result = await this.userRespository.compareUserByPassword(
        phoneNo,
        password,
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async addToken(data: Partial<IToken>) {
    try {
      const result = await this.tokenRespository.addToken(data);
      return result;
    } catch (error) {
      throw {
        status: 500,
        message: 'Failed to add token to database',
      };
    }
  }

  async getToken(userId: string, deviceId: string, token: string) {
    try {
      const result = await this.tokenRespository.getRefreshToken(
        userId,
        deviceId,
        token,
      );
      return result;
    } catch (error) {
      throw {
        status: 500,
        message: 'Failed to get token from database',
      };
    }
  }

  async updateToken(id: String, data: Partial<IToken>) {
    try {
      const result = await this.tokenRespository.updateTokenBasedOnId(id, data);
      return result;
    } catch (error) {
      logger.error('Failed to set new data in mongo', error);
      return null;
    }
  }

  async revoke(userId: string, deviceId: string, type: TokenType = TokenType.REFRESH_TOKEN) {
    try {
      const result = await this.tokenRespository.revokeTokenBasedOnDeviceId(
        userId,
        deviceId,
        type
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async revokeAll(userId: string) {
    try {
      const result = await this.tokenRespository.revokeAllToken(userId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createOtp(userId: string, type: OtpType, metadata = {}) {
    const otp = await this.otpRepository.createOtp(userId, type, metadata);
    return otp;
  }

  async verifyOtp(userId: string, otp: string, type: OtpType, sessionId: string) {
    const result = await this.otpRepository.verifyOtp(userId, sessionId, type, otp);
    return result;
  }

  async markOtpAsInvalid(userId: string, sessionId: string) {
    const result = await this.otpRepository.markOtpAsInvalid(userId, sessionId);
    return result;
  }

  async invalideOldOtp(userId: string, type: OtpType) {
    const result = await this.otpRepository.invalideOldOtp(userId, type);
    return result;
  }

  async getResetToken(userId: string, deviceId: string, token: string) {
    const result = await this.tokenRespository.getToken(userId, deviceId, token, TokenType.RESET_TOKEN);
    return result;
  }

}
