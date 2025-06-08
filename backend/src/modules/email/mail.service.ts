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
      tls: {
        minVersion: 'TLSv1.2', // Explicitly specify the minimum TLS version
        rejectUnauthorized: true,
      },
      debug: true,
    });
  }

  async sendActivationEmail(to: string, link: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('mailer.from'),
        to,
        subject: 'Activation of your account',
        html: `
          <h1>Welcome to the Okten-CRM system!</h1>
          <p>To activate your account, click the link below:</p>
          <a href="${link}" 
          style="display: inline-block; 
          padding: 10px 20px; 
          background-color: #28a745; 
          color: #fff;
          text-decoration: none; 
          border-radius: 5px;">Activate Account</a>
          <p>This link is valid for 30 minutes.</p>
          <p>If you did not create an account, please ignore this email.</p>
        `,
      });
      this.loggerService.log(`Activation email sent to ${to}`);
    } catch (error) {
      this.loggerService.error(`Failed to send activation email to ${to}`, error);
      throw new Error('Failed to send activation email');
    }
  }

  async sendRecoveryEmail(to: string, link: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('mailer.from'),
        to,
        subject: 'Password recovery for your account',
        html: `
          <h1>Password Recovery</h1>
          <p>You have requested a password reset for your account in the CRM system.</p>
          <p>To set a new password, click the link below:</p>
          <a href="${link}" 
          style="display: inline-block;
          padding: 10px 20px; 
          background-color: #007bff; 
          color: #fff;
          text-decoration: none; 
          border-radius: 5px;">Reset Password</a>
          <p>This link is valid for 30 minutes.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        `,
      });
      this.loggerService.log(`Password recovery email sent to ${to}`);
    } catch (error) {
      this.loggerService.error(`Failed to send password recovery email to ${to}`, error);
      throw new Error('Failed to send password recovery email');
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
      this.loggerService.log(`Email sent to ${recipients.join(',')}`);
    } catch (error) {
      this.loggerService.error(`Failed to send email to ${recipients.join(',')}`, error);
      throw new Error('Failed to send email');
    }
  }
}
