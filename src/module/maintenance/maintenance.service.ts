import { MaintenanceRepository } from './maintenance.respository.js';
import { RedisClient } from '@utils/redis.util.js';
import { redisKeys, roles, sendgridTemplates } from '@constants/common.constants.js';
import { SocietyRepository } from '@module/society/society.respository.js';
import AddMaintenancePaymentDto from './dto/addMaintenancePayment.dto.js';
import { IMaintenancePayment } from '@model/maintenancePayment/maintenancePayment.model.js';
import { UserModelRepository } from '@model/user/user.respository.js';
import { IMaintenanceReceipt } from '@interfaces/maintenanceReceipt.interface.js';
import { addressToString, formatDateForEmail, generatePdf } from '@utils/common.util.js';
import { EmailService } from '@services/sendgrid.service.js';

export class MaintenanceService {
  private societyRepository: SocietyRepository;
  private redisClient: RedisClient;
  private maintenanceRepository: MaintenanceRepository;
  private userRepository: UserModelRepository;
  private emailService: EmailService;

  constructor() {
    this.societyRepository = new SocietyRepository();
    this.redisClient = RedisClient.instance;
    this.maintenanceRepository = new MaintenanceRepository();
    this.userRepository = new UserModelRepository();
    this.emailService = EmailService.getInstance();
  }

  async addMaintenance(userId: string, societyId: any, body: AddMaintenancePaymentDto) {
    try {
      const existingPayments = await this.societyRepository.getMyMantainancePayments(
        societyId,
        body.flatNo
      );
      const society = await this.societyRepository.getSocietyById(societyId);

      const currency = society?.maintenanceRate?.currency || 'INR';
      const lastPaidDate = existingPayments[0];
      const to = body.coversPeriodTo
      const from = new Date(lastPaidDate.coversPeriod.to);
      from.setDate(from.getMonth() + 1);
      from.setHours(0, 0, 0, 0);
      from.setDate(1);

      const data: Partial<IMaintenancePayment> = {
        coversPeriod: {
          from,
          to
        },
        amount: body.amount,
        flatNo: body.flatNo,
        paymentMethod: body.paymentMethod,
        paymentDate: body.paymentDate,
        status: body.paymentStatus,
        appliedDiscount: {
          amount: body.appliedDiscount,
          reason: body.discountReason
        },
        societyId: societyId,
        currency: currency
      }

      const result = await this.maintenanceRepository.addMaintenancePayment(data as IMaintenancePayment);

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

      this.redisClient.set(key, JSON.stringify(result), 604800);

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

    const payments = await this.maintenanceRepository.getMyMantainancePaymentsForAllFlats(societyId, userFlats);

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


  async getMyMaintenanceRecords(userId: string, societyId: string) {
    try {
      const flatNos = await this.userRepository.getFlats(societyId, userId);
      const result = await this.maintenanceRepository.getMyMantainancePaymentsForAllFlats(societyId, flatNos);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async generatePdf(userId: string, societyId: string, maintenanceId: string) {
    try {
      const user = await this.userRepository.findById(userId);
      const society = await this.societyRepository.getSocietyById(societyId);
      const maintenance = await this.maintenanceRepository.getMaintenancePaymentById(maintenanceId)

      if (!user?.email) {
        throw {
          status: 400,
          message: 'User email not found'
        }
      }

      if (!maintenance) {
        throw {
          status: 404,
          message: 'Maintenance payment not found'
        }
      }

      const isMemberOfFlat = user?.societies.some(society => {
        const isThisSociety = society.societyId.toString() === societyId;

        if (!isThisSociety) {
          return false;
        }

        return society.flats.includes(maintenance.flatNo) || society.role === roles.SECRETARY;
      });

      if (!isMemberOfFlat) {
        throw {
          status: 403,
          message: 'User is not a member of the specified flat'
        }
      }

      let fromDate: Date | string = new Date(maintenance.coversPeriod.from);
      let toDate: Date | string = new Date(maintenance.coversPeriod.to);
      toDate = new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0);
      fromDate.setDate(1);

      fromDate = formatDateForEmail(fromDate);
      toDate = formatDateForEmail(toDate);



      const data: IMaintenanceReceipt = {
        finalAmount: maintenance.amount.toString(),
        flatNo: maintenance.flatNo,
        from: fromDate,
        to: toDate,
        paidAmount: maintenance.amount.toString(),
        payerName: user?.username || '',
        paymentMode: maintenance.paymentMethod,
        societyName: society?.name || '',
        societyAddress: addressToString(society?.address),
      }

      const template = (await import('@constants/htmlTemplate.constants.js')).maintenanceRecieptTemplate;
      const fileName = `MaintenanceReceipt-${maintenanceId}`;
      const pdf = await generatePdf(template, data, fileName);

      await this.emailService.sendEmailWithAttachmentAndTemplate(user.email, sendgridTemplates.MAINTENANCE_RECEIPT, {}, pdf);

      return {
        message: 'Email sent successfully',
        status: 200
      }
    } catch (error) {
      throw error;
    }
  }

}
