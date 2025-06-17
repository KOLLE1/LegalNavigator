import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ChatMessage } from "@/types";
import { Bot, ThumbsUp, Copy, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface MessageProps {
  message: ChatMessage;
}

export function Message({ message }: MessageProps) {
  const { user } = useAuth();
  const isUser = message.sender === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <Avatar className="h-8 w-8 bg-blue-100 dark:bg-blue-900">
          <AvatarFallback>
            <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-lg ${isUser ? 'order-first' : ''}`}>
        <div className={`rounded-lg p-4 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
        }`}>
          <div 
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
            className="prose prose-sm max-w-none"
          />
          
          {!isUser && message.metadata && (
            <div className="mt-3 space-y-2">
              {message.metadata.category && (
                <Badge variant="secondary" className="text-xs">
                  {message.metadata.category}
                </Badge>
              )}
              
              {message.metadata.references && message.metadata.references.length > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>References:</strong> {message.metadata.references.join(', ')}
                </div>
              )}
              
              {message.metadata.disclaimer && (
                <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border-l-2 border-yellow-400">
                  <strong>Disclaimer:</strong> {message.metadata.disclaimer}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={`flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
          
          {!isUser && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={copyToClipboard}>
                <Copy className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <ThumbsUp className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
