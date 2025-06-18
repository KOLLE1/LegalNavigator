import { useState, useEffect } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import type { ChatSession } from "@/types";

export default function Chat() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  // Get session ID from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionParam = urlParams.get('session');
    if (sessionParam) {
      setSelectedSessionId(sessionParam);
    }
  }, []);

  const handleNewChat = () => {
    setSelectedSessionId("");
    // Remove session param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('session');
    window.history.replaceState({}, '', url.toString());
  };

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    // Update URL with session param
    const url = new URL(window.location.href);
    url.searchParams.set('session', sessionId);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <ChatSidebar 
          selectedSessionId={selectedSessionId}
          onSessionSelect={handleSessionSelect}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatInterface 
          selectedSessionId={selectedSessionId}
          onSessionChange={handleSessionSelect}
        />
      </div>
    </div>
  );
}
