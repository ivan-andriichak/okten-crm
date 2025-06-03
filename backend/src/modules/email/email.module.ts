import { Module } from '@nestjs/common';

import { LoggerModule } from '../logger/logger.module';
import { EmailService } from './email.service';

@Module({
  imports: [LoggerModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
