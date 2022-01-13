import { HttpModule, Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { GitHubUserService } from './services/github-user.service';
import * as dotenv from 'dotenv';

dotenv.config();
@Module({
  imports: [HttpModule],
  controllers: [UsersController],
  providers: [
    GitHubUserService,
    { provide: 'GITHUB_USERS_API', useValue: process.env.GITHUB_USERS_API },
  ],
})
export class DefaultModule {}
