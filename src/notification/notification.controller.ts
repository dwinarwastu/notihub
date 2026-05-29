import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationStatusDto } from './dto/notification-status.dto';

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Send a notification' })
  async send(
    @Body() dto: CreateNotificationDto,
  ): Promise<NotificationStatusDto> {
    return this.notificationService.send(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Check notification status' })
  async getStatus(@Param('id') id: string): Promise<NotificationStatusDto> {
    return this.notificationService.getStatus(id);
  }
}
