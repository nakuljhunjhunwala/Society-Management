import { IInvite, InviteModel } from "./invite.model.js";


export class InviteModelRepository {
    async createInvite(data: Partial<IInvite>) {
        try {
            const invite = await InviteModel.create(data);
            return invite;
        } catch (error) {
            throw error
        }
    }

    async getValidInviteById(inviteId: string) {
        try {
            const invite = await InviteModel.findById(inviteId).populate('createdBy').populate('updatedBy').populate('societyId').exec();
            const now = new Date();

            if (!invite || invite.expireBy < now) {
                return null;
            }

            return invite;
        } catch (error) {
            throw error;
        }
    }
}