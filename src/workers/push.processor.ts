import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import Redis from 'ioredis';
import {
  NotificationLog,
  NotificationStatus,
  NotificationChannel,
} from '../common/entities/notification-log.entity';
import { TemplateService } from '../template/template.service';
import { PushChannel } from '../channels/push.channel';
import { QUEUE_NAMES } from '../queue/queue.module';
import { NotificationJobData } from '../common/interfaces/notification-job.interfaces';
import { REDIS_CLIENT } from '../redis/redis.constants';

@Processor(QUEUE_NAMES.PUSH)
export class PushProcessor extends WorkerHost {
  private readonly logger = new Logger(PushProcessor.name);
  private readonly channel =
    process.env.PULSEBOARD_REDIS_CHANNEL ?? 'notihub:events';

  constructor(
    @InjectRepository(NotificationLog)
    private readonly notificationLogRepository: Repository<NotificationLog>,
    private readonly templateService: TemplateService,
    private readonly pushChannel: PushChannel,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    const { logId, recipient, templateId, templateData, metadata } = job.data;

    await this.notificationLogRepository.update(logId, {
      status: NotificationStatus.PROCESSING,
      attemptCount: job.attemptsMade + 1,
    });

    try {
      const content = this.templateService.render(
        NotificationChannel.PUSH,
        templateId,
        templateData,
      );

      await this.pushChannel.send({ recipient, content, metadata });

      await this.notificationLogRepository.update(logId, {
        status: NotificationStatus.SENT,
        renderedContent: content,
        sentAt: new Date(),
      });

      await this.publishEvent(
        logId,
        NotificationChannel.PUSH,
        'sent',
        recipient,
        metadata,
      );

      this.logger.log(`Push sent to ${recipient} [logId: ${logId}]`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      await this.notificationLogRepository.update(logId, {
        status: NotificationStatus.FAILED,
        errorMessage: message,
      });

      await this.publishEvent(
        logId,
        NotificationChannel.PUSH,
        'failed',
        recipient,
        metadata,
      );

      this.logger.error(
        `Failed to send push to ${recipient} [logId: ${logId}]: ${message}`,
      );
      throw error;
    }
  }

  private async publishEvent(
    logId: string,
    channel: NotificationChannel,
    eventType: string,
    recipient: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.redis.publish(
      this.channel,
      JSON.stringify({ logId, channel, eventType, recipient, metadata }),
    );
  }
}
