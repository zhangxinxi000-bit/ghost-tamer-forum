import { Module } from '@nestjs/common';
import { WantedController } from './wanted.controller';
import { WantedService } from './wanted.service';

@Module({
  controllers: [WantedController],
  providers: [WantedService],
})
export class WantedModule {}
