"use client";
import React from "react";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { Send, Paperclip, Wifi, WifiOff, Download, X } from "lucide-react";
import { jsPDF } from "jspdf";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { Message, ChatProps } from "@/types";

export function ChatBox({ username }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const socketRef = useRef<Socket>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3535", {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      const socket = socketRef.current;

      socket.on("connect", () => {
        setIsConnected(true);
        setIsReconnecting(false);
        socket.emit("join", username);
      });

      socket.on("disconnect", () => setIsConnected(false));
      socket.on("reconnecting", () => setIsReconnecting(true));
      socket.on("reconnect_failed", () => {
        setIsReconnecting(false);
        alert("Failed to reconnect. Please refresh the page.");
      });

      socket.off("chatHistory").on("chatHistory", (history: Message[]) => {
        const sortedHistory = history.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setMessages(sortedHistory);
      });

      // ✅ SAFE handler to avoid multiple listeners
      socket.off("message").on("message", (message: Message) => {
        setMessages((prev) => [
          ...prev,
          {
            ...message,
            timestamp: message.timestamp || new Date(),
          },
        ]);
      });
    }

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = undefined;
    };
  }, [username]);

  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socketRef.current && isConnected && !isSending) {
      setIsSending(true);
      const messageData = {
        from: username,
        content: newMessage.trim(),
        timestamp: new Date(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      socketRef.current.emit("message", messageData);
      setNewMessage("");
      setTimeout(() => setIsSending(false), 500); // prevent rapid re-send
    }
  };

  const downloadChat = () => {
    const format = window
      .prompt("Enter format: 'txt' for TXT or 'pdf' for PDF")
      ?.toLowerCase();
    const chatContent = messages
      .map(
        (msg) =>
          `${msg.from}: ${msg.content} - ${
            msg.time || new Date(msg.timestamp).toLocaleTimeString()
          }`
      )
      .join("\n");

    if (format === "txt") {
      const blob = new Blob([chatContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "chat.txt";
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "pdf") {
      const doc = new jsPDF();
      doc.text(chatContent, 10, 10);
      doc.save("chat.pdf");
    }
  };

  return (
    <div className="fixed h-[500px] bottom-5 right-5 z-50">
      <Card
        className={`w-[400px] shadow-lg transition-all ${
          isMinimized ? "hidden" : "block"
        }`}
      >
        <CardHeader className="bg-primary text-primary-foreground p-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Chat</h3>
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-300" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-300" />
              )}
              <span
                className={`text-xs px-2 py-1 rounded ${
                  isConnected ? "bg-green-500/20" : "bg-red-500/20"
                }`}
              >
                {isReconnecting
                  ? "Reconnecting..."
                  : isConnected
                  ? "Connected"
                  : "Disconnected"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={downloadChat}
              className="text-primary-foreground hover:text-primary-foreground/90"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(true)}
              className="text-primary-foreground hover:text-primary-foreground/90"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-[400px] overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={message._id || index}
              message={message}
              isUser={message.from === username}
            />
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              disabled={!isConnected}
              className="flex-1"
            />
            <Button type="submit" disabled={!isConnected} className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>

      {isMinimized && (
        <Button
          className="fixed bottom-5 right-5"
          onClick={() => setIsMinimized(false)}
        >
          Open Chat
        </Button>
      )}
    </div>
  );
}
