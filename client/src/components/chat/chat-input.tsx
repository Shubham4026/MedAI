import React, { useState, useRef, useEffect } from "react";
import { VoiceModal } from "./voice-modal";
import { Button } from "@/components/ui/button";
import { Mic, Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isDisabled?: boolean;
}

export function ChatInput({ onSend, isDisabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim() && !isDisabled) {
      onSend(message.trim());
      setMessage("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  // Speech-to-text modal state
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [listening, setListening] = useState(false);

  const handleVoice = () => {
    setVoiceModalOpen(true);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setMessage((prev) => (prev ? prev + " " + transcript : transcript));
  };

  return (
    <>
      {voiceModalOpen && (
        <VoiceModal
          open={voiceModalOpen}
          onClose={() => setVoiceModalOpen(false)}
          onTranscript={handleVoiceTranscript}
          setListening={setListening}
        />
      )}
      <div
        className="sticky bottom-0 z-10 border-t border-gray-200 bg-white px-4 py-4 sm:px-6"
        style={{ marginTop: 2 }}
      >
        <div>
          <form onSubmit={handleSend} className="flex items-center space-x-3">
            <div className="min-w-0 flex-1">
              <div className="relative rounded-md shadow-sm">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e as unknown as React.FormEvent);
                    }
                  }}
                  className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 focus:outline-none pl-3 pr-10 text-sm resize-none overflow-hidden"
                  placeholder="Describe your symptoms..."
                  disabled={isDisabled}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    className="p-1.5 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={handleVoice}
                    disabled={isDisabled}
                    aria-label="Start voice input"
                  >
                    <Mic
                      className={`w-5 h-5 ${
                        listening
                          ? "text-red-500 animate-pulse"
                          : "text-gray-400"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              disabled={!message.trim() || isDisabled}
              className="focus:outline-none"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
          <p className="mt-2 text-xs text-gray-500">
            For emergencies, please call your local emergency number (e.g., 911
            in the US) immediately.
          </p>
        </div>
      </div>
    </>
  );
}
