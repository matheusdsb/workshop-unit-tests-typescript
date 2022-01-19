import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { User, UserDocument } from '../../../src/default/models/user';
import { UserService } from '../../../src/default/services/user.service';
import * as sinon from 'sinon';
import { Document } from 'mongoose';
import { expect } from 'chai';

const mockUserDocument: User & Document & any = {
  login: 'any_login',
  githubId: 1,
  avatar: 'any',
  isSiteAdmin: true,

  update(query: any) {
    return new User();
  },
};

const makeFakeUserDocument = () => {
  return mockUserDocument;
};

class UserModelMock {
  constructor(public doc: UserDocument) {}

  static find(filter: any) {
    return {
      exec: async (): Promise<UserDocument[]> => {
        return [makeFakeUserDocument()];
      },
    };
  }

  async save(): Promise<UserDocument> {
    return this.doc;
  }
}

describe('UserService', () => {
  let sut: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: UserModelMock,
        },
      ],
    }).compile();

    sut = module.get<UserService>(UserService);
  });

  describe('createOrUpdate', () => {
    it('should call useModel.find() with correct values', async () => {
      const findSpy = sinon.spy(UserModelMock, 'find');
      const user = new User();
      user.login = 'any_login';
      const query = { login: user.login };

      await sut.createOrUpdate(user);

      sinon.assert.calledOnceWithExactly(findSpy, query);

      findSpy.restore();
    });

    it('should call update with correct values if find return an user', async () => {
      const updateSpy = sinon.spy(mockUserDocument, 'update');
      const saveSpy = sinon.spy(UserModelMock.prototype, 'save');
      const user = new User();
      user.login = 'any_login';
      user.avatar = 'other_avatar';
      user.isSiteAdmin = false;
      const expectedQuery = {
        isSiteAdmin: user.isSiteAdmin,
        avatar: user.avatar,
      };

      await sut.createOrUpdate(user);

      sinon.assert.calledOnceWithExactly(updateSpy, expectedQuery);
      sinon.assert.notCalled(saveSpy);

      updateSpy.restore();
      saveSpy.restore();
    });

    describe('save new - find returns empty array', () => {
      let findStub: sinon.SinonStub;

      beforeEach(() => {
        findStub = sinon.stub(UserModelMock, 'find').returns({
          exec: async (): Promise<UserDocument[]> => {
            return [];
          },
        });
      });

      afterEach(() => {
        findStub.restore();
      });

      it('should return the correct value', async () => {
        const user = new User();
        user.login = 'any_login';
        user.avatar = 'any_avatar';
        user.isSiteAdmin = true;
        user.githubId = 1;

        const actual = await sut.createOrUpdate(user);

        expect(actual.login).to.be.eq(user.login);
        expect(actual.avatar).to.be.eq(user.avatar);
        expect(actual.isSiteAdmin).to.be.eq(user.isSiteAdmin);
      });

      it('should call save', async () => {
        const saveSpy = sinon.spy(UserModelMock.prototype, 'save');
        const updateSpy = sinon.spy(mockUserDocument, 'update');
        const user = new User();

        await sut.createOrUpdate(user);

        sinon.assert.calledOnce(saveSpy);
        sinon.assert.notCalled(updateSpy);

        saveSpy.restore();
      });
    });
  });
});
