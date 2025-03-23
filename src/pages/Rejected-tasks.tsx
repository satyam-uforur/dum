"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RejectedTask {
  _id: string;
  task: string;
  name: string;
  duedate: string;
  priority: "low" | "medium" | "High";
  declinedate: string;
  manageraction: string;
  managerdeclinemsg: string;
  taskassigner: string;
  managerSuggestion?: string;
  role?: string;
}

export default function RejectedTasks() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [taskData, setTaskData] = useState<RejectedTask[]>([]);
  const [managerName, setManagerName] = useState("");
  const [open, setOpen] = useState(false);
  const [managerSuggestion, setManagerSuggestion] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [managers, setManagers] = useState<
    { _id: string; name: string; role: string }[]
  >([]);

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  useEffect(() => {
    axios
      .get("http://localhost:3535/taskalldetail")
      .then((response) => {
        setTaskData(response.data.data);
        console.log(response.data.data);
      })
      .catch(() => toast("Failed to fetch task data."));

    // Fetch managers for suggestions
    axios
      .get("http://localhost:3535/manageralldetail")
      .then((response) => {
        setManagers(response.data.data);
      })
      .catch(() => toast("Failed to fetch managers."));
  }, []);

  const redeclareTask = async (taskId: string) => {
    try {
      // Print the data before sending
      console.log("👉 Redeclare Task Data:", {
        taskId,
        managerName,
        managerSuggestion,
      });

      // Send the request to the backend with manager name and suggestion
      const response = await axios.patch(
        `http://localhost:3535/redeclaretask/${taskId}`,
        {
          managerName,
          managerSuggestion,
        }
      );

      console.log("✅ Task Redeclared:", response.data);
      toast.success("Task has been redeclared.");
      setTimeout(() => window.location.reload(), 1000);
      setOpen(false); // Close the dialog
      setManagerSuggestion(""); // Reset suggestion
    } catch (error) {
      console.error("❌ Redeclare Task Error:", error);
      toast.error("Failed to redeclare task.");
    }
  };

  const openRedeclareDialog = (taskId: string) => {
    setSelectedTaskId(taskId);
    setOpen(true);
  };

  return (
    <div className="space-y-6 p-8">
      <ToastContainer />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Rejected Tasks Review</h2>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]"></TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Rejected Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taskData
              .filter(
                (task) =>
                  localStorage.getItem("role") === "Director" ||
                  task.taskassigner === localStorage.getItem("nameofuser")
              )
              .filter((task) => task.manageraction === "declined")
              .map((task) => (
                <Collapsible key={task._id} asChild>
                  <>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell>
                        <CollapsibleTrigger
                          onClick={() => toggleItem(task._id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {openItems.has(task._id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell className="font-medium">{task.task}</TableCell>
                      <TableCell>{task.name}</TableCell>
                      <TableCell>{task.duedate}</TableCell>
                      <TableCell>
                        <span
                          className={`
                              inline-flex px-2 py-1 rounded-full text-xs font-medium
                              ${
                                task.priority === "High"
                                  ? "bg-red-100 text-red-800"
                                  : ""
                              }
                              ${
                                task.priority === "medium"
                                  ? "bg-orange-100 text-orange-800"
                                  : ""
                              }
                              ${
                                task.priority === "low"
                                  ? "bg-green-100 text-green-800"
                                  : ""
                              }
                        `}
                        >
                          {task.priority}
                        </span>
                      </TableCell>
                      <TableCell>{task.declinedate}</TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={6} className="bg-gray-50">
                          <div className="p-4 space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">
                                Rejection Reason:
                              </h4>
                              <p className="text-gray-600">
                                {task.managerdeclinemsg}
                              </p>
                            </div>

                            {task.managerSuggestion && (
                              <div>
                                <h4 className="font-medium mb-2">
                                  Manager Suggestion:
                                </h4>
                                <p className="text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-100">
                                  {task.managerSuggestion}
                                </p>
                              </div>
                            )}

                            <div className="flex justify-end">
                              <Button
                                onClick={() => openRedeclareDialog(task._id)}
                              >
                                Redeclare Task
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog to input Manager Name and Suggestion */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Redeclare Task</DialogTitle>
          </DialogHeader>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedTaskId && redeclareTask(selectedTaskId)}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
