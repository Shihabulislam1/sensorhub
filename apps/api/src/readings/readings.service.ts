import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, MoreThan, Repository } from 'typeorm';
import type { CreateReadingInput, ReadingsQuery, Reading } from '@sensorhub/shared';
import { DevicesService } from '../devices/devices.service';
import { StreamService } from '../stream/stream.service';
import { ReadingEntity, toReading } from './reading.entity';

const DEFAULT_LIMIT = 50;

@Injectable()
export class ReadingsService {
  constructor(
    @InjectRepository(ReadingEntity)
    private readonly readings: Repository<ReadingEntity>,
    private readonly devices: DevicesService,
    private readonly stream: StreamService,
  ) {}

  async create(input: CreateReadingInput): Promise<Reading> {
    await this.devices.findOne(input.deviceId);

    const entity = this.readings.create({
      deviceId: input.deviceId,
      temperature: input.temperature,
      humidity: input.humidity,
      battery: input.battery,
    });
    const saved = await this.readings.save(entity);
    await this.devices.touch(input.deviceId);

    const reading = toReading(saved);
    this.stream.publish({ type: 'reading', data: reading });
    return reading;
  }

  async findAll(query: ReadingsQuery): Promise<Reading[]> {
    const where: FindOptionsWhere<ReadingEntity> = {};
    if (query.deviceId) {
      where.deviceId = query.deviceId;
    }
    if (query.since) {
      where.createdAt = MoreThan(new Date(query.since));
    }

    const rows = await this.readings.find({
      where,
      order: { createdAt: 'DESC' },
      take: query.limit ?? DEFAULT_LIMIT,
    });
    return rows.map(toReading);
  }
}
