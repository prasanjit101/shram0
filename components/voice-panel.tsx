"use client";

import { useChat } from "@ai-sdk/react";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Loader } from "@/components/ai-elements/loader";
import { DefaultChatTransport, UIMessage } from "ai";
import { useEffect, useState } from "react";

export default function VoicePanel({ messages, isLoading }: { messages: UIMessage[]; isLoading: boolean }) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {messages.map((message) => (
        <Message key={message.id} from={message.role}>
          <MessageContent>
            {message.parts?.map(part => 'text' in part ? part.text : '').join('') || ''}
          </MessageContent>
        </Message>
      ))}
      {isLoading && (
        <div className="flex items-center gap-2">
          <Loader />
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
}