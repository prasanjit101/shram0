import React, { useEffect } from 'react';
import { useTasksStore } from '@/lib/tasks-utils';
import { TasksTable } from '@/components/tasks-table';
import AI_Voice from '@/components/kokonutui/ai-voice';
import VoicePanel from '@/components/voice-panel';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(false);
  const { tasks } = useTasksStore();
  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai",
    }),
  });

  useEffect(() => {
    setIsLoading(status === "streaming");
  }, [status]);


  return (
    <div className="grid grid-cols-12 h-[calc(100vh-4rem)] gap-4 overflow-scroll">
      <div className="col-span-8 p-6">
        <TasksTable tasks={tasks} />
      </div>
      <div className="col-span-4 border-l flex flex-col h-full ">
        <VoicePanel messages={messages} isLoading={isLoading} />
        <AI_Voice />
      </div>
    </div>
  );
}
