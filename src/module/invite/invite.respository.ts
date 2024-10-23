import { IInvite } from "@model/invite/invite.model.js";
import { InviteModelRepository } from "@model/invite/invite.respository.js";


export class InviteRepository {
  private inviteRepository: InviteModelRepository;

  constructor() {
    this.inviteRepository = new InviteModelRepository();
  }

  async createInvite(data: Partial<IInvite>) {
    try {
      const result = await this.inviteRepository.createInvite(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getValidInviteById(inviteId: string) {
    try {
      const result = await this.inviteRepository.getValidInviteById(inviteId);
      return result;
    } catch (error) {
      throw error;
    }
  }

}
