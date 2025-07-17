import { Modal, Card, TabItem, Tabs, Spinner, Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { ITask } from "@/models/Task"; // Assuming this interface is exported from the Task model

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
  const [selectedTab, setSelectedTab] = useState<"Low" | "Medium" | "High">(
    "Medium"
  );
  console.log(memberId);
  // Fetch tasks by priority
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // Load tasks when tab changes
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

  // Task rendering
  const renderTaskRow = (task: ITask, i: any) => (
    <tr key={task._id || i}>
      <td className="px-6 py-4">{task.title}</td>
      <td className="px-6 py-4">{task.status}</td>
      <td className="px-6 py-4">
        {/* {new Date(task.dueDate).toLocaleDateString()} */}
        12-02-2023
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

          <Tabs aria-label="Task Priority Tabs" className="underline">
            {/* Tabs for task priority */}
            <TabItem
              title=" Low Priority s"
              active={selectedTab === "Low"}
              onClick={() => setSelectedTab("Low")}
            >
              Low Priority
            </TabItem>
            <TabItem
              title="Medium Priority"
              active={selectedTab === "Medium"}
              onClick={() => setSelectedTab("Medium")}
            >
              Medium Priority
            </TabItem>
            <TabItem
              title="High Priority"
              active={selectedTab === "High"}
              onClick={() => setSelectedTab("High")}
            >
              High Priority
            </TabItem>
          </Tabs>

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
          <Button
            onClick={onClose}
            type="button"
            color="red"
            className="w-full"
          >
            Close
          </Button>
        </Card>
      </div>
    </Modal>
  );
};

export default ManageTaskModel;
