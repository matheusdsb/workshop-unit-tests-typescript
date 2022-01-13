import { Test, TestingModule } from '@nestjs/testing';
import { expect } from 'chai';
import { UsersController } from '../../../src/default/controllers/users.controller';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).to.be.not.null;
  });
});
