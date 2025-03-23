"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { MessageSquare, AlertCircle, Search, Check } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface LoginProps {
  onLogin: (workerName: string, taskName: string, role: string) => void;
}

interface TaskSuggestion {
  id: string;
  task: string;
  name?: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [taskName, setTaskName] = useState<string>("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    TaskSuggestion[]
  >([]);
  const [userRole, setUserRole] = useState<string>("User");
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [inputValue, setInputValue] = useState("");
  const router = useNavigate();

  useEffect(() => {
    // Client-side only code
    if (typeof window !== "undefined") {
      const roleFromStorage = localStorage.getItem("role") ?? "";
      const nameFromStorage = localStorage.getItem("nameofuser") ?? "";
      const isLoggedIn = localStorage.getItem("loginnn") ?? "";

      if (isLoggedIn !== "done") {
        toast.error("You must be logged in to access this feature");
        setTimeout(() => router("/signin"), 2000);
        return;
      }

      setUserRole(roleFromStorage.trim() || "User");
      setUserName(nameFromStorage.trim());

      if (!nameFromStorage.trim()) {
        toast.error("Username not found in session");
        setTimeout(() => router("/signin"), 2000);
      }
    }
  }, [router]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3535/taskforworkerdetail"
        );
        const tasks = response.data?.data || [];
        setSuggestions(tasks);
        setFilteredSuggestions(tasks); // Show all suggestions initially
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        toast.error("Failed to fetch task suggestions");
      }
    };

    fetchSuggestions();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setTaskName(value);

    // If input is empty, show all suggestions
    if (value.trim() === "") {
      setFilteredSuggestions(suggestions);
    } else {
      // Filter suggestions based on input
      const filtered = suggestions.filter(
        (task: TaskSuggestion) =>
          (task.task?.toLowerCase() || "").includes(value.toLowerCase()) ||
          (task.name?.toLowerCase() || "").includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }

    setShowSuggestions(true);
  };

  const handleSelect = (task: TaskSuggestion) => {
    if (task) {
      setInputValue(task.task);
      setShowSuggestions(false);
      setTaskName(task.task); // Pass selected task to parent component
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!userName.trim()) {
      toast.error("User not logged in. Please log in first.");
      setIsLoading(false);
      return;
    }

    if (!taskName.trim()) {
      toast.error("Please enter a task name to join the chat.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:3535/api/get-task/${encodeURIComponent(
          taskName.trim()
        )}`
      );
      const taskData = response.data?.task;

      if (taskData) {
        onLogin(userName.trim(), taskName.trim(), userRole.trim());
      } else {
        toast.error("Task not found.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error?.response?.status === 404) {
        toast.error("Task not found. Please check the task name.");
      } else {
        toast.error("Error joining task chat. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    // Arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    }
    // Arrow up
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    }
    // Enter
    else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredSuggestions[selectedIndex]);
    }
    // Escape
    else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const isDirector = userRole.includes("Director");

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-black">
          <div className="flex items-center justify-center mb-6">
            <MessageSquare className="w-12 h-12 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-center text-black mb-4">
            Task Chat Login
          </h2>

          <div className="flex flex-col items-center justify-center mb-6">
            <p className="text-sm text-black text-center">
              Logged in as{" "}
              <span className="font-semibold">
                {userName || "Unknown User"}
              </span>
            </p>
            <p className="text-sm text-black text-center">
              Role: <span className="font-semibold">{userRole || "User"}</span>
            </p>
            {isDirector && (
              <div className="mt-2 p-2 bg-gray-100 border border-gray-300 rounded-md flex items-center">
                <AlertCircle className="w-4 h-4 text-black mr-2" />
                <p className="text-xs text-black">
                  As Director, you can access all task chats
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative">
            <div>
              <label
                htmlFor="taskName"
                className="block text-sm font-medium text-black mb-1"
              >
                Task Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="taskName"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 150);
                  }}
                  className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-black"
                  placeholder="Enter task name"
                  required
                />
                <Search className="absolute right-3 top-3 w-5 h-5 text-black" />

                {showSuggestions && (
                  <ul className="absolute z-10 bg-white border border-black w-full mt-1 rounded-lg max-h-40 overflow-y-auto shadow-lg">
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((task, index) => (
                        <li
                          key={task.id || index}
                          onClick={() => handleSelect(task)}
                          className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center justify-between ${
                            selectedIndex === index ? "bg-gray-100" : ""
                          }`}
                        >
                          <span>{task.task}</span>
                          {selectedIndex === index && (
                            <Check className="w-4 h-4 text-black" />
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-sm text-gray-500">
                        No matching tasks found.
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Joining...
                </>
              ) : (
                "Join Task Chat"
              )}
            </button>
          </form>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar
        theme="light"
        toastClassName="border border-black"
      />
    </>
  );
};
