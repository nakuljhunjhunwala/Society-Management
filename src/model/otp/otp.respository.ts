import mongoose from "mongoose";
import { OtpModal } from "./otp.model.js";
import { generateOTP } from "@utils/common.util.js";
import { v4 } from "uuid";

export class OtpModelRespository {
    async createOtp(userId: string, metadata = {}) {
        return await new OtpModal({ userId, metadata, otp: generateOTP(), sessionId: v4() }).save();
    }

    async verifyOtp(userId: string, sessionId: string, otp: string) {
        let userid: any = userId;
        if (typeof userId === 'string') {
            userid = new mongoose.Types.ObjectId(userId);
        }
        return await OtpModal.findOne({ userId: userid, sessionId, otp, isValid: true, expiresAt: { $gte: new Date() } });
    }

    async markOtpAsInvalid(userId: string, sessionId: string) {
        return await OtpModal.updateMany({ userId, sessionId }, { isValid: false });
    }
}