import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TemplateService } from './template.service';
import { NotificationChannel } from '../common/entities/notification-log.entity';

describe('TemplateService', () => {
  let service: TemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateService],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should render email template with correct data', () => {
    const result = service.render(NotificationChannel.EMAIL, 'welcome', {
      name: 'Budi',
    });

    expect(result).toContain('Budi');
  });

  it('should throw NotFoundException when template not found', () => {
    expect(() =>
      service.render(NotificationChannel.EMAIL, 'nonexistent', {}),
    ).toThrow(NotFoundException);
  });
});
