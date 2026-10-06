/**
 * 数据库 Schema(手写,非生成)
 *
 * 使用 drizzle-orm/pg-core 原生类型。
 * 时间戳列统一使用 timestamptz,由数据库填充默认值。
 */
import {
  boolean,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const ts = (
  name: string,
  precision: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 3,
) => timestamp(name, { withTimezone: true, precision });

export const forumUser = pgTable('forum_user', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  avatar: varchar('avatar', { length: 255 }),
  city: varchar('city', { length: 100 }),
  organization: varchar('organization', { length: 100 }),
  ghostInfo: text('ghost_info'),
  bio: text('bio'),
  reputation: integer('reputation').notNull().default(0),
  postCount: integer('post_count').notNull().default(0),
  isAdmin: boolean('is_admin').notNull().default(false),
  position: varchar('position', { length: 100 }),
  realName: varchar('real_name', { length: 100 }),
  age: integer('age'),
  ghostItems: text('ghost_items'),
  dangerLevel: varchar('danger_level', { length: 20 }).default('normal'),
  createdAt: ts('_created_at').notNull().defaultNow(),
  updatedAt: ts('_updated_at').notNull().defaultNow(),
}, (table) => [
  uniqueIndex('forum_user_username_key').on(table.username),
]);

export const board = pgTable('board', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  icon: varchar('icon', { length: 50 }),
  sortOrder: integer('sort_order').notNull().default(0),
  postCount: integer('post_count').notNull().default(0),
  createdAt: ts('_created_at').notNull().defaultNow(),
  updatedAt: ts('_updated_at').notNull().defaultNow(),
}, (table) => [
  uniqueIndex('board_slug_key').on(table.slug),
]);

export const post = pgTable('post', {
  id: uuid('id').primaryKey().defaultRandom(),
  boardId: uuid('board_id').notNull(),
  userId: uuid('user_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  isPinned: boolean('is_pinned').notNull().default(false),
  isEssence: boolean('is_essence').notNull().default(false),
  viewCount: integer('view_count').notNull().default(0),
  replyCount: integer('reply_count').notNull().default(0),
  lastReplyAt: ts('last_reply_at'),
  createdAt: ts('_created_at').notNull().defaultNow(),
  updatedAt: ts('_updated_at').notNull().defaultNow(),
}, (table) => [
  index('idx_post_board_id').on(table.boardId),
  index('idx_post_user_id').on(table.userId),
  index('idx_post_created_at').on(table.createdAt),
  foreignKey({
    columns: [table.boardId],
    foreignColumns: [board.id],
    name: 'post_board_id_fkey',
  }),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [forumUser.id],
    name: 'post_user_id_fkey',
  }),
]);

export const reply = pgTable('reply', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull(),
  userId: uuid('user_id').notNull(),
  content: text('content').notNull(),
  floor: integer('floor').notNull().default(1),
  createdAt: ts('_created_at').notNull().defaultNow(),
  updatedAt: ts('_updated_at').notNull().defaultNow(),
}, (table) => [
  index('idx_reply_post_id').on(table.postId),
  index('idx_reply_user_id').on(table.userId),
  foreignKey({
    columns: [table.postId],
    foreignColumns: [post.id],
    name: 'reply_post_id_fkey',
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [forumUser.id],
    name: 'reply_user_id_fkey',
  }),
]);

export const bounty = pgTable('bounty', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  dangerLevel: varchar('danger_level', { length: 10 }).notNull().default('C'),
  reward: integer('reward').notNull().default(0),
  status: varchar('status', { length: 20 }).notNull().default('open'),
  location: varchar('location', { length: 255 }),
  ghostName: varchar('ghost_name', { length: 255 }),
  ghostRules: text('ghost_rules'),
  createdAt: ts('_created_at').notNull().defaultNow(),
  updatedAt: ts('_updated_at').notNull().defaultNow(),
}, (table) => [
  index('idx_bounty_status').on(table.status),
  index('idx_bounty_danger_level').on(table.dangerLevel),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [forumUser.id],
    name: 'bounty_user_id_fkey',
  }),
]);

export const wantedPerson = pgTable('wanted_person', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  targetName: varchar('target_name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  dangerLevel: varchar('danger_level', { length: 10 }).notNull().default('B'),
  bountyAmount: integer('bounty_amount').notNull().default(0),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  ghostInfo: text('ghost_info'),
  lastSeen: varchar('last_seen', { length: 255 }),
  createdAt: ts('_created_at').notNull().defaultNow(),
  updatedAt: ts('_updated_at').notNull().defaultNow(),
}, (table) => [
  index('idx_wanted_status').on(table.status),
]);

export const trade = pgTable('trade', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  tradeType: varchar('trade_type', { length: 20 }).notNull().default('sell'),
  itemType: varchar('item_type', { length: 50 }).notNull(),
  price: varchar('price', { length: 100 }),
  status: varchar('status', { length: 20 }).notNull().default('open'),
  createdAt: ts('_created_at').notNull().defaultNow(),
  updatedAt: ts('_updated_at').notNull().defaultNow(),
}, (table) => [
  index('idx_trade_status').on(table.status),
  index('idx_trade_type').on(table.tradeType),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [forumUser.id],
    name: 'trade_user_id_fkey',
  }),
]);

export const announcement = pgTable('announcement', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  isPinned: boolean('is_pinned').notNull().default(false),
  createdAt: ts('_created_at').notNull().defaultNow(),
  updatedAt: ts('_updated_at').notNull().defaultNow(),
});

export const hqEvent = pgTable('hq_event', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  dangerLevel: varchar('danger_level', { length: 10 }).notNull().default('C'),
  eventLocation: varchar('event_location', { length: 255 }),
  ghostName: varchar('ghost_name', { length: 255 }),
  ghostRules: text('ghost_rules'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  isPinned: boolean('is_pinned').notNull().default(false),
  viewCount: integer('view_count').notNull().default(0),
  createdAt: ts('_created_at').notNull().defaultNow(),
  updatedAt: ts('_updated_at').notNull().defaultNow(),
}, (table) => [
  index('idx_hq_event_status').on(table.status),
  index('idx_hq_event_danger_level').on(table.dangerLevel),
  index('idx_hq_event_created_at').on(table.createdAt),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [forumUser.id],
    name: 'hq_event_user_id_fkey',
  }),
]);

export const hqMission = pgTable('hq_mission', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  missionType: varchar('mission_type', { length: 30 }).notNull().default('support'),
  dangerLevel: varchar('danger_level', { length: 10 }).notNull().default('C'),
  location: varchar('location', { length: 255 }),
  requirements: text('requirements'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  reward: integer('reward').notNull().default(0),
  isPinned: boolean('is_pinned').notNull().default(false),
  createdAt: ts('_created_at').notNull().defaultNow(),
  updatedAt: ts('_updated_at').notNull().defaultNow(),
}, (table) => [
  index('idx_hq_mission_status').on(table.status),
  index('idx_hq_mission_danger_level').on(table.dangerLevel),
  index('idx_hq_mission_created_at').on(table.createdAt),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [forumUser.id],
    name: 'hq_mission_user_id_fkey',
  }),
]);

export const application = pgTable('application', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  type: varchar('type', { length: 30 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  targetOrganization: varchar('target_organization', { length: 100 }),
  itemName: varchar('item_name', { length: 100 }),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  reviewerId: uuid('reviewer_id'),
  reviewComment: text('review_comment'),
  reviewedAt: ts('reviewed_at', 6),
  createdAt: ts('_created_at').notNull().defaultNow(),
  updatedAt: ts('_updated_at').notNull().defaultNow(),
}, (table) => [
  index('idx_application_user_id').on(table.userId),
  index('idx_application_status').on(table.status),
  index('idx_application_type').on(table.type),
  index('idx_application_created_at').on(table.createdAt),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [forumUser.id],
    name: 'application_user_id_fkey',
  }),
  foreignKey({
    columns: [table.reviewerId],
    foreignColumns: [forumUser.id],
    name: 'application_reviewer_id_fkey',
  }),
]);

// table aliases
export const announcementTable = announcement;
export const applicationTable = application;
export const boardTable = board;
export const bountyTable = bounty;
export const forumUserTable = forumUser;
export const hqEventTable = hqEvent;
export const hqMissionTable = hqMission;
export const postTable = post;
export const replyTable = reply;
export const tradeTable = trade;
export const wantedPersonTable = wantedPerson;
