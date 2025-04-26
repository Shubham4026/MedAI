import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ChatContainer } from "@/components/chat/chat-container";
import { useConversations } from "@/lib/hooks";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Activity, ArrowLeft, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveLastSymptomCheck } from "@/lib/lastSymptomCheck";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation("/auth?mode=login");
    }
  }, [user, setLocation]);

  // Save the current time as the last symptom check when page loads
  useEffect(() => {
    if (user) {
      saveLastSymptomCheck();
    }
  }, [user]);

  const [activeConversationId, setActiveConversationId] = useState<
    number | undefined
  >(undefined);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { conversations, isLoading, createConversation } = useConversations();
  const { toast } = useToast();

  // Sort conversations by last updated (descending)
  const sortedConversations = React.useMemo(() => {
    if (!conversations) return [];
    return [...conversations].sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [conversations]);

  // Select the first conversation by default when loaded
  useEffect(() => {
    if (
      !activeConversationId &&
      sortedConversations &&
      sortedConversations.length > 0
    ) {
      setActiveConversationId(sortedConversations[0].id);
    }
    // If there are no conversations and not loading, create a new one automatically
    if (!isLoading && sortedConversations.length === 0 && user?.id) {
      createConversation(
        { title: "New Symptom Assessment", userId: user.id },
        {
          onSuccess: (data) => {
            setActiveConversationId(data.id);
          },
        }
      );
    }
  }, [
    sortedConversations,
    activeConversationId,
    isLoading,
    user,
    createConversation,
  ]);

  const handleNewChat = () => {
    if (!user?.id) {
      toast({
        title: "User not found",
        description: "You must be logged in to start a new conversation.",
        variant: "destructive",
      });
      return;
    }
    createConversation(
      { title: "New Symptom Assessment", userId: user.id },
      {
        onSuccess: (data) => {
          setActiveConversationId(data.id);
          setIsMobileMenuOpen(false);
        },
      }
    );
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
      description:
        "This feature would generate a PDF report of the current conversation.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100"
                onClick={() => setLocation("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <Brain className="h-7 w-7 text-teal-600" />
                <span className="text-xl font-bold text-teal-600">
                  Symptom Checker
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleNewChat}
                variant="default"
                className="bg-teal-600 hover:bg-teal-700"
              >
                New Assessment
              </Button>
              <Link href="/voice-assistant">
                <Button
                  variant="outline"
                  className="border-teal-600 text-teal-600 hover:bg-teal-50"
                >
                  Voice Assistant
                </Button>
              </Link>
              <Link href="/scan-report">
                <Button
                  variant="ghost"
                  className="border-teal-600 text-teal-600 hover:bg-teal-50"
                >
                  Scan Report
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex">
        {/* Sidebar (desktop) */}
        <Sidebar
          conversations={sortedConversations as any}
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
          conversations={sortedConversations as any}
          isLoading={isLoading}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onExportReport={handleExportReport}
        />
      </main>
    </div>
  );
}
