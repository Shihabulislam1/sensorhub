import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { config } from './config';
import { DevicesModule } from './devices/devices.module';
import { ReadingsModule } from './readings/readings.module';
import { StreamModule } from './stream/stream.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: config.database.host,
      port: config.database.port,
      username: config.database.username,
      password: config.database.password,
      database: config.database.database,
      autoLoadEntities: true,
      // Development only: entities drive the schema. Other environments use migrations.
      synchronize: config.nodeEnv === 'development',
      retryAttempts: 10,
      retryDelay: 1000,
    }),
    DevicesModule,
    ReadingsModule,
    StreamModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
