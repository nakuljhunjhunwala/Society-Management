import { IInvite } from "@model/invite/invite.model.js";
import CreateInviteDto from "./dto/createInvite.dto.js";
import { InviteRepository } from "./invite.respository.js";
import { InviteType } from "@constants/common.constants.js";
import { SocietyRepository } from "@module/society/society.respository.js";


export class InviteService {

  private inviteRepository: InviteRepository;
  private societyRepository: SocietyRepository;

  constructor() {
    this.inviteRepository = new InviteRepository();
    this.societyRepository = new SocietyRepository();
  }

  async createInvite(userId: string, societyId: string, invite: CreateInviteDto) {
    try {
      const data: IInvite = {
        createdBy: userId as any,
        societyId: societyId as any,
        expireBy: invite.expireBy,
        inviteType: invite.inviteType,
        metadata: invite.metadata,
        requiresApproval: invite.requiresApproval,
        updatedBy: userId as any,
      }

      const result = await this.inviteRepository.createInvite(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getInviteById(inviteId: string, userId: string) {
    try {
      const result = await this.inviteRepository.getValidInviteById(inviteId);

      if (!result) {
        throw {
          status: 404,
          message: 'Invalid or expired invite',
        }
      }

      switch (result.inviteType) {
        case InviteType.JOIN_SOCIETY:
          return result;
          break;
        default:
          this.validateInvite(result, userId);
          break;
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  private async validateInvite(invite: IInvite, userId: string) {
    const isCurrenUserPartOfSociety = this.societyRepository.getUserBySocietyIdAndUserId(invite.societyId as any, userId);

    if (!isCurrenUserPartOfSociety) {
      throw {
        status: 403,
        message: 'Invite is not valid for you',
      }
    }

    return true;

  }



}
