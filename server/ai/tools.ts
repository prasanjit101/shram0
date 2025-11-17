import { tool } from "ai";
import z from "zod";
import { Task } from "@/lib/db/schema";
import { api } from "@/lib/api";

const normalizeDateTimeInput = (value?: string | null) => {
    if (!value) {
        return undefined;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toISOString();
};

const buildTaskXml = (tasks: Task[]) => {
    if (tasks.length === 0) {
        return "<tasks />";
    }

    return ["<tasks>",
        ...tasks.map((task, index) => {
            return `<task key="task-${task.id}" index="${index + 1}">
  <id>${task.id}</id>
  <title>${task.title}</title>
  <scheduledTime>${task.scheduledTime ?? ""}</scheduledTime>
  <completed>${task.completed === 1}</completed>
  <createdAt>${task.createdAt ?? ""}</createdAt>
  <updatedAt>${task.updatedAt ?? ""}</updatedAt>
</task>`;
        }),
        "</tasks>",
    ].join("\n");
};



export const todoTools = {
    create: tool({
        description: "Create a new to-do item",
        inputSchema: z.object({
            title: z.string().min(1).describe("The title of the to-do item"),
            scheduledTime: z
                .string()
                .optional()
                .describe("ISO 8601 datetime when the task is scheduled"),
        }),
        execute: async ({ title, scheduledTime }) => {
            const normalizedTime = normalizeDateTimeInput(scheduledTime);
            const task = await api.tasks.create({
                title: title.trim(),
                scheduledTime: normalizedTime,
            });

            return [
                "The following to-do item has been CREATED successfully:",
                buildTaskXml([task]),
                "\nIf there are any errors, update it using the 'update' tool using the 'id' of the to-do item."
            ].join("\n");
        },
    }),
    list: tool({
        description: "List to-do items",
        inputSchema: z.object({
            query: z.string().optional().describe("Free-text filter such as 'administrative'"),
        }),
    }),
    update: tool({
        description: "Update a to-do item",
        inputSchema: z
            .object({
                id: z.number().describe("The ID of the to-do item"),
                title: z.string().optional().describe("The new title of the to-do item"),
                scheduledTime: z
                    .string()
                    .optional()
                    .describe("New ISO 8601 datetime when the task should be scheduled"),
                completed: z
                    .boolean()
                    .optional()
                    .describe("Whether the task is completed (true) or still pending (false)"),
            }),
        execute: async ({ id, title, scheduledTime, completed }) => {
            const normalizedTime = normalizeDateTimeInput(scheduledTime);
            const updatedTask = await api.tasks.update({
                id,
                title: title?.trim(),
                scheduledTime: normalizedTime,
                completed,
            });

            return "The to-do item has been UPDATED successfully.";
        },
    }),
    delete: tool({
        description: "Call this tool to delete a to-do item by its ID",
        inputSchema: z.object({
            id: z.number().int().describe("The ID of the to-do item"),
        }),
        execute: async ({ id }) => {
            await api.tasks.delete({ id });
            return `The to-do item with ID ${id} has been DELETED successfully.`;
        },
    }),
};