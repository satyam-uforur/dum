"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

const Viewtask = () => {
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [declineReason, setDeclineReason] = useState("");
  const [declineId, setDeclineId] = useState("");
  const [open, setOpen] = useState(false);

  const acceptManagerTask = async (e: any) => {
    const id = e.currentTarget.getAttribute("data-id");
    const actions = e.currentTarget.getAttribute("data-actions");
    const nameofworker = localStorage.getItem("nameofuser");

    console.log("👉 Sending Request:", { id, nameofworker, actions });

    if (!nameofworker) {
      toast.error("User is not logged in.");
      return;
    }

    if (!id) {
      toast.error("Task ID is missing.");
      return;
    }

    if (!actions) {
      toast.error("Actions attribute is missing.");
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:3535/updatetaskmanageraction/${id}`,
        {
          nameofworker,
          actions,
        }
      );

      console.log("✅ Server Response:", response.data);
      toast.success("Task status updated successfully.");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error("❌ Error:", error.response?.data || error.message);
      toast.error("Failed to update task status.");
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

  const handleDeclineSubmit = async () => {
    const id = declineId;
    const msg = declineReason;
    const actions = "declined";
    const date = new Date().toISOString().split("T")[0]
    const nameofworker = localStorage.getItem("nameofuser");
    console.log("👉 Sending Request:", { id, nameofworker, msg, actions, date });

    if (!nameofworker) {
      toast.error("User is not logged in.");
      return;
    }

    if (!id) {
      toast.error("Task ID is missing.");
      return;
    }

    if (!msg) {
      toast.error("Decline reason is missing.");
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:3535/updatetaskmsg/${id}`,
        {
          nameofworker,
          msg,
          actions,
          date
        }
      );

      console.log("✅ Server Response:", response.data);
      toast.success("Task status updated successfully.");
      setOpen(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error("❌ Error:", error.response?.data || error.message);
      toast.error("Failed to update task status.");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="space-y-6">
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
                  taskData
                    .filter(
                      (task) => task.name === localStorage.getItem("nameofuser")
                    )
                    .filter((task) => task.manageraction === "initiated")
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
                          <StatusBadge status={task.mainstatus} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                              <Button
                                onClick={acceptManagerTask}
                                task-name={task.task}
                                data-id={task._id || ""}
                                data-actions="accepted"
                                variant="outline"
                                size="sm"
                              >
                                Accept
                              </Button>
                            <Dialog open={open} onOpenChange={setOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  task-name={task.task}
                                  onClick={() => {
                                    setDeclineId(task._id);
                                    setOpen(true);
                                  }}
                                  data-action="declined"
                                  variant="outline"
                                  size="sm"
                                >
                                  Decline
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Decline Task</DialogTitle>
                                  <DialogDescription>
                                    Please provide a reason for declining this
                                    task.
                                  </DialogDescription>
                                </DialogHeader>
                                <Textarea
                                  value={declineReason}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLTextAreaElement>
                                  ) => setDeclineReason(e.target.value)}
                                  placeholder="Enter reason for declining..."
                                />
                                <DialogFooter>
                                  <Button
                                    type="submit"
                                    onClick={handleDeclineSubmit}
                                  >
                                    Submit
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
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
      </div>
    </>
  );
};

export default Viewtask;