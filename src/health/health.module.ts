import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaModule } from '../modules/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
})
export class HealthModule {} 