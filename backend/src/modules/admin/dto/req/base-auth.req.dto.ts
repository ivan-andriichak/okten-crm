import { PickType } from '@nestjs/swagger';

import { BaseUserReqDto } from '../../../users/dto/req/base-user.req.dto';

export class BaseAuthReqDto extends PickType(BaseUserReqDto, ['email', 'name', 'surname']) {}
