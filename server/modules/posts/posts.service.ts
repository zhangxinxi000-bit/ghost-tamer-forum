import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '../../database';
import { eq, and, desc, asc, ilike, count, sql } from 'drizzle-orm';
import { post, reply, forumUser, board } from '../../database/schema';
import type {
  PostSummary,
  PostDetail,
  PostListResponse,
  ReplyListResponse,
  Reply,
  CreatePostRequest,
  CreateReplyRequest,
  ForumUser,
} from '../../../shared/api.interface';

type PostSort = 'latest' | 'hot';

interface PostAuthorSummary {
  id: string;
  displayName: string;
  avatar: string | null;
}

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async findPosts(params: {
    boardId?: string;
    page: number;
    pageSize: number;
    sort: PostSort;
    keyword?: string;
  }): Promise<PostListResponse> {
    const { boardId, page, pageSize, sort, keyword } = params;
    const offset = (page - 1) * pageSize;

    const conditions: ReturnType<typeof eq>[] = [];
    if (boardId) conditions.push(eq(post.boardId, boardId));
    if (keyword) conditions.push(ilike(post.title, `%${keyword}%`));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Count total
    const totalResult = await this.db
      .select({ count: count() })
      .from(post)
      .where(whereClause);
    const total: number = totalResult[0]?.count ?? 0;

    // Base order: pinned first, then by sort param
    const orderByClause =
      sort === 'hot'
        ? [desc(post.isPinned), desc(sql<number>`${post.replyCount} + ${post.viewCount}`), desc(post.createdAt)]
        : [desc(post.isPinned), desc(post.createdAt)];

    const rows = await this.db
      .select({
        id: post.id,
        boardId: post.boardId,
        title: post.title,
        isPinned: post.isPinned,
        isEssence: post.isEssence,
        viewCount: post.viewCount,
        replyCount: post.replyCount,
        lastReplyAt: post.lastReplyAt,
        createdAt: post.createdAt,
        authorId: forumUser.id,
        authorDisplayName: forumUser.displayName,
        authorAvatar: forumUser.avatar,
      })
      .from(post)
      .innerJoin(forumUser, eq(post.userId, forumUser.id))
      .where(whereClause)
      .orderBy(...orderByClause)
      .limit(pageSize)
      .offset(offset);

    const items: PostSummary[] = rows.map((row): PostSummary => {
      const author: PostAuthorSummary = {
        id: row.authorId,
        displayName: row.authorDisplayName,
        avatar: row.authorAvatar ?? null,
      };
      return {
        id: row.id,
        boardId: row.boardId,
        title: row.title,
        isPinned: row.isPinned,
        isEssence: row.isEssence,
        viewCount: row.viewCount,
        replyCount: row.replyCount,
        author,
        lastReplyAt: row.lastReplyAt ? row.lastReplyAt.toISOString() : null,
        createdAt: row.createdAt.toISOString(),
      };
    });

    return { items, total, page, pageSize };
  }

  async findPostDetail(id: string): Promise<PostDetail> {
    const rows = await this.db
      .select({
        id: post.id,
        boardId: post.boardId,
        title: post.title,
        content: post.content,
        isPinned: post.isPinned,
        isEssence: post.isEssence,
        viewCount: post.viewCount,
        replyCount: post.replyCount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        authorId: forumUser.id,
        authorUsername: forumUser.username,
        authorDisplayName: forumUser.displayName,
        authorAvatar: forumUser.avatar,
        authorCity: forumUser.city,
        authorOrganization: forumUser.organization,
        authorPosition: forumUser.position,
        authorGhostInfo: forumUser.ghostInfo,
        authorGhostItems: forumUser.ghostItems,
        authorRealName: forumUser.realName,
        authorAge: forumUser.age,
        authorDangerLevel: forumUser.dangerLevel,
        authorBio: forumUser.bio,
        authorReputation: forumUser.reputation,
        authorPostCount: forumUser.postCount,
        authorIsAdmin: forumUser.isAdmin,
        authorCreatedAt: forumUser.createdAt,
      })
      .from(post)
      .innerJoin(forumUser, eq(post.userId, forumUser.id))
      .where(eq(post.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundException('帖子不存在');
    }

    const row = rows[0];
    const author: ForumUser = {
      id: row.authorId,
      username: row.authorUsername,
      displayName: row.authorDisplayName,
      avatar: row.authorAvatar ?? null,
      city: row.authorCity ?? null,
      organization: row.authorOrganization ?? null,
      position: row.authorPosition ?? null,
        ghostInfo: row.authorGhostInfo ?? null,
        ghostItems: row.authorGhostItems ?? null,
        realName: row.authorRealName ?? null,
        age: row.authorAge ?? null,
        dangerLevelSelf: row.authorDangerLevel ?? null,
        bio: row.authorBio ?? null,
      reputation: row.authorReputation,
      postCount: row.authorPostCount,
      isAdmin: row.authorIsAdmin,
      createdAt: row.authorCreatedAt.toISOString(),
    };

    return {
      id: row.id,
      boardId: row.boardId,
      title: row.title,
      content: row.content,
      isPinned: row.isPinned,
      isEssence: row.isEssence,
      viewCount: row.viewCount,
      replyCount: row.replyCount,
      author,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.db
      .update(post)
      .set({ viewCount: sql<number>`${post.viewCount} + 1` })
      .where(eq(post.id, id));
  }

  async createPost(userId: string, dto: CreatePostRequest): Promise<PostDetail> {
    if (!dto.boardId || !dto.title || !dto.content) {
      throw new BadRequestException('boardId、title、content 均为必填');
    }

    const result = await this.db.transaction(async (tx) => {
      // Verify board exists
      const boardRows = await tx
        .select({ id: board.id })
        .from(board)
        .where(eq(board.id, dto.boardId))
        .limit(1);
      if (boardRows.length === 0) {
        throw new BadRequestException('板块不存在');
      }

      // Create post
      const inserted = await tx
        .insert(post)
        .values({
          boardId: dto.boardId,
          userId,
          title: dto.title,
          content: dto.content,
        })
        .returning();
      const newPost = inserted[0];

      // Update board post_count
      await tx
        .update(board)
        .set({ postCount: sql<number>`${board.postCount} + 1` })
        .where(eq(board.id, dto.boardId));

      // Update user post_count
      await tx
        .update(forumUser)
        .set({ postCount: sql<number>`${forumUser.postCount} + 1` })
        .where(eq(forumUser.id, userId));

      return newPost;
    });

    return this.findPostDetail(result.id);
  }

  async findReplies(params: {
    postId: string;
    page: number;
    pageSize: number;
    authorOnly: boolean;
  }): Promise<ReplyListResponse> {
    const { postId, page, pageSize, authorOnly } = params;
    const offset = (page - 1) * pageSize;

    // Verify post exists
    const postRows = await this.db
      .select({ id: post.id, userId: post.userId })
      .from(post)
      .where(eq(post.id, postId))
      .limit(1);
    if (postRows.length === 0) {
      throw new NotFoundException('帖子不存在');
    }
    const postAuthorId: string = postRows[0].userId;

    const conditions = [eq(reply.postId, postId)];
    if (authorOnly) {
      conditions.push(eq(reply.userId, postAuthorId));
    }
    const whereClause = and(...conditions);

    const totalResult = await this.db
      .select({ count: count() })
      .from(reply)
      .where(whereClause);
    const total: number = totalResult[0]?.count ?? 0;

    const rows = await this.db
      .select({
        id: reply.id,
        postId: reply.postId,
        content: reply.content,
        floor: reply.floor,
        createdAt: reply.createdAt,
        authorId: forumUser.id,
        authorUsername: forumUser.username,
        authorDisplayName: forumUser.displayName,
        authorAvatar: forumUser.avatar,
        authorCity: forumUser.city,
        authorOrganization: forumUser.organization,
        authorPosition: forumUser.position,
        authorGhostInfo: forumUser.ghostInfo,
        authorGhostItems: forumUser.ghostItems,
        authorRealName: forumUser.realName,
        authorAge: forumUser.age,
        authorDangerLevel: forumUser.dangerLevel,
        authorBio: forumUser.bio,
        authorReputation: forumUser.reputation,
        authorPostCount: forumUser.postCount,
        authorIsAdmin: forumUser.isAdmin,
        authorCreatedAt: forumUser.createdAt,
      })
      .from(reply)
      .innerJoin(forumUser, eq(reply.userId, forumUser.id))
      .where(whereClause)
      .orderBy(asc(reply.floor))
      .limit(pageSize)
      .offset(offset);

    const items: Reply[] = rows.map((row): Reply => {
      const author: ForumUser = {
        id: row.authorId,
        username: row.authorUsername,
        displayName: row.authorDisplayName,
        avatar: row.authorAvatar ?? null,
        city: row.authorCity ?? null,
        organization: row.authorOrganization ?? null,
        position: row.authorPosition ?? null,
        ghostInfo: row.authorGhostInfo ?? null,
        ghostItems: row.authorGhostItems ?? null,
        realName: row.authorRealName ?? null,
        age: row.authorAge ?? null,
        dangerLevelSelf: row.authorDangerLevel ?? null,
        bio: row.authorBio ?? null,
        reputation: row.authorReputation,
        postCount: row.authorPostCount,
        isAdmin: row.authorIsAdmin,
        createdAt: row.authorCreatedAt.toISOString(),
      };
      return {
        id: row.id,
        postId: row.postId,
        content: row.content,
        floor: row.floor,
        author,
        createdAt: row.createdAt.toISOString(),
      };
    });

    return { items, total, page, pageSize };
  }

  async createReply(postId: string, userId: string, dto: CreateReplyRequest): Promise<Reply> {
    if (!dto.content) {
      throw new BadRequestException('content 为必填');
    }

    const result = await this.db.transaction(async (tx) => {
      // Verify post exists and get current reply count
      const postRows = await tx
        .select({ id: post.id, replyCount: post.replyCount })
        .from(post)
        .where(eq(post.id, postId))
        .limit(1);
      if (postRows.length === 0) {
        throw new NotFoundException('帖子不存在');
      }
      const currentReplyCount: number = postRows[0].replyCount;
      const floor: number = currentReplyCount + 1;

      // Create reply
      const inserted = await tx
        .insert(reply)
        .values({
          postId,
          userId,
          content: dto.content,
          floor,
        })
        .returning();
      const newReply = inserted[0];

      // Update post reply_count and last_reply_at
      const now = new Date();
      await tx
        .update(post)
        .set({
          replyCount: sql<number>`${post.replyCount} + 1`,
          lastReplyAt: now,
        })
        .where(eq(post.id, postId));

      return newReply;
    });

    // Fetch with author info
    const rows = await this.db
      .select({
        id: reply.id,
        postId: reply.postId,
        content: reply.content,
        floor: reply.floor,
        createdAt: reply.createdAt,
        authorId: forumUser.id,
        authorUsername: forumUser.username,
        authorDisplayName: forumUser.displayName,
        authorAvatar: forumUser.avatar,
        authorCity: forumUser.city,
        authorOrganization: forumUser.organization,
        authorPosition: forumUser.position,
        authorGhostInfo: forumUser.ghostInfo,
        authorGhostItems: forumUser.ghostItems,
        authorRealName: forumUser.realName,
        authorAge: forumUser.age,
        authorDangerLevel: forumUser.dangerLevel,
        authorBio: forumUser.bio,
        authorReputation: forumUser.reputation,
        authorPostCount: forumUser.postCount,
        authorIsAdmin: forumUser.isAdmin,
        authorCreatedAt: forumUser.createdAt,
      })
      .from(reply)
      .innerJoin(forumUser, eq(reply.userId, forumUser.id))
      .where(eq(reply.id, result.id))
      .limit(1);

    const row = rows[0];
    const author: ForumUser = {
      id: row.authorId,
      username: row.authorUsername,
      displayName: row.authorDisplayName,
      avatar: row.authorAvatar ?? null,
      city: row.authorCity ?? null,
      organization: row.authorOrganization ?? null,
      position: row.authorPosition ?? null,
      ghostInfo: row.authorGhostInfo ?? null,
      ghostItems: row.authorGhostItems ?? null,
      realName: row.authorRealName ?? null,
      age: row.authorAge ?? null,
      dangerLevelSelf: row.authorDangerLevel ?? null,
      bio: row.authorBio ?? null,
      reputation: row.authorReputation,
      postCount: row.authorPostCount,
      isAdmin: row.authorIsAdmin,
      createdAt: row.authorCreatedAt.toISOString(),
    };
    return {
      id: row.id,
      postId: row.postId,
      content: row.content,
      floor: row.floor,
      author,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
