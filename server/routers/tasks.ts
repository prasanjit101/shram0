import { z } from 'zod';
import { publicProcedure, router } from '@/lib/trpc';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const tasksRouter = router({
  // Get all tasks
  getAll: publicProcedure
    .query(async () => {
      return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
    }),

  // Get task by ID
  getById: publicProcedure
    .input(z.object({
      id: z.string(),
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
        priorityIndex: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [newTask] = await db.insert(tasks).values({
        title: input.title,
        scheduledTime: input.scheduledTime,
        priorityIndex: input.priorityIndex ?? 0,
      }).returning();
      return newTask;
    }),

  // Update task
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        scheduledTime: z.string().optional(),
        priorityIndex: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [updatedTask] = await db
        .update(tasks)
        .set({
          title: input.title,
          scheduledTime: input.scheduledTime,
          priorityIndex: input.priorityIndex,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(tasks.id, input.id))
        .returning();
      return updatedTask;
    }),

  // Delete task
  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db.delete(tasks).where(eq(tasks.id, input.id));
      return { success: true };
    }),
});