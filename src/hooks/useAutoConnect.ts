
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useAutoConnect = (serverUrl: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const testConnection = async (silent: boolean = false) => {
    setIsConnecting(true);
    try {
      const response = await fetch(`${serverUrl}/health`);
      
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
