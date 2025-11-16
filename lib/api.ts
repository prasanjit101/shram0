import { appRouter } from '@/server/routers';

/**
 * Server-side API caller
 * Use this in Server Components, Server Actions, or API routes
 * 
 * Example:
 * const tasks = await api.tasks.getAll();
 */
export const api = appRouter.createCaller({});
