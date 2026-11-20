/** A simulated device. Dates are ISO 8601 strings in the shared API boundary. */
export interface Device {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  lastSeenAt?: string;
}

/** A single telemetry reading posted by a device. */
export interface Reading {
  id: string;
  deviceId: string;
  temperature: number;
  humidity: number;
  battery: number;
  createdAt: string;
}

/** Validated input accepted by POST /api/readings. */
export interface CreateReadingInput {
  deviceId: string;
  temperature: number;
  humidity: number;
  battery: number;
}

/** Query parameters accepted by GET /api/readings. Dates are ISO 8601 strings. */
export interface ReadingsQuery {
  deviceId?: string;
  since?: string;
  limit?: number;
}

/** Events pushed to the dashboard over the SSE stream. */
export type StreamEvent =
  | { type: 'reading'; data: Reading }
  | { type: 'ping'; data: { at: string } };
