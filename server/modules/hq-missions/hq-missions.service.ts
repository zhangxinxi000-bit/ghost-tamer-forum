import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '../../database';
import { and, count, desc, eq } from 'drizzle-orm';

import { forumUser, hqMission } from '../../database/schema';
import type {
  CreateHqMissionRequest,
  DangerLevel,
  HqMission as HqMissionDto,
  HqMissionListResponse,
  HqMissionStatus,
  HqMissionType,
} from '../../../shared/api.interface';

type SortType = 'latest' | 'reward';

@Injectable()
export class HqMissionsService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async getList(params: {
    page: number;
    pageSize: number;
    dangerLevel?: DangerLevel;
    status?: HqMissionStatus;
    missionType?: HqMissionType;
    sort?: SortType;
  }): Promise<HqMissionListResponse> {
    const {
      page,
      pageSize,
      dangerLevel,
      status,
      missionType,
      sort = 'latest',
    } = params;
    const conditions = [];
    if (dangerLevel) conditions.push(eq(hqMission.dangerLevel, dangerLevel));
    if (status) conditions.push(eq(hqMission.status, status));
    if (missionType) conditions.push(eq(hqMission.missionType, missionType));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const baseOrder =
      sort === 'reward'
        ? [desc(hqMission.reward), desc(hqMission.createdAt)]
        : [desc(hqMission.createdAt)];
    const orderBy = [desc(hqMission.isPinned), ...baseOrder];

    const totalResult = await this.db
      .select({ count: count() })
      .from(hqMission)
      .where(whereClause);
    const total: number = totalResult[0]?.count ?? 0;

    const offset = (page - 1) * pageSize;
    const rows = await this.db
      .select({
        id: hqMission.id,
        title: hqMission.title,
        content: hqMission.content,
        missionType: hqMission.missionType,
        dangerLevel: hqMission.dangerLevel,
        location: hqMission.location,
        requirements: hqMission.requirements,
        status: hqMission.status,
        reward: hqMission.reward,
        isPinned: hqMission.isPinned,
        createdAt: hqMission.createdAt,
        updatedAt: hqMission.updatedAt,
        authorId: forumUser.id,
        authorDisplayName: forumUser.displayName,
        authorAvatar: forumUser.avatar,
        authorOrganization: forumUser.organization,
        authorPosition: forumUser.position,
      })
      .from(hqMission)
      .innerJoin(forumUser, eq(hqMission.userId, forumUser.id))
      .where(whereClause)
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset(offset);

    const items: HqMissionDto[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      missionType: row.missionType as HqMissionType,
      dangerLevel: row.dangerLevel as DangerLevel,
      location: row.location ?? null,
      requirements: row.requirements ?? null,
      status: row.status as HqMissionStatus,
      reward: row.reward,
      isPinned: row.isPinned,
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

  async getDetail(id: string): Promise<HqMissionDto> {
    const rows = await this.db
      .select({
        id: hqMission.id,
        title: hqMission.title,
        content: hqMission.content,
        missionType: hqMission.missionType,
        dangerLevel: hqMission.dangerLevel,
        location: hqMission.location,
        requirements: hqMission.requirements,
        status: hqMission.status,
        reward: hqMission.reward,
        isPinned: hqMission.isPinned,
        createdAt: hqMission.createdAt,
        updatedAt: hqMission.updatedAt,
        authorId: forumUser.id,
        authorDisplayName: forumUser.displayName,
        authorAvatar: forumUser.avatar,
        authorOrganization: forumUser.organization,
        authorPosition: forumUser.position,
      })
      .from(hqMission)
      .innerJoin(forumUser, eq(hqMission.userId, forumUser.id))
      .where(eq(hqMission.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundException('任务不存在');
    }

    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      missionType: row.missionType as HqMissionType,
      dangerLevel: row.dangerLevel as DangerLevel,
      location: row.location ?? null,
      requirements: row.requirements ?? null,
      status: row.status as HqMissionStatus,
      reward: row.reward,
      isPinned: row.isPinned,
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
    dto: CreateHqMissionRequest,
  ): Promise<HqMissionDto> {
    const users = await this.db
      .select({
        organization: forumUser.organization,
      })
      .from(forumUser)
      .where(eq(forumUser.id, userId))
      .limit(1);

    if (users.length === 0) {
      throw new ForbiddenException('用户不存在');
    }

    const org: string | null = users[0].organization;
    const isHq: boolean =
      org !== null &&
      (org.includes('总部') || org.includes('全球灵异事件处理总部'));

    if (!isHq) {
      throw new ForbiddenException('仅总部成员可发布任务指派');
    }

    const inserted = await this.db
      .insert(hqMission)
      .values({
        userId,
        title: dto.title,
        content: dto.content,
        missionType: dto.missionType ?? 'support',
        dangerLevel: dto.dangerLevel,
        location: dto.location ?? null,
        requirements: dto.requirements ?? null,
        status: dto.status ?? 'pending',
        reward: dto.reward ?? 0,
        isPinned: dto.isPinned ?? false,
      })
      .returning({ id: hqMission.id });

    const newId: string = inserted[0].id;
    return this.getDetail(newId);
  }
}
