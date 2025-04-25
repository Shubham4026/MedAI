import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './message-bubble';
import { ThinkingBubble } from './thinking-bubble';
import { ChatInput } from './chat-input';
import { AnalysisResponse } from './analysis-response';
import { useConversation } from '@/lib/hooks';
import { Message } from '@/lib/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface ChatContainerProps {
  conversationId?: number;
}

export function ChatContainer({ conversationId }: ChatContainerProps) {
  const { messages, isLoading, sendMessage, isPending } = useConversation(conversationId);
  const [pendingUserMessage, setPendingUserMessage] = React.useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  // Track if title has been updated for this conversation
  const titleUpdatedRef = React.useRef<Record<number, boolean>>({});

  const queryClient = useQueryClient();

  const handleSendMessage = async (content: string) => {
    setPendingUserMessage(content);
    sendMessage(content);

    // Only update title for first user message in this conversation
    if (
      conversationId &&
      !titleUpdatedRef.current[conversationId] &&
      messages?.filter((m) => m.role === "user").length === 0
    ) {
      // Summarize (truncate) the message for the title
      const summary = content.length > 48 ? content.slice(0, 48) + "..." : content;
      try {
        await fetchWithAuth(`/api/conversations/${conversationId}/title`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: summary })
        });
        titleUpdatedRef.current[conversationId] = true;
        // Invalidate the conversations query so the sidebar updates
        queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      } catch (e) {
        // Optionally handle error
        // console.error('Failed to update conversation title', e);
      }
    }
  };

  // Clear pending message when not sending
  React.useEffect(() => {
    if (!isPending) setPendingUserMessage(null);
  }, [isPending]);


  return (
    <div className="flex-grow flex flex-col bg-white">
      <div className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between sm:px-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-medium leading-6 text-gray-900">
            Symptom Assessment
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Describe your symptoms for AI-assisted analysis
          </p>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 chat-container">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Medical Disclaimer */}
          <Alert className="bg-blue-50 border-l-4 border-primary-500">
            <div className="flex">
              <Info className="h-5 w-5 text-primary-500" />
              <AlertDescription className="ml-3 text-sm text-blue-800">
                <strong>Medical Disclaimer:</strong> MediAI provides information for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.
              </AlertDescription>
            </div>
          </Alert>

          {/* AI Welcome Message */}
          <MessageBubble 
            role="assistant" 
            content="Hello! I'm MediAI, your health assistant. I can help you understand your symptoms and provide general health information. Remember, I'm not a replacement for professional medical advice. To get started, please describe your symptoms in detail. You can mention: what symptoms you're experiencing, when they started, any factors that make them better or worse, and any relevant medical history."
          />
          
          <MessageBubble 
            role="assistant" 
            content="For example, you could say: 'I've been experiencing a throbbing headache for the past 3 days, primarily on the right side. It gets worse when I bend over. I also feel slightly nauseous in the mornings.'"
          />

          {/* Conversation messages */}
          {messages?.map((message: Message) => {
            if (message.role === "assistant" && message.analysis) {
              return (
                <AnalysisResponse 
                  key={message.id}
                  message={message.content}
                  analysis={message.analysis}
                  followUpQuestion={message.analysis.followUpQuestion}
                />
              );
            } else {
              return (
                <MessageBubble 
                  key={message.id}
                  role={message.role} 
                  content={message.content}
                />
              );
            }
          })}

          {/* Optimistically show the user message while sending */}
          {pendingUserMessage && (
            <MessageBubble
              key="pending-user"
              role="user"
              content={pendingUserMessage}
              className="opacity-70 animate-pulse"
            />
          )}

          {/* Loading state */}
          <ThinkingBubble isVisible={isPending} />
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput onSend={handleSendMessage} isDisabled={isPending} />
    </div>
  );
}
