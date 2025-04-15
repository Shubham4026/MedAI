import React from 'react';
import { Button } from '@/components/ui/button';
import { useConversations } from '@/lib/hooks';
import { Bolt, Plus } from 'lucide-react';

interface HeaderProps {
  onNewChat: () => void;
  onMenuToggle: () => void;
}

export function Header({ onNewChat, onMenuToggle }: HeaderProps) {
  const { isPending } = useConversations();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Bolt className="h-8 w-8 text-primary-500" />
            <h1 className="ml-2 text-xl font-bold text-gray-900">MediAI</h1>
          </div>
          
          <div className="flex items-center">
            <Button 
              onClick={onNewChat} 
              disabled={isPending}
              className="inline-flex items-center"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Chat
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 md:hidden"
              onClick={onMenuToggle}
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
