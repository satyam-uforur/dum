import React from "react";
import { Message } from "../../../types";
import { getCurrentTime } from "../../../utils/time";

interface ChatMessageProps {
  message: Message;
  isUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isUser,
}) => {
  const messageTime =
    message.time ||
    (message.timestamp
      ? new Date(message.timestamp).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : getCurrentTime());

  return (
    <div
      className={`message ${
        isUser ? "flex flex-col items-end" : "flex flex-col items-start"
      }`}
    >
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 mb-1 ${
          isUser ? "bg-gray-100 text-gray-800" : "bg-purple-600 text-white"
        }`}
      >
        <strong>{message.from}:</strong> {message.content}
      </div>
      <span className="text-xs text-gray-500">{messageTime}</span>
    </div>
  );
};

export default ChatMessage;