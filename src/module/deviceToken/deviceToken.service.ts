import { IDeviceToken } from "@model/deviceToken/deviceToken.model.js";
import { DeviceTokenRepository } from "./deviceToken.respository.js";


export class DeviceTokenService {

  private deviceTokenRepository: DeviceTokenRepository;

  constructor() {
    this.deviceTokenRepository = new DeviceTokenRepository();
  }

  async addDeviceToken(userId: string, deviceToken: string, deviceId: string): Promise<IDeviceToken> {
    try {
      const result = await this.deviceTokenRepository.addDeviceToken(userId, deviceToken, deviceId);
      return result;
    } catch (error) {
      throw error;
    }
  }

}
