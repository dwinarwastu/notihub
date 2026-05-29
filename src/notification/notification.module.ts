import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationLog } from '../common/entities/notification-log.entity';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationLog]), QueueModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
