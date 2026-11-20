import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { QueryReadingsDto } from './query-readings.dto';

describe('QueryReadingsDto', () => {
  it('accepts valid filters with a numeric limit', async () => {
    const dto = plainToInstance(QueryReadingsDto, {
      deviceId: 'dev-001',
      since: '2026-01-01T00:00:00.000Z',
      limit: '25',
    });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.limit).toBe(25);
  });

  it('rejects a limit above 500', async () => {
    const errors = await validate(plainToInstance(QueryReadingsDto, { limit: 501 }));
    expect(errors.map((error) => error.property)).toContain('limit');
  });

  it('rejects a non-ISO since value', async () => {
    const errors = await validate(plainToInstance(QueryReadingsDto, { since: 'yesterday' }));
    expect(errors.map((error) => error.property)).toContain('since');
  });
});
