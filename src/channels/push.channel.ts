import { Injectable, Logger } from '@nestjs/common';
import { IChannel, SendPayload } from './channel.interface';

@Injectable()
export class PushChannel implements IChannel {
  private readonly logger = new Logger(PushChannel.name);

  async send(payload: SendPayload): Promise<void> {
    // TODO: integrate FCM
    // Production: POST https://fcm.googleapis.com/v1/projects/{project_id}/messages:send
    // dengan Authorization: Bearer {FCM_TOKEN}
    this.logger.log(`[STUB] Push sent to ${payload.recipient}`);
    return Promise.resolve();
  }
}
