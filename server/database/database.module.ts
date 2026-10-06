import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase as DrizzlePostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

/**
 * 依赖注入 token:drizzle 数据库实例。
 * 业务服务通过 `@Inject(DRIZZLE_DATABASE)` 获取。
 */
export const DRIZZLE_DATABASE = Symbol('DRIZZLE_DATABASE');

export type PostgresJsDatabase = DrizzlePostgresJsDatabase;

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_DATABASE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        if (!databaseUrl) {
          throw new Error(
            '缺少 DATABASE_URL 环境变量。请复制 .env.example 为 .env 并配置 PostgreSQL 连接串。',
          );
        }
        const client = postgres(databaseUrl, {
          prepare: false,
          onnotice: () => {},
        });
        return drizzle(client);
      },
    },
  ],
  exports: [DRIZZLE_DATABASE],
})
export class DatabaseModule {}
