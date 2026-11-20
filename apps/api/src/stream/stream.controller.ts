import { Controller, Sse } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { interval, map, merge, Observable } from 'rxjs';
import type { StreamEvent } from '@sensorhub/shared';
import { StreamService } from './stream.service';

const PING_INTERVAL_MS = 15_000;

@Controller('stream')
export class StreamController {
  constructor(private readonly stream: StreamService) {}

  @Sse()
  events(): Observable<MessageEvent> {
    const readings = this.stream.events$.pipe(
      map((event): MessageEvent => ({ data: JSON.stringify(event) })),
    );

    const pings = interval(PING_INTERVAL_MS).pipe(
      map((): MessageEvent => {
        const event: StreamEvent = {
          type: 'ping',
          data: { at: new Date().toISOString() },
        };
        return { data: JSON.stringify(event) };
      }),
    );

    // Nest unsubscribes from the returned observable when the client disconnects,
    // which disposes of the interval timer and the stream subscription with it.
    return merge(readings, pings);
  }
}
