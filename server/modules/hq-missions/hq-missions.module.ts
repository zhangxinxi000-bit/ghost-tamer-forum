import { Module } from '@nestjs/common';
import { HqMissionsController } from './hq-missions.controller';
import { HqMissionsService } from './hq-missions.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [HqMissionsController],
  providers: [HqMissionsService],
})
export class HqMissionsModule {}
