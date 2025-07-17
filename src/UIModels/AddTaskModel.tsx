"use client";

import {
  Modal,
  Card,
  Label,
  TextInput,
  Textarea,
  Select,
  Button,
  Spinner,
  Datepicker,
  Alert,
} from "flowbite-react";
import { useState } from "react";

type Props = {
  show: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  memberId: string;
  teamId: string;
};

const AddTaskModal: React.FC<Props> = ({
  show,
  onClose,
  memberId,
  teamId,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          dueDate,
          priority,
          assignedTo: memberId,
          teamId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setFormError(result.message || "Something went wrong.");
        return;
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.log(err);
      setFormError("Error submitting task.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} size="md" popup>
      <div className="w-full max-w-sm mx-auto">
        <Card className="w-full shadow-none bg-transparent border-none">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h1 className="text-2xl font-bold text-center mb-4">Assign Task</h1>
            {formError && <Alert color="failure">{formError}</Alert>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Title</Label>
                <TextInput
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task description"
                  required
                />
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Datepicker
                  id="dueDate"
                  onChange={(date: Date | null) => setDueDate(date)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  id="priority"
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as "Low" | "Medium" | "High")
                  }
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              color="blue"
              className="w-full"
              disabled={formLoading}
            >
              {formLoading ? (
                <>
                  <Spinner size="sm" aria-label="Loading" />{" "}
                  <span className="pl-2">Assigning...</span>
                </>
              ) : (
                "Assign Task"
              )}
            </Button>

            <Button
              onClick={onClose}
              type="button"
              color="red"
              className="w-full"
              disabled={formLoading}
            >
              Cancel
            </Button>
          </form>
        </Card>
      </div>
    </Modal>
  );
};

export default AddTaskModal;
