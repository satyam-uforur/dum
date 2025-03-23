"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
}

export default function ScrollingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:3535/taskalldetail");
        if (!response.ok) {
          throw new Error("Failed to fetch task data");
        }

        const data = await response.json();
        const allTasks = data.data;
        const loggedInUser = localStorage.getItem("role");

        if (loggedInUser === "Director") {
          setTaskData(allTasks); // Set all data when owner11 logs in
        }

        setError(null);
      } catch (err) {
        setError("Failed to fetch task data. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("default", {
      month: "long",
      year: "numeric",
    });
  };

  const formatTaskDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("default", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Get events for a specific date
  const getEventsForDate = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    // Format to 'YYYY-MM-DD'
    const dateString = date.toISOString().split("T")[0];

    // Filter events where the duedate matches the current day
    return taskData.filter((event) => event.duedate === dateString);
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  // Get all upcoming tasks sorted by due date
  const upcomingTasks = [...taskData]
    .filter((task) => {
      const dueDate = new Date(task.duedate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate >= today;
    })
    .sort(
      (a, b) => new Date(a.duedate).getTime() - new Date(b.duedate).getTime()
    );

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {formatDate(currentDate)}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleTodayClick}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">{error}</div>
          ) : (
            <>
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-muted-foreground"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2" ref={scrollRef}>
                {/* Empty days */}
                {emptyDays.map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}

                {/* Actual days */}
                {daysArray.map((day) => {
                  const dayEvents = getEventsForDate(day+1);
                  const isToday =
                    new Date().toDateString() ===
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      day
                    ).toDateString();

                  return (
                    <div
                      key={day}
                      className={`aspect-square p-1 rounded-lg border ${
                        isToday
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      } transition-colors`}
                    >
                      <div className="h-full flex flex-col">
                        <div
                          className={`text-sm font-medium ${
                            isToday ? "text-primary" : "text-foreground"
                          } mb-1`}
                        >
                          {day}
                        </div>
                        <ScrollArea className="flex-1">
                          <div className="space-y-1 pr-1">
                            {dayEvents.map((event) => (
                              <div
                                key={event._id}
                                className={`text-xs p-1 rounded truncate ${getPriorityColor(
                                  event.priority
                                )}`}
                                title={event.task}
                              >
                                {event.task}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Upcoming Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {upcomingTasks.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No upcoming tasks
                </div>
              ) : (
                upcomingTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="overflow-hidden">
                      <h4 className="font-medium text-foreground truncate">
                        {task.task}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatTaskDate(task.duedate)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={getPriorityColor(task.priority)}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
