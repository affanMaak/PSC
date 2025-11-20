import { Test, TestingModule } from '@nestjs/testing';
import { LawnService } from './lawn.service';

describe('LawnService', () => {
  let service: LawnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LawnService],
    }).compile();

    service = module.get<LawnService>(LawnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
