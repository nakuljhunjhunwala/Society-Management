import { SocietyRepository } from './society.respository.js';

export class SocietyService {
  private societyRepository: SocietyRepository;

  constructor() {
    this.societyRepository = new SocietyRepository();
  }

  async getMySocieties(id: string) {
    try {
      const societies = await this.societyRepository.getMySocieties(id);
      return societies;
    } catch (error) {
      throw error;
    }
  }

  async createSociety(userId: string, society: any) {
    try {
      const result = await this.societyRepository.createSociety(
        userId,
        society,
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getMembers(societyId: string) {
    try {
      const result = await this.societyRepository.getMembers(societyId);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
