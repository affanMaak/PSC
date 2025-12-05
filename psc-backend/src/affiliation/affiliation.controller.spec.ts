import { Test, TestingModule } from '@nestjs/testing';
import { AffiliationController } from './affiliation.controller';

describe('AffiliationController', () => {
  let controller: AffiliationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AffiliationController],
    }).compile();

    controller = module.get<AffiliationController>(AffiliationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
