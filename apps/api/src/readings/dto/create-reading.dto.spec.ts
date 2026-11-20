import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateReadingDto } from './create-reading.dto';

const valid = {
  deviceId: 'dev-001',
  temperature: 22,
  humidity: 40,
  battery: 75,
};

describe('CreateReadingDto', () => {
  it('accepts a valid reading', async () => {
    expect(await validate(plainToInstance(CreateReadingDto, valid))).toHaveLength(0);
  });

  it('rejects out-of-range sensor values', async () => {
    const errors = await validate(
      plainToInstance(CreateReadingDto, {
        ...valid,
        temperature: -51,
        humidity: 101,
        battery: -1,
      }),
    );
    expect(errors.map((error) => error.property).sort()).toEqual([
      'battery',
      'humidity',
      'temperature',
    ]);
  });

  it('rejects a missing device id', async () => {
    const errors = await validate(
      plainToInstance(CreateReadingDto, { ...valid, deviceId: undefined }),
    );
    expect(errors.map((error) => error.property)).toContain('deviceId');
  });

  it('coerces numeric strings before validation', async () => {
    const dto = plainToInstance(CreateReadingDto, {
      ...valid,
      temperature: '23',
      humidity: '41',
      battery: '42',
    });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.temperature).toBe(23);
  });
});
