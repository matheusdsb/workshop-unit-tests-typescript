import { HttpService, Inject, Injectable } from '@nestjs/common';
import { User } from '../models/user';

export type GithubUser = {
  login: string;
  id: number;
  avatar_url: string;
  site_admin: boolean;
};

@Injectable()
export class GitHubUserService {
  // API REFERENCE https://docs.github.com/pt/rest/reference/users
  static MAX_PAGE_SIZE = 100;

  constructor(
    private httpService: HttpService,
    @Inject('GITHUB_USERS_API') private apiUrl: string,
  ) {}

  async list(idGreaterThan?: number, pageSize?: number): Promise<User[]> {
    try {
      if (!idGreaterThan) {
        idGreaterThan = 0;
      }
      if (!pageSize || pageSize > GitHubUserService.MAX_PAGE_SIZE) {
        pageSize = GitHubUserService.MAX_PAGE_SIZE;
      }
      const result = await this.httpService.axiosRef.get<GithubUser[]>(
        `${this.apiUrl}?since=${idGreaterThan}&per_page=${pageSize}`,
      );
      return result?.data ? this.toUsers(result.data) : [];
    } catch (error) {
      throw new Error('Error consuming Github Users API');
    }
  }

  async import(onlyAdmins = false, onlyWithAvatar = false, idGreaterThan = 0) {
    const itemsFound = await this.list(idGreaterThan);
    let itemsToImport = itemsFound.map((i) => i);

    if (onlyAdmins) {
      itemsToImport = itemsToImport.filter((i) => i.isSiteAdmin === true);
    }

    if (onlyWithAvatar) {
      itemsToImport = itemsToImport.filter(
        (i) => i.avatar && i.avatar.length > 0,
      );
    }

    return itemsToImport;
  }

  private toUsers(githubUsers: GithubUser[]): User[] {
    return githubUsers.map((g) => {
      const user = new User();

      user.id = g.id;
      user.avatar = g.avatar_url;
      user.login = g.login;
      user.isSiteAdmin = g.site_admin;

      return user;
    });
  }
}
