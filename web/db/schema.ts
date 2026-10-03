import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), chatId: text("chat_id").notNull(),
  name: text("name").notNull(), mime: text("mime").notNull(), size: integer("size").notNull(),
  storeId: text("store_id"), fileId: text("file_id"), status: text("status").notNull(), createdAt: integer("created_at").notNull(),
}, t => [index("documents_user_chat").on(t.userId, t.chatId)]);
