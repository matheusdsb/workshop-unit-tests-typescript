import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/user';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createOrUpdate(user: User): Promise<User> {
    const existingUser = await this.userModel
      .find({ login: user.login })
      .exec();
    if (existingUser.length > 0) {
      return await existingUser[0].update({
        isSiteAdmin: user.isSiteAdmin,
        avatar: user.avatar,
      });
    }

    const createdUser = new this.userModel(user);
    return await createdUser.save();
  }
}
