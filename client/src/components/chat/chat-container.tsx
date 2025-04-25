import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './message-bubble';
import { ThinkingBubble } from './thinking-bubble';
import { ChatInput } from './chat-input';
import { AnalysisResponse } from './analysis-response';
import { useConversation, useConversations } from '@/lib/hooks';
import { Message } from '@/lib/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter'; 
import { useAuth } from '@/hooks/use-auth'; 

interface ChatContainerProps {
  conversationId?: number;
}

export function ChatContainer({ conversationId }: ChatContainerProps) {
  const { messages, isLoading, sendMessage, isPending } = useConversation(conversationId);
  const { createConversation, isPending: isCreatingConversation } = useConversations();
  const { user } = useAuth(); 
  const [, setLocation] = useLocation(); 
  const [pendingUserMessage, setPendingUserMessage] = React.useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isPending, isCreatingConversation]);

  const handleSendMessage = async (content: string) => {
    if (!user) {
      console.error("User not logged in, cannot send message or create conversation.");
      return; 
    }

    const userId = user.id;

    setPendingUserMessage(content);

    if (conversationId) {
      sendMessage(content);
    } else {
      createConversation(
        { userId, initialMessageContent: content },
        {
          onSuccess: (newConversation) => {
            setLocation(`/chat/${newConversation.id}`);
          },
          onError: (error) => {
            console.error("Failed to create conversation:", error);
            setPendingUserMessage(null); 
          }
        }
      );
    }
  };

  React.useEffect(() => {
    if (!isPending && !isCreatingConversation) {
      setPendingUserMessage(null);
    }
  }, [isPending, isCreatingConversation]);

  const isProcessing = isPending || isCreatingConversation;

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
          <ThinkingBubble isVisible={isProcessing} />
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput onSend={handleSendMessage} isDisabled={isProcessing} />
    </div>
  );
}
