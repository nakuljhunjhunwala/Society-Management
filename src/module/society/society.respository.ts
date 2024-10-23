import { roles } from '@constants/common.constants.js';
import { MaintenancePaymentModelRepository } from '@model/maintenancePayment/maintenancePayment.respository.js';
import { SocietyModelRepository } from '@model/society/society.respository.js';
import { IUser } from '@model/user/user.model.js';
import { UserModelRepository } from '@model/user/user.respository.js';
import { CreateSocietyDto } from './dto/society.dto.js';
import { AddMemberDto } from './dto/addMember.dto.js';

export class SocietyRepository {
  private userRespository: UserModelRepository;
  private societyRespository: SocietyModelRepository;
  private mantainancePaymentRespository: MaintenancePaymentModelRepository;

  constructor() {
    this.userRespository = new UserModelRepository();
    this.societyRespository = new SocietyModelRepository();
    this.mantainancePaymentRespository = new MaintenancePaymentModelRepository();
  }

  async getMySocieties(id: string): Promise<IUser['societies']> {
    try {
      const result = await this.userRespository.findById(id);

      await result?.populate('societies.societyId');

      return result?.['societies'] || [];
    } catch (error) {
      throw error;
    }
  }

  async createSociety(userId: string, society: CreateSocietyDto) {
    try {
      const result = await this.societyRespository.createSocietyAndAddRole(
        society,
        userId,
        roles.SECRETARY,
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getMembers(societyId: string) {
    try {
      const result = await this.userRespository.findSocietyMembers(societyId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getUserBySocietyIdAndUserId(societyId: string, userId: string) {
    try {
      const result = await this.userRespository.getUserBySocietyIdAndUserId(
        societyId,
        userId,
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getSocietyById(societyId: string) {
    try {
      const result = await this.societyRespository.getSocietyById(societyId);
      return result;
    } catch (error) {
      throw error;
    }
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

  async addMember(societyId: string, body: AddMemberDto) {
    try {
      const result = await this.userRespository.addSocietyToUserWithFlats(
        body.userId,
        societyId,
        body.role,
        body.flatNos
      )
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateFlats(societyId: string, userId: string, flats: any) {
    try {
      const result = await this.userRespository.updateFlats(societyId, userId, flats);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
