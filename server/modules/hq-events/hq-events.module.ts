import { Module } from '@nestjs/common';
import { HqEventsController } from './hq-events.controller';
import { HqEventsService } from './hq-events.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [HqEventsController],
  providers: [HqEventsService],
})
export class HqEventsModule {}
