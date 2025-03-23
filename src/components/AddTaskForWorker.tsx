"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  User,
  FileText,
  FileWarning,
  PieChart,
  Plus,
  Minus,
  Search,
  Calendar,
  Users,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Task {
  _id: string;
  name: string;
  task: string;
  detail: string;
  assigndate: string;
  duedate: string;
  workercount: number;
  priority: string;
  status: string;
}

interface Manager {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface WorkerInput {
  id: string;
  name: string;
}

const Addtaskforworker = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [taskData, setTaskData] = useState<Task>({
    _id: "",
    name: "",
    task: "",
    detail: "",
    assigndate: "",
    duedate: "",
    workercount: 1,
    priority: "",
    status: "",
  });

  // Changed to store worker objects with id and name
  const [workers, setWorkers] = useState<WorkerInput[]>([
    { id: "1", name: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const taskRef = useRef<HTMLInputElement>(null);
  const taskDetailRef = useRef<HTMLTextAreaElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);
  const priorityRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLInputElement>(null);
  const [managers, setManagers] = useState<Manager[]>([]);

  // Track active input index and search state
  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleManagerSelect = (manager: Manager, index: number) => {
    const updatedWorkers = [...workers];
    updatedWorkers[index] = { id: manager._id, name: manager.name };
    setWorkers(updatedWorkers);
    setShowSuggestions(false);
    setSearchTerm("");
  };

  useEffect(() => {
    fetchManagers();
  }, []);

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
        setManagers(response.data.data);
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
    if (id) {
      axios
        .post(`http://localhost:3535/getpertitask/${id}`)
        .then((response) => {
          const data = response.data.data;
          setTaskData(data);

          // Initialize workers array with empty objects based on workercount
          if (data.workercount && data.workercount > 0) {
            setWorkers(
              Array(data.workercount)
                .fill(null)
                .map((_, i) => ({
                  id: (i + 1).toString(),
                  name: "",
                }))
            );
          }
        })
        .catch(() => {
          toast.error("Failed to fetch task data.");
        });
    }
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWorkerInputChange = (value: string, index: number) => {
    const updatedWorkers = [...workers];
    updatedWorkers[index] = { ...updatedWorkers[index], name: value };
    setWorkers(updatedWorkers);
    setSearchTerm(value);
  };

  const addWorkerInput = () => {
    const newId = (workers.length + 1).toString();
    setWorkers([...workers, { id: newId, name: "" }]);
    setTaskData((prev) => ({
      ...prev,
      workercount: prev.workercount + 1,
    }));
    toast.success("Worker added successfully");
  };

  const removeWorkerInput = (index: number) => {
    if (workers.length > 1) {
      const updatedWorkers = [...workers];
      updatedWorkers.splice(index, 1);
      setWorkers(updatedWorkers);
      setTaskData((prev) => ({
        ...prev,
        workercount: prev.workercount - 1,
      }));
      toast.warn("Worker removed successfully");
    } else {
      toast.info("At least one worker is required");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Check if all workers have names
    if (workers.some((worker) => !worker.name.trim())) {
      toast.error("All worker fields must be filled");
      setIsLoading(false);
      return;
    }

    const obj = {
      taskid: id,
      name: usernameRef.current?.value,
      task: taskRef.current?.value,
      detail: taskDetailRef.current?.value,
      assigndate: new Date().toISOString().split("T")[0],
      duedate: dueDateRef.current?.value,
      workers: workers.map((worker) => worker.name), // Extract just the names for the API
      priority: priorityRef.current?.value,
      status: statusRef.current?.value,
    };

    const toastId = toast.loading("Adding task...");

    axios
      .post("http://localhost:3535/addtaskforworker", obj)
      .then((response) => {
        console.log(response);
        toast.update(toastId, {
          render: "Task added successfully",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        setTimeout(() => {
          navigate("/dashboard/teamlead");
        }, 2000);
      })
      .catch((error) => {
        setIsLoading(false);
        toast.update(toastId, {
          render:
            error.response?.data?.message ||
            "An error occurred while adding the task",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      });
  };

  const getPriorityColor = (priority: string) => {
    const lowerPriority = priority.toLowerCase();
    if (lowerPriority.includes("high"))
      return "bg-gray-200 text-gray-900 border-gray-300";
    if (lowerPriority.includes("medium"))
      return "bg-gray-200 text-gray-900 border-gray-300";
    if (lowerPriority.includes("low"))
      return "bg-gray-200 text-gray-900 border-gray-300";
    return "bg-gray-200 text-gray-900 border-gray-300";
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("complete") || lowerStatus.includes("done"))
      return "bg-gray-200 text-gray-900 border-gray-300";
    if (lowerStatus.includes("progress"))
      return "bg-gray-200 text-gray-900 border-gray-300";
    if (lowerStatus.includes("pending"))
      return "bg-gray-200 text-gray-900 border-gray-300";
    if (lowerStatus.includes("cancel"))
      return "bg-gray-200 text-gray-900 border-gray-300";
    return "bg-gray-200 text-gray-900 border-gray-300";
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-4 text-gray-600 hover:text-black"
            onClick={() => navigate("/dashboard/teamlead")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="bg-gray-100 rounded-t-xl">
              <CardTitle className="text-2xl font-bold text-black">
                Assign Task to Workers
              </CardTitle>
              <CardDescription className="text-gray-600">
                Create and assign tasks to team members with detailed
                instructions
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Task Assignor
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      value={taskData.name || ""}
                      onChange={handleInputChange}
                      className="pl-10 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                      required
                      ref={usernameRef}
                    />
                    <User className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task" className="text-sm font-medium">
                      Task Name
                    </Label>
                    <div className="relative">
                      <Input
                        id="task"
                        name="task"
                        value={taskData.task || ""}
                        onChange={handleInputChange}
                        className="pl-10 border-gray-300"
                        required
                        ref={taskRef}
                      />
                      <FileText className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-medium">
                      Task Priority
                    </Label>
                    <div className="relative">
                      <Input
                        id="priority"
                        name="priority"
                        value={taskData.priority || ""}
                        onChange={handleInputChange}
                        className="pl-10 border-gray-300"
                        required
                        ref={priorityRef}
                        placeholder="High, Medium, Low"
                      />
                      <FileWarning className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                    {taskData.priority && (
                      <Badge
                        className={`mt-1 ${getPriorityColor(
                          taskData.priority
                        )}`}
                      >
                        {taskData.priority}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">
                      Task Status
                    </Label>
                    <div className="relative">
                      <Input
                        id="status"
                        name="status"
                        value={taskData.status || ""}
                        onChange={handleInputChange}
                        className="pl-10 border-gray-300"
                        required
                        ref={statusRef}
                        placeholder="Pending, In Progress, etc."
                      />
                      <PieChart className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                    {taskData.status && (
                      <Badge
                        className={`mt-1 ${getStatusColor(taskData.status)}`}
                      >
                        {taskData.status}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detail" className="text-sm font-medium">
                    Task Detail
                  </Label>
                  <Textarea
                    id="detail"
                    name="detail"
                    value={taskData.detail || ""}
                    onChange={handleInputChange}
                    rows={4}
                    className="resize-none border-gray-300"
                    required
                    ref={taskDetailRef}
                    placeholder="Provide detailed instructions for this task..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duedate" className="text-sm font-medium">
                      Due Date
                    </Label>
                    <div className="relative">
                      <Input
                        id="duedate"
                        name="duedate"
                        type="date"
                        value={taskData.duedate || ""}
                        onChange={handleInputChange}
                        className="pl-10 border-gray-300"
                        required
                        ref={dueDateRef}
                      />
                      <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-500" />
                        <Label className="text-sm font-medium">
                          Assign Workers
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addWorkerInput}
                        className="flex items-center gap-1 text-black border-gray-300 hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" /> Add Worker
                      </Button>
                    </div>

                    <div className="border border-gray-200 rounded-md p-3 space-y-3 bg-gray-50">
                      {workers.map((worker, index) => (
                        <div
                          key={worker.id}
                          className="flex items-center gap-2"
                        >
                          <div className="bg-gray-200 h-7 w-7 rounded-full flex items-center justify-center text-gray-700 text-xs font-medium">
                            {index + 1}
                          </div>
                          <div className="relative flex-1">
                            <Input
                              placeholder={`Worker ${index + 1} name`}
                              value={worker.name}
                              onChange={(e) => {
                                handleWorkerInputChange(e.target.value, index);
                                setActiveInputIndex(index);
                                setShowSuggestions(true);
                              }}
                              onFocus={() => {
                                setActiveInputIndex(index);
                                setSearchTerm(worker.name);
                                setShowSuggestions(true);
                              }}
                              onBlur={() => {
                                // Delay hiding suggestions to allow for clicks
                                setTimeout(() => {
                                  setShowSuggestions(false);
                                }, 200);
                              }}
                              required
                              className="border-gray-300 flex-1"
                            />
                            <Search
                              size={16}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />

                            {/* Only show suggestions for the active input */}
                            {showSuggestions &&
                              activeInputIndex === index &&
                              searchTerm && (
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
                                          onClick={() =>
                                            handleManagerSelect(manager, index)
                                          }
                                        >
                                          <div className="font-medium">
                                            {manager.name}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {manager.email} • {manager.role}
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
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeWorkerInput(index)}
                            className="flex-shrink-0 h-9 w-9 border-gray-300 hover:bg-gray-200 hover:text-black"
                            aria-label="Remove worker"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard/teamlead")}
                    className="border-gray-300 text-black hover:bg-gray-100 hover:text-black"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-black hover:bg-gray-800 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Assigning..." : "Assign Task"}
                  </Button>
                </div>
              </form>
            </CardContent>

            <CardFooter className="bg-gray-50 p-4 text-center text-sm text-gray-500 rounded-b-xl border-t border-gray-200">
              All tasks will be visible to assigned workers after submission
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Addtaskforworker;
