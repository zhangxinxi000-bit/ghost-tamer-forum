import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '../../database';
import { and, count, desc, eq } from 'drizzle-orm';

import { forumUser, hqEvent } from '../../database/schema';
import type {
  HqEvent as HqEventDto,
  HqEventListResponse,
  HqEventStatus,
  DangerLevel,
} from '../../../shared/api.interface';

type SortType = 'latest' | 'views';

@Injectable()
export class HqEventsService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async getList(params: {
    page: number;
    pageSize: number;
    dangerLevel?: DangerLevel;
    status?: HqEventStatus;
    sort?: SortType;
  }): Promise<HqEventListResponse> {
    const { page, pageSize, dangerLevel, status, sort = 'latest' } = params;
    const conditions = [];
    if (dangerLevel) conditions.push(eq(hqEvent.dangerLevel, dangerLevel));
    if (status) conditions.push(eq(hqEvent.status, status));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orderBy =
      sort === 'views'
        ? [desc(hqEvent.isPinned), desc(hqEvent.viewCount), desc(hqEvent.createdAt)]
        : [desc(hqEvent.isPinned), desc(hqEvent.createdAt)];

    const totalResult = await this.db
      .select({ count: count() })
      .from(hqEvent)
      .where(whereClause);
    const total: number = totalResult[0]?.count ?? 0;

    const offset = (page - 1) * pageSize;
    const rows = await this.db
      .select({
        id: hqEvent.id,
        title: hqEvent.title,
        content: hqEvent.content,
        dangerLevel: hqEvent.dangerLevel,
        eventLocation: hqEvent.eventLocation,
        ghostName: hqEvent.ghostName,
        ghostRules: hqEvent.ghostRules,
        status: hqEvent.status,
        isPinned: hqEvent.isPinned,
        viewCount: hqEvent.viewCount,
        createdAt: hqEvent.createdAt,
        updatedAt: hqEvent.updatedAt,
        authorId: forumUser.id,
        authorDisplayName: forumUser.displayName,
        authorAvatar: forumUser.avatar,
        authorOrganization: forumUser.organization,
        authorPosition: forumUser.position,
      })
      .from(hqEvent)
      .innerJoin(forumUser, eq(hqEvent.userId, forumUser.id))
      .where(whereClause)
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset(offset);

    const items: HqEventDto[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      dangerLevel: row.dangerLevel as DangerLevel,
      eventLocation: row.eventLocation ?? null,
      ghostName: row.ghostName ?? null,
      ghostRules: row.ghostRules ?? null,
      status: row.status as HqEventStatus,
      isPinned: row.isPinned,
      viewCount: row.viewCount,
      author: {
        id: row.authorId,
        displayName: row.authorDisplayName,
        avatar: row.authorAvatar ?? null,
        organization: row.authorOrganization ?? null,
        position: row.authorPosition ?? null,
      },
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));

    return { items, total, page, pageSize };
  }

  async getDetail(id: string): Promise<HqEventDto> {
    const rows = await this.db
      .select({
        id: hqEvent.id,
        title: hqEvent.title,
        content: hqEvent.content,
        dangerLevel: hqEvent.dangerLevel,
        eventLocation: hqEvent.eventLocation,
        ghostName: hqEvent.ghostName,
        ghostRules: hqEvent.ghostRules,
        status: hqEvent.status,
        isPinned: hqEvent.isPinned,
        viewCount: hqEvent.viewCount,
        createdAt: hqEvent.createdAt,
        updatedAt: hqEvent.updatedAt,
        authorId: forumUser.id,
        authorDisplayName: forumUser.displayName,
        authorAvatar: forumUser.avatar,
        authorOrganization: forumUser.organization,
        authorPosition: forumUser.position,
      })
      .from(hqEvent)
      .innerJoin(forumUser, eq(hqEvent.userId, forumUser.id))
      .where(eq(hqEvent.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundException('事件通报不存在');
    }

    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      dangerLevel: row.dangerLevel as DangerLevel,
      eventLocation: row.eventLocation ?? null,
      ghostName: row.ghostName ?? null,
      ghostRules: row.ghostRules ?? null,
      status: row.status as HqEventStatus,
      isPinned: row.isPinned,
      viewCount: row.viewCount,
      author: {
        id: row.authorId,
        displayName: row.authorDisplayName,
        avatar: row.authorAvatar ?? null,
        organization: row.authorOrganization ?? null,
        position: row.authorPosition ?? null,
      },
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async create(
    userId: string,
    dto: {
      title: string;
      content: string;
      dangerLevel: DangerLevel;
      eventLocation?: string;
      ghostName?: string;
      ghostRules?: string;
      status?: HqEventStatus;
      isPinned?: boolean;
    },
  ): Promise<HqEventDto> {
    const userRows = await this.db
      .select({ organization: forumUser.organization })
      .from(forumUser)
      .where(eq(forumUser.id, userId))
      .limit(1);

    if (userRows.length === 0) {
      throw new ForbiddenException('用户不存在');
    }

    const org: string | null = userRows[0].organization ?? null;
    const isHq: boolean =
      !!org && (org.includes('总部') || org.includes('全球灵异事件处理总部'));
    if (!isHq) {
      throw new ForbiddenException('仅总部成员可发布事件通报');
    }

    const inserted = await this.db
      .insert(hqEvent)
      .values({
        userId,
        title: dto.title,
        content: dto.content,
        dangerLevel: dto.dangerLevel,
        eventLocation: dto.eventLocation ?? null,
        ghostName: dto.ghostName ?? null,
        ghostRules: dto.ghostRules ?? null,
        status: dto.status ?? 'active',
        isPinned: dto.isPinned ?? false,
      })
      .returning({ id: hqEvent.id });

    const newId: string = inserted[0].id;
    return this.getDetail(newId);
  }
}
