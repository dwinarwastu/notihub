import { Module } from '@nestjs/common';
import { EmailChannel } from './email.channel';
import { WhatsappChannel } from './whatsapp.channel';
import { PushChannel } from './push.channel';

@Module({
  providers: [EmailChannel, WhatsappChannel, PushChannel],
  exports: [EmailChannel, WhatsappChannel, PushChannel],
})
export class ChannelsModule {}
