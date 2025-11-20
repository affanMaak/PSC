import { Test, TestingModule } from '@nestjs/testing';
import { PhotoshootService } from './photoshoot.service';

describe('PhotoshootService', () => {
  let service: PhotoshootService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhotoshootService],
    }).compile();

    service = module.get<PhotoshootService>(PhotoshootService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
