import { FlatModel, IFlat } from "./flat.model.js";

export class FlatModalRespository {
    async getFlats(societyId: string) {
        try {
            const result = await FlatModel.find({ societyId });
            return result;
        } catch (error) {
            throw error;
        }
    }

    async getFlatById(flatId: string) {
        try {
            const result = await FlatModel.findById(flatId);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async createFlat(flat: Partial<IFlat>) {
        try {
            const result = await FlatModel.create(flat);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async updateFlat(flatId: string, flat: Partial<IFlat>) {
        try {
            const result = await FlatModel.findByIdAndUpdate(flatId, flat, { new: true });
            return result;
        } catch (error) {
            throw error;
        }
    }

    async getFlatsBySocietyIdAndFlatNos(societyId: string, flatNos: string[]) {
        try {
            const result = await FlatModel.find({ societyId, flatNo: { $in: flatNos } });
            return result;
        } catch (error) {
            throw error;
        }
    }

    async createFlats(flats: Partial<IFlat>[]): Promise<IFlat[]> {
        try {
            const result = await FlatModel.create(flats);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async getFlatsByIds(flatIds: string[]): Promise<IFlat[]> {
        try {
            const result = await FlatModel.find({ _id: { $in: flatIds } });
            return result;
        } catch (error) {
            throw error;
        }
    }

    async updateFlatsOwner(societyId: string, userId: string, flatIds: string[]) {
        try {
            const result = await FlatModel.updateMany({ _id: { $in: flatIds } }, { owner: userId });
            return result;
        } catch (error) {
            throw error;
        }
    }
}