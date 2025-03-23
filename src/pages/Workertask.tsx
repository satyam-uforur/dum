"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import {
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Task {
  _id: string;
  assigndate: string;
  detail: string;
  duedate: string;
  mainstatus: string;
  name: string;
  priority: "low" | "Medium" | "High";
  task: string;
  taskforworker_details: any[];
  workercount: number;
  workers: string[];
  actions: string;
  manageraction?: string;
  status?: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "starting":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "initial":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-purple-100 text-purple-800"; // Custom status color
    }
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
        status
      )}`}
    >
      {status}
    </span>
  );
};

const PriorityBadge = ({
  priority,
}: {
  priority: "low" | "Medium" | "High";
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(
        priority
      )}`}
    >
      {priority}
    </span>
  );
};

const Workertask = () => {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTaskData, setEditTaskData] = useState({
    task: "",
    duedate: "",
    priority: "Medium" as "low" | "Medium" | "High",
    detail: "",
    status: "",
  });

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:3535/taskalldetail");
      setTaskData(response.data.data);
      console.log("Task Data:", response.data.data);
    } catch {
      toast("Failed to fetch task data.");
    }
  };

  const changestatus = (e: any) => {
    const id = e.currentTarget.getAttribute("task-id");
    setSelectedTaskId(id);
    setIsStatusDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      console.log(id);
      const response = await axios.delete(
        `http://localhost:3535/deleteworkertask/${id}`
      );
      toast.success("Task deleted successfully", response);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const redeclareTask = async (taskId: string) => {
    try {
      const workerName = newName.trim();

      if (!workerName) {
        toast.error("Worker name is missing.");
        return;
      }

      // Print the data before sending
      console.log("👉 Redeclare Task Data:", { taskId, workerName });

      // Send the request to the backend with worker name
      const response = await axios.patch(
        `http://localhost:3535/redeclareworkertask/${taskId}`,
        { workerName }
      );

      console.log("✅ Task Redeclared:", response.data);
      toast.success("Task has been redeclared.");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error(
        "❌ Redeclare Task Error:",
        error.response?.data || error.message
      );
      toast.error("Failed to redeclare task.");
    }
  };

  const handleEditTask = (taskId: string, taskData: any) => {
    setSelectedTaskId(taskId);
    setEditTaskData({
      task: taskData.task,
      duedate: taskData.duedate,
      priority: taskData.priority,
      detail: taskData.detail || "",
      status: taskData.status,
    });
    setIsEditDialogOpen(true);
  };

  const saveTaskEdit = async () => {
    try {
      if (!selectedTaskId) return;

      console.log("Editing task:", selectedTaskId, editTaskData);

      const response = await axios.patch(
        `http://localhost:3535/updateworkertask/${selectedTaskId}`,
        editTaskData
      );

      console.log("✅ Task Updated:", response.data);
      toast.success("Task has been updated successfully");
      setIsEditDialogOpen(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error(
        "❌ Update Task Error:",
        error.response?.data || error.message
      );
      toast.error("Failed to update task");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="space-y-6">
      <ToastContainer />
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-2">
          Welcome to Task Management System
        </h1>
        <p className="text-gray-600 mb-6">Manage your tasks efficiently</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Associate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {taskData.length > 0 ? (
                taskData.map((task) =>
                  task.taskforworker_details
                    .filter((detail) =>
                      detail.name.includes(localStorage.getItem("nameofuser"))
                    )
                    .filter(
                      (detail) =>
                        detail.actionStatuses.some(
                          (action: any) => action.actions === "accepted"
                        ) ||
                        detail.actionStatuses.length === 0 ||
                        detail.actionStatuses.some(
                          (action: any) => action.actions === "initiated"
                        )
                    )
                    .map((workerTask) => (
                      <tr key={task._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {workerTask.task}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {workerTask.workers}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {workerTask.duedate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PriorityBadge priority={workerTask.priority} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={workerTask.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onSelect={changestatus}
                                task-id={workerTask._id}
                              >
                                Reassign Task
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  const taskDetails = workerTask;
                                  handleEditTask(workerTask._id, taskDetails);
                                }}
                              >
                                Edit Task
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  setTaskToDelete(workerTask._id);
                                  setOpenConfirm(true);
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => setSelectedTask(workerTask)}
                              >
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                )
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No tasks available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add this new Dialog for changing status */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Task Status</DialogTitle>
            <DialogDescription>
              Enter the new status for this task.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-status" className="text-right">
                New Status
              </Label>
              <Input
                id="new-status"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={() => redeclareTask(selectedTaskId!)}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this task?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The task will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenConfirm(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (taskToDelete) {
                  handleDelete(taskToDelete);
                  setOpenConfirm(false);
                }
              }}
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to the task details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-task-name" className="text-right">
                Task Name
              </Label>
              <Input
                id="edit-task-name"
                value={editTaskData.task}
                onChange={(e) =>
                  setEditTaskData({ ...editTaskData, task: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-due-date" className="text-right">
                Due Date
              </Label>
              <Input
                id="edit-due-date"
                type="date"
                value={editTaskData.duedate}
                onChange={(e) =>
                  setEditTaskData({ ...editTaskData, duedate: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <Input
                id="edit-status"
                type="text"
                value={editTaskData.status}
                onChange={(e) =>
                  setEditTaskData({ ...editTaskData, status: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-priority" className="text-right">
                Priority
              </Label>
              <select
                id="edit-priority"
                value={editTaskData.priority}
                onChange={(e) =>
                  setEditTaskData({
                    ...editTaskData,
                    priority: e.target.value as "low" | "Medium" | "High",
                  })
                }
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-details" className="text-right">
                Details
              </Label>
              <Textarea
                id="edit-details"
                value={editTaskData.detail}
                onChange={(e) =>
                  setEditTaskData({ ...editTaskData, detail: e.target.value })
                }
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" onClick={saveTaskEdit}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask?.task}</DialogTitle>
            <DialogDescription>Task Details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <strong>Assignee:</strong> {selectedTask?.name}
            </div>
            <div>
              <strong>Associate:</strong> {selectedTask?.workers}
            </div>
            <div>
              <strong>Due Date:</strong> {selectedTask?.duedate}
            </div>
            <div>
              <strong>Priority:</strong>{" "}
              <PriorityBadge priority={selectedTask?.priority || "Medium"} />
            </div>
            <div>
              <strong>Status:</strong>{" "}
              <StatusBadge status={selectedTask?.status || "In Progress"} />
            </div>
            <div>
              <strong>Description:</strong> {selectedTask?.detail}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workertask;
