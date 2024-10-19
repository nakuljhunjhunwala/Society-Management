import { RegisterUserDto } from './dto/register.dto.js';
import { AuthRepository } from './auth.respository.js';
import { LoginUserDto } from './dto/login.dto.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@utils/jwt.util.js';
import { UserRepository } from '@module/user/user.respository.js';
import { IUser } from '@model/user/user.model.js';

export class AuthService {
  private authRepository: AuthRepository;
  private userRespository: UserRepository;

  constructor() {
    this.authRepository = new AuthRepository();
    this.userRespository = new UserRepository();
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

      const newToken = generateRefreshToken(payload);
      tokenDoc.token = refreshToken;
      const updatedData = await this.authRepository.updateToken(
        tokenDoc._id as string,
        tokenDoc,
      );
      if (updatedData) {
        newRefreshToken = newToken;
      }

      const newAccessToken = generateAccessToken(payload);
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      throw err;
    }
  }

  async logout(userId: string, deviceId: string) {
    try {
      const result = await this.authRepository.revoke(userId, deviceId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async logAlOut(userId: string) {
    try {
      const result = await this.authRepository.revokeAll(userId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  private generatePayload(user: IUser) {
    const payload: { userId: any; username: string; role: { [key: string]: any } } = {
      userId: user._id,
      username: user.username,
      role: {}
    };

    user.societies.forEach((society) => {
      payload.role[society.societyId.toString()] = society.role;
    });

    return payload;
  }
}
