import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '../../database';
import { and, count, desc, eq } from 'drizzle-orm';

import { forumUser, trade } from '../../database/schema';
import type {
  CreateTradeRequest,
  Trade as TradeDto,
  TradeListResponse,
  TradeStatus,
  TradeType,
} from '../../../shared/api.interface';

@Injectable()
export class TradesService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async getList(params: {
    page: number;
    pageSize: number;
    tradeType?: TradeType;
    itemType?: string;
    status?: TradeStatus;
  }): Promise<TradeListResponse> {
    const { page, pageSize, tradeType, itemType, status } = params;
    const conditions = [];
    if (tradeType) conditions.push(eq(trade.tradeType, tradeType));
    if (itemType) conditions.push(eq(trade.itemType, itemType));
    if (status) conditions.push(eq(trade.status, status));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await this.db
      .select({ count: count() })
      .from(trade)
      .where(whereClause);
    const total: number = totalResult[0]?.count ?? 0;

    const offset = (page - 1) * pageSize;
    const rows = await this.db
      .select({
        id: trade.id,
        title: trade.title,
        content: trade.content,
        tradeType: trade.tradeType,
        itemType: trade.itemType,
        price: trade.price,
        status: trade.status,
        createdAt: trade.createdAt,
        authorId: forumUser.id,
        authorDisplayName: forumUser.displayName,
        authorAvatar: forumUser.avatar,
      })
      .from(trade)
      .innerJoin(forumUser, eq(trade.userId, forumUser.id))
      .where(whereClause)
      .orderBy(desc(trade.createdAt))
      .limit(pageSize)
      .offset(offset);

    const items: TradeDto[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      tradeType: row.tradeType as TradeType,
      itemType: row.itemType,
      price: row.price ?? null,
      status: row.status as TradeStatus,
      author: {
        id: row.authorId,
        displayName: row.authorDisplayName,
        avatar: row.authorAvatar ?? null,
      },
      createdAt: row.createdAt.toISOString(),
    }));

    return { items, total, page, pageSize };
  }

  async getDetail(id: string): Promise<TradeDto> {
    const rows = await this.db
      .select({
        id: trade.id,
        title: trade.title,
        content: trade.content,
        tradeType: trade.tradeType,
        itemType: trade.itemType,
        price: trade.price,
        status: trade.status,
        createdAt: trade.createdAt,
        authorId: forumUser.id,
        authorDisplayName: forumUser.displayName,
        authorAvatar: forumUser.avatar,
      })
      .from(trade)
      .innerJoin(forumUser, eq(trade.userId, forumUser.id))
      .where(eq(trade.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundException('交易帖不存在');
    }

    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      tradeType: row.tradeType as TradeType,
      itemType: row.itemType,
      price: row.price ?? null,
      status: row.status as TradeStatus,
      author: {
        id: row.authorId,
        displayName: row.authorDisplayName,
        avatar: row.authorAvatar ?? null,
      },
      createdAt: row.createdAt.toISOString(),
    };
  }

  async create(userId: string, dto: CreateTradeRequest): Promise<TradeDto> {
    const inserted = await this.db
      .insert(trade)
      .values({
        userId,
        title: dto.title,
        content: dto.content,
        tradeType: dto.tradeType,
        itemType: dto.itemType,
        price: dto.price ?? null,
      })
      .returning({ id: trade.id });

    const newId: string = inserted[0].id;
    return this.getDetail(newId);
  }
}
