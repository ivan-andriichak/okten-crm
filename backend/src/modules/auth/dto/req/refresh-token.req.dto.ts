import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class RefreshTokenReqDto {
  @ApiProperty({
    description: 'Refresh token for authentication',
    example:
      // eslint-disable-next-line max-len
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4Nzg5OTdkNS00ZTY0LTRjNjQtYjkxMC04YThkNDMwY2RlZTEiLCJkZXZpY2VJZCI6IjNjODlhZjBhLTEzODYtNDEzMy04NGJiLTNhZmZkNTQxMzJiYSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0ODE1NzQxMiwiZXhwIjoxNzQ4NzYyMjEyfQ.dGycRPUpCjlrCBkyCHoYTtuxN7QXTxx6MywTyz2A0YM',
  })
  @IsString()
  refreshToken: string;

  @ApiProperty({
    description: 'Device ID associated with the token',
    example: '30406eb8-5a30-4930-9bb2-17ac1c23d732',
  })
  @IsUUID()
  deviceId: string;
}
