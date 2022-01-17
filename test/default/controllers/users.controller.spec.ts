import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../src/default/models/user';
import { UsersController } from '../../../src/default/controllers/users.controller';
import { expect } from 'chai';
import * as sinon from 'sinon';

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

  return [item1, item2];
};

const mockGithubUserSerivce = {
  async list(idGreaterThan?: number, pageSize?: number): Promise<User[]> {
    return makeFakeUsers();
  },
};

describe('UsersController', () => {
  let sut: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: 'GitHubUserService',
          useFactory: () => mockGithubUserSerivce,
        },
        { provide: 'UserService', useFactory: () => null },
        { provide: 'ImportService', useFactory: () => null },
      ],
    }).compile();

    sut = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(sut).to.be.not.null;
  });

  describe('listFromGithub', () => {
    it('should call githubUserService.list with correct values', async () => {
      //Arrange
      const listSpy = sinon.spy(mockGithubUserSerivce, 'list');
      const idGreaterThan = 10;
      const pageSize = 20;

      //Act
      await sut.listFromGithub(idGreaterThan, pageSize);

      //Assert
      sinon.assert.calledOnceWithExactly(listSpy, idGreaterThan, pageSize);

      listSpy.restore();
    });

    it('should return the correct values', async () => {
      const expected = makeFakeUsers();
      const actual = await sut.listFromGithub(10, 10);
      expect(actual).to.be.deep.eq(expected);
    });
  });
});
