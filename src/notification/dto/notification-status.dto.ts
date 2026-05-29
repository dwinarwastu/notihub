import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  NotificationChannel,
  NotificationStatus,
} from 'src/common/entities/notification-log.entity';

export class NotificationStatusDto {
  @ApiProperty({ example: 'c04d12b2-6e64-42f0-af77-f4103316ad83' })
  id: string;

  @ApiProperty({ enum: NotificationChannel })
  channel: NotificationChannel;

  @ApiProperty({ enum: NotificationStatus })
  status: NotificationStatus;

  @ApiProperty({ example: 'user@example.com' })
  recipient: string;

  @ApiProperty({ example: 1 })
  attemptCount: number;

  @ApiPropertyOptional({ example: '2026-05-12T02:32:01.123Z' })
  sentAt: Date;

  @ApiPropertyOptional({ example: null })
  errorMessage: string;

  @ApiProperty({ example: '2026-05-12T02:31:58.841Z' })
  createdAt: Date;
}
