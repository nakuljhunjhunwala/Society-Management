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


}
