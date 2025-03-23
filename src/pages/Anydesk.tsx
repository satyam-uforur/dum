"use client";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    manageraction: string    
    status: string
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

const Anydesk = () => {
  const [managerName, setManagerName] = useState(
    localStorage.getItem("managerName") || ""
    );
  const [ViewselectedTask, setViewSelectedTask] = useState<any>(null);
  const [isNameSet, setIsNameSet] = useState(false);
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleSetUsername = () => {
    if (managerName) {
    const selectedManager = managers.find((m) => m.name === managerName);
        if (selectedManager) {
            localStorage.setItem("managerName", managerName);
            localStorage.setItem("managerRole", selectedManager.role);
            setIsNameSet(true);
        }
    } else {
    toast.error("Please select a manager");
    }
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
        toast.error("An unexpected error occurred while fetching managers");  
        setManagers([]);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  useEffect(() => {
    if (isNameSet) {
      fetchTasks();
    }
  }, [isNameSet]);

  const fetchTasks = () => {
    axios
      .get("http://localhost:3535/taskalldetail")
      .then((response) => {
        setTaskData(response.data.data);
        console.log(response.data.data);
      })
      .catch(() => toast.error("Failed to fetch task data."));
  };

  if (!isNameSet) {
    return (
      <div className="flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Welcome</h1>
                <p className="mt-2 text-gray-600">
                Please enter your name to continue
                </p>
            </div>
            <div className="space-y-4 py-2">
                <div className="space-y-2">
                <label className="text-sm font-medium">Select Manager</label>
                <Select value={managerName} onValueChange={setManagerName}>
                    <SelectTrigger>
                    <SelectValue placeholder="Select a manager" />
                    </SelectTrigger>
                    <SelectContent>
                    {managers.map((manager) => (
                        <SelectItem key={manager._id} value={manager.name}>
                        {`${manager.name} (${manager.role})`}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
            </div>
            <Button onClick={handleSetUsername} className="w-full">
              Continue
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer />
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-2">Welcome, {managerName}</h1>
        <p className="text-gray-600 mb-6">Manage Others tasks</p>

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
              {taskData.length > 0 &&
              localStorage.getItem("managerRole") === "Teamlead" ? (
                taskData
                  .filter((task) => task.name === managerName)
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
              {taskData.length > 0 &&
              localStorage.getItem("managerRole") === "Associate" ? (
                taskData.map((task) =>
                  task.taskforworker_details
                    .filter((detail) =>
                      detail.workers.includes(
                        managerName ? managerName : localStorage.getItem("managerName")
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
              ) : null}
              {taskData.length > 0 && localStorage.getItem("managerRole") === "Associate" ? (
                taskData
                  .filter(
                    (task) => task.name === managerName
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
                              onSelect={() => setViewSelectedTask(task)}
                            >
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

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
                status={selectedTask?.status || selectedTask?.mainstatus || ""}
              />
            </div>
            <div>
              <strong>Description:</strong> {selectedTask?.detail}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {selectedTask && (
        <Dialog
          open={!!selectedTask}
          onOpenChange={() => setSelectedTask(null)}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
              <DialogDescription>
                View detailed information about this task
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <h3 className="font-medium text-gray-900">Task Name</h3>
                <p className="mt-1">{selectedTask.task}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Description</h3>
                <p className="mt-1">
                  {selectedTask.detail || "No description provided"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Assigned To</h3>
                  <p className="mt-1">{selectedTask.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Assigned By</h3>
                  <p className="mt-1">{selectedTask.taskassigner}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Due Date</h3>
                  <p className="mt-1">{selectedTask.duedate}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Assigned Date</h3>
                  <p className="mt-1">{selectedTask.assigndate}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Priority</h3>
                  <div className="mt-1">
                    <PriorityBadge priority={selectedTask.priority} />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Status</h3>
                  <div className="mt-1">
                    <StatusBadge status={selectedTask.mainstatus} />
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Anydesk;
