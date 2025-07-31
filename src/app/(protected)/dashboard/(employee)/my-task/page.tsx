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

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/my-tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      const updatedTask = await res.json();

      setTasks((prev) =>
        prev.map((task) =>
          task._id === updatedTask._id
            ? { ...task, status: updatedTask.status }
            : task
        )
      );
    } catch (err) {
      console.error(err);
    }
  };
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
                <TableHeadCell>Priority</TableHeadCell>
                <TableHeadCell>Due Date</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
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
                  <TableCell className="capitalize">
                    {getPriorityBadge(task.priority)}
                  </TableCell>
                  <TableCell>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task._id, e.target.value)
                      }
                      className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
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
