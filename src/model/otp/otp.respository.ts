import { OtpModal } from "./otp.model.js";

export class OtpModelRespository {
    async createOtp(userId: string, metadata = {}) {
        return await new OtpModal({ userId, metadata }).save();
    }

    async verifyOtp(userId: string, sessionId: string, otp: string) {
        return await OtpModal.findOne({ userId, sessionId, otp, isValid: true, expiresAt: { $gte: new Date() } });
    }
}