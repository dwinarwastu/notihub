import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { NotificationChannel } from '../common/entities/notification-log.entity';

@Injectable()
export class TemplateService {
  private readonly templateBasePath = path.join(
    process.cwd(),
    process.env.NODE_ENV === 'production' ? 'src' : 'src',
    'template',
    'templates',
  );

  render(
    channel: NotificationChannel,
    templateId: string,
    data: Record<string, any>,
  ): string {
    const templatePath = path.join(
      this.templateBasePath,
      channel,
      `${templateId}.hbs`,
    );

    if (!fs.existsSync(templatePath)) {
      throw new NotFoundException(
        `Template ${templateId} not found for chnnel ${channel}`,
      );
    }

    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const compiled = Handlebars.compile(templateSource);
    return compiled(data);
  }
}
