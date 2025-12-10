import { Test, TestingModule } from '@nestjs/testing';
import { PhotoshootController } from './photoshoot.controller';

describe('PhotoshootController', () => {
  let controller: PhotoshootController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhotoshootController],
    }).compile();

    controller = module.get<PhotoshootController>(PhotoshootController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
