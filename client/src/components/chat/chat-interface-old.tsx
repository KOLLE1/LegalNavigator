import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { Message } from "./message";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Paperclip,
  Mic,
  Square,
  Bot
} from "lucide-react";
import type { ChatSession, ChatMessage, WSMessage } from "@/types";

interface ChatInterfaceProps {
  selectedSessionId?: string;
  onSessionChange?: (sessionId: string) => void;
}

export function ChatInterface({ selectedSessionId, onSessionChange }: ChatInterfaceProps) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem("auth_token");

  // WebSocket for real-time messaging
  const { sendMessage: sendWSMessage, isConnected } = useWebSocket({
    token: token || undefined,
    onMessage: (message: WSMessage) => {
      if (message.type === 'message_sent' || message.type === 'ai_response') {
        // Invalidate messages query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedSessionId] });
      } else if (message.type === 'error') {
        toast({
          title: "Error",
          description: typeof message.message === 'string' ? message.message : "An error occurred",
          variant: "destructive",
        });
      }
      
      if (message.type === 'ai_response') {
        setIsTyping(false);
      }
    },
  });

  // Fetch messages for selected session
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', selectedSessionId],
    queryFn: async () => {
      if (!selectedSessionId) return [];
      const response = await apiRequest('GET', `/api/chat/sessions/${selectedSessionId}/messages`);
      return response.json();
    },
    enabled: !!selectedSessionId,
  });

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest('POST', '/api/chat/sessions', { title });
      return response.json();
    },
    onSuccess: (newSession: ChatSession) => {
      onSessionChange?.(newSession.id);
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMessage.trim()) return;
    
    let sessionId = selectedSessionId;
    
    // Create new session if none selected
    if (!sessionId) {
      const title = currentMessage.length > 50 
        ? currentMessage.substring(0, 50) + '...' 
        : currentMessage;
      
      try {
        const newSession = await createSessionMutation.mutateAsync(title);
        sessionId = newSession.id;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create chat session",
          variant: "destructive",
        });
        return;
      }
    }

    // Send message via WebSocket
    const messageSent = sendWSMessage({
      type: 'chat_message',
      sessionId: sessionId!,
      content: currentMessage,
      userId: user!.id,
    });

    if (messageSent) {
      setCurrentMessage("");
      setIsTyping(true);
    } else {
      toast({
        title: "Connection Error",
        description: "Unable to send message. Please check your connection.",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSendMessage(e);
    }
  };

  if (!selectedSessionId) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-950">
        {/* Empty state - centered content */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto px-4">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-normal text-gray-900 dark:text-white">
              Ready when you are.
            </h1>
          </div>
        </div>
        
        {/* Input area at bottom */}
        <div className="w-full max-w-3xl mx-auto p-4">
          <form onSubmit={handleSendMessage} className="relative">
            <div className="relative bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <Textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                className="w-full bg-transparent border-0 resize-none rounded-3xl px-6 py-4 pr-20 text-base focus:ring-0 focus:outline-none min-h-[56px] max-h-32"
                rows={1}
              />
              
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                
                <Button
                  type="submit"
                  disabled={!currentMessage.trim()}
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-center mt-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Square className="h-3 w-3" />
                <span>Tools</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Chat messages area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="space-y-6">
              {messages.map((message: ChatMessage) => (
                <Message key={message.id} message={message} />
              ))}
              
              {isTyping && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Input area at bottom */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto p-4">
          <form onSubmit={handleSendMessage} className="relative">
            <div className="relative bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <Textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                className="w-full bg-transparent border-0 resize-none rounded-3xl px-6 py-4 pr-20 text-base focus:ring-0 focus:outline-none min-h-[56px] max-h-32"
                rows={1}
              />
              
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                
                <Button
                  type="submit"
                  disabled={!currentMessage.trim() || isTyping}
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-center mt-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Square className="h-3 w-3" />
                <span>Tools</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
