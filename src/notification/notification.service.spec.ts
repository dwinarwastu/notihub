import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { NotificationService } from './notification.service';
import {
  NotificationLog,
  NotificationChannel,
  NotificationStatus,
} from '../common/entities/notification-log.entity';
import { QUEUE_NAMES } from '../queue/queue.module';
import { CreateNotificationDto } from './dto/create-notification.dto';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};

const mockQueue = {
  add: jest.fn(),
};

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(NotificationLog),
          useValue: mockRepository,
        },
        {
          provide: getQueueToken(QUEUE_NAMES.EMAIL),
          useValue: mockQueue,
        },
        {
          provide: getQueueToken(QUEUE_NAMES.WHATSAPP),
          useValue: mockQueue,
        },
        {
          provide: getQueueToken(QUEUE_NAMES.PUSH),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('send', () => {
    it('should create log and enqueue job', async () => {
      const dto: CreateNotificationDto = {
        channel: NotificationChannel.EMAIL,
        recipient: 'test@example.com',
        templateId: 'welcome',
        templateData: { name: 'Budi' },
      };

      const mockLog: Partial<NotificationLog> = {
        id: 'uuid-123',
        channel: dto.channel,
        recipient: dto.recipient,
        templateId: dto.templateId,
        templateData: dto.templateData,
        status: NotificationStatus.PENDING,
        attemptCount: 0,
        sentAt: undefined,
        errorMessage: undefined,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockLog);
      mockRepository.save.mockResolvedValue(mockLog);
      mockQueue.add.mockResolvedValue({});

      const result = await service.send(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: dto.channel,
          recipient: dto.recipient,
          templateId: dto.templateId,
          status: NotificationStatus.PENDING,
        }),
      );
      expect(mockRepository.save).toHaveBeenCalledWith(mockLog);
      expect(mockQueue.add).toHaveBeenCalledWith(
        'send',
        expect.objectContaining({ logId: mockLog.id }),
        expect.any(Object),
      );
      expect(result.status).toBe(NotificationStatus.PENDING);
      expect(result.recipient).toBe(dto.recipient);
    });
  });

  describe('getStatus', () => {
    it('should return notification status', async () => {
      const mockLog: Partial<NotificationLog> = {
        id: 'uuid-123',
        channel: NotificationChannel.EMAIL,
        status: NotificationStatus.SENT,
        recipient: 'test@example.com',
        attemptCount: 1,
        sentAt: new Date(),
        errorMessage: undefined,
        createdAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockLog);

      const result = await service.getStatus('uuid-123');

      expect(result.id).toBe('uuid-123');
      expect(result.status).toBe(NotificationStatus.SENT);
    });

    it('should throw error when notification not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getStatus('nonexistent-id')).rejects.toThrow(
        'Notification not found',
      );
    });
  });
});
