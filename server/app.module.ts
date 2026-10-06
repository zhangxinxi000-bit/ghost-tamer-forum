import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database';
import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { ViewModule } from './modules/view/view.module';
import { UsersModule } from './modules/users/users.module';
import { BoardsModule } from './modules/boards/boards.module';
import { PostsModule } from './modules/posts/posts.module';
import { BountiesModule } from './modules/bounties/bounties.module';
import { WantedModule } from './modules/wanted/wanted.module';
import { TradesModule } from './modules/trades/trades.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { AuthModule } from './modules/auth/auth.module';
import { HqEventsModule } from './modules/hq-events/hq-events.module';
import { HqMissionsModule } from './modules/hq-missions/hq-missions.module';
import { ApplicationsModule } from './modules/applications/applications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    // ====== 业务模块 ======
    AuthModule,
    UsersModule,
    BoardsModule,
    PostsModule,
    BountiesModule,
    WantedModule,
    TradesModule,
    AnnouncementsModule,
    HqEventsModule,
    HqMissionsModule,
    ApplicationsModule,

    // SPA 路由兜底,必须放在最后
    ViewModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
