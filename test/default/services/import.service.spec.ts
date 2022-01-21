import { TestingModule, Test } from '@nestjs/testing';
import { ImportService } from '../../../src/default/services/import.service';
import * as sinon from 'sinon';
import { User } from '../../../src/default/models/user';
import { expect } from 'chai';

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

const mockGitHubUserService = {
  list: async (idGreaterThan?: number, pageSize?: number): Promise<User[]> => {
    return makeFakeUsers();
  },
};

const mockUserService = {
  createOrUpdate: async (user: User): Promise<User> => {
    return user.githubId == 2 ? null : user;
  },
};

describe('ImportService', () => {
  let sut: ImportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportService,
        {
          provide: 'GitHubUserService',
          useFactory: () => mockGitHubUserService,
        },
        {
          provide: 'UserService',
          useFactory: () => mockUserService,
        },
      ],
    }).compile();

    sut = module.get<ImportService>(ImportService);
  });

  describe('importUsersFromGithubByPage', () => {
    it('should call githubUserService.list with correct values', async () => {
      const listSpy = sinon.spy(mockGitHubUserService, 'list');
      const expecetedIdGreaterTHan = 30;
      const expectPageSize = 20;

      await sut.importUsersFromGithubByPage(
        expecetedIdGreaterTHan,
        expectPageSize,
      );

      sinon.assert.calledOnceWithExactly(
        listSpy,
        expecetedIdGreaterTHan,
        expectPageSize,
      );

      listSpy.restore();
    });

    it('should call userService.createOrUpdate correct number of times with correct values', async () => {
      const expected = makeFakeUsers();
      const createOrUpdateSpy = sinon.spy(mockUserService, 'createOrUpdate');
      await sut.importUsersFromGithubByPage(10, 10);

      sinon.assert.calledThrice(createOrUpdateSpy);
      sinon.assert.calledWithExactly(createOrUpdateSpy, expected[0]);
      sinon.assert.calledWithExactly(createOrUpdateSpy, expected[1]);
      sinon.assert.calledWithExactly(createOrUpdateSpy, expected[2]);

      createOrUpdateSpy.restore();
    });

    it('should return the correct value', async () => {
        const actual = await sut.importUsersFromGithubByPage(10, 10);
        expect(actual).to.be.eq(2);
    });
  });
});
