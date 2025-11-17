import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, stepCountIs, streamText, experimental_transcribe as transcribe, UIMessage } from 'ai';
import { NextResponse } from "next/server";
import { ResponseUIMessage } from '@/types/ai';
import { Experimental_Agent as Agent, tool } from 'ai';
import { z } from 'zod';
import { groq } from '@ai-sdk/groq';
import { taskTools } from '@/server/ai/tools';
import { todoSystemPrompt } from '@/server/ai/prompt';
import { TaskClient } from '@/lib/db/schema';

type RequestBody = {
  audioBase64: string;
  messages?: UIMessage[];
  tasks?: TaskClient[];
};

export async function POST(request: Request) {
  try {

    const body = await request.json() as RequestBody;
    const { audioBase64, messages, tasks } = body;

    if (!audioBase64) {
      return NextResponse.json(
        { error: "No audio data provided" },
        { status: 400 }
      );
    }

    // create a custom UI message stream
    const stream = createUIMessageStream<ResponseUIMessage>({
      execute: async ({ writer }) => {

        // Convert base64 to buffer
        const audioBuffer = Buffer.from(audioBase64, 'base64');

        // Transcribe the audio
        const { text: transcript } = await transcribe({
          model: groq.transcription('whisper-large-v3-turbo'),
          audio: audioBuffer,
          providerOptions: { groq: { language: 'en', prompt: 'Transcribe english audio to text accurately.' } },
        });

        writer.write({
          type: 'data-customMessage',
          data: {
            role: 'user',
            text: transcript,
          },
          transient: true,
        })

        const conversationHistory = convertToModelMessages([
          // pick only last 1 message from the history, for better results summarizing or compressing the context would be more helpful.
          ...(messages || []).slice(-1),
          {
            role: 'user',
            parts: [{ type: 'text', text: transcript }]
          }]);

        const todoAgent = new Agent({
          model: groq('openai/gpt-oss-120b'),
          tools: taskTools,
          stopWhen: stepCountIs(6),
          system: todoSystemPrompt(tasks),
          temperature: 0.2,
          maxRetries: 3,
        });

        // Generate AI response based on the transcript
        const result = todoAgent.stream({
          messages: conversationHistory,
        });

        writer.merge(result.toUIMessageStream({
          sendReasoning: false,
          sendSources: false,
        }));
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to process audio", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
