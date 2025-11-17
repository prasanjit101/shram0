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
import { Task } from "@/lib/db/schema"

interface TasksTableProps {
  tasks: Task[]
}

export function TasksTable({ tasks }: TasksTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="w-[200px]">Scheduled Time</TableHead>
            <TableHead className="w-[150px]">Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No tasks found.
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
                  {task.createdAt
                    ? new Date(task.createdAt).toLocaleString()
                    : "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
