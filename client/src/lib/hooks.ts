import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "./queryClient";
import { Conversation, Message, Analysis } from "./types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Custom hook for handling conversations
export function useConversations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // // Fetch all conversations
  // const { data: conversations, isLoading } = useQuery<Conversation[]>({
  //   queryKey: ['/api/conversations'] as const,
  //   onError: (error: unknown) => {
  //     const message = error instanceof Error ? error.message : 'Unknown error occurred';
  //     toast({
  //       title: "Error fetching conversations",
  //       description: message,
  //       variant: "destructive",
  //     });
  //   }
  // });


  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'] as const,
    queryFn: async () => {
      try {
        const res = await fetch('/api/conversations');
        if (!res.ok) throw new Error('Failed to fetch conversations');
        return res.json();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        toast({
          title: "Error fetching conversations",
          description: message,
          variant: "destructive",
        });
        throw error; // Re-throw so React Query can still handle it internally if needed
      }
    },
  });

  // Create a new conversation
  const createConversationMutation = useMutation({
    mutationFn: async ({ title, userId }: { title: string; userId: number }) => {
      const response = await apiRequest("POST", "/api/conversations", { title, userId });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error creating conversation",
        description: message,
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

  // // Fetch messages for a conversation
  // const { 
  //   data: messages, 
  //   isLoading: isLoadingMessages 
  // } = useQuery<Message[]>({
  //   queryKey: ['/api/conversations', conversationId, 'messages'] as const,
  //   enabled: !!conversationId,
  //   onError: (error: unknown) => {
  //     const message = error instanceof Error ? error.message : 'Unknown error occurred';
  //     toast({
  //       title: "Error fetching messages",
  //       description: message,
  //       variant: "destructive",
  //     });
  //   }
  // });

  const { 
    data: messages, 
    isLoading: isLoadingMessages 
  } = useQuery<Message[]>({
    queryKey: ['/api/conversations', conversationId, 'messages'] as const,
    enabled: !!conversationId,
    queryFn: async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages`);
        if (!res.ok) throw new Error('Failed to fetch messages');
        return res.json();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        toast({
          title: "Error fetching messages",
          description: message,
          variant: "destructive",
        });
        throw error; // Rethrow so React Query can still treat it as an error
      }
    }
  });
  

  // Fetch analyses for a conversation
  // const { 
  //   data: analyses, 
  //   isLoading: isLoadingAnalyses 
  // } = useQuery<Analysis[]>({
  //   queryKey: ['/api/conversations', conversationId, 'analyses'] as const,
  //   enabled: !!conversationId,
  //   onError: (error: unknown) => {
  //     const message = error instanceof Error ? error.message : 'Unknown error occurred';
  //     toast({
  //       title: "Error fetching analyses",
  //       description: message,
  //       variant: "destructive",
  //     });
  //   }
  // });

  const { 
    data: analyses, 
    isLoading: isLoadingAnalyses 
  } = useQuery<Analysis[]>({
    queryKey: ['/api/conversations', conversationId, 'analyses'] as const,
    enabled: !!conversationId,
    queryFn: async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}/analyses`);
        if (!res.ok) throw new Error('Failed to fetch analyses');
        return res.json();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        toast({
          title: "Error fetching analyses",
          description: message,
          variant: "destructive",
        });
        throw error; // so React Query still considers this a failed query
      }
    }
  });
  

  // Create a new message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, conversationId }: { content: string, conversationId: number }) => {
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
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error sending message",
        description: message,
        variant: "destructive",
      });
    }
  });

  // Combine messages with their analyses
  const messagesWithAnalyses = (messages as Message[] | undefined)?.map((message: Message) => {
    if (message.role === "assistant") {
      const analysis = (analyses as Analysis[] | undefined)?.find((a: Analysis) => a.urgencyLevel);
      if (analysis) {
        return { ...message, analysis };
      }
    }
    return message;
  });

  return {
    messages: messagesWithAnalyses || [],
    isLoading: isLoadingMessages || isLoadingAnalyses,
    sendMessage: (content: string) => sendMessageMutation.mutate({ content, conversationId: conversationId! }),
    isPending: sendMessageMutation.isPending,
  };
}
