import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

import { LoggerService } from '../logger/logger.service';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  constructor(
    private configService: ConfigService,
    private loggerService: LoggerService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mailer.host'),
      port: this.configService.get<number>('mailer.port'),
      secure: this.configService.get<boolean>('mailer.secure') || false,
      auth: {
        user: this.configService.get<string>('mailer.user'),
        pass: this.configService.get<string>('mailer.pass'),
        from: this.configService.get<string>('mailer.from'),
      },
    } as nodemailer.TransportOptions);
  }

  async sendActivationEmail(to: string, link: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `CRM System <${this.configService.get<string>('MAIL_EMAIL')}>`,
        to,
        subject: 'Activate your manager account',
        html: `
  <h1>Welcome to the CRM system!</h1>
  <p>Please activate your manager account by clicking the link below:</p>
  <a href="${link}">Activate Account</a>
  <p>This link is valid for 30 minutes.</p>
`,
      });
      this.loggerService.log(`Activation email sent to ${to}`);
    } catch (error) {
      this.loggerService.error(`Failed to send activation email to ${to}`, error);
      throw new Error('Failed to send activation email');
    }
  }
}
