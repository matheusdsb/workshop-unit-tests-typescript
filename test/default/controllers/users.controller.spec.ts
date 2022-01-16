import { Test, TestingModule } from '@nestjs/testing';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { UsersController } from '../../../src/default/controllers/users.controller';
import { User } from '../../../src/default/models/user';

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

const mockGithubService = {
  list: async (idGreaterThan?: number, pageSize?: number): Promise<User[]> => {
    return makeFakeUsers();
  },
};

describe('UsersController', () => {
  let sut: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: 'GitHubUserService', useFactory: () => mockGithubService },
        { provide: 'UserService', useFactory: () => null },
        { provide: 'ImportService', useFactory: () => null },
      ],
    }).compile();

    sut = module.get<UsersController>(UsersController);
  });

  describe('listFromGithub', () => {
    it('should call githubUserService.list with correct values', async () => {
      const listSpy = sinon.spy(mockGithubService, 'list');
      await sut.listFromGithub(0, 10);
      sinon.assert.calledOnceWithExactly(listSpy, 0, 10);

      listSpy.restore();
    });

    it('should return githubUserService.list content', async () => {
      const expected = makeFakeUsers();
      const actual = await sut.listFromGithub(0, 10);
      expect(actual).to.be.deep.eq(expected);
    });
  });
});
