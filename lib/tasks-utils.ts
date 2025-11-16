import { useEffect } from 'react';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { trpc } from '@/components/trpc-provider';
import type { Task } from '@/lib/db/schema';

type TasksStoreState = {
  tasks: Task[];
  isHydrated: boolean;
  lastFetchedAt?: number;
};

type TasksStoreActions = {
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (id: string) => void;
  reset: () => void;
};

export const useTasksStore = create<TasksStoreState & TasksStoreActions>((set) => ({
  tasks: [],
  isHydrated: false,
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
      isHydrated: state.isHydrated,
      lastFetchedAt: state.lastFetchedAt,
    })),
  reset: () => set({ tasks: [], isHydrated: false, lastFetchedAt: undefined }),
}));

export const useTasksStoreActions = () =>
  useTasksStore(
    useShallow((state) => ({
      setTasks: state.setTasks,
      addTask: state.addTask,
      updateTask: state.updateTask,
      removeTask: state.removeTask,
      reset: state.reset,
    }))
  );

// Task hooks using tRPC backed by the Zustand store
export const useTasks = {
  // Get all tasks
  useGetAll: () => {
    const { setTasks } = useTasksStoreActions();
    const query = trpc.tasks.getAll.useQuery();

    useEffect(() => {
      if (query.data) {
        setTasks(query.data);
      }
    }, [query.data, setTasks]);

    return query;
  },

  // Get task by ID
  useGetById: (id: string) => {
    const { updateTask } = useTasksStoreActions();
    const query = trpc.tasks.getById.useQuery({ id }, { enabled: Boolean(id) });

    useEffect(() => {
      if (query.data) {
        updateTask(query.data);
      }
    }, [query.data, updateTask]);

    return query;
  },

  // Create task mutation
  useCreate: () => {
    const { addTask } = useTasksStoreActions();
    return trpc.tasks.create.useMutation({
      onSuccess: (task) => {
        if (task) {
          addTask(task);
        }
      },
    });
  },

  // Update task mutation
  useUpdate: () => {
    const { updateTask } = useTasksStoreActions();
    return trpc.tasks.update.useMutation({
      onSuccess: (task) => {
        if (task) {
          updateTask(task);
        }
      },
    });
  },

  // Delete task mutation
  useDelete: () => {
    const { removeTask } = useTasksStoreActions();
    return trpc.tasks.delete.useMutation({
      onSuccess: (_result, variables) => {
        if (variables?.id) {
          removeTask(variables.id);
        }
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
    const tasks = await utils.tasks.getAll.fetch();
    if (tasks) {
      setTasks(tasks);
    } else {
      reset();
    }
    return tasks;
  };

  return {
    ...utils,
    hydrateFromCache,
    refetchTasks,
  };
};