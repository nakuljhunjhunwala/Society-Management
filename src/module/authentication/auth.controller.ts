import { WrappedRequest } from '@utils/wrapper.util.js';
import { AuthService } from './auth.service.js';
import { AddEmailDto } from './dto/addEmail.dto.js';
import ForgetPasswordDto from './dto/forgetPassword.dto.js';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async refresh({ headers, deviceId }: WrappedRequest) {
    try {
      if (!headers['x-refresh-token']) {
        throw {
          status: 400,
          message: 'Refresh Token Missing',
        };
      }
      const result = await this.authService.refresh(
        headers['x-refresh-token'],
        deviceId,
      );
      return {
        status: 200,
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  async login({ body, deviceId }: WrappedRequest) {
    try {
      const result = await this.authService.login(body, deviceId);
      return {
        status: 200,
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  async createUser({ body, deviceId }: WrappedRequest) {
    try {
      const result = await this.authService.register(body, deviceId);
      return {
        status: 201,
        data: result,
        message: 'User Registered',
      };
    } catch (error) {
      throw error;
    }
  }

  async logout({ deviceId, user }: WrappedRequest) {
    try {
      if (!user?.userId) {
        throw {
          status: 400,
          message: 'User ID is required',
        };
      }
      await this.authService.logout(user?.userId, deviceId);
      return {
        status: 200,
      };
    } catch (error) {
      throw error;
    }
  }

  async logAllOut({ user }: WrappedRequest) {
    try {
      if (!user?.userId) {
        throw {
          status: 400,
          message: 'User ID is required',
        };
      }
      await this.authService.logAllOut(user?.userId);
      return {
        status: 200,
      };
    } catch (error) {
      throw error;
    }
  }

  async addEmail({ body, user }: WrappedRequest<AddEmailDto>) {
    try {
      if (!user?.userId) {
        throw {
          status: 400,
          message: 'User ID is required',
        };
      }
      const result = await this.authService.addEmail(user?.userId, body.email);
      return {
        status: 200,
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail({ body, user }: WrappedRequest) {
    try {
      if (!user?.userId) {
        throw {
          status: 400,
          message: 'User ID is required',
        };
      }
      const result = await this.authService.verifyEmail(user?.userId, body);
      return {
        status: 200,
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword({ body }: WrappedRequest<ForgetPasswordDto>) {
    try {
      if (!body.email && !body.phoneNo) {
        throw {
          status: 400,
          message: 'Email or Phone Number is required',
        };
      }

      const result = await this.authService.forgotPassword(body);
      return {
        status: 200,
        data: result,
      };

    } catch (error) {
      throw error;
    }
  }

  async resetPassword({ body }: WrappedRequest) {
    try {
      const result = await this.authService.resetPassword(body);
      return {
        status: 200,
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

}
