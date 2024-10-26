import { IApproval } from "@model/approval/approval.model.js";
import CreateApprovalDto from "./dto/createApproval.dto.js";
import { ApprovalRepository } from "./approval.respository.js";
import { approvalStatus, ApproverType, InviteType } from "@constants/common.constants.js";
import { SocietyRepository } from "@module/society/society.respository.js";


export class ApprovalService {

  private approvalRepository: ApprovalRepository;
  private societyRepository: SocietyRepository

  constructor() {
    this.approvalRepository = new ApprovalRepository();
    this.societyRepository = new SocietyRepository();
  }

  async createApproval(userId: string, body: CreateApprovalDto) {
    try {
      const data: Partial<IApproval> = {
        requestedBy: userId as any,
        societyId: body.societyId as any,
        approverType: body.approverType,
        approvers: body.approvers,
        status: approvalStatus.PENDING,
        action: body.action,
        metadata: body.metadata,
      }

      const result = await this.approvalRepository.createApproval(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getRequestedApprovals(userId: string, societyId: string, params: any) {
    try {
      const society = await this.societyRepository.getSocietyById(societyId);
      if (!society) {
        throw new Error('Society not found');
      }
      const user = await this.societyRepository.getUserBySocietyIdAndUserId(societyId, userId);
      if (!user) {
        throw new Error('User not found in society');
      }
      const myRole = user.societies.find((s) => s.societyId.toString() === societyId)?.role;
      const result = await this.approvalRepository.getAllRequestedApprovals(societyId, userId, myRole!, params);

      return result;
    } catch (error) {
      throw error;
    }
  }

  async approveApproval(userId: string, societyId: string, approvalId: string) {
    try {
      const user = await this.societyRepository.getUserBySocietyIdAndUserId(societyId, userId);
      if (!user) {
        throw new Error('User not found in society');
      }
      const myRole = user.societies.find((s) => s.societyId.toString() === societyId)?.role;

      const approval = await this.approvalRepository.getApprovalById(approvalId);
      const isAuthorized = this.checkApprovalAuthorization(userId, myRole!, approval!);
      if (isAuthorized) {
        const result = await this.approvalRepository.approveApproval(approvalId, userId);
        await this.processApproval(result!, userId);
        return result;
      } else {
        throw {
          status: 403,
          message: 'You are not authorized to approve this request'
        }
      }

    } catch (error) {
      throw error
    }
  }

  async rejectApproval(userId: string, societyId: string, approvalId: string, reason: string) {
    try {
      const user = await this.societyRepository.getUserBySocietyIdAndUserId(societyId, userId);
      if (!user) {
        throw new Error('User not found in society');
      }
      const myRole = user.societies.find((s) => s.societyId.toString() === societyId)?.role;

      const approval = await this.approvalRepository.getApprovalById(approvalId);
      const isAuthorized = this.checkApprovalAuthorization(userId, myRole!, approval!);
      if (isAuthorized) {
        const result = await this.approvalRepository.rejectApproval(approvalId, userId, reason);
        return result;
      } else {
        throw {
          status: 403,
          message: 'You are not authorized to reject this request'
        }
      }

    } catch (error) {
      throw error
    }
  }

  private checkApprovalAuthorization(userId: string, role: string, approval?: IApproval) {
    if (!approval) {
      throw {
        status: 404,
        message: 'Approval not found'
      }
    }
    if (approval.status === approvalStatus.APPROVED || approval.status === approvalStatus.REJECTED) {
      throw {
        status: 400,
        message: 'Approval already processed'
      }
    }

    if (approval.approverType === ApproverType.ROLE && !approval.approvers.includes(role)) {
      throw {
        status: 403,
        message: 'You are not authorized to approve this request'
      }
    }

    if (approval.approverType === ApproverType.USER && !approval.approvers.includes(userId)) {
      throw {
        status: 403,
        message: 'You are not authorized to approve this request'
      }
    }

    return true;
  }

  private async processApproval(approval: IApproval, userId: string) {

  }

}
