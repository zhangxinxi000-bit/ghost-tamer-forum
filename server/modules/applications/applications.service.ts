import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '../../database';
import { and, count, desc, eq, inArray } from 'drizzle-orm';

import { application, forumUser } from '../../database/schema';
import type {
  Application as ApplicationDto,
  ApplicationListResponse,
  ApplicationStatus,
  ApplicationType,
  CreateApplicationRequest,
  ReviewApplicationRequest,
} from '../../../shared/api.interface';

@Injectable()
export class ApplicationsService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  private mapRow(row: Record<string, unknown>, reviewerMap: Map<string, { id: string; displayName: string; avatar: string | null }>): ApplicationDto {
    const reviewerId: string | null = (row.reviewerId as string | null) ?? null;
    return {
      id: row.id as string,
      type: row.type as ApplicationType,
      title: row.title as string,
      content: row.content as string,
      targetOrganization: (row.targetOrganization as string | null) ?? null,
      itemName: (row.itemName as string | null) ?? null,
      status: row.status as ApplicationStatus,
      author: {
        id: row.authorId as string,
        displayName: row.authorDisplayName as string,
        avatar: (row.authorAvatar as string | null) ?? null,
        organization: (row.authorOrganization as string | null) ?? null,
        position: (row.authorPosition as string | null) ?? null,
      },
      reviewer: reviewerId ? reviewerMap.get(reviewerId) ?? null : null,
      reviewComment: (row.reviewComment as string | null) ?? null,
      reviewedAt: row.reviewedAt ? (row.reviewedAt as Date).toISOString() : null,
      createdAt: (row.createdAt as Date).toISOString(),
      updatedAt: (row.updatedAt as Date).toISOString(),
    };
  }

  private async loadReviewers(rows: Array<Record<string, unknown>>): Promise<Map<string, { id: string; displayName: string; avatar: string | null }>> {
    const reviewerIds: string[] = rows
      .filter((row) => row.reviewerId)
      .map((row) => row.reviewerId as string);
    const reviewerMap: Map<string, { id: string; displayName: string; avatar: string | null }> = new Map();
    if (reviewerIds.length === 0) return reviewerMap;
    const reviewerRows = await this.db
      .select({
        id: forumUser.id,
        displayName: forumUser.displayName,
        avatar: forumUser.avatar,
      })
      .from(forumUser)
      .where(inArray(forumUser.id, reviewerIds));
    for (const r of reviewerRows) {
      reviewerMap.set(r.id, {
        id: r.id,
        displayName: r.displayName,
        avatar: r.avatar ?? null,
      });
    }
    return reviewerMap;
  }

  async getList(params: {
    page: number;
    pageSize: number;
    type?: ApplicationType;
    status?: ApplicationStatus;
    userId?: string;
  }): Promise<ApplicationListResponse> {
    const { page, pageSize, type, status, userId } = params;
    const conditions = [];
    if (type) conditions.push(eq(application.type, type));
    if (status) conditions.push(eq(application.status, status));
    if (userId) conditions.push(eq(application.userId, userId));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await this.db
      .select({ count: count() })
      .from(application)
      .where(whereClause);
    const total: number = totalResult[0]?.count ?? 0;

    const offset = (page - 1) * pageSize;
    const rows = await this.db
      .select({
        id: application.id,
        type: application.type,
        title: application.title,
        content: application.content,
        targetOrganization: application.targetOrganization,
        itemName: application.itemName,
        status: application.status,
        reviewComment: application.reviewComment,
        reviewedAt: application.reviewedAt,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        reviewerId: application.reviewerId,
        authorId: forumUser.id,
        authorDisplayName: forumUser.displayName,
        authorAvatar: forumUser.avatar,
        authorOrganization: forumUser.organization,
        authorPosition: forumUser.position,
      })
      .from(application)
      .leftJoin(forumUser, eq(application.userId, forumUser.id))
      .where(whereClause)
      .orderBy(desc(application.createdAt))
      .limit(pageSize)
      .offset(offset);

    const reviewerMap = await this.loadReviewers(rows as unknown as Array<Record<string, unknown>>);
    const items: ApplicationDto[] = rows.map((row) =>
      this.mapRow(row as unknown as Record<string, unknown>, reviewerMap),
    );

    return { items, total, page, pageSize };
  }

  async getDetail(id: string): Promise<ApplicationDto> {
    const rows = await this.db
      .select({
        id: application.id,
        type: application.type,
        title: application.title,
        content: application.content,
        targetOrganization: application.targetOrganization,
        itemName: application.itemName,
        status: application.status,
        reviewComment: application.reviewComment,
        reviewedAt: application.reviewedAt,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        reviewerId: application.reviewerId,
        authorId: forumUser.id,
        authorDisplayName: forumUser.displayName,
        authorAvatar: forumUser.avatar,
        authorOrganization: forumUser.organization,
        authorPosition: forumUser.position,
      })
      .from(application)
      .leftJoin(forumUser, eq(application.userId, forumUser.id))
      .where(eq(application.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundException('申请不存在');
    }

    const reviewerMap = await this.loadReviewers(rows as unknown as Array<Record<string, unknown>>);
    return this.mapRow(rows[0] as unknown as Record<string, unknown>, reviewerMap);
  }

  async create(
    userId: string,
    dto: CreateApplicationRequest,
  ): Promise<ApplicationDto> {
    const inserted = await this.db
      .insert(application)
      .values({
        userId,
        type: dto.type,
        title: dto.title,
        content: dto.content,
        targetOrganization: dto.targetOrganization ?? null,
        itemName: dto.itemName ?? null,
        status: 'pending',
      })
      .returning({ id: application.id });

    const newId: string = inserted[0].id;
    return this.getDetail(newId);
  }

  async review(
    id: string,
    reviewerId: string,
    dto: ReviewApplicationRequest,
  ): Promise<ApplicationDto> {
    const reviewerRows = await this.db
      .select({
        organization: forumUser.organization,
      })
      .from(forumUser)
      .where(eq(forumUser.id, reviewerId))
      .limit(1);

    if (
      reviewerRows.length === 0 ||
      !reviewerRows[0].organization ||
      !reviewerRows[0].organization.includes('总部')
    ) {
      throw new ForbiddenException('无审批权限，需为总部成员');
    }

    const updated = await this.db
      .update(application)
      .set({
        status: dto.status,
        reviewComment: dto.reviewComment,
        reviewerId,
        reviewedAt: new Date(),
      })
      .where(eq(application.id, id))
      .returning({ id: application.id });

    if (updated.length === 0) {
      throw new NotFoundException('申请不存在');
    }

    return this.getDetail(updated[0].id);
  }
}
