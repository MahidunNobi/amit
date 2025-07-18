// app/dashboard/my-tasks/page.tsx
"use client";

import {
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { useEffect, useState } from "react";

interface Task {
  title: string;
  _id: string;
  status: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/my-tasks");
        if (!res.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await res.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        // Optionally show a toast or message to user
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Assigned Tasks</h1>

      {loading ? (
        <Spinner />
      ) : tasks.length === 0 ? (
        <p>No tasks assigned to you.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Task Name</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Priority</TableHeadCell>
                <TableHeadCell>Due Date</TableHeadCell>
                <TableHeadCell>
                  <span className="sr-only">View</span>
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {tasks.map((task) => (
                <TableRow
                  key={task._id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {task.title}
                  </TableCell>
                  <TableCell>{task.status}</TableCell>
                  <TableCell className="capitalize">
                    {getPriorityBadge(task.priority)}
                  </TableCell>
                  <TableCell>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <a
                      href="#"
                      className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                    >
                      View
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

const getPriorityBadge = (priority: string) => {
  const baseClass =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  switch (priority.toLowerCase()) {
    case "high":
      return (
        <span
          className={`${baseClass} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}
        >
          High
        </span>
      );
    case "medium":
      return (
        <span
          className={`${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}
        >
          Medium
        </span>
      );
    case "low":
    default:
      return (
        <span
          className={`${baseClass} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`}
        >
          Low
        </span>
      );
  }
};
