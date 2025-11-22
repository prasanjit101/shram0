import { api } from "@/lib/api";
import { ResponseUIMessage } from "@/types/ai";
import { getToolName, isToolUIPart, ModelMessage, UIDataTypes, UIMessage, UIMessageStreamWriter, UITools } from "ai";
import { normalizeDateTimeInput } from "./tools";

export const trimConversationHistory = (messages: ModelMessage[]) => {
    let maxLength = 6;
    let newMessages: ModelMessage[] = [];
    let prevRole: ModelMessage['role'] | undefined;
    let i = 0;
    while (i <= messages.length - 1 && newMessages.length < maxLength) {
        let k = messages.length - 1 - i;
        i++;
        if (messages[k].role === 'assistant' && prevRole === 'assistant') {
            continue;
        }
        newMessages.push(messages[k]);
        prevRole = messages[k].role;
    }
    return newMessages.reverse();
}

export const executeHITLtools = async (writer: UIMessageStreamWriter<ResponseUIMessage>, messages: UIMessage<unknown, UIDataTypes, UITools>[]) => {
    const lastMessage = messages[messages.length - 1];
    lastMessage.parts = await Promise.all(
        // map through all message parts
        lastMessage.parts?.map(async part => {
          if (!isToolUIPart(part)) {
            return part;
          }
          const toolName = getToolName(part);
          if (part.state !== 'output-available') {
            return part;
          }

          switch (toolName) {
            case 'updateTask': {
                if (part.output === 'Yes, confirmed.') {
                    const { id, title, scheduledTime, completed } = part.input as any;
                    const normalizedTime = normalizeDateTimeInput(scheduledTime);
                    await api.tasks.update({
                        id,
                        title: title?.trim(),
                        scheduledTime: normalizedTime,
                        completed,
                    });

                    let result = "The to-do item has been UPDATED successfully.";
                    writer.write({
                        type: 'tool-output-available',
                        toolCallId: part.toolCallId,
                        output: result,
                    });
                    return { ...part, output: result };
                } else if (part.output === 'No, denied.') {
                    let result = "Update cancelled by user.";
                    writer.write({
                        type: 'tool-output-available',
                        toolCallId: part.toolCallId,
                        output: result,
                    });
                    return { ...part, output: result };
                }
                  return part;
            }
            case 'deleteTask': {
                  if (part.output === 'Yes, confirmed.') {
                      const { id } = part.input as any;
                      await api.tasks.delete({ id });

                      let result = `The to-do item with ID ${id} has been DELETED successfully.`;
                      writer.write({
                          type: 'tool-output-available',
                          toolCallId: part.toolCallId,
                          output: result,
                      });
                      return { ...part, output: result };
                  } else if (part.output === 'No, denied.') {
                      let result = "Deletion cancelled by user.";
                      writer.write({
                          type: 'tool-output-available',
                          toolCallId: part.toolCallId,
                          output: result,
                      });
                      return { ...part, output: result };
                  }
                  return part;
            }
            default: {
              return part;
            }
          }
        }) || []
      );
}