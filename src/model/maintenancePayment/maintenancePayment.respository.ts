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

  async getMaintenancePaymentBySoceityIdAndFlat(societyId: string, flat: string): Promise<IMaintenancePayment[] | null> {
    try {
      const result = await MaintenancePaymentModel.find({ societyId, flat });
      return result;
    } catch (error) {
      throw error;
    }
  }
}
