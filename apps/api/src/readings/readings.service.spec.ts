import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Reading } from '@sensorhub/shared';
import { DevicesService } from '../devices/devices.service';
import { StreamService } from '../stream/stream.service';
import { ReadingEntity } from './reading.entity';
import { ReadingsService } from './readings.service';

const createdAt = new Date('2026-02-01T12:00:00.000Z');

const savedEntity: ReadingEntity = {
  id: 'reading-1',
  deviceId: 'dev-001',
  temperature: 21.5,
  humidity: 44,
  battery: 88,
  createdAt,
};

describe('ReadingsService', () => {
  let service: ReadingsService;
  const repo = {
    create: jest.fn((value: Partial<ReadingEntity>) => value as ReadingEntity),
    save: jest.fn(),
    find: jest.fn(),
  };
  const devices = { findOne: jest.fn(), touch: jest.fn() };
  const stream = { publish: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    repo.save.mockResolvedValue(savedEntity);
    devices.findOne.mockResolvedValue({ id: 'dev-001' });

    const module = await Test.createTestingModule({
      providers: [
        ReadingsService,
        { provide: getRepositoryToken(ReadingEntity), useValue: repo },
        { provide: DevicesService, useValue: devices },
        { provide: StreamService, useValue: stream },
      ],
    }).compile();
    service = module.get(ReadingsService);
  });

  it('saves a reading, updates lastSeenAt and publishes a reading event', async () => {
    const result: Reading = await service.create({
      deviceId: 'dev-001',
      temperature: 21.5,
      humidity: 44,
      battery: 88,
    });

    expect(devices.findOne).toHaveBeenCalledWith('dev-001');
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ deviceId: 'dev-001', temperature: 21.5 }),
    );
    expect(devices.touch).toHaveBeenCalledWith('dev-001');
    expect(stream.publish).toHaveBeenCalledWith({ type: 'reading', data: result });
    expect(result.createdAt).toBe(createdAt.toISOString());
  });

  it('applies filters and the limit when finding readings', async () => {
    repo.find.mockResolvedValue([savedEntity]);

    const result = await service.findAll({
      deviceId: 'dev-001',
      since: '2026-01-01T00:00:00.000Z',
      limit: 500,
    });

    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ deviceId: 'dev-001' }),
        order: { createdAt: 'DESC' },
        take: 500,
      }),
    );
    expect(result[0]).toEqual({
      id: 'reading-1',
      deviceId: 'dev-001',
      temperature: 21.5,
      humidity: 44,
      battery: 88,
      createdAt: createdAt.toISOString(),
    });
  });
});
