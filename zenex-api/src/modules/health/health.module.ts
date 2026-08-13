import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { WakeController } from './wake.controller';

@Module({
  controllers: [HealthController, WakeController],
})
export class HealthModule {}
