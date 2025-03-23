"use client";

import { useEffect, useState } from "react";
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
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  actions: string;
  manageraction?: string;
}

export default function RejectedWorkerTask() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [managerName, setManagerName] = useState("");
  const [open, setOpen] = useState(false);

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
  }, []);

  const redeclareTask = async (taskId: string) => {
    try {
      const workerName = managerName.trim();
      
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
      setOpen(false); // Close the dialog
    } catch (error: any) {
      console.error(
        "❌ Redeclare Task Error:",
        error.response?.data || error.message
      );
      toast.error("Failed to redeclare task.");
    }
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
              <TableHead>Worker Name</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Rejected Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taskData
              .map((task) =>
                    task.taskforworker_details
              .filter((detail) =>
                detail.name.includes(localStorage.getItem("nameofuser"))
              )
              .filter(
                (detail) =>
                  detail.actionStatuses.some(
                    (action: any) => action.actions === "declined"
                  ) &&
                  detail.actionStatuses.some(
                    (action: any) => action.actions !== ""
                  )
              )
              .map((task) =>
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
                        <TableCell className="font-medium">
                          {task.task}
                        </TableCell>
                        <TableCell>{task.workers}</TableCell>
                        <TableCell>{task.duedate}</TableCell>
                        <TableCell>
                          <span
                            className={`
                              inline-flex px-2 py-1 rounded-full text-xs font-medium
                              ${
                                task.priority === "high"
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
                        <TableCell>{task.actionStatuses?.[0]?.date}</TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <TableRow>
                          <TableCell colSpan={6} className="bg-gray-50">
                            <div className="p-4">
                              <h4 className="font-medium mb-2">
                                Rejection Reason:
                              </h4>
                              <p className="text-gray-600">
                                {task.actionStatuses?.[0]?.msg}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell colSpan={6} className="bg-gray-50">
                            <div className="p-4">
                              {/* Dialog to input Manager Name */}
                              <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                  <Button onClick={() => setOpen(true)}>
                                    Redeclare Task
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>Redeclare Task</DialogTitle>
                                  </DialogHeader>
                                  <Input
                                    value={managerName}
                                    onChange={(e) =>
                                      setManagerName(e.target.value)
                                    }
                                    placeholder="Enter Worker Name"
                                  />
                                  <DialogFooter>
                                    <Button
                                      onClick={() => redeclareTask(task._id)}
                                    >
                                      Submit
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => setOpen(false)}
                                    >
                                      Cancel
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                ))
              }
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
