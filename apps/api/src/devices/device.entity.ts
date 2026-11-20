import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import type { Device } from '@sensorhub/shared';

@Entity('devices')
export class DeviceEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  location!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastSeenAt: Date | null = null;
}

export function toDevice(entity: DeviceEntity): Device {
  return {
    id: entity.id,
    name: entity.name,
    location: entity.location,
    createdAt: entity.createdAt.toISOString(),
    ...(entity.lastSeenAt ? { lastSeenAt: entity.lastSeenAt.toISOString() } : {}),
  };
}
