import React, { useState, useRef, useEffect } from "react";
import { Send, Search, PlusCircle, MessageCircle } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import type { Message, Task } from "../types";
import { Login } from "./chat/task/Login";
import { TaskChatRoom } from "./chat/task/TaskChatRoom";

type Section = "general" | "task" | "groups";

function Discussion() {
  const [activeSection, setActiveSection] = useState<Section>("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem("nameofuser") || " ");
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [userRole, setUserRole] = useState<string>("User");

  useEffect(() => {
    const storedUsername = localStorage.getItem("nameofuser");
    const storedRole = localStorage.getItem("role");
    if (storedUsername) setUsername(storedUsername);
    if (storedRole) setUserRole(storedRole);
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setCurrentTask(null);
  };

  useEffect(() => {
    if (activeSection === "general") {
      socketRef.current = io("http://localhost:3000", {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      const socket = socketRef.current;

      socket.on("connect", () => {
        setIsConnected(true);
        socket.emit("join", localStorage.getItem("nameofuser"));
      });

      socket.on("disconnect", () => setIsConnected(false));

      socket.on("chatHistory", (history: Message[]) => {
        const sortedHistory = history.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setMessages(sortedHistory);
      });

      socket.on("message", (message: Message) => {
        setMessages((prev) => [
          ...prev,
          { ...message, timestamp: message.timestamp || new Date() },
        ]);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [activeSection]);

  const handleLogin = async (
    workerName: string,
    taskName: string,
    role: string
  ) => {
    try {
      const safeRole = role && role.trim() !== "" ? role : "User";

      if (safeRole.includes("Director")) {
        try {
          const res = await fetch(
            `http://localhost:4000/api/get-task/${encodeURIComponent(taskName)}`
          );
          if (!res.ok)
            throw new Error(
              `Server error (${res.status}): ${await res.text()}`
            );
          const data = await res.json();

          if (data.task) {
            setUsername(workerName);
            setCurrentTask(data.task);
            setIsLoggedIn(true);
          } else {
            alert("Task not found. Please check the task name and try again.");
          }
        } catch (error) {
          console.error("Error fetching task:", error);
          alert("Failed to fetch task. Please try again.");
        }
      } else {
        const response = await fetch(
          "http://localhost:4000/api/validate-task-access",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workerName, taskName, role: safeRole }),
          }
        );

        if (!response.ok)
          throw new Error(
            `Server error (${response.status}): ${await response.text()}`
          );
        const data = await response.json();

        if (data.valid) {
          setUsername(workerName);
          setCurrentTask(data.task);
          setIsLoggedIn(true);
        } else {
          alert("You do not have access to this task chat.");
        }
      }
    } catch (error) {
      console.error("Error validating access:", error);
      alert("Failed to validate access. Please try again.");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socketRef.current && isConnected) {
      const messageData = {
        from: localStorage.getItem("nameofuser"),
        content: newMessage.trim(),
        timestamp: new Date(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      socketRef.current.emit("message", messageData);
      setNewMessage("");
    }
  };

  const lastTwoMessages = [...messages].reverse().slice(0, 2);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        {/* User Profile */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {username || "Guest"}
              </h3>
              <p className="text-sm text-gray-500">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search discussions"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20 transition-all"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex space-x-2 px-4 mb-4">
          <button
            onClick={() => setActiveSection("general")}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all ${
              activeSection === "general"
                ? "bg-black text-white shadow-lg shadow-black/20"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveSection("task")}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all ${
              activeSection === "task"
                ? "bg-black text-white shadow-lg shadow-black/20"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Task
          </button>
        </nav>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {lastTwoMessages.map((message, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl transition-all ${
                  index === 0 ? "bg-gray-50 shadow-sm" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {message.from?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">
                      {message.from}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{message.time}</span>
                </div>
                <p className="text-gray-600 line-clamp-2">{message.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Director Role Indicator */}
        {userRole &&
          userRole.includes("Director") &&
          activeSection === "task" && (
            <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <p className="text-sm text-blue-700">Director Access Enabled</p>
              </div>
            </div>
          )}

        {/* New Discussion Button */}
        <div className="p-4 border-t border-gray-100">
          <button className="w-full bg-black text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-900 transition-all shadow-lg shadow-black/20">
            <PlusCircle className="h-5 w-5" />
            <span className="font-medium">New Discussion</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white shadow-xl rounded-l-3xl">
        {activeSection === "general" ? (
          <>
            {/* Header */}
            <header className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-6 w-6 text-gray-400" />
                <h1 className="text-xl font-semibold text-gray-900">
                  General Discussion
                </h1>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-sm text-gray-500">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    message.from === username ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {message.from}
                    </span>
                    <span className="text-sm text-gray-500">
                      {message.time}
                    </span>
                  </div>
                  <div
                    className={`max-w-xl rounded-2xl px-6 py-4 ${
                      message.from === username
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 p-6">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20 transition-all"
                />
                <button
                  type="submit"
                  className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-900 transition-all flex items-center space-x-2 shadow-lg shadow-black/20"
                  disabled={!isConnected}
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : activeSection === "task" ? (
          <>
            {!isLoggedIn ? (
              <Login onLogin={handleLogin} />
            ) : (
              currentTask && (
                <TaskChatRoom
                  task={currentTask}
                  username={username}
                  onLogout={handleLogout}
                />
              )
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a message in {activeSection}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Discussion;
