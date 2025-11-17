import { z } from 'zod';
import { publicProcedure, router } from '@/lib/trpc';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getTextEmbedding } from '../ai/embedding';

export const tasksRouter = router({
  // Get all tasks
  getAll: publicProcedure
    .input(z.object({
      query: z.string().optional(),
    }))
    .query(async ({ input }) => {
      if (input.query) {
        const queryVector = await getTextEmbedding(input.query);
        const topK = await db.select({
          id: tasks.id,
          title: tasks.title,
          scheduledTime: tasks.scheduledTime,
          completed: tasks.completed,
          createdAt: tasks.createdAt,
          updatedAt: tasks.updatedAt,
        }).from(tasks).where(
          sql`vector_top_k('vector_index', vector32(${JSON.stringify(queryVector)}), 10)`,
        );

        return topK;
      }
      return await db.select({
        id: tasks.id,
        title: tasks.title,
        scheduledTime: tasks.scheduledTime,
        completed: tasks.completed,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      }).from(tasks).orderBy(desc(tasks.id));
    }),

  // Get task by ID
  getById: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      const [task] = await db.select().from(tasks).where(eq(tasks.id, input.id));
      return task;
    }),

  // Create new task
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        scheduledTime: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const titleVector = await getTextEmbedding(input.title);
      const [newTask] = await db.insert(tasks).values({
        title: input.title,
        scheduledTime: input.scheduledTime,
        titleEmbedding: sql`vector32(${JSON.stringify(titleVector)})`
      }).returning();
      return newTask;
    }),

  // Update task
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        scheduledTime: z.string().optional(),
        completed: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [updatedTask] = await db
        .update(tasks)
        .set({
          title: input.title,
          scheduledTime: input.scheduledTime,
          updatedAt: new Date().toISOString(),
          completed: input.completed !== undefined ? (input.completed ? 1 : 0) : undefined,
        })
        .where(eq(tasks.id, input.id))
        .returning({
          id: tasks.id,
          title: tasks.title,
          scheduledTime: tasks.scheduledTime,
          completed: tasks.completed,
          createdAt: tasks.createdAt,
          updatedAt: tasks.updatedAt,
        });
      return updatedTask;
    }),

  // Delete task
  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await db.delete(tasks).where(eq(tasks.id, input.id));
      return { success: true };
    }),
});
