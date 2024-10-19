import { IUser } from '@model/user/user.model.js';
import { UserModelRepository } from '@model/user/user.respository.js';

export class UserRepository {
  private userRespository: UserModelRepository;

  constructor() {
    this.userRespository = new UserModelRepository();
  }

  async me(id: string): Promise<IUser> {
    try {
      const result = (await this.userRespository.findById(id)) as IUser;
      return result;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
    try {
      delete user.password;
      delete user.email;
      delete user.societies;
      delete user._id;

      const result = await this.userRespository.updateUser(id, user);
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

  async markUserAsVerifiedAndAddPassword(id: string, password: string): Promise<IUser | null> {
    try {
      const result = await this.userRespository.markUserAsVerifiedAndAddPassword(id, password);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
