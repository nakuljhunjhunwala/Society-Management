import { roles } from '@constants/common.constants.js';
import User, { IUser } from './user.model.js';

class UserModelRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).exec();
  }

  async findByPhoneNo(phoneNo: number): Promise<IUser | null> {
    return User.findOne({ phoneNo }).exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).select('-password').exec();
  }

  async createUser(user: Partial<IUser>): Promise<IUser> {
    const newUser = new User(user);
    return newUser.save();
  }

  async markUserAsVerifiedAndAddPassword(id: string, password: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id,
      {
        hasRegistered: true,
        password,
      },
      { new: true },
    )
  }

  async compareUserByPassword(phoneNo: number, password: string): Promise<IUser> {
    try {
      const user = await this.findByPhoneNo(phoneNo);
      const isValid = await user?.comparePassword(password);
      if (isValid) {
        return user!;
      }
      throw {
        status: 401,
        message: "Password doesn't match",
      };
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id: string, user: Partial<IUser>): Promise<IUser> {
    // Santinze user object
    delete user.password;
    delete user.phoneNo;

    return User.findByIdAndUpdate(id, user, {
      new: true,
    }).exec() as Promise<IUser>;
  }

  async deleteUser(id: string): Promise<IUser> {
    return User.findByIdAndDelete(id).exec() as Promise<IUser>;
  }

  async findSocietyMembers(societyId: string): Promise<IUser[]> {
    return User.find({
      'societies.societyId': societyId,
    }).exec();
  }

  async findSocietySecretary(societyId: string): Promise<IUser | null> {
    return User.findOne({
      'societies.societyId': societyId,
      societies: {
        $elemMatch: {
          role: roles.SECRETARY,
        },
      },
    }).exec();
  }

  async addSocietyToUser(
    userId: string,
    societyId: string,
    role: string,
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          societies: {
            societyId,
            role,
            joinedAt: new Date(),
          },
        },
      },
      { new: true },
    );
  }

  async addSocietyToUserWithSession(
    userId: string,
    societyId: string,
    role: string,
    session: any,
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          societies: {
            societyId,
            role,
            joinedAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true, session },
    );
  }

  async getUserBySocietyIdAndUserId(societyId: string, userId: string): Promise<IUser | null> {
    console.log('societyId', societyId);
    console.log('userId', userId);

    return await User.findOne({
      _id: userId,
      'societies.societyId': societyId,
    }).lean();
  }
}

export { UserModelRepository };
