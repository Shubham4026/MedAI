import React from 'react';
import { cn } from "@/lib/utils";
import { Bolt } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  className?: string;
}

export function MessageBubble({ role, content, className }: MessageBubbleProps) {
  const isUser = role === "user";
  
  return (
    <div className={cn(
      "flex items-start",
      isUser ? "justify-end" : "",
      className
    )}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center">
            <Bolt className="h-5 w-5 text-primary-600" />
          </div>
        </div>
      )}
      
      <div className={cn(
        "px-4 py-3 rounded-lg max-w-lg",
        isUser ? "mr-3 bg-primary-500 text-white" : "ml-3 bg-gray-100 text-gray-800"
      )}>
        <p className={isUser ? "text-white" : "text-gray-800"}>
          {content}
        </p>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0">
          <div className="h-9 w-9 rounded-full bg-gray-300 flex items-center justify-center">
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
