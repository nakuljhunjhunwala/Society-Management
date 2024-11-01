import {
  IMaintenancePayment,
  MaintenancePaymentModel,
} from '@model/maintenancePayment/maintenancePayment.model.js';

export class MaintenancePaymentModelRepository {

  async getMaintenancePaymentsBySocietyId(societyId: string): Promise<IMaintenancePayment[]> {
    try {
      const result = await MaintenancePaymentModel.find({ societyId });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getMaintenancePaymentsBySoceityIdAndFlat(societyId: string, flat: string): Promise<IMaintenancePayment[] | null> {
    try {
      const result = await MaintenancePaymentModel.find({ societyId, flatId: { $in: flat } }).sort({
        "coversPeriod.to": -1,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createMaintenancePayment(data: IMaintenancePayment): Promise<IMaintenancePayment> {
    try {
      const result = await MaintenancePaymentModel.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getMaintenancePaymentsBySoceityIdAndFlatIds(societyId: string, flatIds: string[]): Promise<IMaintenancePayment[]> {
    try {
      const result = await MaintenancePaymentModel.find({ societyId, flatId: { $in: flatIds } }).sort({
        "coversPeriod.to": -1,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getMaintenancePaymentById(id: string): Promise<IMaintenancePayment | null> {
    try {
      const result = await MaintenancePaymentModel.findById(id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getLastMaintenancePayment(societyId: string, flatId: string): Promise<IMaintenancePayment | null> {
    try {
      const result = await MaintenancePaymentModel.findOne({ societyId, flatId }).sort({
        "coversPeriod.to": -1,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

}
