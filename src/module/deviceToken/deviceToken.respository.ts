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

  async invalidateDeviceTokenByDeviceId(deviceId: string): Promise<boolean> {
    try {
      const result = await this.deviceTokenRepository.invalidateDeviceTokenByDeviceId(deviceId);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async invalidateDeviceTokenByUserId(userId: string): Promise<boolean> {
    try {
      const result = await this.deviceTokenRepository.invalidateDeviceTokenByUserId(userId);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getDeviceTokens(userId: string): Promise<string[]> {
    try {
      const result = await this.deviceTokenRepository.getDeviceToken(userId);
      const deviceTokens = result.map((deviceToken) => {
        return deviceToken.deviceToken;
      });
      return deviceTokens;
    } catch (error) {
      throw error;
    }
  }

  async getDeviceTokensByUserIds(userId: string[]): Promise<string[]> {
    try {
      const result = await this.deviceTokenRepository.getDeviceTokenByUserIds(userId);
      const deviceTokens = result.map((deviceToken) => {
        return deviceToken.deviceToken;
      });
      return deviceTokens;
    } catch (error) {
      throw error;
    }
  }

  async getDeviceTokensByRoleAndSociety(role: string, societyId: string): Promise<string[]> {
    try {
      const result = await this.deviceTokenRepository.getDeviceTokensByRoleAndSociety(role, societyId);
      return result;
    } catch (error) {
      throw error;
    }
  }

}
