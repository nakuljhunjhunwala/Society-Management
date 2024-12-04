import { IUser } from '@model/user/user.model.js';
import { UserModelRepository } from '@model/user/user.respository.js';
import { AuthRepository } from '@module/authentication/auth.respository.js';

export class UserRepository {
  private userRespository: UserModelRepository;
  private authRepository: AuthRepository;

  constructor() {
    this.userRespository = new UserModelRepository();
    this.authRepository = new AuthRepository();
  }

  async getUserById(id: string): Promise<IUser> {
    try {
      const result = (await this.userRespository.findById(id)) as IUser;
      return result;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
    try {
      delete user._id;

      const result = await this.userRespository.updateUser(id, user);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(id: string, password: string): Promise<IUser | null> {
    try {
      const result = await this.userRespository.updatePassword(id, password);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      const result = await this.userRespository.findByEmail(email);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getUserByPhone(phone: number): Promise<IUser | null> {
    try {
      const result = await this.userRespository.findByPhoneNo(phone);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async reRegisterUser(id: string, user: Partial<IUser>): Promise<IUser | null> {
    try {
      const result = await this.userRespository.reRegisterUser(id, user);
      await this.authRepository.revokeAll(id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async removeMemberFromSociety(societyId: string, userId: string): Promise<IUser | null> {
    try {
      const result = await this.userRespository.removeMemberFromSociety(societyId, userId);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
