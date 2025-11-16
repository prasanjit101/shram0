import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createId } from "@paralleldrive/cuid2";
import { float32Array } from './custom';

export const VECTOR_DIMENSIONS = 768;

export const tasks = sqliteTable('tasks', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    title: text('title').notNull(),
    titleEmbedding: float32Array("title_embedding", { dimensions: VECTOR_DIMENSIONS }),
    scheduledTime: text('scheduled_time'), // ISO 8601 datetime string
    priorityIndex: integer('priority_index').default(0),
    createdAt: text('created_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`)
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type UpdateTask = Partial<NewTask> & { id: number };

