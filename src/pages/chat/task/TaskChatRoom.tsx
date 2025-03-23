import React, { useEffect, useRef, useState } from "react";
import { Message, Task } from "../../../types";
import { Paperclip, Send, LogOut, AlertCircle, Download } from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { ChatMessage } from "./ChatMessage";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";

interface TaskChatRoomProps {
  task: Task;
  username: string;
  onLogout: () => void;
}

export const TaskChatRoom: React.FC<TaskChatRoomProps> = ({
  task,
  username,
  onLogout,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket>();
  const userRole = localStorage.getItem("role") || "User";
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const downloadChatAsPDF = () => {
    const pdf = new jsPDF();

    // Add title
    pdf.setFontSize(20);
    pdf.text(`Chat History - ${task.name}`, 20, 20);

    // Add timestamp
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

    // Reset font size for messages
    pdf.setFontSize(12);
    let yPosition = 40;

    messages.forEach((msg) => {
      // Add sender name
      pdf.setFont("helvetica", "bold");
      const sender = `${msg.from}:`;
      pdf.text(sender, 20, yPosition);

      // Add message content
      pdf.setFont("helvetica", "normal");
      const content = msg.content;
      const lines = pdf.splitTextToSize(content, 170);

      // Check if we need a new page
      if (yPosition + 10 * lines.length > pdf.internal.pageSize.height - 20) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.text(lines, 20, yPosition + 5);

      // Add timestamp
      pdf.setFontSize(8);
      pdf.text(msg.time || "", 170, yPosition, { align: "right" });
      pdf.setFontSize(12);

      // Update position for next message
      yPosition += 10 * lines.length + 15;

      // Add file attachment info if present
      if (msg.fileName) {
        pdf.setFont("helvetica", "italic");
        pdf.text(`Attachment: ${msg.fileName}`, 30, yPosition);
        yPosition += 10;
      }
    });

    pdf.save(
      `chat-history-${task.name}-${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  useEffect(() => {
    // Connect to socket server with role information
    socketRef.current = io("http://localhost:3535", {
      query: {
        role: userRole,
      },
    });
    const socket = socketRef.current;

    // Join task room with proper username
    const storedUsername = localStorage.getItem("nameofuser");
    const usernameToUse = storedUsername || username;

    if (!task.task) {
      console.error("Task name is undefined:", task);
      toast.error("Invalid task data. Please try again.");
      onLogout();
      return;
    }

    socket.emit("joinTaskRoom", task.task, usernameToUse);
    console.log(`Joined task room: ${task.task} as ${usernameToUse}`);

    // Set up event listeners
    socket.on("taskChatHistory", (history: Message[]) => {
      console.log("Received chat history:", history.length, "messages");
      setMessages(history);
    });

    socket.on("taskMessage", (message: Message) => {
      console.log("New message received:", message);
      setMessages((prev) => [...prev, message]);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      toast.error("Connection error. Please try again later.");
    });

    // Cleanup function
    return () => {
      console.log("Disconnecting socket");
      socket.disconnect();
    };
  }, [task.task, username, onLogout, userRole]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && socketRef.current) {
      const usernameToUse = localStorage.getItem("nameofuser") || username;

      const messageData = {
        taskName: task.task,
        from: usernameToUse,
        content: inputMessage.trim(),
        time: new Date().toLocaleTimeString(),
      };

      try {
        socketRef.current.emit("taskMessage", messageData);
        setInputMessage("");
        setShowEmojiPicker(false);
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message. Please try again.");
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !socketRef.current) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:3535/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { fileUrl } = await response.json();
        const usernameToUse = localStorage.getItem("nameofuser") || username;

        const messageData = {
          taskName: task.task,
          from: usernameToUse,
          content: `Shared a file: ${file.name}`,
          fileUrl,
          fileName: file.name,
          time: new Date().toLocaleTimeString(),
        };

        socketRef.current.emit("taskMessage", messageData);
        toast.success("File uploaded successfully");
      } else {
        const errorData = await response.json();
        console.error("Upload error:", errorData);
        toast.error("Failed to upload file. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const onEmojiSelect = (emoji: any) => {
    setInputMessage((prev) => prev + emoji.native);
  };

  // Safely handle logout
  const handleLogout = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    onLogout();
  };

  const isDirector = userRole.includes("Director");

  return (
    <div className="h-screen flex flex-col bg-white shadow-xl">
      {/* Header */}
      <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">{task.task || "Unknown Task"}</h2>
          <span className="text-sm bg-gray-500/20 px-2 py-1 rounded">
            Task Chat
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadChatAsPDF}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download size={16} />
            <span className="text-sm">Download Chat</span>
          </button>
          {isDirector && (
            <div className="flex items-center mr-4 text-xs bg-blue-500 rounded px-2 py-1">
              <AlertCircle size={12} className="mr-1" />
              Director Access
            </div>
          )}
          <button
            onClick={handleLogout}
            className="text-white hover:bg-black rounded-full p-2 flex items-center gap-1"
          >
            <LogOut size={20} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg}
              isUser={
                msg.from === username ||
                msg.from === localStorage.getItem("nameofuser")
              }
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4 relative">
        <form onSubmit={sendMessage} className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-black disabled:opacity-50"
            disabled={isUploading}
          >
            <Paperclip size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-black"
          >
            😊
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
          />
          <button
            type="submit"
            className="p-2 text-gray-500 hover:text-black rounded-lg transition-colors disabled:opacity-50"
            disabled={!inputMessage.trim() || isUploading}
          >
            <Send size={20} />
          </button>
        </form>
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 z-10">
            <Picker data={data} onEmojiSelect={onEmojiSelect} />
          </div>
        )}
      </div>
    </div>
  );
};
