import { Test, TestingModule } from '@nestjs/testing';
import {
  GitHubUserService,
  GithubUser,
} from '../../../src/default/services/github-user.service';
import { AxiosResponse } from 'axios';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { User } from '../../../src/default/models/user';
import { GithubUserFilter } from '../../../src/default/models/github-user-filter';

const makeFakeGithubUsers = (): GithubUser[] => {
  const fakeItem1: GithubUser = {
    login: 'any_login',
    id: 1,
    avatar_url: 'any_avatar',
    site_admin: true,
  };

  const fakeItem2: GithubUser = {
    login: 'other_login',
    id: 2,
    avatar_url: 'other_avatar',
    site_admin: false,
  };

  return [fakeItem1, fakeItem2];
};

const makeFakeUsers = (): User[] => {
  const fakeItem1 = new User();
  fakeItem1.login = 'any_login';
  fakeItem1.githubId = 1;
  fakeItem1.avatar = 'any_avatar';
  fakeItem1.isSiteAdmin = true;

  const fakeItem2 = new User();
  fakeItem2.login = 'other_login';
  fakeItem2.githubId = 2;
  fakeItem2.avatar = 'other_avatar';
  fakeItem2.isSiteAdmin = false;

  return [fakeItem1, fakeItem2];
};

const mockAxiosInstance = {
  async get(url: string): Promise<AxiosResponse<GithubUser[]>> {
    return {
      data: makeFakeGithubUsers(),
      status: 200,
      statusText: '200',
      headers: {},
      config: {},
      request: {},
    };
  },
};

const mockHttpService = {
  axiosRef: mockAxiosInstance,
};

describe('GitHubUserService', () => {
  let sut: GitHubUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GitHubUserService,
        { provide: 'HttpService', useFactory: () => mockHttpService },
        { provide: 'GITHUB_USERS_API', useValue: () => 'any_api' },
        { provide: 'AxiosInstance', useValue: () => mockAxiosInstance },
      ],
    }).compile();

    sut = module.get<GitHubUserService>(GitHubUserService);
  });

  describe('list', () => {
    it('should call httpService.axiosRef.get with correct values', async () => {
      const idGreaterThan = 10;
      const pageSize = 20;

      const getSpy = sinon.spy(mockAxiosInstance, 'get');

      await sut.list(idGreaterThan, pageSize);

      sinon.assert.calledOnceWithExactly(
        getSpy,
        "() => 'any_api'?since=10&per_page=20",
      );

      getSpy.restore();
    });

    it('should return the correct values', async () => {
      const expected = makeFakeUsers();
      const actual = await sut.list(0, 10);
      expect(actual).to.be.deep.eq(expected);
    });
  });

  describe('listByFilters', () => {
    it('should call list with correct values', async () => {
      const listSpy = sinon.spy(sut, 'list');
      const filter: GithubUserFilter = {
        idGreaterThan: 10,
      };

      await sut.listByFilters(filter);

      sinon.assert.calledOnceWithExactly(listSpy, 10);

      listSpy.restore();
    });

    it('should return the correct values', async () => {
      const expected = [makeFakeUsers()[0]];
      const filter: GithubUserFilter = {
        onlyAdmins: true,
        loginStartsWith: 'a',
      };

      const actual = await sut.listByFilters(filter);

      expect(actual).to.be.deep.eq(expected);
    });
  });
});
