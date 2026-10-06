import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '../../database';
import { and, count, desc, eq } from 'drizzle-orm';

import { wantedPerson } from '../../database/schema';
import type {
  DangerLevel,
  WantedListResponse,
  WantedPerson as WantedPersonDto,
  WantedStatus,
} from '../../../shared/api.interface';

@Injectable()
export class WantedService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async getList(params: {
    page: number;
    pageSize: number;
    status?: WantedStatus;
    dangerLevel?: DangerLevel;
  }): Promise<WantedListResponse> {
    const { page, pageSize, status, dangerLevel } = params;
    const conditions = [];
    if (status) conditions.push(eq(wantedPerson.status, status));
    if (dangerLevel) conditions.push(eq(wantedPerson.dangerLevel, dangerLevel));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await this.db
      .select({ count: count() })
      .from(wantedPerson)
      .where(whereClause);
    const total: number = totalResult[0]?.count ?? 0;

    const offset = (page - 1) * pageSize;
    const rows = await this.db
      .select()
      .from(wantedPerson)
      .where(whereClause)
      .orderBy(desc(wantedPerson.createdAt))
      .limit(pageSize)
      .offset(offset);

    const items: WantedPersonDto[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      targetName: row.targetName,
      description: row.description,
      dangerLevel: row.dangerLevel as DangerLevel,
      bountyAmount: row.bountyAmount,
      status: row.status as WantedStatus,
      ghostInfo: row.ghostInfo ?? null,
      lastSeen: row.lastSeen ?? null,
      createdAt: row.createdAt.toISOString(),
    }));

    return { items, total, page, pageSize };
  }

  async getDetail(id: string): Promise<WantedPersonDto> {
    const rows = await this.db
      .select()
      .from(wantedPerson)
      .where(eq(wantedPerson.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundException('通缉令不存在');
    }

    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      targetName: row.targetName,
      description: row.description,
      dangerLevel: row.dangerLevel as DangerLevel,
      bountyAmount: row.bountyAmount,
      status: row.status as WantedStatus,
      ghostInfo: row.ghostInfo ?? null,
      lastSeen: row.lastSeen ?? null,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
