import { IDeviceToken } from "@model/deviceToken/deviceToken.model.js";
import { DeviceTokenModelRespository } from "@model/deviceToken/deviceToken.respository.js";


export class DeviceTokenRepository {
  private deviceTokenRepository: DeviceTokenModelRespository;

  constructor() {
    this.deviceTokenRepository = new DeviceTokenModelRespository();
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
