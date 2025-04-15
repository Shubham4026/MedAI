import React from 'react';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[] | undefined;
  isLoading: boolean;
  activeConversationId?: number;
  onSelectConversation: (id: number) => void;
  onExportReport: () => void;
}

export function MobileMenu({
  isOpen,
  onClose,
  conversations,
  isLoading,
  activeConversationId,
  onSelectConversation,
  onExportReport
}: MobileMenuProps) {
  if (!isOpen) return null;

  const handleConversationSelect = (id: number) => {
    onSelectConversation(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50" aria-hidden="true">
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl">
        <div className="h-full flex flex-col">
          <div className="px-4 py-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Conversation History</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <ScrollArea className="flex-grow p-4">
            <div className="space-y-2">
              {isLoading && (
                <div className="text-sm text-gray-500 italic">Loading conversations...</div>
              )}
              
              {!isLoading && conversations?.length === 0 && (
                <div className="text-sm text-gray-500 italic">No conversations yet</div>
              )}
              
              {conversations?.map((conversation) => (
                <button
                  key={conversation.id}
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium truncate ${
                    activeConversationId === conversation.id ? 'bg-gray-100' : 'text-gray-700'
                  }`}
                  onClick={() => handleConversationSelect(conversation.id)}
                >
                  {conversation.title}
                </button>
              ))}
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
      </div>
    </div>
  );
}
