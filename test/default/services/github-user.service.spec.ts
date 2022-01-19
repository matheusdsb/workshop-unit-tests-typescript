import { TestingModule, Test } from '@nestjs/testing';
import {
  GithubUser,
  GitHubUserService,
} from '../../../src/default/services/github-user.service';
import { AxiosResponse } from 'axios';
import * as sinon from 'sinon';

const mockAxiosInstance = {
  get: async (url: string): Promise<AxiosResponse<GithubUser[]>> => { 
    return {
      data: [],
      config: {},
      headers: {},
      status: 200,
      statusText: '200',
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
    it('should call httpService.axiosRef.get', async () => {
      const getSpy = sinon.spy(mockAxiosInstance, 'get');
      await sut.list();
      sinon.assert.called(getSpy);
      getSpy.restore();
    });
  });
});
