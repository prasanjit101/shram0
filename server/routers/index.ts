import { router } from '@/lib/trpc';
import { tasksRouter } from './tasks';

export const appRouter = router({
  tasks: tasksRouter,
});

// Export type AppRouter type signature
export type AppRouter = typeof appRouter;