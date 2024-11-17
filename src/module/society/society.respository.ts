import { roles } from '@constants/common.constants.js';
import { MaintenancePaymentModelRepository } from '@model/maintenancePayment/maintenancePayment.respository.js';
import { SocietyModelRepository } from '@model/society/society.respository.js';
import { IUser } from '@model/user/user.model.js';
import { UserModelRepository } from '@model/user/user.respository.js';
import { CreateSocietyDto } from './dto/society.dto.js';
import { AddMemberDto } from './dto/addMember.dto.js';
import { FlatModalRespository } from '@model/flat/flat.respository.js';
import { IFlat } from '@model/flat/flat.model.js';

export class SocietyRepository {
  private userRespository: UserModelRepository;
  private societyRespository: SocietyModelRepository;
  private mantainancePaymentRespository: MaintenancePaymentModelRepository;
  private flatRepository: FlatModalRespository;

  constructor() {
    this.userRespository = new UserModelRepository();
    this.societyRespository = new SocietyModelRepository();
    this.mantainancePaymentRespository = new MaintenancePaymentModelRepository();
    this.flatRepository = new FlatModalRespository();
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
        body.flatIds
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

  async getFlatsBySocietyIdAndFlatNos(societyId: string, flatNos: string[]) {
    try {
      const result = await this.flatRepository.getFlatsBySocietyIdAndFlatNos(societyId, flatNos);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createFlats(flats: Partial<IFlat>[]): Promise<IFlat[]> {
    try {
      const result = await this.flatRepository.createFlats(flats);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getFlatsById(flatId: string) {
    try {
      const result = await this.flatRepository.getFlatById(flatId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getFlatsByIds(flatIds: string[]): Promise<IFlat[]> {
    try {
      const result = await this.flatRepository.getFlatsByIds(flatIds);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateFlatsOwner(societyId: string, userId: string, flatIds: string[]) {
    try {
      const result = await this.flatRepository.updateFlatsOwner(societyId, userId, flatIds);
      return result;
    } catch (error) {
      throw error;
    }
  }

}
