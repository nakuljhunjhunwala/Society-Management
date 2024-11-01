import { WrappedRequest } from '@utils/wrapper.util.js';
import { DeviceTokenService } from './deviceToken.service.js';
import AddDeviceTokenDto from './dto/addToken.dto.js';

export class DeviceTokenController {
  private deviceTokenService: DeviceTokenService;

  constructor() {
    this.deviceTokenService = new DeviceTokenService();
  }

  async addDeviceToken({ user, body, deviceId }: WrappedRequest<AddDeviceTokenDto>) {
    try {
      if (!body?.deviceToken) {
        throw {
          status: 400,
          message: 'Device Token is required',
        };
      }
      if (!user?.userId) {
        throw {
          status: 400,
          message: 'User ID is required',
        };
      }
      if (!deviceId) {
        throw {
          status: 400,
          message: 'Device ID is required',
        }
      }
      const result = await this.deviceTokenService.addDeviceToken(user.userId, body.deviceToken, deviceId);
      return result;
    } catch (error) {
      throw error;
    }
  }

}
