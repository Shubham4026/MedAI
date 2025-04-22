import React from 'react';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface SidebarProps {
  conversations: Conversation[] | undefined;
  isLoading: boolean;
  activeConversationId?: number;
  onSelectConversation: (id: number) => void;
  onExportReport: () => void;
}

export function Sidebar({
  conversations,
  isLoading,
  activeConversationId,
  onSelectConversation,
  onExportReport
}: SidebarProps) {
  return (
    <aside className="hidden md:block w-64 border-r border-gray-200 bg-white">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">History</h2>
        </div>
        <ScrollArea className="flex-grow p-4">
          <div className="space-y-2">
            {isLoading && (
              <div className="text-sm text-gray-500 italic">Loading conversations...</div>
            )}
            
            {!isLoading && conversations?.length === 0 && (
              <div className="text-sm text-gray-500 italic">No conversations yet</div>
            )}
            
            <TooltipProvider>
              {conversations?.map((conversation) => (
                <Tooltip key={conversation.id}>
                  <TooltipTrigger asChild>
                    <button
                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium truncate ${
                        activeConversationId === conversation.id ? 'bg-gray-100' : 'text-gray-700'
                      }`}
                      onClick={() => onSelectConversation(conversation.id)}
                    >
                      {conversation.title}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {conversation.title}
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={onExportReport}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
    </aside>
  );
}
