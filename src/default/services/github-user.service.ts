import { HttpService, Inject, Injectable, Logger } from '@nestjs/common';
import { GithubUserFilter } from '../models/github-user-filter';
import { User } from '../models/user';
import { TimerHelper } from '../helpers/timer.helper';

export type GithubUser = {
  login: string;
  id: number;
  avatar_url: string;
  site_admin: boolean;
};

@Injectable()
export class GitHubUserService {
  private logger = new Logger(GitHubUserService.name);
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
      this.logger.error(error.message, error.stack);
      throw new Error('Error consuming Github Users API');
    }
  }

  async listByFilters(filter: GithubUserFilter): Promise<User[]> {
    const itemsFound = await this.list(filter.idGreaterThan);
    return this.filterList(itemsFound, filter);
  }

  private filterList(items: User[], filter: GithubUserFilter): User[] {
    let newList = items.map((i) => i);

    if (filter.onlyAdmins) {
      newList = newList.filter((i) => i.isSiteAdmin === true);
    }

    if (filter.onlyWithAvatar) {
      newList = newList.filter((i) => i.avatar && i.avatar.length > 0);
    }

    if (filter.loginStartsWith && filter.loginStartsWith.trim().length > 0) {
      newList = newList.filter((i) =>
        i.login
          .toLowerCase()
          .startsWith(filter.loginStartsWith.toLowerCase().trim()),
      );
    }

    return newList;
  }

  async populate(
    filter: GithubUserFilter,
    totalItems: number,
  ): Promise<User[]> {
    const maxAttempts = 50;
    let attempts = 0;
    let lastFoundId = 0;
    let currentPage = await this.list(lastFoundId + 1, 100);
    const items: User[] = [];

    while (
      items.length < totalItems &&
      currentPage.length > 0 &&
      attempts < maxAttempts
    ) {
      lastFoundId = currentPage[currentPage.length - 1].id;
      items.push(...this.filterList(currentPage, filter));
      await TimerHelper.sleep(1000);
      currentPage = await this.list(lastFoundId + 1, 100);
      attempts++;
    }

    return items;
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
