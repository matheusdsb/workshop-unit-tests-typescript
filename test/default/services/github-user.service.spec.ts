import { TestingModule, Test } from '@nestjs/testing';
import {
  GithubUser,
  GitHubUserService,
} from '../../../src/default/services/github-user.service';
import { User } from '../../../src/default/models/user';
import { AxiosResponse } from 'axios';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { GithubUserFilter } from 'src/default/models/github-user-filter';

const mockAxiosInstance = {
  get: async (url: string): Promise<AxiosResponse<GithubUser[]>> => {
    return {
      data: [
        {
          login: 'any_login',
          id: 1,
          avatar_url: 'any_avatar',
          site_admin: true,
        },
        {
          login: 'other_login',
          id: 2,
          avatar_url: 'other_avatar',
          site_admin: false,
        },
        {
          login: 'another_login',
          id: 3,
          avatar_url: null,
          site_admin: true,
        },
      ],
      config: {},
      headers: {},
      status: 200,
      statusText: '200',
    };
  },
};

const makeFakeUsers = (): User[] => {
  const item1 = new User();
  item1.login = 'any_login';
  item1.githubId = 1;
  item1.avatar = 'any_avatar';
  item1.isSiteAdmin = true;

  const item2 = new User();
  item2.login = 'other_login';
  item2.githubId = 2;
  item2.avatar = 'other_avatar';
  item2.isSiteAdmin = false;

  const item3 = new User();
  item3.login = 'another_login';
  item3.githubId = 3;
  item3.avatar = null;
  item3.isSiteAdmin = true;

  return [item1, item2, item3];
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
        { provide: 'GITHUB_USERS_API', useValue: 'any_api' },
        {
          provide: 'HttpService',
          useFactory: () => mockHttpService,
        },
        {
          provide: 'AxiosInstance',
          useFactory: () => mockAxiosInstance,
        },
      ],
    }).compile();

    sut = module.get<GitHubUserService>(GitHubUserService);
  });

  describe('list()', () => {
    it('should call httpService.axiosRef.get with correct values when inputs were provided', async () => {
      const getSpy = sinon.spy(mockAxiosInstance, 'get');
      const expectedIdGreaterThan = 15;
      const expectedPageSize = 20;
      const url = `any_api?since=${expectedIdGreaterThan}&per_page=${expectedPageSize}`;

      await sut.list(expectedIdGreaterThan, expectedPageSize);

      sinon.assert.calledOnceWithExactly(getSpy, url);

      getSpy.restore();
    });

    it('should call httpService.axiosRef.get with default values when no input param where provided', async () => {
      const getSpy = sinon.spy(mockAxiosInstance, 'get');
      const expectedIdGreaterThan = 0;
      const expectedPageSize = GitHubUserService.MAX_PAGE_SIZE;
      const url = `any_api?since=${expectedIdGreaterThan}&per_page=${expectedPageSize}`;

      await sut.list();

      sinon.assert.calledOnceWithExactly(getSpy, url);

      getSpy.restore();
    });

    it('should return the correct values', async () => {
      const expected = makeFakeUsers();
      const actual = await sut.list(0, 10);
      expect(actual).to.be.deep.eq(expected);
    });

    it('should return an empty array if returned data is null', async () => {
      const getStub = sinon.stub(mockAxiosInstance, 'get').resolves({
        data: null,
        config: {},
        headers: {},
        status: 200,
        statusText: '200',
      });
      const actual = await sut.list();
      expect(actual).to.be.deep.eq([]);

      getStub.restore();
    });
  });

  describe('listByFilters', () => {
    it('should call list() with correct values', async () => {
      const listSpy = sinon.spy(sut, 'list');
      const filter: GithubUserFilter = {
        idGreaterThan: 30,
      };

      await sut.listByFilters(filter);

      sinon.assert.calledOnceWithExactly(listSpy, filter.idGreaterThan);

      listSpy.restore();
    });

    it('should return the correct values', async () => {
      const expected = [makeFakeUsers()[0]];
      const filter: GithubUserFilter = {
        onlyAdmins: true,
        loginStartsWith: 'a',
        onlyWithAvatar: true,
      };

      const actual = await sut.listByFilters(filter);

      expect(actual).to.be.deep.eq(expected);
    });
  });
});
