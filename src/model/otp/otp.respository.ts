import mongoose from "mongoose";
import { OtpModal } from "./otp.model.js";

export class OtpModelRespository {
    async createOtp(userId: string, metadata = {}) {
        return await new OtpModal({ userId, metadata }).save();
    }

    async verifyOtp(userId: string, sessionId: string, otp: string) {
        let userid: any = userId;
        if (typeof userId === 'string') {
            userid = new mongoose.Types.ObjectId(userId);
        }
        return await OtpModal.findOne({ userId: userid, sessionId, otp, isValid: true, expiresAt: { $gte: new Date() } });
    }

    async markOtpAsInvalid(userId: string, sessionId: string) {
        let userid: any = userId;
        if (typeof userId === 'string') {
            userid = new mongoose.Types.ObjectId(userId);
        }
        return await OtpModal.updateMany({ userId: userid, sessionId }, { isValid: false });
    }
}