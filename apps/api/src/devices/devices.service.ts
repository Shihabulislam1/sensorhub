import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Device } from '@sensorhub/shared';
import { DeviceEntity, toDevice } from './device.entity';

const DEMO_DEVICES = [
  { id: 'dev-001', name: 'Boiler Room', location: 'Basement' },
  { id: 'dev-002', name: 'Cold Store', location: 'Warehouse' },
  { id: 'dev-003', name: 'Greenhouse', location: 'Roof' },
  { id: 'dev-004', name: 'Server Closet', location: 'Floor 2' },
  { id: 'dev-005', name: 'Front Entrance', location: 'Lobby' },
] as const;

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    @InjectRepository(DeviceEntity)
    private readonly devices: Repository<DeviceEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    for (const seed of DEMO_DEVICES) {
      const existing = await this.devices.findOneBy({ id: seed.id });
      if (existing) {
        continue;
      }
      await this.devices.save(this.devices.create({ ...seed, lastSeenAt: null }));
      this.logger.log(`Seeded demo device ${seed.id}`);
    }
  }

  async findAll(search?: string): Promise<Device[]> {
    const rows = await this.devices.find({ order: { id: 'ASC' } });
    const term = search?.trim().toLowerCase();

    const matches = term
      ? rows.filter(
          (device) =>
            device.name.toLowerCase().includes(term) ||
            device.location.toLowerCase().includes(term),
        )
      : rows;

    return matches.map(toDevice);
  }

  async findOne(id: string): Promise<Device> {
    const entity = await this.devices.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`Device ${id} not found`);
    }
    return toDevice(entity);
  }

  async touch(id: string): Promise<void> {
    await this.devices.update({ id }, { lastSeenAt: new Date() });
  }
}
