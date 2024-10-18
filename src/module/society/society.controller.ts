import { WrappedRequest } from '@utils/wrapper.util.js';
import { SocietyService } from './society.service.js';
import { CreateSocietyDto } from './dto/society.dto.js';

export class SocietyController {
  private societyService: SocietyService;

  constructor() {
    this.societyService = new SocietyService();
  }

  async getMySocieties({ user }: WrappedRequest) {
    try {
      if (!user?.userId) {
        throw new Error('User ID is required');
      }
      const result = await this.societyService.getMySocieties(user.userId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createSociety({ user, body }: WrappedRequest<CreateSocietyDto>) {
    try {
      if (!body) {
        throw new Error('Society data is required');
      }
      if (!user?.userId) {
        throw new Error('User ID is required');
      }
      const result = await this.societyService.createSociety(user.userId, body);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getMembers({ societyId }: WrappedRequest) {
    try {
      if (!societyId) throw new Error('Society ID is required');
      const result = await this.societyService.getMembers(societyId);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
