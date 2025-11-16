import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { NextRequest } from 'next/server';
import { appRouter } from '@/server/routers';

// Enable response caching for server-side requests
export async function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    req,
    createContext: () => ({}),
  });
}

export async function POST(req: NextRequest) {
  const url = req.nextUrl.clone();
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    req,
    createContext: () => ({}),
  });
}