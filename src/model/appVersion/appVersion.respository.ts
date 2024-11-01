import { AppVersionModal, IAppVersion } from "./appVersion.model.js";

export class AppVersionModalRepository {
    async getLatestVersion(platform: string) {
        try {
            const latestVersion = await AppVersionModal.findOne({ platform }).sort({ releaseDate: -1 }).lean();
            return latestVersion;
        }
        catch (error) {
            throw error;
        }
    }
    async addVersion(version: IAppVersion) {
        try {
            const newVersion = await AppVersionModal.create(version);
            return newVersion;
        }
        catch (error) {
            throw error;
        }
    }
    async updateVersion(version: IAppVersion) {
        try {
            const updatedVersion = await AppVersionModal.findOneAndUpdate({ _id: version._id }, version, { new: true }).lean();
            return updatedVersion;
        }
        catch (error) {
            throw error;
        }
    }
}