"use client";

import { useEffect, useState, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

interface Task {
  _id: string;
  assigndate: string;
  detail: string;
  duedate: string;
  mainstatus: string;
  name: string;
  priority: "low" | "medium" | "high";
  task: string;
  taskforworker_details: any[];
  workercount: number;
  title: string;
  actionStatuses: any[];
  status: string;
  actions: string;
  manageraction?: string;
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
  priority: "low" | "medium" | "high";
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

const Associate = () => {
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [user, setUser] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [ViewselectedTask, setViewSelectedTask] = useState<any>(null);
  const [isWorkerStatusDialogOpen, setIsWorkerStatusDialogOpen] =
    useState<boolean>(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchTasks = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:3535/taskalldetail");
      setTaskData(response.data.data);
    } catch {
      toast("Failed to fetch task data.");
    }
  }, []);

  const fetchWorker = useCallback(async () => {
    try {
      const username = localStorage.getItem("nameofuser") || "";
      const response = await axios.get(
        `http://localhost:3535/getuser?username=${username}`
      );

      if (response.data.status === "done") {
        if (response.data.data.ischanged) {
          setUser(response.data.data);
        } else {
          // Show toast warning and navigate after a slight delay
          toast.warning("Your password needs to be changed. Redirecting...", {
            autoClose: 3000, // Wait 3 seconds before navigating
            onClose: () => navigate("/forgotpassword", { replace: true }), // Redirect after toast closes
          });
        }
      } else {
        toast.error("User not found");
      }
    } catch (error) {
      toast.error("Failed to fetch user data.");
      console.error("Error fetching user:", error);
    }
  }, []);

  const handleStatusChange = async () => {
    console.log("👉 Sending Request:", { selectedTaskId, newStatus });

    if (!selectedTaskId || !newStatus) return;

    try {
      const response = await axios.patch(
        `http://localhost:3535/changestatus/${selectedTaskId}`,
        {
          mainstatus: newStatus,
        }
      );

      if (response.data.status === "done") {
        toast.success("Task status updated successfully");
        setIsStatusDialogOpen(false);
        setNewStatus("");
        // Refresh the task data
        const updatedTaskData = await axios.get(
          "http://localhost:3535/taskalldetail"
        );
        setTaskData(updatedTaskData.data.data);
      }

      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
    }
  };

  const handleWorkerStatusUpdate = async () => {
    // Set taskId from selectedTask before using it
    const currentTaskId = selectedTask?._id;

    if (!currentTaskId || !newStatus) {
      toast.error("Please select a status");
      return;
    }

    setIsUpdating(true);

    console.log("👉 Sending Status Data:", {
      taskId: currentTaskId,
      newStatus,
    });
    try {
      const response = await axios.patch(
        `http://localhost:3535/updatetaskstatus/${currentTaskId}`,
        {
          taskId: currentTaskId,
          status: newStatus,
        }
      );

      if (response.data.status === "done") {
        toast.success("Status updated successfully");
        setIsWorkerStatusDialogOpen(false);
        setNewStatus("");
        fetchTasks();
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchWorker(); 
    fetchTasks();// Call fetchWorker when component mounts
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <ToastContainer />
      {user && (
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
                    Team Leader
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
                        detail.workers.includes(
                          localStorage.getItem("nameofuser")
                        )
                      )
                      .filter(
                        (detail) =>
                          detail.actionStatuses.some(
                            (action: any) => action.actions === "accepted"
                          ) &&
                          detail.actionStatuses.some(
                            (action: any) => action.actions !== ""
                          )
                      )
                      .map((task) => (
                        <tr key={task._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {task.task}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {task.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {task.duedate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <PriorityBadge priority={task.priority} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={task.status} />
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
                                  onSelect={() => {
                                    setSelectedTask(task);
                                    setIsWorkerStatusDialogOpen(true);
                                    setSelectedTaskId(task._id);
                                  }}
                                >
                                  Change Status
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => setViewSelectedTask(task)}
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
                {taskData.length > 0 ? (
                  taskData
                    .filter(
                      (task) => task.name === localStorage.getItem("nameofuser")
                    )
                    .filter((task) => task.manageraction === "accepted")
                    .map((task) => (
                      <tr key={task._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {task.task}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                          <div className="line-clamp-2">{task.detail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {task.duedate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PriorityBadge priority={task.priority} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={task.mainstatus} />
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
                                onSelect={() => {
                                  setSelectedTask(task);
                                  setSelectedTaskId(task._id);
                                  setIsStatusDialogOpen(true); // Use the status dialog for manager tasks
                                }}
                              >
                                Change Status
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => setViewSelectedTask(task)}
                              >
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
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
      )}

      {/* Status Change Dialog */}
      <Dialog
        open={isWorkerStatusDialogOpen}
        onOpenChange={setIsWorkerStatusDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Task Status</DialogTitle>
            <DialogDescription>Change the status of task:</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Custom Status</Label>
            <Input
              type="text"
              placeholder="Enter custom status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsWorkerStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleWorkerStatusUpdate} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleStatusChange}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!ViewselectedTask}
        onOpenChange={(open) => !open && setViewSelectedTask(null)}
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
              <strong>Due Date:</strong> {selectedTask?.duedate}
            </div>
            <div>
              <strong>Priority:</strong>{" "}
              <PriorityBadge priority={selectedTask?.priority || "low"} />
            </div>
            <div>
              <strong>Status:</strong>{" "}
              <StatusBadge
                status={selectedTask?.status || selectedTask?.mainstatus}
              />
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

export default Associate;
