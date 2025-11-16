import { UIMessage } from "ai";

export type ResponseUIMessage = UIMessage<
  never,
  {
    notification: {
      message: string;
      level: 'info' | 'warning' | 'error';
    };
    customMessage: {
      role: 'user' | 'assistant' | 'system';
      text: string;
    }
  }
>;