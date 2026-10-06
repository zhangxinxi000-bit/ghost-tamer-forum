import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '../../database';
import { eq } from 'drizzle-orm';
import { scryptSync, randomBytes, createHmac } from 'crypto';

import { forumUser } from '../../database/schema';
import type { ForumUser, LoginRequest, LoginResponse, RegisterRequest } from '../../../shared/api.interface';

const JWT_SECRET: string = process.env.JWT_SECRET || 'forum-secret-key-for-dev';
const JWT_EXPIRES_IN_MS: number = 7 * 24 * 60 * 60 * 1000; // 7 days
const SCRYPT_KEYLEN: number = 64;

function hashPassword(password: string): string {
  const salt: string = randomBytes(16).toString('hex');
  const derivedKey: Buffer = scryptSync(password, salt, SCRYPT_KEYLEN);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, keyHex]: string[] = storedHash.split(':');
  if (!salt || !keyHex) return false;
  const derivedKey: Buffer = scryptSync(password, salt, SCRYPT_KEYLEN);
  return derivedKey.toString('hex') === keyHex;
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input: string): string {
  const padded: string = input + '='.repeat((4 - (input.length % 4)) % 4);
  return Buffer.from(padded, 'base64').toString();
}

export interface AuthUser {
  userId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  signToken(userId: string): string {
    const header: string = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
    const payload: string = JSON.stringify({
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + JWT_EXPIRES_IN_MS) / 1000),
    });
    const headerB64: string = base64UrlEncode(header);
    const payloadB64: string = base64UrlEncode(payload);
    const signature: string = createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    return `${headerB64}.${payloadB64}.${signature}`;
  }

  verifyToken(token: string): AuthUser {
    try {
      const parts: string[] = token.split('.');
      if (parts.length !== 3) throw new Error('无效的令牌格式');

      const [headerB64, payloadB64, signatureB64]: string[] = parts;
      const expectedSignature: string = createHmac('sha256', JWT_SECRET)
        .update(`${headerB64}.${payloadB64}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      if (expectedSignature !== signatureB64) {
        throw new Error('令牌签名无效');
      }

      const payload: { sub: string; exp: number } = JSON.parse(base64UrlDecode(payloadB64));
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('令牌已过期');
      }

      return { userId: payload.sub };
    } catch {
      throw new UnauthorizedException('认证令牌无效或已过期');
    }
  }

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

  async register(dto: RegisterRequest): Promise<LoginResponse> {
    const existing = await this.db
      .select({ id: forumUser.id })
      .from(forumUser)
      .where(eq(forumUser.username, dto.username));

    if (existing.length > 0) {
      throw new ConflictException('用户名已被占用');
    }

    const passwordHash: string = hashPassword(dto.password);

    const inserted = await this.db
      .insert(forumUser)
      .values({
        username: dto.username,
        passwordHash,
        displayName: dto.displayName,
      })
      .returning();

    const user: ForumUser = this.mapToForumUser(inserted[0]);
    const token: string = this.signToken(user.id);

    this.logger.log(`用户注册成功: ${user.username}`);
    return { user, token };
  }

  async login(dto: LoginRequest): Promise<LoginResponse> {
    const rows = await this.db
      .select()
      .from(forumUser)
      .where(eq(forumUser.username, dto.username));

    if (rows.length === 0) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const row: typeof forumUser.$inferSelect = rows[0];
    const valid: boolean = verifyPassword(dto.password, row.passwordHash);

    if (!valid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const user: ForumUser = this.mapToForumUser(row);
    const token: string = this.signToken(user.id);

    this.logger.log(`用户登录成功: ${user.username}`);
    return { user, token };
  }
}
