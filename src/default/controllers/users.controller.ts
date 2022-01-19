import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Post,
  Query,
} from '@nestjs/common';
import { User } from '../models/user';
import { GitHubUserService } from '../services/github-user.service';
import { UserService } from '../services/user.service';
import { ImportService } from '../services/import.service';

@Controller('users')
export class UsersController {
  private logger = new Logger(UsersController.name);

  constructor(
    private readonly githubUserService: GitHubUserService,
    private readonly userService: UserService,
    private readonly importService: ImportService,
  ) {}

  @Get('list-from-github')
  async listFromGithub(
    @Query('idGreaterThan') idGreaterThan: number,
    @Query('pageSize') pageSize: number,
  ) {
    return await this.githubUserService.list(idGreaterThan, pageSize);
  }

  @Post('save')
  async save(@Body() user: User) {
    return await this.userService.createOrUpdate(user);
  }

  @Post('import-github-page')
  async importGithubPageOfUsers(
    @Query('idGreaterThan') idGreaterThan: number,
    @Query('pageSize') pageSize: number,
  ): Promise<string> {
    try {
      const importedItems =
        await this.importService.importUsersFromGithubByPage(
          isNaN(idGreaterThan) ? 0 : Number(idGreaterThan),
          isNaN(pageSize) ? 10 : Number(pageSize),
        );
      return importedItems > 0
        ? `total of ${importedItems} items imported successfully`
        : 'No items found';
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Post('import-from-github')
  async importFromGithub(
    @Query('numberOfItems') numberOfItems: number,
    @Query('onlyAdmins') onlyAdmins: string,
    @Query('onlyWithAvatar') onlyWithAvatar: string,
    @Query('loginStartsWith') loginStartsWith: string,
  ): Promise<string> {
    try {
      const importedItems =
        await this.importService.importUsersFromGithubByFilter(
          {
            onlyAdmins: onlyAdmins === 'true' ? true : false,
            onlyWithAvatar: onlyWithAvatar === 'true' ? true : false,
            loginStartsWith,
          },
          isNaN(numberOfItems) ? 10 : Number(numberOfItems),
        );
      return `total of ${importedItems} items imported successfully`;
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
