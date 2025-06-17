import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { Message } from "./message";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Paperclip, 
  Download, 
  MoreVertical,
  Bot,
  Shield,
  Languages
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
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">AI Legal Assistant</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Specialized in Cameroon law
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full w-fit mx-auto">
              <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Welcome to LawHelp</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                I'm your AI legal assistant specialized in Cameroon law. I can help you with questions about:
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <Badge variant="secondary">Criminal Law</Badge>
                <Badge variant="secondary">Family Law</Badge>
                <Badge variant="secondary">Property Law</Badge>
                <Badge variant="secondary">Business Law</Badge>
                <Badge variant="secondary">Employment Law</Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start a conversation by typing your legal question below.
              </p>
            </div>
          </div>
        </CardContent>
        
        <div className="p-6 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your legal question here..."
              className="min-h-[60px] resize-none"
              rows={2}
            />
            <div className="flex flex-col gap-2">
              <Button type="button" variant="outline" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button type="submit" disabled={!currentMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Press Ctrl+Enter to send</span>
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3" />
              <span>Encrypted</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">AI Legal Assistant</h3>
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {isConnected ? 'Online' : 'Connecting...'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Languages className="h-4 w-4" />
              EN
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-6">
          <div className="space-y-6">
            {messages.map((message: ChatMessage) => (
              <Message key={message.id} message={message} />
            ))}
            
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
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
        </ScrollArea>
      </CardContent>

      <div className="p-6 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <Textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your legal question here..."
            className="min-h-[60px] resize-none"
            rows={2}
          />
          <div className="flex flex-col gap-2">
            <Button type="button" variant="outline" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="submit" disabled={!currentMessage.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Press Ctrl+Enter to send • AI responses are for guidance only</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Encrypted</span>
            </div>
            <span>Response time: ~2s</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
