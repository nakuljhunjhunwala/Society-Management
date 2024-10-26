import { IApproval } from "@model/approval/approval.model.js";
import { ApprovalModelRepository } from "@model/approval/approval.respository.js";


export class ApprovalRepository {
  private approvalRepository: ApprovalModelRepository;

  constructor() {
    this.approvalRepository = new ApprovalModelRepository();
  }

  async createApproval(data: Partial<IApproval>): Promise<IApproval> {
    try {
      const result = await this.approvalRepository.createApproval(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAllRequestedApprovals(societyId: string, userId: string, role: string, params: any) {
    const skip = params.pageNo ? (params.pageNo - 1) * (params.limit || 10) : 0;
    const pagination = {
      limit: params.limit || 10,
      skip: skip,
    }

    const result = await this.approvalRepository.getAllRequestedApprovals(societyId, userId, role, pagination);
    return result;
  }

  async getApprovalById(approvalId: string): Promise<IApproval | null> {
    try {
      const result = await this.approvalRepository.getApprovalById(approvalId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async approveApproval(approvalId: string, approvedBy: string): Promise<IApproval | null> {
    try {
      const result = await this.approvalRepository.approveApproval(approvalId, approvedBy);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async rejectApproval(approvalId: string, rejectedBy: string, reason: string): Promise<IApproval | null> {
    try {
      const result = await this.approvalRepository.rejectApproval(approvalId, rejectedBy, reason);
      return result;
    } catch (error) {
      throw error;
    }
  }

}
