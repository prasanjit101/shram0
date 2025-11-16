"use client";

import { useChat } from "@ai-sdk/react";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Loader } from "@/components/ai-elements/loader";
import { DefaultChatTransport, UIMessage } from "ai";
import { useEffect, useState } from "react";
import AI_Voice from "./kokonutui/ai-voice";

export default function VoicePanel() {
    const [isLoading, setIsLoading] = useState(false);
    const { messages, status, sendMessage } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/ai",
            body: {
                // send voice data here
            }
        }),
    });

    useEffect(() => {
        setIsLoading(status === "streaming");
    }, [status]);

    return (
        <div className="flex flex-col h-full p-4">
            <div className="flex-1 overflow-y-auto flex flex-col gap-4">
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
            <AI_Voice />

        </div>
    );
}
