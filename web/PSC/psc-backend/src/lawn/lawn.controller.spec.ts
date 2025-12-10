import { Test, TestingModule } from '@nestjs/testing';
import { LawnController } from './lawn.controller';

describe('LawnController', () => {
  let controller: LawnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LawnController],
    }).compile();

    controller = module.get<LawnController>(LawnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
