import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class MailDto {
  @ApiProperty({
    description: 'List of email recipients',
    type: [String],
    example: ['example@example.com'],
  })
  @IsEmail({}, { each: true })
  recipients: string[];

  @ApiProperty({
    description: 'Subject of the email',
    type: String,
    example: 'Test Email',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'HTML content of the email',
    type: String,
    example: '<p>This is a test email</p>',
  })
  @IsString()
  html: string;

  @ApiProperty({
    description: 'Optional plain text content of the email',
    type: String,
    example: 'Optional plain text content',
    required: false,
  })
  @IsOptional()
  @IsString()
  text?: string;
}
