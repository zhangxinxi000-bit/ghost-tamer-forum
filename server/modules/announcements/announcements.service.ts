import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '../../database';
import { count, desc, eq, sql } from 'drizzle-orm';

import { announcement } from '../../database/schema';
import type {
  Announcement as AnnouncementDto,
  AnnouncementListResponse,
} from '../../../shared/api.interface';

@Injectable()
export class AnnouncementsService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async getList(params: {
    page: number;
    pageSize: number;
  }): Promise<AnnouncementListResponse> {
    const { page, pageSize } = params;

    const totalResult = await this.db
      .select({ count: count() })
      .from(announcement);
    const total: number = totalResult[0]?.count ?? 0;

    const offset = (page - 1) * pageSize;
    const rows = await this.db
      .select()
      .from(announcement)
      .orderBy(
        sql`${announcement.isPinned} DESC`,
        desc(announcement.createdAt),
      )
      .limit(pageSize)
      .offset(offset);

    const items: AnnouncementDto[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      isPinned: row.isPinned,
      createdAt: row.createdAt.toISOString(),
    }));

    return { items, total, page, pageSize };
  }

  async getDetail(id: string): Promise<AnnouncementDto> {
    const rows = await this.db
      .select()
      .from(announcement)
      .where(eq(announcement.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundException('公告不存在');
    }

    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      isPinned: row.isPinned,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
