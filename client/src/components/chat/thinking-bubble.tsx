import React from 'react';
import { Bolt } from "lucide-react";

interface ThinkingBubbleProps {
  isVisible: boolean;
}

export function ThinkingBubble({ isVisible }: ThinkingBubbleProps) {
  if (!isVisible) return null;
  
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center">
          <Bolt className="h-5 w-5 text-primary-600" />
        </div>
      </div>
      <div className="ml-3 bg-gray-100 rounded-lg px-4 py-3">
        <div className="flex space-x-1">
          <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></div>
          <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
          <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
}
