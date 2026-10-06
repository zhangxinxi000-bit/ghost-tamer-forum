import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '../../database';
import { eq, asc } from 'drizzle-orm';
import { board } from '../../database/schema';
import type { Board } from '../../../shared/api.interface';

@Injectable()
export class BoardsService {
  private readonly logger = new Logger(BoardsService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async findAll(): Promise<Board[]> {
    const rows = await this.db
      .select()
      .from(board)
      .orderBy(asc(board.sortOrder));

    return rows.map((row: typeof board.$inferSelect): Board => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      icon: row.icon ?? null,
      sortOrder: row.sortOrder,
      postCount: row.postCount,
    }));
  }

  async findBySlug(slug: string): Promise<Board> {
    const rows = await this.db
      .select()
      .from(board)
      .where(eq(board.slug, slug))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundException('板块不存在');
    }

    const row = rows[0];
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      icon: row.icon ?? null,
      sortOrder: row.sortOrder,
      postCount: row.postCount,
    };
  }
}
