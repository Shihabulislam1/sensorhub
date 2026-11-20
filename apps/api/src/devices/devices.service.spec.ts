import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Device } from '@sensorhub/shared';
import { DeviceEntity, toDevice } from './device.entity';
import { DevicesService } from './devices.service';

const createdAt = new Date('2026-01-01T00:00:00.000Z');

const entity = (id: string): DeviceEntity => ({
  id,
  name: `Device ${id}`,
  location: 'Lab',
  createdAt,
  lastSeenAt: null,
});

const namedEntity = (id: string, name: string, location: string): DeviceEntity => ({
  ...entity(id),
  name,
  location,
});

const searchableDevices: DeviceEntity[] = [
  namedEntity('dev-001', 'Boiler Room', 'Basement'),
  namedEntity('dev-002', 'Cold Store', 'Warehouse'),
  namedEntity('dev-003', 'Greenhouse', 'Roof'),
];

describe('DevicesService', () => {
  let service: DevicesService;
  const repo = {
    findOneBy: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn((value: Partial<DeviceEntity>) => value as DeviceEntity),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        DevicesService,
        { provide: getRepositoryToken(DeviceEntity), useValue: repo },
      ],
    }).compile();
    service = module.get(DevicesService);
  });

  it('seeds missing devices without overwriting existing ones', async () => {
    repo.findOneBy.mockImplementation(({ id }: { id: string }) =>
      Promise.resolve(id === 'dev-001' ? entity(id) : null),
    );

    await service.onModuleInit();

    expect(repo.findOneBy).toHaveBeenCalledTimes(5);
    expect(repo.save).toHaveBeenCalledTimes(4);
    const savedIds = repo.save.mock.calls.map((call) => (call[0] as DeviceEntity).id);
    expect(savedIds).toEqual(['dev-002', 'dev-003', 'dev-004', 'dev-005']);
  });

  it('returns shared Device types with ISO dates', async () => {
    repo.find.mockResolvedValue([entity('dev-001')]);

    const result: Device[] = await service.findAll();

    expect(result).toEqual([
      {
        id: 'dev-001',
        name: 'Device dev-001',
        location: 'Lab',
        createdAt: createdAt.toISOString(),
      },
    ]);
    expect(toDevice(entity('dev-001')).createdAt).toBe(createdAt.toISOString());
  });

  it('returns all devices when search is omitted or empty', async () => {
    repo.find.mockResolvedValue(searchableDevices);

    await expect(service.findAll()).resolves.toHaveLength(3);
    await expect(service.findAll('')).resolves.toHaveLength(3);
  });

  it('filters by device name', async () => {
    repo.find.mockResolvedValue(searchableDevices);

    const result = await service.findAll('Boiler');

    expect(result.map((device) => device.id)).toEqual(['dev-001']);
  });

  it('filters by device location', async () => {
    repo.find.mockResolvedValue(searchableDevices);

    const result = await service.findAll('warehouse');

    expect(result.map((device) => device.id)).toEqual(['dev-002']);
  });

  it('matches case-insensitively', async () => {
    repo.find.mockResolvedValue(searchableDevices);

    const result = await service.findAll('GREENHOUSE');

    expect(result.map((device) => device.id)).toEqual(['dev-003']);
  });

  it('returns an empty array when nothing matches', async () => {
    repo.find.mockResolvedValue(searchableDevices);

    await expect(service.findAll('missing')).resolves.toEqual([]);
  });

  it('throws 404 for an unknown device', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
