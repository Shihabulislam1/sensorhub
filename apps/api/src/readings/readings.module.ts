import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesModule } from '../devices/devices.module';
import { ReadingEntity } from './reading.entity';
import { ReadingsController } from './readings.controller';
import { ReadingsService } from './readings.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReadingEntity]), DevicesModule],
  controllers: [ReadingsController],
  providers: [ReadingsService],
  exports: [ReadingsService],
})
export class ReadingsModule {}
