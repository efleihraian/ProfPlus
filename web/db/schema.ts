import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), chatId: text("chat_id").notNull(),
  name: text("name").notNull(), mime: text("mime").notNull(), size: integer("size").notNull(),
  storeId: text("store_id"), fileId: text("file_id"), status: text("status").notNull(), createdAt: integer("created_at").notNull(),
}, t => [index("documents_user_chat").on(t.userId, t.chatId)]);
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(), userId: text('user_id').notNull(), name: text('name').notNull(), createdAt: integer('created_at').notNull(),
}, t => [index('projects_user').on(t.userId)]);
export const conversations = sqliteTable('conversations', {
  id: text('id').primaryKey(), userId: text('user_id').notNull(), title: text('title').notNull(), projectId: text('project_id'),
  deleted: integer('deleted').notNull().default(0), messages: text('messages').notNull(), selection: text('selection').notNull(), revision: integer('revision').notNull(),
  createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull(),
}, t => [index('conversations_user_updated').on(t.userId,t.updatedAt)]);
export const accountDeletions = sqliteTable('account_deletions', {
 userId: text('user_id').primaryKey(), startedAt: integer('started_at').notNull(),
});
