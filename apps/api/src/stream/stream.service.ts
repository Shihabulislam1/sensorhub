import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import type { StreamEvent } from '@sensorhub/shared';

@Injectable()
export class StreamService {
  private readonly subject = new Subject<StreamEvent>();

  readonly events$ = this.subject.asObservable();

  publish(event: StreamEvent): void {
    this.subject.next(event);
  }
}
