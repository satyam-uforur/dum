import React from "react";
import { Message } from "../../../types";

interface ChatMessageProps {
  message: Message;
  isUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isUser,
}) => {
  return (
    <div
      className={`message ${
        isUser ? "flex flex-col items-end" : "flex flex-col items-start"
      }`}
    >
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 mb-1 ${
          isUser
            ? "text-gray-500"
            : "bg-gray-400 border border-gray-400 text-gray-800"
        }`}
      >
        <div className="text-sm text-black font-semibold mb-1">
          {message.from}
        </div>
        <div>{message.content}</div>
        {message.fileUrl && (
          <div className="mt-2">
            <a
              href={`http://localhost:3535${message.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-700 hover:text-black underline"
            >
              {message.fileName}
            </a>
          </div>
        )}
      </div>
      <span className="text-xs text-gray-500">
        {message.time || new Date(message.timestamp!).toLocaleTimeString()}
      </span>
    </div>
  );
};
