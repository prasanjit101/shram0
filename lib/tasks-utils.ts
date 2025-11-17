import { useEffect } from 'react';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { trpc } from '@/components/trpc-provider';
import type { Task, TaskClient } from '@/lib/db/schema';
import { toast } from 'sonner';



type TasksStoreState = {
  tasks: TaskClient[];
  isHydrated: boolean;
  isLoading: boolean;
  lastFetchedAt?: number;
};

type TasksStoreActions = {
  setTasks: (tasks: TaskClient[]) => void;
  addTask: (task: TaskClient) => void;
  updateTask: (task: TaskClient) => void;
  removeTask: (id: number) => void;
  reset: () => void;
  setLoading: (isLoading: boolean) => void;
};

export const useTasksStore = create<TasksStoreState & TasksStoreActions>((set) => ({
  tasks: [],
  isHydrated: false,
  isLoading: false,
  lastFetchedAt: undefined,
  setTasks: (tasks) =>
    set({
      tasks,
      isHydrated: true,
      lastFetchedAt: Date.now(),
    }),
  addTask: (task) =>
    set((state) => ({
      tasks: [task, ...state.tasks.filter((existing) => existing.id !== task.id)],
      isHydrated: true,
      lastFetchedAt: Date.now(),
    })),
  updateTask: (task) =>
    set((state) => ({
      tasks: state.tasks.map((existing) =>
        existing.id === task.id ? { ...existing, ...task } : existing
      ),
      isHydrated: true,
      lastFetchedAt: Date.now(),
    })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
      isHydrated: true,
      lastFetchedAt: Date.now(),
    })),
  reset: () => set({ tasks: [], isHydrated: false, lastFetchedAt: undefined }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export const useTasksStoreActions = () =>
  useTasksStore(
    useShallow((state) => ({
      setTasks: state.setTasks,
      addTask: state.addTask,
      updateTask: state.updateTask,
      removeTask: state.removeTask,
      reset: state.reset,
      setLoading: state.setLoading,
    }))
  );

// Task hooks using tRPC backed by the Zustand store
export const useTasks = {
  // Get all tasks
  useGetAll: (queryStr?: string) => {
    const { setTasks, setLoading } = useTasksStoreActions();
    const query = trpc.tasks.getAll.useQuery({ query: queryStr || undefined }, {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    });

    useEffect(() => {
      setLoading(query.isLoading);
      if (query.data) {
        setTasks(query.data);
        toast.success('Tasks list fetched.');
      }
    }, [query.data, query.isLoading, setTasks, setLoading]);

    return query;
  },

  // Create task mutation
  useCreate: () => {
    const { addTask, setLoading } = useTasksStoreActions();
    setLoading(true);
    return trpc.tasks.create.useMutation({
      onSuccess: (task) => {
        if (task) {
          addTask(task);
          toast.success(`Task "${task.title}" created.`);
        }
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  },

  // Update task mutation
  useUpdate: () => {
    const { updateTask, setLoading } = useTasksStoreActions();
    setLoading(true);
    return trpc.tasks.update.useMutation({
      onSuccess: (task) => {
        if (task) {
          updateTask(task);
          toast.success(`Task "${task.title}" updated.`);
        }
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  },

  // Delete task mutation
  useDelete: () => {
    const { removeTask, setLoading } = useTasksStoreActions();
    setLoading(true);
    return trpc.tasks.delete.useMutation({
      onSuccess: (_result, variables) => {
        if (variables?.id) {
          removeTask(variables.id);
          toast.success(`Task deleted successfully.`);
        }
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  },
};

// Get utils for invalidating/revalidating queries and hydrating the store
export const useTasksUtils = () => {
  const utils = trpc.useUtils();
  const { setTasks, reset } = useTasksStoreActions();

  const hydrateFromCache = () => {
    const cached = utils.tasks.getAll.getData();
    if (cached) {
      setTasks(cached);
    }
  };

  const refetchTasks = async () => {
    const tasks = await utils.tasks.getAll.fetch({});
    if (tasks) {
      setTasks(tasks);
    } else {
      reset();
    }
    return tasks;
  };

  const invalidateTasks = () => {
    utils.tasks.getAll.invalidate();
    utils.tasks.getById.invalidate();
  };

  return {
    ...utils,
    hydrateFromCache,
    refetchTasks,
    invalidateTasks,
  };
};
