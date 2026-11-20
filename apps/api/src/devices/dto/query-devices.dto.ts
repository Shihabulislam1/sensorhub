import { IsOptional, IsString } from 'class-validator';

export class QueryDevicesDto {
  @IsOptional()
  @IsString()
  search?: string;
}
