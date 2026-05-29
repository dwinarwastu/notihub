import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { NotificationChannel } from 'src/common/entities/notification-log.entity';

export class CreateNotificationDto {
  @ApiProperty({
    enum: NotificationChannel,
    example: NotificationChannel.EMAIL,
  })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  recipient: string;

  @ApiProperty({ example: 'welcome' })
  @IsString()
  templateId: string;

  @ApiProperty({ example: { name: 'Budi' } })
  @IsObject()
  templateData: Record<string, unknown>;

  @ApiPropertyOptional({ example: { subject: 'Selamat Datang' } })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
