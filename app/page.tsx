'use client';

import React from 'react';
import { useTasks } from '@/lib/hooks';
import { TasksTable } from '@/components/tasks-table';

export default function Home() {
  const { useCreate } = useTasks;
  const createTaskMutation = useCreate();

  const handleCreateTask = async () => {
    try {
      await createTaskMutation.mutateAsync({
        title: `Sample task ${Date.now()}`,
        priorityIndex: Math.floor(Math.random() * 10),
      });
      alert('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  return (
    <div className="container p-4 grid grid-cols-8 h-screen gap-4 overflow-scroll">
      <div className="col-span-6">
        <TasksTable tasks={[]} />
      </div>
      <div className="col-span-2 border-l flex flex-col items-center">
        {/* Placeholder for microphone icon */}
        <div className="mt-8 text-center">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Voice commands here</p>
        </div>
      </div>
    </div>
  );
}