import { RegisterUserDto } from './dto/register.dto.js';
import { AuthRepository } from './auth.respository.js';
import { LoginUserDto } from './dto/login.dto.js';
import {
  generateAccessToken,
  generateRefreshToken,
  resetPasswordToken,
  verifyRefreshToken,
  verifyResetPasswordToken,
} from '@utils/jwt.util.js';
import { UserRepository } from '@module/user/user.respository.js';
import { IUser } from '@model/user/user.model.js';
import { DeviceTokenRepository } from '@module/deviceToken/deviceToken.respository.js';
import { EmailService } from '@services/sendgrid.service.js';
import { OtpType, sendgridTemplates, TokenType } from '@constants/common.constants.js';
import { VerifyEmailDto } from './dto/verifyEmail.dto.js';
import ForgetPasswordDto from './dto/forgetPassword.dto.js';
import { VerifyOtpForResetPasswordDto } from './dto/verifyOtpForResetPassword.dto.js';
import { IToken } from '@model/token/token.model.js';
import { ResetPasswordDto } from './dto/resetPassword.dto.js';

export class AuthService {
  private authRepository: AuthRepository;
  private userRespository: UserRepository;
  private deviceTokenRepository: DeviceTokenRepository;
  private emailService: EmailService;

  constructor() {
    this.authRepository = new AuthRepository();
    this.userRespository = new UserRepository();
    this.deviceTokenRepository = new DeviceTokenRepository();
    this.emailService = EmailService.getInstance();
  }

  async register(
    createUserDto: RegisterUserDto,
    deviceId: string,
  ): Promise<any> {
    const user = await this.userRespository.getUserByPhone(createUserDto.phoneNo);
    if (user && user.hasRegistered) {
      throw {
        status: 400,
        message: 'User already exists',
      };
    }

    let userDetails: IUser | null = null

    if (user && !user?.hasRegistered) {
      userDetails = await this.userRespository.markUserAsVerifiedAndAddPassword(user.id, createUserDto.password);
    } else {
      const data: Partial<IUser> = { ...createUserDto, hasRegistered: true };
      userDetails = await this.authRepository.createUser(data);
    }

    const payload = this.generatePayload(userDetails!);

    const token = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.authRepository.addToken({
      deviceId: deviceId,
      userId: payload.userId as any,
      token: refreshToken,
    });

    return {
      token: token,
      refreshToken: refreshToken,
    };
  }

  async login(loginUserDto: LoginUserDto, deviceId: string): Promise<any> {
    try {
      const { phoneNo, password } = loginUserDto;
      const userDetails = await this.authRepository.comparePassword(
        phoneNo,
        password,
      );

      try {
        await this.deviceTokenRepository.invalidateDeviceTokenByDeviceId(deviceId);
      } catch (error) {
        logger.error("Error in invalidating device token", error);
      }

      const payload = this.generatePayload(userDetails!);

      const token = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      await this.authRepository.addToken({
        deviceId: deviceId,
        userId: payload.userId as any,
        token: refreshToken,
      });

      return {
        token: token,
        refreshToken: refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async refresh(refreshToken: string, deviceId: string) {
    try {
      const payload = verifyRefreshToken(refreshToken) as any;
      const userId = payload.userId;

      const tokenDoc = await this.authRepository.getToken(
        userId,
        deviceId,
        refreshToken,
      );
      if (!tokenDoc)
        throw {
          status: 400,
          message: 'Invalid refresh token',
        };

      let newRefreshToken = refreshToken;

      const user = await this.userRespository.getUserById(userId);
      const newPayload = this.generatePayload(user!);

      const newToken = generateRefreshToken(newPayload);
      tokenDoc.token = refreshToken;
      const updatedData = await this.authRepository.updateToken(
        tokenDoc._id as string,
        tokenDoc,
      );
      if (updatedData) {
        newRefreshToken = newToken;
      }

      const newAccessToken = generateAccessToken(newPayload);
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      throw err;
    }
  }

  async logout(userId: string, deviceId: string) {
    try {
      const result = await this.authRepository.revoke(userId, deviceId);
      try {
        await this.deviceTokenRepository.invalidateDeviceTokenByDeviceId(deviceId);
      } catch (error) {
        logger.error("Error in logging out", error);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async logAllOut(userId: string) {
    try {
      const result = await this.authRepository.revokeAll(userId);
      try {
        await this.deviceTokenRepository.invalidateDeviceTokenByUserId(userId);
      } catch (error) {
        logger.error("Error in logging all user out", error);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  private generatePayload(user: IUser) {
    const payload: { userId: any; username: string; role: { [key: string]: any }; isAdmin: boolean } = {
      userId: user._id,
      username: user.username,
      role: {},
      isAdmin: user.isAdmin,
    };

    user.societies.forEach((society) => {
      payload.role[society.societyId.toString()] = society.role;
    });

    return payload;
  }

  async addEmail(userId: string, email: string) {

    const user = await this.userRespository.getUserById(userId);

    if (user.email) {
      throw {
        status: 400,
        message: 'Email already exists',
      };
    }

    await this.authRepository.invalideOldOtp(userId, OtpType.VERIFY_EMAIL);

    const otpData = await this.authRepository.createOtp(userId, OtpType.VERIFY_EMAIL, {
      email: email,
    });

    const emailData = {
      name: user.username,
      otp: otpData.otp,
    }

    await this.emailService.sendEmailViaTemplate(email, sendgridTemplates.EMAIL_VERIFICATION, emailData);

    const data = {
      sessionId: otpData.sessionId,
    }

    return data;
  }

  async verifyEmail(userId: string, body: VerifyEmailDto) {
    const otpData = await this.authRepository.verifyOtp(userId, body.otp, OtpType.VERIFY_EMAIL, body.sessionId);

    if (!otpData) {
      throw {
        status: 400,
        message: 'Invalid OTP',
      };
    }

    if (!otpData.metadata.email) {
      throw {
        status: 400,
        message: 'Regenerate OTP and try again',
      }
    }

    const user = await this.userRespository.update(userId, {
      email: otpData.metadata.email,
    });

    await this.authRepository.markOtpAsInvalid(userId, body.sessionId);
    return user;
  }

  async forgotPassword(body: ForgetPasswordDto) {
    const { email, phoneNo } = body;
    let user = null;

    if (email) {
      user = await this.userRespository.getUserByEmail(email);
    } else if (phoneNo) {
      user = await this.userRespository.getUserByPhone(phoneNo);
    }

    if (!user) {
      throw {
        status: 400,
        message: 'User not found',
      };
    }

    const userEmail = user.email;

    if (!userEmail) {
      throw {
        status: 400,
        message: 'Email is not registered with the user, please contact admin',
      };
    }
    await this.authRepository.invalideOldOtp(user._id, OtpType.FORGOT_PASSWORD);
    const otpData = await this.authRepository.createOtp(user._id, OtpType.FORGOT_PASSWORD);

    const emailData = {
      name: user.username,
      otp: otpData.otp,
    }

    await this.emailService.sendEmailViaTemplate(userEmail, sendgridTemplates.FORGOT_PASSWORD, emailData);

    const data = {
      sessionId: otpData.sessionId,
      userId: user._id,
    }

    return data;
  }

  async resetPassword(body: ResetPasswordDto, deviceId: string) {
    const { password, resetToken } = body;

    const payload = verifyResetPasswordToken(resetToken) as any;

    if (payload.type !== TokenType.RESET_TOKEN) {
      throw {
        status: 400,
        message: 'Invalid token',
      };
    }

    const tokenDoc = await this.authRepository.getResetToken(
      payload.userId,
      deviceId,
      resetToken,
    );

    if (!tokenDoc) {
      throw {
        status: 400,
        message: 'Invalid token',
      };
    }


    const user = await this.userRespository.updatePassword(payload.userId, password);

    await this.authRepository.updateToken(tokenDoc._id as string, {
      valid: false,
    });

    return user;

  }

  async validateOtpForResetPassword(body: VerifyOtpForResetPasswordDto, deviceId: string) {
    const { otp, sessionId, userId } = body;

    const otpData = await this.authRepository.verifyOtp(userId, otp, OtpType.FORGOT_PASSWORD, sessionId);

    if (!otpData) {
      throw {
        status: 400,
        message: 'Invalid OTP',
      };
    }

    const token = resetPasswordToken({
      type: TokenType.RESET_TOKEN,
      userId: userId,
    });


    const data = {
      userId: userId as any,
      token: token,
      type: TokenType.RESET_TOKEN,
      valid: true,
      deviceId: deviceId,
    }

    await this.authRepository.revoke(userId, deviceId, TokenType.RESET_TOKEN);
    const savedToken = await this.authRepository.addToken(data);

    await this.authRepository.markOtpAsInvalid(userId, sessionId);
    return {
      token: savedToken.token,
    };
  }

}
