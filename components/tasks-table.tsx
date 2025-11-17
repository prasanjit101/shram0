"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTasksStore, useTasks } from "@/lib/tasks-utils";


export function TasksTable() {
  const { tasks, isLoading } = useTasksStore();
  useTasks.useGetAll();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="w-[200px]">Scheduled Time</TableHead>
            <TableHead className="w-[150px]">Completed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {isLoading ? "Loading tasks..." : "No tasks found."}
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>
                  {task.scheduledTime
                    ? new Date(task.scheduledTime).toLocaleString()
                    : "-"}
                </TableCell>
                <TableCell>
                  {task.completed ? "Yes" : "No"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
