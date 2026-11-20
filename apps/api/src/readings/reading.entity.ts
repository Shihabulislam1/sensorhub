import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import type { Reading } from '@sensorhub/shared';

@Entity('readings')
export class ReadingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar' })
  deviceId!: string;

  @Column({ type: 'real' })
  temperature!: number;

  @Column({ type: 'real' })
  humidity!: number;

  @Column({ type: 'real' })
  battery!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

export function toReading(entity: ReadingEntity): Reading {
  return {
    id: entity.id,
    deviceId: entity.deviceId,
    temperature: entity.temperature,
    humidity: entity.humidity,
    battery: entity.battery,
    createdAt: entity.createdAt.toISOString(),
  };
}
