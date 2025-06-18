import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Library, 
  Settings,
  Zap,
  Bot,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import type { ChatSession } from "@/types";

interface ChatSidebarProps {
  selectedSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
}

export function ChatSidebar({ selectedSessionId, onSessionSelect, onNewChat }: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch chat sessions
  const { data: chatSessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/chat/sessions');
      return response.json();
    },
  });

  // Filter sessions based on search term
  const filteredSessions = chatSessions.filter((session: ChatSession) =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header with Logo and New Chat */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">LegalGPT</span>
        </div>
        <Button
          onClick={onNewChat}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Navigation */}
      <div className="px-3 py-2">
        <Button
          onClick={onNewChat}
          variant="ghost"
          className="w-full justify-start text-left h-10 px-3 mb-2"
        >
          <MessageSquare className="h-4 w-4 mr-3" />
          New chat
        </Button>
        
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chats"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9 bg-transparent border-gray-300 dark:border-gray-600"
          />
        </div>
      </div>

      {/* Additional Navigation Items */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <Button variant="ghost" className="w-full justify-start text-left h-9 px-3 mb-1">
          <Library className="h-4 w-4 mr-3" />
          Library
        </Button>
        
        <div className="mt-4 mb-2">
          <div className="px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Featured
          </div>
          <Button variant="ghost" className="w-full justify-start text-left h-9 px-3 mb-1">
            <Zap className="h-4 w-4 mr-3" />
            Sora
          </Button>
          <Button variant="ghost" className="w-full justify-start text-left h-9 px-3 mb-1">
            <Bot className="h-4 w-4 mr-3" />
            GPTs
          </Button>
          <Button variant="ghost" className="w-full justify-start text-left h-9 px-3 mb-1">
            <Sparkles className="h-4 w-4 mr-3" />
            Excel AI
          </Button>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 px-3 py-2">
        <div className="px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Chats
        </div>
        
        <ScrollArea className="h-full">
          {sessionsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded px-3"></div>
                </div>
              ))}
            </div>
          ) : filteredSessions.length > 0 ? (
            <div className="space-y-1">
              {filteredSessions.map((session: ChatSession) => (
                <Button
                  key={session.id}
                  onClick={() => onSessionSelect(session.id)}
                  variant={selectedSessionId === session.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left h-9 px-3 font-normal truncate"
                >
                  <MessageSquare className="h-3 w-3 mr-3 flex-shrink-0" />
                  <span className="truncate">{session.title}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No matching chats' : 'No chats yet'}
              </p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Bottom section with upgrade plan */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Upgrade plan
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            More access to the best models
          </div>
        </div>
      </div>
    </div>
  );
}