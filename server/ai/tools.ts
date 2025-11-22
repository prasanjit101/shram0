import { tool } from "ai";
import z from "zod";
import { Task } from "@/lib/db/schema";
import { api } from "@/lib/api";

export const normalizeDateTimeInput = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString();
};

export const buildTaskXml = (tasks: Task[]) => {
  if (tasks.length === 0) {
    return "<tasks />";
  }

  return [
    "<tasks>",
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



export const taskTools = {
  createTask: tool({
    description: "Create a new task item",
    inputSchema: z.object({
      title: z.string().min(1).describe("The title of the task item"),
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
        "\nIf there are any errors, update it using the 'update' tool using the 'id' of the to-do item.",
      ].join("\n");
    },
  }),
  listTask: tool({
    description: "List task items",
    inputSchema: z.object({
      query: z
        .string()
        .optional()
        .describe("Free-text filter such as 'administrative'"),
    }),
    execute: async ({ query }) => {
      return "Tasks list based on the query has been requested. It should be reflected in the UI shortly.";
    },
  }),
  updateTask: tool({
    description: "Update a task item",
    inputSchema: z.object({
      id: z.number().describe("The ID of the task item"),
      title: z.string().optional().describe("The new title of the task item"),
      scheduledTime: z
        .string()
        .optional()
        .describe("New ISO 8601 datetime when the task should be scheduled"),
      completed: z
        .boolean()
        .optional()
        .describe(
          "Whether the task is completed (true) or still pending (false)",
        ),
    }),
  }),
  deleteTask: tool({
    description: "Call this tool to delete a task item by its ID",
    inputSchema: z.object({
      id: z.number().int().describe("The ID of the task item"),
    }),
  }),
};
