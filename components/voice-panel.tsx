"use client";

import { useChat } from "@ai-sdk/react";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Loader } from "@/components/ai-elements/loader";
import { DefaultChatTransport, getToolName, isToolUIPart, UIMessage } from "ai";
import {
    useActionState,
    useEffect,
    useState,
    startTransition,
} from "react";
import AI_Voice from "./kokonutui/ai-voice";
import { usePlayer } from "@/lib/hooks/use-player";
import { useMicVAD, utils } from "@ricky0123/vad-react";
import { ResponseUIMessage } from "@/types/ai";
import { Conversation, ConversationContent } from "./ai-elements/conversation";
import { useTasksUtils, useTasksStoreActions, useTasks, useTasksStore } from "@/lib/tasks-utils";
import { TaskClient } from "@/lib/db/schema";

export default function VoicePanel() {
    const [micPermission, setMicPermission] = useState<"prompt" | "granted" | "denied">("prompt");

    const player = usePlayer();

    // Check and request microphone permission
    useEffect(() => {
        const checkMicrophonePermission = async () => {
            try {
                // Check if we're in a browser environment
                if (typeof window === 'undefined' || !('permissions' in navigator)) {
                    setMicPermission('prompt');
                    return;
                }

                const updatePermissionState = (state: PermissionState) => {
                    if (state === 'granted') {
                        setMicPermission('granted');
                    } else if (state === 'denied') {
                        setMicPermission('denied');
                    } else {
                        setMicPermission('prompt');
                    }
                };

                const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
                updatePermissionState(permissionStatus.state);

                permissionStatus.onchange = () => {
                    updatePermissionState(permissionStatus.state);
                };
            } catch (error) {
                console.warn('Could not check microphone permission:', error);
                // Fallback: if permissions API is not supported, we'll try requesting directly when needed
                setMicPermission('prompt');
            }
        };

        checkMicrophonePermission();
    }, []);

    const requestMicrophonePermission = async () => {
        try {
            if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
                console.warn('MediaDevices API not available in this environment.');
                return false;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // If successful, stop all tracks and update permission state
            stream.getTracks().forEach(track => track.stop());
            setMicPermission('granted');
            return true;
        } catch (error) {
            console.error('Microphone permission denied:', error);
            setMicPermission('denied');
            return false;
        }
    };

    const { tasks } = useTasksStore();


    const vad = useMicVAD({
        startOnLoad: false,
        onnxWASMBasePath: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/",
        baseAssetPath: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.27/dist/",
        onSpeechEnd: (audio) => {
            player.stop();
            const wav = utils.encodeWAV(audio);
            const blob = new Blob([wav], { type: "audio/wav" });
            startTransition(() => submit(blob));
            const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.includes("Firefox");
            if (isFirefox) vad.pause();
        },
        positiveSpeechThreshold: 0.6,
    });

    const { invalidateTasks, } = useTasksUtils();
    const { useGetAll } = useTasks;

    // Local state to hold the current query for listing tasks via tool calls
    const [listQuery, setListQuery] = useState<string | undefined>(undefined);

    // Run the useGetAll hook reactively when listQuery changes. This respects
    // the Rules of Hooks while still letting us trigger a fetch from onToolCall.
    useGetAll(listQuery);

    const { messages, sendMessage, setMessages, status, addToolOutput } = useChat<ResponseUIMessage>({
        transport: new DefaultChatTransport({
            api: "/api/ai",
        }),
        onData: dataPart => {
            if (dataPart.type === 'data-customMessage') {
                setMessages(prevMessages => [
                    ...prevMessages,
                    {
                        id: crypto.randomUUID(),
                        role: dataPart.data.role,
                        parts: [{ type: 'text', text: dataPart.data.text }],
                    },
                ]);
            }
        },
        onToolCall: async ({ toolCall }) => {
            if (toolCall.toolName === "listTask") {
                let query = (toolCall.input as any).query as string | undefined;
                console.log("Calling Tool for listTask with query:", query);
                // Trigger a reactive fetch by updating the query state
                setListQuery(query);
            } else {
                console.log("Invalidating tasks for tool:", toolCall.toolName);
                // delay to ensure the action is completed before invalidating
                setTimeout(() => {
                    invalidateTasks();
                }, 1500);
            }
            console.log({ toolCall });
        }
    });

    // Submits either text or audio (Blob) to the chat API
    async function submit(data: string | Blob) {
        let requestBody: {
            input?: string;
            audioBase64?: string;
            tasks?: TaskClient[];
        };

        if (typeof data === "string") {
            requestBody = { input: data };
        } else {
            // Convert blob to base64 for safe transmission
            const arrayBuffer = await data.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            let binaryString = '';
            for (let i = 0; i < uint8Array.length; i++) {
                binaryString += String.fromCharCode(uint8Array[i]);
            }
            const base64 = btoa(binaryString);
            requestBody = { audioBase64: base64 };
        }
        requestBody['tasks'] = tasks;

        await sendMessage(undefined, {
            body: requestBody,
        });
    }

    // Function to handle microphone permission request and toggle VAD
    const handleToggleVAD = async () => {
        if (micPermission === 'granted') {
            if (vad.listening) {
                vad.pause();
            } else {
                vad.start();
            }
        } else if (micPermission === 'prompt') {
            const granted = await requestMicrophonePermission();
            if (granted) {
                vad.start();
            }
        }
    };


    return (
        <div className="flex flex-col h-full p-4">
            <div className="h-[65vh] overflow-y-auto flex-col gap-4">
                {/* Microphone permission status */}
                {micPermission === 'denied' && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                        <p>Microphone access is blocked. Please enable it in your browser settings.</p>
                    </div>
                )}
                {micPermission === 'prompt' && (
                    <div className="p-3 bg-yellow-100 text-yellow-700 rounded-md text-sm">
                        <p>Microphone permission needed. Please click the voice button to enable.</p>
                    </div>
                )}
                <Conversation>
                    <ConversationContent>
                        {
                            messages.map((message) => {
                                // some kind of bug in ai-sdk causing duplicate messages, so filtering them out
                                const parts = message.role === 'assistant' ? [message.parts.findLast(part => part.type === 'text')] : message.parts;
                                return (
                                    <Message from={message.role} key={message.id}>
                                        <MessageContent>
                                            {parts.map((part, i) => {
                                                if (!part) return null;
                                                switch (part?.type) {
                                                    case 'text':
                                                        return (
                                                            <MessageResponse key={`${message.id}-${i}`}>
                                                                {part.text}
                                                            </MessageResponse>
                                                        );
                                                }
                                            })}
                                        </MessageContent>
                                    </Message>
                                )
                            })
                        }
                    </ConversationContent>
                </Conversation>
            </div>

            <AI_Voice
                listening={vad.listening}
                disabled={!!vad.errored || micPermission === 'denied'}
                isProcessing={status === "streaming"}
                userSpeaking={vad.userSpeaking}
                onToggle={handleToggleVAD}
            />
            <p className="text-xs text-center mx-auto text-muted-foreground max-w-xs">Click the mic and speak. Speech is auto-detected and processed. Turning it off stops the detection.</p>
            <p className="text-destructive">{vad.errored}</p>
        </div>
    );
}
