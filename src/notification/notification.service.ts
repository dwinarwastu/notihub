import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import {
  NotificationChannel,
  NotificationLog,
  NotificationStatus,
} from 'src/common/entities/notification-log.entity';
import { QUEUE_NAMES } from 'src/queue/queue.module';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationStatusDto } from './dto/notification-status.dto';

@Injectable()
export class NotificationService {
  private readonly queueMap: Record<NotificationChannel, Queue>;

  constructor(
    @InjectRepository(NotificationLog)
    private readonly notificationLogRepository: Repository<NotificationLog>,
    @InjectQueue(QUEUE_NAMES.EMAIL) private readonly emailQueue: Queue,
    @InjectQueue(QUEUE_NAMES.WHATSAPP) private readonly whatsappQueue: Queue,
    @InjectQueue(QUEUE_NAMES.PUSH) private readonly pushQueue: Queue,
  ) {
    this.queueMap = {
      [NotificationChannel.EMAIL]: this.emailQueue,
      [NotificationChannel.WHATSAPP]: this.whatsappQueue,
      [NotificationChannel.PUSH]: this.pushQueue,
    };
  }

  async send(dto: CreateNotificationDto): Promise<NotificationStatusDto> {
    const log = this.notificationLogRepository.create({
      channel: dto.channel,
      recipient: dto.recipient,
      templateId: dto.templateId,
      templateData: dto.templateData,
      metadata: dto.metadata,
      status: NotificationStatus.PENDING,
    });

    await this.notificationLogRepository.save(log);

    const queue = this.queueMap[dto.channel];
    await queue.add(
      'send',
      { logId: log.id, ...dto },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    return this.toStatusDto(log);
  }

  async getStatus(id: string): Promise<NotificationStatusDto> {
    const log = await this.notificationLogRepository.findOne({ where: { id } });
    if (!log) throw new Error('Notification not found');
    return this.toStatusDto(log);
  }

  private toStatusDto(log: NotificationLog): NotificationStatusDto {
    return {
      id: log.id,
      channel: log.channel,
      status: log.status,
      recipient: log.recipient,
      attemptCount: log.attemptCount,
      sentAt: log.sentAt,
      errorMessage: log.errorMessage,
      createdAt: log.createdAt,
    };
  }
}
