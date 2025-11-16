import { trpc } from '@/components/trpc-provider';

// Task hooks using tRPC
export const useTasks = {
  // Get all tasks
  useGetAll: () => trpc.tasks.getAll.useQuery(),
  
  // Get task by ID
  useGetById: (id: string) => trpc.tasks.getById.useQuery({ id }),
  
  // Create task mutation
  useCreate: () => trpc.tasks.create.useMutation(),
  
  // Update task mutation
  useUpdate: () => trpc.tasks.update.useMutation(),
  
  // Delete task mutation
  useDelete: () => trpc.tasks.delete.useMutation(),
};

// Get utils for invalidating/revalidating queries
export const useTasksUtils = () => trpc.useUtils();