import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

export const QUEUE_NAMES = {
  EMAIL: 'email-queue',
  WHATSAPP: 'whatsapp-queue',
  PUSH: 'push-queue',
};

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.EMAIL },
      { name: QUEUE_NAMES.WHATSAPP },
      { name: QUEUE_NAMES.PUSH },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
