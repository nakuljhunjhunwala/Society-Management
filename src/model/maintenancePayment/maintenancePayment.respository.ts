// src/repositories/maintenancePayment.repository.ts

import { maintenancePaymentStatus } from '@constants/common.constants.js';
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
      const result = await MaintenancePaymentModel.find({ societyId, flat }).sort({
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

  async getMaintenancePaymentsBySoceityIdAndFlatNos(societyId: string, flatNos: string[]): Promise<IMaintenancePayment[]> {
    try {
      const result = await MaintenancePaymentModel.find({ societyId, flatNo: { $in: flatNos } }).sort({
        "coversPeriod.to": -1,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
}
