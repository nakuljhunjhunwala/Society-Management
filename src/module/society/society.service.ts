import { SocietyRepository } from './society.respository.js';
import { RedisClient } from '@utils/redis.util.js';
import { redisKeys } from '@constants/common.constants.js';
import { IUser } from '@model/user/user.model.js';
import { CreateSocietyDto } from './dto/society.dto.js';
import { UserRepository } from '@module/user/user.respository.js';
import { AddMemberDto } from './dto/addMember.dto.js';
import { IFlat } from '@model/flat/flat.model.js';
import UpdateFlatsDto from './dto/updateFlats.dto.js';

export class SocietyService {
  private societyRepository: SocietyRepository;
  private userRepository: UserRepository;
  constructor() {
    this.societyRepository = new SocietyRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Retrieves the societies associated with a given user ID.
   *
   * @param {string} id - The ID of the user whose societies are to be retrieved.
   * @returns {Promise<IUser["societies"]>} A promise that resolves to the list of societies.
   * @throws Will throw an error if the retrieval process fails.
   */
  async getMySocieties(id: string): Promise<IUser["societies"]> {
    try {
      const societies = await this.societyRepository.getMySocieties(id);
      return societies;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Creates a new society for a given user.
   *
   * @param userId - The ID of the user creating the society.
   * @param society - The details of the society to be created.
   * @returns A promise that resolves to the created society.
   * @throws Will throw an error if the society creation fails.
   */
  async createSociety(userId: string, society: CreateSocietyDto) {
    try {
      const result = await this.societyRepository.createSociety(
        userId,
        society,
      );
      return result.society;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves the members of a society by its ID.
   *
   * @param societyId - The unique identifier of the society.
   * @returns A promise that resolves to the list of members of the society.
   * @throws Will throw an error if the retrieval fails.
   */
  async getMembers(societyId: string) {
    try {
      const result = await this.societyRepository.getMembers(societyId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Adds a member to a society.
   *
   * @param societyId - The ID of the society to which the member will be added.
   * @param member - The member object containing user details.
   * @returns A promise that resolves to the result of adding the member.
   * @throws Will throw an error if the user is already a member of the society or if any other error occurs during the process.
   */
  async addMember(societyId: string, member: AddMemberDto) {
    try {
      const existingMember = await this.societyRepository.getUserBySocietyIdAndUserId(
        societyId,
        member.userId
      );

      if (existingMember) {
        throw {
          status: 400,
          message: 'User is already a member of the society'
        };
      }

      const flatNos = member.flatNos;

      const flats = await this.societyRepository.getFlatsBySocietyIdAndFlatNos(societyId, flatNos);

      const missingFlats = flatNos.filter(flatNo => !flats.find(flat => flat.flatNo === flatNo));
      const needOwnerUpdate = flats.filter(flat => !flat.owner).map(flat => flat._id as string);

      let missingFlatsObj: IFlat[] = [];
      if (missingFlats.length) {
        const flatsObj = missingFlats.map(flatNo => {
          const flat = {
            society: societyId as any,
            flatNo: flatNo,
            owner: member.userId as any,
          }
          return flat;
        });

        missingFlatsObj = await this.societyRepository.createFlats(flatsObj);
      }

      if (needOwnerUpdate.length) {
        await this.societyRepository.updateFlatsOwner(societyId, member.userId, needOwnerUpdate);
      }

      const allFlatsIds: string[] = [...flats, ...missingFlatsObj].map(flat => flat._id as string);
      member.flatNos = allFlatsIds;

      const result = await this.societyRepository.addMember(societyId, member);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateFlats(societyId: string, userId: string, flats: UpdateFlatsDto) {
    try {
      const result = await this.societyRepository.updateFlats(societyId, userId, flats.flatIds);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async removeMember(societyId: string, userId: string) {
    try {
      const result = await this.userRepository.removeMemberFromSociety(societyId, userId);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
