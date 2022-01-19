import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../src/default/models/user';
import { UsersController } from '../../../src/default/controllers/users.controller';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';

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

const mockUserUservice = {
  createOrUpdate: async (user: User): Promise<User> => null,
};

const mockImportService = {
  importUsersFromGithubByPage: async (
    idGreaterThan: number,
    pageSize: number,
  ): Promise<number> => {
    return 2;
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
        { provide: 'UserService', useFactory: () => mockUserUservice },
        { provide: 'ImportService', useFactory: () => mockImportService },
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

  describe('save', () => {
    it('should call userService.createOrUpdate with correct values', async () => {
      const createOrUpdateSpy = sinon.spy(mockUserUservice, 'createOrUpdate');
      const user = makeFakeUsers()[0];

      await sut.save(user);

      sinon.assert.calledOnceWithExactly(createOrUpdateSpy, user);

      createOrUpdateSpy.restore();
    });
  });

  describe('importGithubPageOfUsers', () => {
    it('should call importService.importUsersFromGithubByPage with correct values - valid inputs provided', async () => {
      const importUsersFromGithubByPageSpy = sinon.spy(
        mockImportService,
        'importUsersFromGithubByPage',
      );
      const expectedIdGreaterThan = 15;
      const expectedPageSize = 8;

      await sut.importGithubPageOfUsers(
        expectedIdGreaterThan,
        expectedPageSize,
      );

      sinon.assert.calledOnceWithExactly(
        importUsersFromGithubByPageSpy,
        expectedIdGreaterThan,
        expectedPageSize,
      );

      importUsersFromGithubByPageSpy.restore();
    });

    it('should call importService.importUsersFromGithubByPage with default values when valid inputs were not provided', async () => {
      const importUsersFromGithubByPageSpy = sinon.spy(
        mockImportService,
        'importUsersFromGithubByPage',
      );
      const expectedIdGreaterThan = 0;
      const expectedPageSize = 10;

      await sut.importGithubPageOfUsers(
        'invalid_number' as any,
        'other_invalid_number' as any,
      );

      sinon.assert.calledOnceWithExactly(
        importUsersFromGithubByPageSpy,
        expectedIdGreaterThan,
        expectedPageSize,
      );

      importUsersFromGithubByPageSpy.restore();
    });

    it('should return the correct message', async () => {
      const expected = 'total of 2 items imported successfully';
      const actual = await sut.importGithubPageOfUsers(0, 10);
      expect(actual).to.be.eq(expected);
    });

    it('should return the correct message', async () => {
      const importUsersFromGithubByPageStub = sinon
        .stub(mockImportService, 'importUsersFromGithubByPage')
        .resolves(0);
      const expected = 'No items found';

      const actual = await sut.importGithubPageOfUsers(0, 10);

      expect(actual).to.be.eq(expected);

      importUsersFromGithubByPageStub.restore();
    });

    describe('errors', () => {
      it('should call logger.error with correct values', async () => {
        const error = new Error('any_error');
        const importUsersFromGithubStub = sinon
          .stub(mockImportService, 'importUsersFromGithubByPage')
          .throws(error);
        const errorSpy = sinon.spy(Logger.prototype, 'error');

        await sut.importGithubPageOfUsers(0, 10).catch((e) => {
          sinon.assert.calledOnceWithExactly(
            errorSpy,
            error.message,
            error.stack,
          );
        });

        importUsersFromGithubStub.restore();
        errorSpy.restore();
      });

      it('should throw an InternalServerErrorException with correct values', async () => {
        const error = new HttpException('any_http_exception_error', 400);
        const importUsersFromGithubStub = sinon
          .stub(mockImportService, 'importUsersFromGithubByPage')
          .throws(error);

        await sut.importGithubPageOfUsers(0, 10).catch((e) => {
          expect(e.message).to.be.eq('An unexpected error occurred');
          expect(e.status).to.be.eq(HttpStatus.INTERNAL_SERVER_ERROR);
        });

        importUsersFromGithubStub.restore();
      });
    });
  });
});
