import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '../../database';
import { eq } from 'drizzle-orm';

import { forumUser } from '../../database/schema';
import type { ForumUser, UpdateProfileRequest } from '../../../shared/api.interface';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  mapToForumUser(row: typeof forumUser.$inferSelect): ForumUser {
    return {
      id: row.id,
      username: row.username,
      displayName: row.displayName,
      avatar: row.avatar ?? null,
      city: row.city ?? null,
      organization: row.organization ?? null,
      position: row.position ?? null,
      ghostInfo: row.ghostInfo ?? null,
      ghostItems: row.ghostItems ?? null,
      realName: row.realName ?? null,
      age: row.age ?? null,
      dangerLevelSelf: row.dangerLevel ?? null,
      bio: row.bio ?? null,
      reputation: row.reputation,
      postCount: row.postCount,
      isAdmin: row.isAdmin,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async findById(id: string): Promise<ForumUser> {
    const rows = await this.db
      .select()
      .from(forumUser)
      .where(eq(forumUser.id, id));

    if (rows.length === 0) {
      throw new NotFoundException('用户不存在');
    }

    return this.mapToForumUser(rows[0]);
  }

  async findByUsername(username: string): Promise<ForumUser> {
    const rows = await this.db
      .select()
      .from(forumUser)
      .where(eq(forumUser.username, username));

    if (rows.length === 0) {
      throw new NotFoundException('用户不存在');
    }

    return this.mapToForumUser(rows[0]);
  }

  async updateProfile(userId: string, dto: UpdateProfileRequest): Promise<ForumUser> {
    const patch: Partial<typeof forumUser.$inferInsert> = {};

    if (dto.displayName !== undefined) patch.displayName = dto.displayName;
    if (dto.city !== undefined) patch.city = dto.city;
    if (dto.organization !== undefined) patch.organization = dto.organization;
    if (dto.position !== undefined) patch.position = dto.position;
    if (dto.ghostInfo !== undefined) patch.ghostInfo = dto.ghostInfo;
    if (dto.ghostItems !== undefined) patch.ghostItems = dto.ghostItems;
    if (dto.realName !== undefined) patch.realName = dto.realName;
    if (dto.age !== undefined) patch.age = dto.age;
    if (dto.dangerLevelSelf !== undefined) patch.dangerLevel = dto.dangerLevelSelf;
    if (dto.bio !== undefined) patch.bio = dto.bio;
    if (dto.avatar !== undefined) patch.avatar = dto.avatar;

    if (Object.keys(patch).length === 0) {
      throw new BadRequestException('未提供可更新字段');
    }

    const updated = await this.db
      .update(forumUser)
      .set(patch)
      .where(eq(forumUser.id, userId))
      .returning();

    if (updated.length === 0) {
      throw new NotFoundException('用户不存在');
    }

    this.logger.log(`用户资料已更新: ${userId}`);
    return this.mapToForumUser(updated[0]);
  }
}
