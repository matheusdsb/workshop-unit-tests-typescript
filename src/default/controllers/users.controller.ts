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
    @Query('idGreaterThan') idGreaterThan: number,
    @Query('onlyAdmins') onlyAdmins: string,
    @Query('onlyWithAvatar') onlyWithAvatar: string,
  ) {
    return await this.githubUserService.import(
      onlyAdmins === 'true' ? true : false,
      onlyWithAvatar === 'true' ? true : false,
      isNaN(idGreaterThan) ? 0 : Number(idGreaterThan),
    );
  }
}
