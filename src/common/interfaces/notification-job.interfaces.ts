export interface NotificationJobData {
  logId: string;
  recipient: string;
  templateId: string;
  templateData: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
