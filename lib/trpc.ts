import { initTRPC } from '@trpc/server';
import { ZodError } from 'zod';
import superjson from 'superjson';

// Initialize tRPC
const t = initTRPC.create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Create route types
export const router = t.router;
export const publicProcedure = t.procedure;