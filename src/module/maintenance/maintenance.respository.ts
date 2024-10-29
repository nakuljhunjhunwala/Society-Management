import { roles } from '@constants/common.constants.js';
import { IMaintenancePayment } from '@model/maintenancePayment/maintenancePayment.model.js';
import { MaintenancePaymentModelRepository } from '@model/maintenancePayment/maintenancePayment.respository.js';
import { SocietyModelRepository } from '@model/society/society.respository.js';
import { IUser } from '@model/user/user.model.js';
import { UserModelRepository } from '@model/user/user.respository.js';


export class MaintenanceRepository {
  private mantainancePaymentRespository: MaintenancePaymentModelRepository;

  constructor() {
    this.mantainancePaymentRespository = new MaintenancePaymentModelRepository();
  }

  async getMyMantainancePayments(societyId: string, flatNo: string) {
    try {
      const result = await this.mantainancePaymentRespository.getMaintenancePaymentsBySoceityIdAndFlat(
        societyId,
        flatNo,
      );
      return result || [];
    } catch (error) {
      throw error;
    }
  }

  async getMyMantainancePaymentsForAllFlats(societyId: string, flatNos: string[]) {
    try {
      const result = await this.mantainancePaymentRespository.getMaintenancePaymentsBySoceityIdAndFlatNos(
        societyId,
        flatNos,
      );
      return result || [];
    } catch (error) {
      throw error;
    }
  }

  async addMaintenancePayment(data: IMaintenancePayment) {
    try {
      const result = await this.mantainancePaymentRespository.createMaintenancePayment(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getMaintenancePaymentById(id: string) {
    try {
      const result = await this.mantainancePaymentRespository.getMaintenancePaymentById(id);
      return result;
    } catch (error) {
      throw error;
    }
  }

}
