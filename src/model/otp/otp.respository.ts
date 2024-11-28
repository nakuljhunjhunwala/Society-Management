import mongoose from "mongoose";
import { OtpModal } from "./otp.model.js";
import { generateOTP } from "@utils/common.util.js";
import { v4 } from "uuid";
import { OtpType } from "@constants/common.constants.js";

export class OtpModelRespository {
    async createOtp(userId: string, type: OtpType, metadata = {}) {
        return await new OtpModal({ userId, metadata, otp: generateOTP(), sessionId: v4(), otpType: type }).save();
    }

    async verifyOtp(userId: string, sessionId: string, type: OtpType, otp: string) {
        let userid: any = userId;
        if (typeof userId === 'string') {
            userid = new mongoose.Types.ObjectId(userId);
        }
        return await OtpModal.findOne({ userId: userid, sessionId, otp, otpType: type, isValid: true, expiresAt: { $gte: new Date() } });
    }

    async markOtpAsInvalid(userId: string, sessionId: string) {
        return await OtpModal.updateMany({ userId, sessionId }, { isValid: false });
    }

    async invalideOldOtp(userId: string, type: OtpType) {
        return await OtpModal.updateMany({ userId, otpType: type }, { isValid: false });
    }
}