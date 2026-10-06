import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '../../database';
import { and, count, desc, eq } from 'drizzle-orm';

import { bounty, forumUser } from '../../database/schema';
import type {
  Bounty as BountyDto,
  BountyListResponse,
  BountyStatus,
  CreateBountyRequest,
  DangerLevel,
} from '../../../shared/api.interface';

type SortType = 'latest' | 'reward';

@Injectable()
export class BountiesService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async getList(params: {
    page: number;
    pageSize: number;
    dangerLevel?: DangerLevel;
    status?: BountyStatus;
    sort?: SortType;
  }): Promise<BountyListResponse> {
    const { page, pageSize, dangerLevel, status, sort = 'latest' } = params;
    const conditions = [];
    if (dangerLevel) conditions.push(eq(bounty.dangerLevel, dangerLevel));
    if (status) conditions.push(eq(bounty.status, status));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderBy =
      sort === 'reward'
        ? [desc(bounty.reward), desc(bounty.createdAt)]
        : [desc(bounty.createdAt)];

    const totalResult = await this.db
      .select({ count: count() })
      .from(bounty)
      .where(whereClause);
    const total: number = totalResult[0]?.count ?? 0;

    const offset = (page - 1) * pageSize;
    const rows = await this.db
      .select({
        id: bounty.id,
        title: bounty.title,
        description: bounty.description,
        dangerLevel: bounty.dangerLevel,
        reward: bounty.reward,
        status: bounty.status,
        location: bounty.location,
        ghostName: bounty.ghostName,
        ghostRules: bounty.ghostRules,
        createdAt: bounty.createdAt,
        authorId: forumUser.id,
        authorDisplayName: forumUser.displayName,
        authorAvatar: forumUser.avatar,
      })
      .from(bounty)
      .innerJoin(forumUser, eq(bounty.userId, forumUser.id))
      .where(whereClause)
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset(offset);

    const items: BountyDto[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      dangerLevel: row.dangerLevel as DangerLevel,
      reward: row.reward,
      status: row.status as BountyStatus,
      location: row.location ?? null,
      ghostName: row.ghostName ?? null,
      ghostRules: row.ghostRules ?? null,
      author: {
        id: row.authorId,
        displayName: row.authorDisplayName,
        avatar: row.authorAvatar ?? null,
      },
      createdAt: row.createdAt.toISOString(),
    }));

    return { items, total, page, pageSize };
  }

  async getDetail(id: string): Promise<BountyDto> {
    const rows = await this.db
      .select({
        id: bounty.id,
        title: bounty.title,
        description: bounty.description,
        dangerLevel: bounty.dangerLevel,
        reward: bounty.reward,
        status: bounty.status,
        location: bounty.location,
        ghostName: bounty.ghostName,
        ghostRules: bounty.ghostRules,
        createdAt: bounty.createdAt,
        authorId: forumUser.id,
        authorDisplayName: forumUser.displayName,
        authorAvatar: forumUser.avatar,
      })
      .from(bounty)
      .innerJoin(forumUser, eq(bounty.userId, forumUser.id))
      .where(eq(bounty.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundException('悬赏不存在');
    }

    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      dangerLevel: row.dangerLevel as DangerLevel,
      reward: row.reward,
      status: row.status as BountyStatus,
      location: row.location ?? null,
      ghostName: row.ghostName ?? null,
      ghostRules: row.ghostRules ?? null,
      author: {
        id: row.authorId,
        displayName: row.authorDisplayName,
        avatar: row.authorAvatar ?? null,
      },
      createdAt: row.createdAt.toISOString(),
    };
  }

  async create(userId: string, dto: CreateBountyRequest): Promise<BountyDto> {
    const inserted = await this.db
      .insert(bounty)
      .values({
        userId,
        title: dto.title,
        description: dto.description,
        dangerLevel: dto.dangerLevel,
        reward: dto.reward,
        location: dto.location ?? null,
        ghostName: dto.ghostName ?? null,
        ghostRules: dto.ghostRules ?? null,
      })
      .returning({ id: bounty.id });

    const newId: string = inserted[0].id;
    return this.getDetail(newId);
  }
}
