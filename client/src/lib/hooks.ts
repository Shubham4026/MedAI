import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "./queryClient";
import { Conversation, Message, Analysis } from "./types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Custom hook for handling conversations
export function useConversations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all conversations
  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
    onError: (error) => {
      toast({
        title: "Error fetching conversations",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create a new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("POST", "/api/conversations", { title });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
    onError: (error) => {
      toast({
        title: "Error creating conversation",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    conversations,
    isLoading,
    createConversation: createConversationMutation.mutate,
    isPending: createConversationMutation.isPending,
  };
}

// Custom hook for handling messages in a conversation
export function useConversation(conversationId?: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch messages for a conversation
  const { 
    data: messages, 
    isLoading: isLoadingMessages 
  } = useQuery<Message[]>({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    enabled: !!conversationId,
    onError: (error) => {
      toast({
        title: "Error fetching messages",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Fetch analyses for a conversation
  const { 
    data: analyses, 
    isLoading: isLoadingAnalyses 
  } = useQuery<Analysis[]>({
    queryKey: ['/api/conversations', conversationId, 'analyses'],
    enabled: !!conversationId,
    onError: (error) => {
      toast({
        title: "Error fetching analyses",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create a new message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId) throw new Error("No conversation selected");
      
      const response = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, {
        role: "user",
        content
      });
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', conversationId, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', conversationId, 'analyses'] });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Combine messages with their analyses
  const messagesWithAnalyses = messages?.map(message => {
    if (message.role === "assistant") {
      const analysis = analyses?.find(a => a.messageId === message.id);
      if (analysis) {
        return { ...message, analysis };
      }
    }
    return message;
  });

  return {
    messages: messagesWithAnalyses,
    isLoading: isLoadingMessages || isLoadingAnalyses,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
  };
}
