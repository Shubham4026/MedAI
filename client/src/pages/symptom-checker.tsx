import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { ChatContainer } from '@/components/chat/chat-container';
import { useConversations } from '@/lib/hooks';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation("/auth?mode=login");
    }
  }, [user, setLocation]);

  const [activeConversationId, setActiveConversationId] = useState<number | undefined>(undefined);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { conversations, isLoading, createConversation } = useConversations();
  const { toast } = useToast();

  const handleNewChat = () => {
    // Create a new conversation with a default title
    // In a real app, you might prompt for a title or use the first message as the title
    createConversation('New Symptom Assessment', {
      onSuccess: (data) => {
        setActiveConversationId(data.id);
        setIsMobileMenuOpen(false);
      }
    });
  };

  const handleSelectConversation = (id: number) => {
    setActiveConversationId(id);
  };

  const handleExportReport = () => {
    if (!activeConversationId) {
      toast({
        title: "No conversation selected",
        description: "Please select a conversation to export.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would generate and download a report
    toast({
      title: "Export Report",
      description: "This feature would generate a PDF report of the current conversation.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header 
        onNewChat={handleNewChat} 
        onMenuToggle={() => setIsMobileMenuOpen(true)} 
      />

      {/* Main Content */}
      <main className="flex-grow flex">
        {/* Sidebar (desktop) */}
        <Sidebar 
          conversations={conversations}
          isLoading={isLoading}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onExportReport={handleExportReport}
        />

        {/* Chat Container */}
        <ChatContainer conversationId={activeConversationId} />

        {/* Mobile Menu */}
        <MobileMenu 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          conversations={conversations}
          isLoading={isLoading}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onExportReport={handleExportReport}
        />
      </main>
    </div>
  );
}
