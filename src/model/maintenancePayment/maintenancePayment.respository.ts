// src/repositories/maintenancePayment.repository.ts

import { maintenancePaymentStatus } from '@constants/common.constants.js';
import {
  IMaintenancePayment,
  MaintenancePaymentModel,
} from '@model/maintenancePayment/maintenancePayment.model.js';

export class MaintenancePaymentModelRepository {
  async findByUser(userId: string): Promise<IMaintenancePayment[]> {
    return MaintenancePaymentModel.find({ userId });
  }

  async findBySociety(societyId: string): Promise<IMaintenancePayment[]> {
    return MaintenancePaymentModel.find({ societyId });
  }

  async findByStatus(
    status: IMaintenancePayment['status'],
  ): Promise<IMaintenancePayment[]> {
    return MaintenancePaymentModel.find({ status });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<IMaintenancePayment[]> {
    return MaintenancePaymentModel.find({
      paymentDate: { $gte: startDate, $lte: endDate },
    });
  }

  async getTotalPaymentsByUser(userId: string): Promise<number> {
    const result = await MaintenancePaymentModel.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  }

  async create(payment: IMaintenancePayment): Promise<IMaintenancePayment> {
    return MaintenancePaymentModel.create(payment);
  }

  async update(
    id: string,
    payment: Partial<IMaintenancePayment>,
  ): Promise<IMaintenancePayment | null> {
    return MaintenancePaymentModel.findByIdAndUpdate(id, payment, {
      new: true,
    });
  }

  async delete(id: string): Promise<IMaintenancePayment | null> {
    return MaintenancePaymentModel.findByIdAndDelete(id);
  }

  async deleteByUser(userId: string): Promise<void> {
    await MaintenancePaymentModel.deleteMany({ userId });
  }

  async deleteBySociety(societyId: string): Promise<void> {
    await MaintenancePaymentModel.deleteMany({ societyId });
  }

  async deleteByStatus(status: IMaintenancePayment['status']): Promise<void> {
    await MaintenancePaymentModel.deleteMany({ status });
  }

  async deleteByDateRange(startDate: Date, endDate: Date): Promise<void> {
    await MaintenancePaymentModel.deleteMany({
      paymentDate: { $gte: startDate, $lte: endDate },
    });
  }

  async deleteAll(): Promise<void> {
    await MaintenancePaymentModel.deleteMany({});
  }

  async find(): Promise<IMaintenancePayment[]> {
    return MaintenancePaymentModel.find();
  }

  async findById(id: string): Promise<IMaintenancePayment | null> {
    return MaintenancePaymentModel.findById(id)
      .populate('userId')
      .populate('societyId');
  }

  async getPaymentCountByUser(userId: string): Promise<number> {
    return MaintenancePaymentModel.countDocuments({ userId });
  }

  async getPaymentCountBySociety(societyId: string): Promise<number> {
    return MaintenancePaymentModel.countDocuments({ societyId });
  }

  async getPaymentCountByStatus(
    status: IMaintenancePayment['status'],
  ): Promise<number> {
    return MaintenancePaymentModel.countDocuments({ status });
  }

  async getPaymentCountByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return MaintenancePaymentModel.countDocuments({
      paymentDate: { $gte: startDate, $lte: endDate },
    });
  }

  async getPaymentCount(): Promise<number> {
    return MaintenancePaymentModel.countDocuments();
  }

  async getPendingPayments(): Promise<IMaintenancePayment[]> {
    return MaintenancePaymentModel.find({ status: 'pending' });
  }

  async moveStatusToNextStageById(
    paymentId: string,
  ): Promise<IMaintenancePayment | null> {
    const payment = await MaintenancePaymentModel.findById(paymentId);
    if (!payment) {
      return null;
    }

    const status = payment.status;
    let newStatus: IMaintenancePayment['status'] =
      maintenancePaymentStatus.FAILED;
    if (status === 'pending') {
      newStatus = maintenancePaymentStatus.PROCESSED;
    }

    return MaintenancePaymentModel.findByIdAndUpdate(
      paymentId,
      { status: newStatus },
      { new: true },
    );
  }
}
