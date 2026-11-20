import { Type } from 'class-transformer';
import { IsNumber, IsString, Max, Min } from 'class-validator';
import type { CreateReadingInput } from '@sensorhub/shared';

export class CreateReadingDto implements CreateReadingInput {
  @IsString()
  deviceId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(-50)
  @Max(60)
  temperature!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  battery!: number;
}
