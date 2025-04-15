import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isDisabled?: boolean;
}

export function ChatInput({ onSend, isDisabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isDisabled) {
      onSend(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleVoice = () => {
    // This would integrate with speech recognition in a real application
    // For now just show an alert about the feature
    alert("Voice input would be activated here. This feature would use the Web Speech API to capture voice input.");
  };

  return (
    <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
      <form onSubmit={handleSend} className="flex space-x-3">
        <div className="min-w-0 flex-1">
          <div className="relative rounded-md shadow-sm">
            <textarea
              ref={textareaRef}
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 pl-3 pr-10 text-sm resize-none overflow-hidden"
              placeholder="Describe your symptoms..."
              disabled={isDisabled}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="button"
                onClick={handleVoice}
                className="text-gray-400 hover:text-gray-500"
                disabled={isDisabled}
              >
                <Mic className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <Button type="submit" disabled={!message.trim() || isDisabled}>
          <Send className="h-5 w-5" />
        </Button>
      </form>
      <p className="mt-2 text-xs text-gray-500">
        For emergencies, please call your local emergency number (e.g., 911 in the US) immediately.
      </p>
    </div>
  );
}
