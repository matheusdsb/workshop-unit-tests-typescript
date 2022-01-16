import { Injectable, Logger } from '@nestjs/common';
import { GitHubUserService } from './github-user.service';
import { UserService } from './user.service';
import { GithubUserFilter } from '../models/github-user-filter';
import { User } from '../models/user';

@Injectable()
export class ImportService {
  private logger = new Logger(ImportService.name);

  constructor(
    private readonly githubUserService: GitHubUserService,
    private readonly userService: UserService,
  ) {}

  async importUsersFromGithubByFilter(
    filter: GithubUserFilter,
    totalItems: number,
  ): Promise<number> {
    try {
      const users = await this.githubUserService.populate(filter, totalItems);
      return await this.saveMany(users);
    } catch (error) {
      this.logger.error('Error saving user: ' + error.message, error.stack);
    }
  }

  async importUsersFromGithubByPage(
    idGreaterThan: number,
    pageSize: number,
  ): Promise<number> {
    try {
      const users = await this.githubUserService.list(idGreaterThan, pageSize);
      return await this.saveMany(users);
    } catch (error) {
      this.logger.error('Error saving user: ' + error.message, error.stack);
    }
  }

  private async saveMany(users: User[]): Promise<number> {
    let savedItems = 0;
    for (const user of users) {
      const savedUser = await this.userService.createOrUpdate(user);
      if (savedUser) {
        savedItems++;
      }
    }
    return savedItems;
  }
}
