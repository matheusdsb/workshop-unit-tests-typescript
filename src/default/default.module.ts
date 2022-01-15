import { HttpModule, Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { GitHubUserService } from './services/github-user.service';
import * as dotenv from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from './models/user';
import { UserSchema } from './models/user-schema';
import { UserService } from './services/user.service';

dotenv.config();
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    HttpModule,
  ],
  controllers: [UsersController],
  providers: [
    GitHubUserService,
    UserService,
    { provide: 'GITHUB_USERS_API', useValue: process.env.GITHUB_USERS_API },
  ],
})
export class DefaultModule {}
