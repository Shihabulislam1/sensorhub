import type { StreamEvent } from '@sensorhub/shared';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';

describe('StreamController', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('emits a ping every 15 seconds and stops after unsubscribe', () => {
    const controller = new StreamController(new StreamService());
    const received: StreamEvent[] = [];
    const subscription = controller.events().subscribe((message) => {
      received.push(JSON.parse(String(message.data)) as StreamEvent);
    });

    jest.advanceTimersByTime(15_000);
    expect(received).toHaveLength(1);
    expect(received[0].type).toBe('ping');

    subscription.unsubscribe();
    jest.advanceTimersByTime(30_000);
    expect(received).toHaveLength(1);
  });
});
