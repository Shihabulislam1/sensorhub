import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import type { Reading } from '@sensorhub/shared';
import { CreateReadingDto } from './dto/create-reading.dto';
import { QueryReadingsDto } from './dto/query-readings.dto';
import { ReadingsService } from './readings.service';

@Controller('readings')
export class ReadingsController {
  constructor(private readonly readings: ReadingsService) {}

  @Post()
  create(@Body() dto: CreateReadingDto): Promise<Reading> {
    return this.readings.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryReadingsDto): Promise<Reading[]> {
    return this.readings.findAll(query);
  }
}
