export interface SendPayload {
  recipient: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface IChannel {
  send(payload: SendPayload): Promise<void>;
}
