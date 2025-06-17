import { useEffect, useRef, useState, useCallback } from "react";
import type { WSMessage } from "@/types";

interface UseWebSocketOptions {
  token?: string;
  onMessage?: (message: WSMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<WebSocket['readyState']>(WebSocket.CLOSED);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setConnectionState(WebSocket.OPEN);
        reconnectAttempts.current = 0;
        
        // Authenticate if token is available
        if (options.token) {
          sendMessage({ type: 'auth', token: options.token });
        }
        
        options.onConnect?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          options.onMessage?.(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setIsConnected(false);
        setConnectionState(WebSocket.CLOSED);
        options.onDisconnect?.();

        // Auto-reconnect logic
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        options.onError?.(error);
      };

    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
    }
  }, [options.token, options.onMessage, options.onConnect, options.onDisconnect, options.onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionState(WebSocket.CLOSED);
  }, []);

  const sendMessage = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (options.token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [options.token, connect, disconnect]);

  useEffect(() => {
    const ws = wsRef.current;
    if (ws) {
      const updateConnectionState = () => {
        setConnectionState(ws.readyState);
      };
      
      const interval = setInterval(updateConnectionState, 1000);
      return () => clearInterval(interval);
    }
  }, []);

  return {
    isConnected,
    connectionState,
    sendMessage,
    connect,
    disconnect,
  };
}
