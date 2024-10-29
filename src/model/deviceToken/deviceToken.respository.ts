import UserModal from "@model/user/user.model.js";
import { DeviceTokenModal } from "./deviceToken.model.js";

export class DeviceTokenModelRespository {
    async addDeviceToken(userId: string, deviceToken: string, deviceId: string) {
        const data = new DeviceTokenModal({
            userId,
            deviceToken,
            deviceId
        });

        try {
            const result = await data.save();
            return result;
        } catch (error) {
            throw error;
        }
    }

    async getDeviceToken(userId: string) {
        try {
            const result = await DeviceTokenModal.find({ userId, isActive: true });
            return result;
        } catch (error) {
            throw error;
        }
    }

    async getDeviceTokenByDeviceId(deviceId: string) {
        try {
            const result = await DeviceTokenModal.findOne({ deviceId, isActive: true });
            return result;
        } catch (error) {
            throw error;
        }
    }

    async invalidateDeviceTokenByDeviceId(deviceId: string) {
        try {
            const result = await DeviceTokenModal.updateMany({ deviceId }, { isActive: false });
            return result;
        } catch (error) {
            throw error;
        }
    }

    async invalidateDeviceTokenByUserId(userId: string) {
        try {
            const result = await DeviceTokenModal.updateMany({ userId }, { isActive: false });
            return result;
        } catch (error) {
            throw error;
        }
    }

    async getDeviceTokenByUserIds(userIds: string[]) {
        try {
            const result = await DeviceTokenModal.find({ userId: { $in: userIds }, isActive: true });
            return result;
        } catch (error) {
            throw error;
        }
    }

    async getDeviceTokensByRoleAndSociety(role: string, societyId: string): Promise<string[]> {
        try {
            const result = await UserModal.aggregate([
                {
                    $match: {
                        "societies.societyId": societyId,
                        "societies.role": role
                    }
                },
                {
                    $lookup: {
                        from: "devicetokens",
                        localField: "_id",
                        foreignField: "userId",
                        as: "deviceTokens"
                    }
                },
                {
                    $unwind: "$deviceTokens"
                },
                {
                    $match: {
                        "deviceTokens.isActive": true
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        deviceTokens: {
                            $push: "$deviceTokens.deviceToken"
                        }
                    }
                }
            ]);

            return result || [];
        } catch (error) {
            throw error;
        }
    }
}