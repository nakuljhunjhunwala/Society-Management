import { IDeviceToken } from "@model/deviceToken/deviceToken.model.js";
import { DeviceTokenRepository } from "./deviceToken.respository.js";
import { FirebaseService } from "@services/firebase.service.js";
import { INotificationData } from "@interfaces/notificationData.interface.js";


export class DeviceTokenService {

  private deviceTokenRepository: DeviceTokenRepository;
  private firebaseService: FirebaseService;

  constructor() {
    this.deviceTokenRepository = new DeviceTokenRepository();
    this.firebaseService = FirebaseService.getInstance();
  }

  async addDeviceToken(userId: string, deviceToken: string, deviceId: string): Promise<IDeviceToken> {
    try {
      const result = await this.deviceTokenRepository.addDeviceToken(userId, deviceToken, deviceId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async sendNotificationToUsers(userId: string | string[], data: INotificationData): Promise<boolean> {
    try {
      const userIds = Array.isArray(userId) ? userId : [userId];
      const deviceTokens = await this.deviceTokenRepository.getDeviceTokensByUserIds(userIds);
      await this.firebaseService.sendNotification(deviceTokens, data.title, data.message, data.data, data.image);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async sendNotificationByRole(role: string, societyId: string, data: INotificationData): Promise<boolean> {
    try {
      // find users from role and society also get device tokens of users
      const deviceTokens = await this.deviceTokenRepository.getDeviceTokensByRoleAndSociety(role, societyId);
      await this.firebaseService.sendNotification(deviceTokens, data.title, data.message, data.data, data.image);
      return true;
    } catch (error) {
      throw error;
    }
  }

}
