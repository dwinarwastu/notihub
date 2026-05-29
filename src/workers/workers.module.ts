import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLog } from '../common/entities/notification-log.entity';
import { EmailProcessor } from './email.processor';
import { WhatsappProcessor } from './whatsapp.processor';
import { PushProcessor } from './push.processor';
import { TemplateModule } from '../template/template.module';
import { ChannelsModule } from '../channels/channels.module';
import { QueueModule } from '../queue/queue.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationLog]),
    QueueModule,
    TemplateModule,
    ChannelsModule,
    RedisModule,
  ],
  providers: [EmailProcessor, WhatsappProcessor, PushProcessor],
})
export class WorkersModule {}
