import { Test, TestingModule } from '@nestjs/testing';
import { AffiliationService } from './affiliation.service';

describe('AffiliationService', () => {
  let service: AffiliationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AffiliationService],
    }).compile();

    service = module.get<AffiliationService>(AffiliationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
