import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export function AgeValid() {
  return applyDecorators(
    Type(() => Number),
    IsInt(),
    IsNumber(),
    Max(100),
    Min(18),
  );
}
