// src/repositories/society.repository.ts

import { roles } from '@constants/common.constants.js';
import { ISociety, SocietyModel } from '@model/society/society.model.js';
import { IUser } from '@model/user/user.model.js';
import { UserModelRepository } from '@model/user/user.respository.js';
import mongoose, { ClientSession } from 'mongoose';

export class SocietyModelRepository {
  private userRepository: UserModelRepository;

  constructor() {
    this.userRepository = new UserModelRepository();
  }

  async findByName(name: string): Promise<ISociety | null> {
    return SocietyModel.findOne({ name });
  }

  async updateMaintenanceRate(
    id: string,
    newRate: ISociety['maintenanceRate'],
  ): Promise<ISociety | null> {
    const society = await SocietyModel.findById(id);
    if (!society) return null;

    if (
      society.maintenanceRate.amount !== newRate.amount ||
      society.maintenanceRate.currency !== newRate.currency
    ) {
      society.maintenanceRateHistory.push({
        ...society.maintenanceRate,
        effectiveTo: new Date(),
      });
      society.maintenanceRate = newRate;
    }

    return society.save();
  }

  async getMaintenanceRateAtDate(
    id: string,
    date: Date,
  ): Promise<{ amount: number; currency: string } | null> {
    const society = await SocietyModel.findById(id);
    if (!society) return null;

    if (date >= society.maintenanceRate.effectiveFrom) {
      return {
        amount: society.maintenanceRate.amount,
        currency: society.maintenanceRate.currency,
      };
    }

    const historicalRate = society.maintenanceRateHistory
      .sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime())
      .find((rate) => date >= rate.effectiveFrom && date < rate.effectiveTo);

    return historicalRate
      ? { amount: historicalRate.amount, currency: historicalRate.currency }
      : null;
  }

  async getMaintenanceRateHistory(
    id: string,
  ): Promise<ISociety['maintenanceRateHistory']> {
    const society = await SocietyModel.findById(id);
    if (!society) return [];

    return society.maintenanceRateHistory;
  }

  async createSociety(society: ISociety): Promise<ISociety> {
    return SocietyModel.create(society);
  }

  async updateSociety(id: string, society: ISociety): Promise<ISociety | null> {
    return SocietyModel.findByIdAndUpdate(id, society, { new: true });
  }

  async deleteSociety(id: string): Promise<ISociety | null> {
    return SocietyModel.findByIdAndDelete(id);
  }

  async getAllSocieties(): Promise<ISociety[]> {
    return SocietyModel.find();
  }

  async getSocietyById(id: string): Promise<ISociety | null> {
    return SocietyModel.findById(id);
  }

  async createSocietyAndAddRole(
    createSocietyDto: any,
    userId: string,
    role: roles,
  ): Promise<{ society: ISociety; user: IUser }> {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create the society
      const society = new SocietyModel(createSocietyDto);
      await society.save({ session });

      const user = await this.userRepository.addSocietyToUserWithSession(
        userId,
        society._id as string,
        role,
        session,
      );

      if (!user) {
        throw new Error('User not found');
      }

      // If everything is successful, commit the transaction
      await session.commitTransaction();

      return { society, user };
    } catch (error) {
      // If any error occurs, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      session.endSession();
    }
  }
}
