"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import {
  Clock,
  Plus,
  X,
  Users,
  Calendar,
  FolderPen,
  ReceiptText,
  PieChart,
  Search,
  Minus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";

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
  customStatus?: string;
  taskassigner: string;
  role: string;
}

interface Manager {
  _id: string;
  name: string;
  email: string;
  role: string;
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

const RoleBadge = ({ role }: { role: "Associate" | "Teamlead" }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "Associate":
        return "bg-blue-100 text-blue-800";
      case "Teamlead":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(
        role
      )}`}
    >
      {role}
    </span>
  );
};

const Director = () => {
  const [newTask, setNewTask] = useState<Partial<Task>>({
    assigndate: new Date().toISOString().split("T")[0], // Default to today
    duedate: "",
    priority: "low",
    name: "",
    task: "",
    detail: "",
    taskassigner: localStorage.getItem("nameofuser") || "",
    mainstatus: "",
    role: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskData, setTaskData] = useState<Task[]>([]);
  const navigate = useNavigate();
  const [managerName, setManagerName] = useState("");
  const [managers, setManagers] = useState<Manager[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);
   const [customStatuses, setCustomStatuses] = useState(() => {
     return ["Initial"]; // Initial default statuses
   });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [customStatus, setCustomStatus] = useState("");

  const addCustomStatus = () => {
    const trimmedStatus = customStatus.trim();

    if (trimmedStatus && !customStatuses.includes(trimmedStatus || "")) {
      setCustomStatuses((prev) => [...prev, trimmedStatus]); // Store permanently
      setNewTask({ ...newTask, mainstatus: trimmedStatus });
      setCustomStatus("");

      toast.success("Status added successfully!");
    } else {
      toast.error("Status already exists or is invalid!");
    }
  };
  
  const removeCustomStatus = (status:any) => {
    setCustomStatuses((prev) => prev.filter((s) => s !== status));
    toast.success("Status removed successfully!");
  };

  const fetchManagers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3535/manageralldetail",
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );

      if (response.data && Array.isArray(response.data.data)) {
        const managers = response.data.data;
        setManagers(managers.filter((manager:any) => manager.role !== "Director"));
      } else {
        toast.error("Invalid manager data format received");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED") {
          toast.error(
            "Cannot connect to server. Please check if it's running."
          );
        } else if (error.response?.status === 404) {
          toast.error(
            "Manager data endpoint not found. Please check the API URL."
          );
        } else {
          toast.error(`Error: ${error.message}`);
        }
      } else {
        toast.error("An unexpected error occurred while fetching managers");
      }
      setManagers([]);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleManagerRoleSelect = (manager: Manager) => {
    const role = manager.role;
    const name = manager.name;
    setNewTask({ ...newTask, role, name });
    setSearchTerm(manager.name);
    setShowSuggestions(false);
  };

  const handleDelete = async (id: string) => {
    try {
      console.log(id);
      const response = await axios.delete(
        `http://localhost:3535/deletetask/${id}`
      );
      toast.success("Task deleted successfully", response);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(newTask);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Ensure assign date is not in the past
    if (newTask.assigndate && newTask.assigndate < today) {
      toast.error("Assign date cannot be in the past.");
      return;
    }

    // Ensure all required fields are filled
    if (
      !newTask.name ||
      !newTask.task ||
      !newTask.duedate ||
      !newTask.priority ||
      !newTask.detail ||
      !newTask.mainstatus ||
      !newTask.taskassigner ||
      !newTask.role
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    toast.info("Task is being added...");

    try {
      const response = await axios.post("http://localhost:3535/addtask", newTask);

      console.log(response);

      if (response.data.status === "done") {
        toast.success("Task added successfully");
        setIsModalOpen(false);

        // Reset the form fields
        setNewTask({
          assigndate: today, // Reset to today
          duedate: "",
          priority: "low",
          name: "",
          task: "",
          detail: "",
          mainstatus: "",
          taskassigner: localStorage.getItem("username") || "",
          role: "",
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTask) return;

    console.log(editingTask);

     const today = new Date().toISOString().split("T")[0];

     // Ensure assign date is not in the past
     if (editingTask.assigndate && editingTask.assigndate < today) {
       toast.error("Assign date cannot be in the past.");
       return;
     }

    // Ensure all required fields are filled
    if (
      !editingTask.name ||
      !editingTask.task ||
      !editingTask.duedate ||
      !editingTask.priority ||
      !editingTask.detail ||
      !editingTask.mainstatus
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    toast.info("Task is being updated...");

    try {
      const response = await axios.patch(
        `http://localhost:3535/updatetask/${editingTask._id}`,
        editingTask
      );

      if (response.data.status === "done") {
        toast.success("Task updated successfully");
        setIsEditModalOpen(false);
        setEditingTask(null);

        // Refresh task data
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("An error occurred while updating the task");
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:3535/taskalldetail")
      .then((response) => {
        setTaskData(response.data.data);
        console.log(response.data.data);
      })
      .catch(() => toast("Failed to fetch task data."));
  }, []);

  return (
    <div className="space-y-6">
      <ToastContainer />
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-2">
          Welcome to Task Management System
        </h1>
        <p className="text-gray-600 mb-6">Manage your tasks efficiently</p>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => navigate("/addmanager")}
            className="flex gap-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-700"
          >
            <Plus size={20} /> Add TeamLead
          </button>
          <button
            onClick={() => navigate("/addworker")}
            className="flex gap-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-700"
          >
            <Plus size={20} /> Add Associate
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex gap-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-700"
          >
            <Plus size={20} /> Add Task
          </button>
          <button
            onClick={() => navigate("/removemanager")}
            className="flex gap-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-700"
          >
            <Minus size={20} /> Remove TeamLead
          </button>
          <button
            onClick={() => navigate("/removeworker")}
            className="flex gap-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-700"
          >
            <Minus size={20} /> Remove Associate
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Name
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
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  More
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {taskData.length > 0 ? (
                taskData.map((task) => (
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
                      <StatusBadge status={task.mainstatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <RoleBadge
                        role={
                          task.role === "Manager"
                            ? "Teamlead"
                            : task.role === "Worker"
                            ? "Associate"
                            : ("Associate" as "Associate" | "Teamlead") // Defaulting to "Associate"
                        }
                      />
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
                              setEditingTask(task);
                              setIsEditModalOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              setTaskToDelete(task._id);
                              setOpenConfirm(true);
                            }}
                          >
                            Delete
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

                <form onSubmit={handleSubmit} className="space-y-4">
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
                    {/* <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={16} className="text-gray-400" />
                        <label className="text-sm font-medium text-gray-700">
                          ManageTasker Name
                        </label>
                      </div>
                      <div className="relative">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search manager name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-500"
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                          />
                          <Search
                            size={16}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          />
                        </div>
                        {showSuggestions && searchTerm && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto">
                            {managers.length > 0 ? (
                              managers
                                .filter((manager) =>
                                  manager.name
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase())
                                )
                                .map((manager) => (
                                  <div
                                    key={manager._id}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      handleManagerRoleSelect(manager);
                                    }}
                                  >
                                    <div className="font-medium">
                                      {manager.name}
                                    </div>
                                  </div>
                                ))
                            ) : (
                              <div className="px-4 py-2 text-gray-500">
                                No managers found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div> */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={16} className="text-gray-400" />
                        <label className="text-sm font-medium text-gray-700">
                          ManageTasker Name
                        </label>
                      </div>

                      <div className="relative">
                        <Select
                          value={managerName}
                          onValueChange={(value) => {
                            const selectedManager = managers.find(
                              (manager) => manager.name === value
                            );
                            if (selectedManager) {
                              handleManagerRoleSelect(selectedManager);
                              // Set all manager data
                            }
                            setManagerName(value);
                          }}
                        >
                          <SelectTrigger className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-500">
                            <SelectValue placeholder="Search or select a manager" />
                          </SelectTrigger>

                          <SelectContent>
                            {managers.map((manager) => (
                              <SelectItem
                                key={manager._id}
                                value={manager.name}
                              >
                                {`${manager.name} (${manager.role})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <PieChart size={16} className="text-gray-400" />
                        <label className="text-sm font-medium text-gray-700">
                          Status
                        </label>
                      </div>

                      <div className="space-y-2">
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-500"
                          value={
                            [...customStatuses].includes(
                              newTask.mainstatus || ""
                            )
                              ? newTask.mainstatus
                              : "custom"
                          }
                          onChange={(e) => {
                            const updatedStatus = e.target.value;
                            if (updatedStatus === "custom") {
                              setNewTask({
                                ...newTask,
                                mainstatus: customStatus,
                              });
                            } else {
                              setNewTask({
                                ...newTask,
                                mainstatus: updatedStatus,
                              });
                              setCustomStatus("");
                            }
                          }}
                        >
                          {customStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                          <option value="custom">Custom</option>
                        </select>

                        {!customStatuses.includes(newTask.mainstatus || "") && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Enter Custom Status"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-500"
                              value={customStatus}
                              onChange={(e) => {
                                setCustomStatus(e.target.value);
                                setNewTask({
                                  ...newTask,
                                  mainstatus: e.target.value.trim(),
                                });
                              }}
                            />
                            <button
                              type="button"
                              onClick={addCustomStatus}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        )}

                        {customStatuses.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Custom Statuses:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {customStatuses.map((status) => (
                                <div
                                  key={status}
                                  className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md"
                                >
                                  <span className="text-sm">{status}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeCustomStatus(status)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div> */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <PieChart size={16} className="text-gray-400" />
                        <label className="text-sm font-medium text-gray-700">
                          Status
                        </label>
                      </div>

                      <div className="space-y-2">
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-500"
                          value={
                            customStatuses.includes(newTask.mainstatus || "")
                              ? newTask.mainstatus
                              : "custom"
                          }
                          onChange={(e) => {
                            const updatedStatus = e.target.value;
                            if (updatedStatus === "custom") {
                              setNewTask({
                                ...newTask,
                                mainstatus: customStatus,
                              });
                            } else {
                              setNewTask({
                                ...newTask,
                                mainstatus: updatedStatus,
                              });
                              setCustomStatus("");
                            }
                          }}
                        >
                          {customStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                          <option value="custom">Custom</option>
                        </select>

                        {!customStatuses.includes(newTask.mainstatus || "") && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Enter Custom Status"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-500"
                              value={customStatus}
                              onChange={(e) => setCustomStatus(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={addCustomStatus}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        )}

                        {customStatuses.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Custom Statuses:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {customStatuses.map((status) => (
                                <div
                                  key={status}
                                  className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md"
                                >
                                  <span className="text-sm">{status}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeCustomStatus(status)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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
      {isEditModalOpen && editingTask && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Edit Task
                  </h2>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-6">
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
                        value={editingTask.task}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            task: e.target.value,
                          })
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
                        value={editingTask.assigndate?.split("T")[0] || ""}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            assigndate: e.target.value,
                          })
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
                        value={editingTask.duedate?.split("T")[0] || ""}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            duedate: e.target.value,
                          })
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
                        value={editingTask.priority}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
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
                        value={editingTask.detail}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            detail: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={16} className="text-gray-400" />
                        <label className="text-sm font-medium text-gray-700">
                          ManagerTasker Name
                        </label>
                      </div>
                      <div className="relative">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search manager name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-500"
                            value={editingTask.name}
                            onChange={(e) => {
                              setEditingTask({
                                ...editingTask,
                                name: e.target.value,
                              });
                              setSearchTerm(e.target.value);
                              setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                          />
                          <Search
                            size={16}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          />
                        </div>
                        {showSuggestions && searchTerm && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto">
                            {managers.length > 0 ? (
                              managers
                                .filter((manager) =>
                                  manager.name
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase())
                                )
                                .map((manager) => (
                                  <div
                                    key={manager._id}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      setEditingTask({
                                        ...editingTask,
                                        name: manager.name,
                                        role: manager.role,
                                      });
                                      handleManagerRoleSelect(manager);
                                    }}
                                  >
                                    <div className="font-medium">
                                      {manager.name}
                                    </div>
                                  </div>
                                ))
                            ) : (
                              <div className="px-4 py-2 text-gray-500">
                                No managers found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <PieChart size={16} className="text-gray-400" />
                        <label className="text-sm font-medium text-gray-700">
                          Status
                        </label>
                      </div>

                      <div className="space-y-2">
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-500"
                          value={
                            [...customStatuses].includes(
                              editingTask.mainstatus || ""
                            )
                              ? editingTask.mainstatus
                              : "custom"
                          }
                          onChange={(e) => {
                            const updatedStatus = e.target.value;
                            if (updatedStatus === "custom") {
                              setEditingTask({
                                ...editingTask,
                                mainstatus: customStatus,
                              });
                            } else {
                              setEditingTask({
                                ...editingTask,
                                mainstatus: updatedStatus,
                              });
                              setCustomStatus("");
                            }
                          }}
                        >
                          {customStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                          <option value="custom">Custom</option>
                        </select>

                        {!customStatuses.includes(
                          editingTask.mainstatus || ""
                        ) && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Enter Custom Status"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-500"
                              value={editingTask.mainstatus || customStatus}
                              onChange={(e) => {
                                setCustomStatus(e.target.value);
                                setEditingTask({
                                  ...editingTask,
                                  mainstatus: e.target.value.trim(),
                                });
                              }}
                            />
                            <button
                              type="button"
                              onClick={addCustomStatus}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        )}

                        {customStatuses.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Custom Statuses:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {customStatuses.map((status) => (
                                <div
                                  key={status}
                                  className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md"
                                >
                                  <span className="text-sm">{status}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeCustomStatus(status)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-700"
                    >
                      Update Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
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
    </div>
  );
};

export default Director;
