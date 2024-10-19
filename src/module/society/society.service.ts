import { SocietyRepository } from './society.respository.js';
import { RedisClient } from '@utils/redis.util.js';
import { redisKeys } from '@constants/common.constants.js';
import { IUser } from '@model/user/user.model.js';
import { CreateSocietyDto } from './dto/society.dto.js';

export class SocietyService {
  private societyRepository: SocietyRepository;
  private redisClient: RedisClient;

  constructor() {
    this.societyRepository = new SocietyRepository();
    this.redisClient = RedisClient.instance;
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
   * Retrieves the pending maintenance balance for a user in a specific society.
   * 
   * This method first attempts to fetch the balance from a Redis cache. If the balance
   * is not found in the cache, it calculates the balance, stores it in the cache with
   * an expiration time of one week (604800 seconds), and then returns the calculated balance.
   * 
   * @param userId - The ID of the user whose pending maintenance balance is to be retrieved.
   * @param societyId - The ID of the society for which the maintenance balance is to be retrieved.
   * @returns A promise that resolves to the pending maintenance balance.
   * @throws Will throw an error if there is an issue retrieving or calculating the balance.
   */
  async getMyPendingMaintenance(userId: string, societyId: string) {
    try {
      const key = `${redisKeys.mantainenceBalance}:${userId}:${societyId}`;
      const resultFromCache = await this.redisClient.get(key);

      if (resultFromCache) {
        const result = JSON.parse(resultFromCache);
        return result;
      }

      const result = await this.calculateMaintenanceBalance(
        userId,
        societyId,
      );

      this.redisClient.setEx(key, 604800, JSON.stringify(result));

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculates the maintenance balance for a user in a specified society.
   *
   * @param userId - The ID of the user.
   * @param societyId - The ID of the society.
   * @returns An object containing the total due amount and the balance due for each flat.
   * @throws {Object} Throws an error if no flats are found for the user in the specified society or if the society is not found.
   * @throws {Object} Throws an error if the society is not found.
   *
   * The returned object has the following structure:
   * - totalDue: The total maintenance amount due for the user.
   * - flatBalances: An array of objects, each containing:
   *   - flatNo: The flat number.
   *   - balanceDue: The maintenance amount due for the flat.
   */
  private async calculateMaintenanceBalance(userId: string, societyId: string) {
    // Fetch user and associated flats in the society in parallel
    const [user, society] = await Promise.all([
      this.societyRepository.getUserBySocietyIdAndUserId(societyId, userId),
      this.societyRepository.getSocietyById(societyId)
    ]);

    const userFlats = user?.societies?.find(
      (society) => society.societyId.toString() === societyId.toString()
    )?.flats;

    if (!userFlats || userFlats.length === 0) {
      throw {
        status: 404,
        message: 'No flats found for this user in the specified society.'
      }
    }

    if (!society) {
      throw {
        status: 404,
        message: 'Society not found'
      }
    }

    const { maintenanceRate, maintenanceRateHistory, createdAt: societyCreationDate } = society;

    // Fetch all maintenance payments in parallel
    const payments = (await Promise.all(
      userFlats.map(flat => this.societyRepository.getMyMantainancePayments(societyId, flat))
    )).flat();

    payments.sort((a, b) => new Date(b.coversPeriod.to).getTime() - new Date(a.coversPeriod.to).getTime());

    const currentDate = new Date();
    currentDate.setDate(1);
    currentDate.setHours(0, 0, 0, 0);

    const getRateForDate = (date: Date) => {
      const rateRecord = maintenanceRateHistory.find(
        (rate) =>
          date >= new Date(rate.effectiveFrom) && date <= new Date(rate.effectiveTo)
      );
      return rateRecord ? rateRecord.amount : maintenanceRate.amount;
    };

    let totalDue = 0;
    const flatBalances = userFlats.map((flat) => {
      const flatPayments = payments.filter((payment) => payment.flatNo === flat);
      const lastPayment = flatPayments[0];
      let balanceDue = 0;
      let lastPaidDate = lastPayment
        ? new Date(lastPayment.coversPeriod.to)
        : new Date(societyCreationDate);

      if (lastPayment) {
        lastPaidDate.setMonth(lastPaidDate.getMonth() + 1);
        lastPaidDate.setDate(1);
        lastPaidDate.setHours(0, 0, 0, 0);
      }

      while (lastPaidDate < currentDate) {
        const currentRate = getRateForDate(lastPaidDate);
        const nextRateChange = maintenanceRateHistory.find(
          (rate) => new Date(rate.effectiveFrom) > lastPaidDate
        );

        const nextCutoffDate = nextRateChange
          ? new Date(nextRateChange.effectiveFrom)
          : currentDate;

        nextCutoffDate.setDate(1);
        nextCutoffDate.setHours(0, 0, 0, 0);

        while (lastPaidDate < nextCutoffDate && lastPaidDate < currentDate) {
          balanceDue += currentRate;
          lastPaidDate.setMonth(lastPaidDate.getMonth() + 1);
        }
      }

      totalDue += balanceDue;

      return {
        flatNo: flat,
        balanceDue,
      };
    });

    return {
      totalDue,
      flatBalances,
    };
  }

}
