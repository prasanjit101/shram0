import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createId } from "@paralleldrive/cuid2";
import { float32Array } from './custom';

export const VECTOR_DIMENSIONS = 768;

export const tasks = sqliteTable('tasks', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    titleEmbedding: float32Array("title_embedding", { dimensions: VECTOR_DIMENSIONS }),
    scheduledTime: text('scheduled_time'), // ISO 8601 datetime string
    completed: integer('completed').default(0), // 0 = false, 1 = true
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
export type TaskClient = Omit<Task, 'titleEmbedding'>;
