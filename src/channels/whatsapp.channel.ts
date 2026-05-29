import { Injectable, Logger } from '@nestjs/common';
import { IChannel, SendPayload } from './channel.interface';

@Injectable()
export class WhatsappChannel implements IChannel {
  private readonly logger = new Logger(WhatsappChannel.name);

  async send(payload: SendPayload): Promise<void> {
    // TODO: integrate WhatsApp Business API / Twilio Sandbox
    // Production: POST https://graph.facebook.com/v18.0/{phone_id}/messages
    // dengan Authorization: Bearer {WA_TOKEN}
    this.logger.log(`[STUB] WhatsApp sent to ${payload.recipient}`);
    return Promise.resolve();
  }
}
