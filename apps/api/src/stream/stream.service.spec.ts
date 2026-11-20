import type { StreamEvent } from '@sensorhub/shared';
import { StreamService } from './stream.service';

describe('StreamService', () => {
  it('publishes events to subscribers', () => {
    const service = new StreamService();
    const received: StreamEvent[] = [];
    const subscription = service.events$.subscribe((event) => received.push(event));

    const event: StreamEvent = {
      type: 'ping',
      data: { at: '2026-03-01T00:00:00.000Z' },
    };
    service.publish(event);

    expect(received).toEqual([event]);
    subscription.unsubscribe();
  });
});
