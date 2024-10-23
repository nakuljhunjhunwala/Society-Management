import { IApproval } from "@model/approval/approval.model.js";
import CreateApprovalDto from "./dto/createApproval.dto.js";
import { ApprovalRepository } from "./approval.respository.js";
import { approvalStatus, InviteType } from "@constants/common.constants.js";
import { SocietyRepository } from "@module/society/society.respository.js";


export class ApprovalService {

  private approvalRepository: ApprovalRepository;

  constructor() {
    this.approvalRepository = new ApprovalRepository();
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

}
