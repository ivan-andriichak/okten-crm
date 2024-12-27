import { IsString } from 'class-validator';

export class CommentDto {
  @IsString()
  comment: string;
  text: string;
  author: string;
}
