"use client";

import { Modal, Card, TabItem, Tabs, Spinner, Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { ITask } from "@/models/Task";
import { HiArrowDown, HiArrowUp, HiMinus } from "react-icons/hi";

type TaskProps = {
  show: boolean;
  onClose: () => void;
  teamId: string;
  memberId: string;
};

const ManageTaskModel: React.FC<TaskProps> = ({
  show,
  onClose,
  teamId,
  memberId,
}) => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<"low" | "medium" | "high">(
    "medium"
  );
  console.log(selectedTab);
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/tasks?teamId=${teamId}&priority=${selectedTab}&memberId=${memberId}`
        );
        const data = await response.json();
        if (response.ok) {
          setTasks(data.tasks);
        } else {
          console.error("Error fetching tasks", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [selectedTab, memberId, teamId]);

  const renderTaskRow = (task: ITask, i: number) => (
    <tr key={(task._id as string) || i}>
      <td className="px-6 py-4">{task.title}</td>
      <td className="px-6 py-4 capitalize">{task.status.replace("_", " ")}</td>
      <td className="px-6 py-4">
        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
      </td>
    </tr>
  );

  return (
    <Modal show={show} onClose={onClose} size="lg" popup>
      <div className="w-full max-w-lg mx-auto">
        <Card className="w-full shadow-none bg-transparent border-none">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Task Management</h2>
          </div>

          <Tabs
            // aria-label="Task Priority Tabs"
            className="underline"
            variant="underline"
            aria-label="Tabs with underline"
            // variant="underline"
            onActiveTabChange={(tab) => {
              if (tab === 0) setSelectedTab("low");
              if (tab === 1) setSelectedTab("medium");
              if (tab === 2) setSelectedTab("high");
            }}
          >
            {["Low Priority", "Medium Priority", "High Priority"].map(
              (tem, i) => (
                <TabItem key={i} title={tem}>
                  <div className="mt-4">
                    {loading ? (
                      <div className="flex justify-center">
                        <Spinner />
                      </div>
                    ) : (
                      <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                          <tr>
                            <th className="px-6 py-3">Task Name</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Due Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.length > 0 ? (
                            tasks.map((task, i) => renderTaskRow(task, i))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-6 py-4 text-center">
                                No tasks available.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </TabItem>
              )
            )}
          </Tabs>

          <Button
            onClick={onClose}
            type="button"
            color="red"
            className="w-full mt-4"
          >
            Close
          </Button>
        </Card>
      </div>
    </Modal>
  );
};

export default ManageTaskModel;

type TaskTableTabProps = {
  title: string;
  tasks: ITask[];
  loading: boolean;
  renderTaskRow: (task: ITask, index: number) => React.ReactNode;
};

const TaskTableTab: React.FC<TaskTableTabProps> = ({
  title,
  tasks,
  loading,
  renderTaskRow,
}) => (
  <TabItem title={title}>
    <div className="mt-4">
      {loading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : (
        <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">Task Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length > 0 ? (
              tasks.map((task, i) => renderTaskRow(task, i))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center">
                  No tasks available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  </TabItem>
);
