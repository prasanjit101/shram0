'use client';
import React, { useEffect } from 'react';
import { useTasksStore } from '@/lib/tasks-utils';
import { TasksTable } from '@/components/tasks-table';
import VoicePanel from '@/components/voice-panel';

export default function Home() {
  return (
    <>
    <div className="grid grid-cols-12 h-[calc(100vh-4rem)] gap-4 overflow-scroll">
      <div className="col-span-8 p-6">
          <TasksTable />
      </div>
      <div className="col-span-4 border-l flex flex-col h-full ">
        <VoicePanel />
      </div>
      </div>
    </>
  );
}
