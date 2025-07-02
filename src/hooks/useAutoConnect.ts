
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const validateAndFormatUrl = (url: string): string => {
  // Remove any trailing slashes
  const trimmedUrl = url.trim().replace(/\/+$/, '');
  
  // Check if URL starts with http:// or https://
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return `http://${trimmedUrl}`;
  }
  
  // Fix common malformed URLs like http:/192.168.1.1 (missing slash)
  if (trimmedUrl.match(/^https?:\/[^\/]/)) {
    return trimmedUrl.replace(/^(https?:\/)(.)/, '$1/$2');
  }
  
  return trimmedUrl;
};

export const useAutoConnect = (serverUrl: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const testConnection = async (silent: boolean = false) => {
    setIsConnecting(true);
    try {
      const formattedUrl = validateAndFormatUrl(serverUrl);
      const response = await fetch(`${formattedUrl}/health`);
      
      if (response.ok) {
        setIsConnected(true);
        if (!silent) {
          toast({
            title: "Connection Successful",
            description: "Successfully connected to the AI agent server.",
          });
        }
        return true;
      } else {
        throw new Error("Server responded with error");
      }
    } catch (error) {
      setIsConnected(false);
      if (!silent) {
        toast({
          title: "Connection Failed",
          description: "Could not connect to the AI agent server. Make sure it's running.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (!serverUrl) {
      setIsConnected(false);
      setIsConnecting(false);
      return;
    }

    // Auto-connect on mount
    testConnection(true);
    
    // Set up periodic connection checks
    const interval = setInterval(() => {
      testConnection(true);
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [serverUrl]);

  return { isConnected, isConnecting, testConnection };
};
