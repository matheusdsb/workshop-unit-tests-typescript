import { Controller, Get, Query } from '@nestjs/common';
import { GitHubUserService } from '../services/github-user.service';

@Controller('users')
export class UsersController {
  constructor(private readonly githubUserService: GitHubUserService) {}

  @Get('list-from-github')
  async listFromGithub(
    @Query('idGreaterThan') idGreaterThan: number,
    @Query('pageSize') pageSize: number,
  ) {
    return await this.githubUserService.list(idGreaterThan, pageSize);
  }

  @Get('import-from-github')
  async importFromGithub(
    @Query('numberOfItems') numberOfItems: number,
    @Query('onlyAdmins') onlyAdmins: string,
    @Query('onlyWithAvatar') onlyWithAvatar: string,
    @Query('loginStartsWith') loginStartsWith: string,
  ) {
    return await this.githubUserService.populate(
      {
        onlyAdmins: onlyAdmins === 'true' ? true : false,
        onlyWithAvatar: onlyWithAvatar === 'true' ? true : false,
        loginStartsWith,
      },
      isNaN(numberOfItems) ? 10 : Number(numberOfItems),
    );
  }
}
