"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import {
  Clock,
  Plus,
  X,
  Users,
  Calendar,
  Paperclip,
  FolderPen,
  ReceiptText,
  MoreVertical,
  PieChart,
  Minus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  manageraction: string;
  title: string;
  customStatus?: string;
  taskassigner: string;
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

const Teamlead = () => {
  const [newTask, setNewTask] = useState<Partial<Task>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const navigate = useNavigate();
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("http://localhost:3535/taskalldetail")
      .then((response) => {
        setTaskData(response.data.data);
      })
      .catch(() => toast("Failed to fetch task data."));

    fetchWorker();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    newTask.taskassigner = localStorage.getItem("nameofuser") || "";

    // Ensure all required fields are filled
    if (
      !newTask.name ||
      !newTask.task ||
      !newTask.duedate ||
      !newTask.priority ||
      !newTask.detail ||
      !newTask.mainstatus ||
      !newTask.taskassigner
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    toast.info("Task is being added...");

    try {
      const response = await axios.post(
        "http://localhost:3535/addtask",
        newTask
      );

      console.log(response);

      if (response.data.status === "done") {
        toast.success("Task added successfully");
        setIsModalOpen(false);

        // Reset the form fields
        setNewTask({
          assigndate: new Date().toISOString().split("T")[0], // Reset to today
          duedate: "",
          priority: "low",
          name: "",
          task: "",
          detail: "",
          mainstatus: "",
          taskassigner: localStorage.getItem("nameofuser") || "",
        });
      }
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error("Error:", error);

      if (error.response?.status === 404) {
        toast.error("This worker does not exist");
      } else {
        toast.error("An error occurred while adding the task");
      }
    }
  };

  const addtask = (e: any) => {
    var id = e.currentTarget.getAttribute("task-id");
    console.log(id);
    navigate("/addtaskforworker/" + id);
  };

  const changestatus = (e: any) => {
    const id = e.currentTarget.getAttribute("task-id");
    setSelectedTaskId(id);
    setIsStatusDialogOpen(true);
  };

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

  return (
    <div className="space-y-6">
      <ToastContainer />
      {user && (
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold mb-2">
            Welcome to Task Management System
          </h1>
          <p className="text-gray-600 mb-6">Manage your tasks efficiently</p>
          <div className="flex gap-4 mb-4">
            <Button
              className="bg-black text-white"
              onClick={() => navigate("/addworker")}
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Associate
            </Button>
            <Button
              className="bg-black text-white"
              onClick={() => setIsModalOpen(true)}
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
            <Button
              onClick={() => navigate("/removeworker")}
              className="bg-black text-white"
            >
              <Minus className="mr-2 h-4 w-4" /> Remove Associate
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discripation
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
                                onSelect={addtask}
                                task-id={task._id}
                              >
                                Assign Task to Worker
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={changestatus}
                                task-id={task._id}
                              >
                                Change Status
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => setSelectedTask(task)}
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

      {/* Task Details Dialog */}
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
              <strong>Due Date:</strong> {selectedTask?.duedate}
            </div>
            <div>
              <strong>Priority:</strong>{" "}
              <PriorityBadge priority={selectedTask?.priority || "low"} />
            </div>
            <div>
              <strong>Status:</strong>{" "}
              <StatusBadge status={selectedTask?.mainstatus || ""} />
            </div>
            <div>
              <strong>Description:</strong> {selectedTask?.detail}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isModalOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Add New Task
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FolderPen size={16} className="text-gray-400" />
                        <label className="text-sm font-medium text-gray-700">
                          Task Title
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="Write your task"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-500"
                        value={newTask.task}
                        onChange={(e) =>
                          setNewTask({ ...newTask, task: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={16} className="text-gray-400" />
                        <label className="text-sm font-medium text-gray-700">
                          Assign Date
                        </label>
                      </div>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-500"
                        value={
                          newTask.assigndate ||
                          new Date().toISOString().split("T")[0]
                        } // Default to today's date
                        onChange={(e) =>
                          setNewTask({ ...newTask, assigndate: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={16} className="text-gray-400" />
                        <label className="text-sm font-medium text-gray-700">
                          Due Date
                        </label>
                      </div>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-500"
                        value={newTask.duedate}
                        onChange={(e) =>
                          setNewTask({ ...newTask, duedate: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-gray-400" />
                        <label className="text-sm font-medium text-gray-700">
                          Priority
                        </label>
                      </div>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-500"
                        value={newTask.priority}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            priority: e.target.value as
                              | "low"
                              | "medium"
                              | "high",
                          })
                        }
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <ReceiptText size={16} className="text-gray-400" />
                        <label className="text-sm font-medium text-gray-700">
                          Task Description
                        </label>
                      </div>
                      <textarea
                        placeholder="Task description"
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-500"
                        value={newTask.detail}
                        onChange={(e) =>
                          setNewTask({ ...newTask, detail: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={16} className="text-gray-400" />
                        <label className="text-sm font-medium text-gray-700">
                          Manager Name
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="Enter assignee name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-500"
                        value={newTask.name}
                        onChange={(e) =>
                          setNewTask({ ...newTask, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <PieChart size={16} className="text-gray-400" />
                        <label className="text-sm font-medium text-gray-700">
                          Status
                        </label>
                      </div>

                      <div className="flex gap-4">
                        {/* Select Dropdown for Status */}
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-500"
                          value={newTask.mainstatus}
                          onChange={(e) => {
                            const updatedStatus = e.target.value;
                            setNewTask({
                              ...newTask,
                              mainstatus: updatedStatus,
                            });
                          }}
                        >
                          <option value="initial">Initial</option>
                          <option value="pending">Pending</option>
                          <option value="in progress">In Progress</option>
                          <option value="starting">Starting</option>
                          <option value="custom">Custom</option>{" "}
                          {/* Custom option */}
                        </select>

                        {/* Conditionally Render Input for Custom Status */}
                        {newTask.mainstatus === "custom" && (
                          <input
                            type="text"
                            placeholder="Custom Status"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-500"
                            value={newTask.mainstatus || ""}
                            onChange={(e) =>
                              setNewTask({
                                ...newTask,
                                mainstatus: e.target.value,
                              })
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 hover:text-gray-700 cursor-pointer">
                    <Paperclip size={16} />
                    <span className="text-sm">Upload Document</span>
                    <input type="file" className="hidden" />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-700"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
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
    </div>
  );
};

export default Teamlead;
