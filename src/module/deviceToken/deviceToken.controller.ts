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
        throw new Error('Device token is required');
      }
      if (!user?.userId) {
        throw new Error('User ID is required');
      }
      if (!deviceId) {
        throw new Error('Device ID is required');
      }
      const result = await this.deviceTokenService.addDeviceToken(user.userId, body.deviceToken, deviceId);
      return result;
    } catch (error) {
      throw error;
    }
  }

}
