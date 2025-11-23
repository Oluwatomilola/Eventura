import { pgTable, uuid, text, timestamp, boolean, jsonb, index, pgEnum } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// Enums
export const connectionStatusEnum = pgEnum('connection_status', [
  'pending',
  'accepted',
  'rejected',
  'blocked',
  'removed'
]);

export const notificationTypeEnum = pgEnum('notification_type', [
  'connection_request',
  'connection_accepted',
  'connection_rejected',
  'new_message',
  'event_reminder',
  'waitlist_available',
  'event_cancelled',
  'system'
]);

// Tables
export const users = pgTable('users', {
  walletAddress: text('wallet_address').primaryKey(),
  displayName: text('display_name'),
  globalBio: text('global_bio'),
  avatarIpfsHash: text('avatar_ipfs_hash'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const eventPersonas = pgTable('event_personas', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletAddress: text('wallet_address').references(() => users.walletAddress, { onDelete: 'cascade' }),
  eventId: text('event_id').notNull(),
  displayName: text('display_name').notNull(),
  bio: text('bio'),
  interests: text('interests').array().default(sql`ARRAY[]::text[]`),
  lookingFor: text('looking_for').array().default(sql`ARRAY[]::text[]`),
  visibility: text('visibility', { enum: ['public', 'attendees', 'connections', 'private'] }).default('attendees'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  walletAddressIdx: index('idx_personas_wallet').on(table.walletAddress),
  eventIdIdx: index('idx_personas_event').on(table.eventId),
  visibilityIdx: index('idx_personas_visibility').on(table.visibility),
  uniquePersona: index('unique_persona').on(table.walletAddress, table.eventId), // Drizzle 0.33+ unique() support might vary, removed for build stability if persistent
}));

export const connections = pgTable('connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromWallet: text('from_wallet').notNull().references(() => users.walletAddress, { onDelete: 'cascade' }),
  toWallet: text('to_wallet').notNull().references(() => users.walletAddress, { onDelete: 'cascade' }),
  eventId: text('event_id'),
  status: connectionStatusEnum('status').default('pending'),
  message: text('message'),
  isGlobal: boolean('is_global').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  fromWalletIdx: index('idx_connections_from').on(table.fromWallet),
  toWalletIdx: index('idx_connections_to').on(table.toWallet),
  eventIdIdx: index('idx_connections_event').on(table.eventId),
  statusIdx: index('idx_connections_status').on(table.status),
}));

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromWallet: text('from_wallet').notNull().references(() => users.walletAddress, { onDelete: 'cascade' }),
  toWallet: text('to_wallet').notNull().references(() => users.walletAddress, { onDelete: 'cascade' }),
  eventId: text('event_id'),
  content: text('content').notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  fromWalletIdx: index('idx_messages_from').on(table.fromWallet),
  toWalletIdx: index('idx_messages_to').on(table.toWallet),
  eventIdIdx: index('idx_messages_event').on(table.eventId),
  // Removed desc() on index creation, manual SQL might be needed for specific index sorting or use updated drizzle features
  conversationIdx: index('idx_messages_conversation').on(table.fromWallet, table.toWallet, table.createdAt),
}));

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userWallet: text('user_wallet').notNull().references(() => users.walletAddress, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'),
  metadata: jsonb('metadata'),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  userWalletIdx: index('idx_notifications_user').on(table.userWallet),
  typeIdx: index('idx_notifications_type').on(table.type),
  // Filtered index logic (where readAt is null) is often distinct in Drizzle definition
  unreadIdx: index('idx_notifications_unread').on(table.userWallet, table.readAt),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sentConnections: many(connections, { relationName: 'sent_connections' }),
  receivedConnections: many(connections, { relationName: 'received_connections' }),
  sentMessages: many(messages, { relationName: 'sent_messages' }),
  receivedMessages: many(messages, { relationName: 'received_messages' }),
  notifications: many(notifications),
  personas: many(eventPersonas),
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
  fromUser: one(users, {
    fields: [connections.fromWallet],
    references: [users.walletAddress],
    relationName: 'sent_connections',
  }),
  toUser: one(users, {
    fields: [connections.toWallet],
    references: [users.walletAddress],
    relationName: 'received_connections',
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type EventPersona = typeof eventPersonas.$inferSelect;
export type NewEventPersona = typeof eventPersonas.$inferInsert;

export type Connection = typeof connections.$inferSelect;
export type NewConnection = typeof connections.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
