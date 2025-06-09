import { ApiProperty } from '@nestjs/swagger';

import { UserResDto } from '../../../users/dto/res/user.res.dto';
import { TokenPairResDto } from './token-pair.res.dto';

export class AuthResDto {
  @ApiProperty({
    description: 'User details',
    type: UserResDto,
  })
  user: UserResDto;

  @ApiProperty({
    description: 'Token pair for authentication',
    type: TokenPairResDto,
  })
  tokens: TokenPairResDto;
}
