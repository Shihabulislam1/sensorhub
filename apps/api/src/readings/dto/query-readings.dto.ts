import { Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, IsString, Max, Min } from 'class-validator';
import type { ReadingsQuery } from '@sensorhub/shared';

export class QueryReadingsDto implements ReadingsQuery {
  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsISO8601()
  since?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;
}
