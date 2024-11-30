import { WrappedRequest } from '@utils/wrapper.util.js';
import { SocietyService } from './society.service.js';
import { CreateSocietyDto } from './dto/society.dto.js';
import UpdateFlatsDto from './dto/updateFlats.dto.js';
import { BulkFileUploadDto } from './dto/bulkFileUpload.dto.js';

export class SocietyController {
  private societyService: SocietyService;

  constructor() {
    this.societyService = new SocietyService();
  }

  async getMySocieties({ user }: WrappedRequest) {
    try {
      if (!user?.userId) {
        throw {
          status: 400,
          message: 'User ID is required',
        };
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
        throw {
          status: 400,
          message: 'Society data is required',
        }
      }
      if (!user?.userId) {
        throw {
          status: 400,
          message: 'User ID is required',
        };
      }
      const result = await this.societyService.createSociety(user.userId, body);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getMembers({ societyId }: WrappedRequest) {
    try {
      if (!societyId) throw {
        message: 'Society ID is required',
        status: 400,
      };
      const result = await this.societyService.getMembers(societyId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async addMember({ body, societyId }: WrappedRequest) {
    try {
      if (!societyId) {
        throw {
          message: 'Society ID is required',
          status: 400,
        };
      }
      const result = await this.societyService.addMember(societyId, body);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateFlats({ body, societyId, user }: WrappedRequest<UpdateFlatsDto>) {
    try {
      if (!societyId) {
        throw {
          message: 'Society ID is required',
          status: 400,
        };
      }
      if (!user?.userId) {
        throw {
          status: 400,
          message: 'User ID is required',
        };
      }
      const result = await this.societyService.updateFlats(societyId, user.userId, body);
      return result;
    } catch (error) {
      throw error;
    }
  }


  async removeMember({ societyId, params }: WrappedRequest) {
    try {
      if (!societyId) {
        throw {
          message: 'Society ID is required',
          status: 400,
        };
      }
      if (!params?.id) {
        throw {
          status: 400,
          message: 'User ID is required',
        };
      }
      const result = await this.societyService.removeMember(societyId, params.id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createFlats({ body, files }: WrappedRequest<BulkFileUploadDto>) {
    try {
      if (!body.societyId) {
        throw {
          status: 400,
          message: 'Society ID is required',
        };
      }
      if (!files?.length) {
        throw {
          status: 400,
          message: 'File is required',
        };
      }
      const result = await this.societyService.createFlats(body.societyId, files);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAllSocieties() {
    try {
      const result = await this.societyService.getAllSocieties();
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getRoles() {
    try {
      const result = await this.societyService.getRoles();
      return result;
    } catch (error) {
      throw error;
    }
  }

}
