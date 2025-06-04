import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

import { LoggerService } from '../logger/logger.service';
import { MailDto } from './mail.dto';

@Injectable()
export class MailService {
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
      },
    });
  }

  async sendActivationEmail(to: string, link: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('mailer.from'),
        to,
        subject: 'Активація вашого акаунта менеджера',
        html: `
          <h1>Вітаємо в CRM-системі!</h1>
          <p>Для активації вашого акаунта менеджера перейдіть за посиланням нижче:</p>
          <a href="${link}" 
          style="display: inline-block; 
          padding: 10px 20px; 
          background-color: #28a745; 
          color: #fff;
           text-decoration: none; 
           border-radius: 5px;">Активувати акаунт</a>
          <p>Це посилання дійсне протягом 30 хвилин.</p>
          <p>Якщо ви не створювали акаунт, проігноруйте цей лист.</p>
        `,
      });
      this.loggerService.log(`Активаційний email надіслано на ${to}`);
    } catch (error) {
      this.loggerService.error(`Не вдалося надіслати активаційний email на ${to}`, error);
      throw new Error('Не вдалося надіслати активаційний email');
    }
  }

  async sendRecoveryEmail(to: string, link: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('mailer.from'),
        to,
        subject: 'Відновлення пароля до вашого акаунта',
        html: `
          <h1>Відновлення пароля</h1>
          <p>Ви запросили відновлення пароля для вашого акаунта в CRM-системі.</p>
          <p>Для встановлення нового пароля перейдіть за посиланням нижче:</p>
          <a href="${link}" 
          style="display: inline-block;
           padding: 10px 20px; 
           background-color: #007bff; color: #fff;
            text-decoration: none; 
            border-radius: 5px;">Відновити пароль</a>
          <p>Це посилання дійсне протягом 30 хвилин.</p>
          <p>Якщо ви не запитували відновлення пароля, проігноруйте цей лист.</p>
        `,
      });
      this.loggerService.log(`Email для відновлення пароля надіслано на ${to}`);
    } catch (error) {
      this.loggerService.error(`Не вдалося надіслати email для відновлення пароля на ${to}`, error);
      throw new Error('Не вдалося надіслати email для відновлення пароля');
    }
  }

  async sendMail(dto: MailDto): Promise<void> {
    const { recipients, subject, html, text } = dto;
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('mailer.from'),
        to: recipients.join(','),
        subject,
        html,
        text,
      });
      this.loggerService.log(`Email надіслано на ${recipients.join(',')}`);
    } catch (error) {
      this.loggerService.error(`Не вдалося надіслати email на ${recipients.join(',')}`, error);
      throw new Error('Не вдалося надіслати email');
    }
  }
}
