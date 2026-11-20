import { Controller, Get, Param, Query } from '@nestjs/common';
import type { Device } from '@sensorhub/shared';
import { QueryDevicesDto } from './dto/query-devices.dto';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devices: DevicesService) {}

  @Get()
  findAll(@Query() query: QueryDevicesDto): Promise<Device[]> {
    return this.devices.findAll(query.search);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Device> {
    return this.devices.findOne(id);
  }
}
