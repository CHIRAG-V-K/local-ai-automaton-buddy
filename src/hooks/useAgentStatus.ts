
import { useState, useEffect } from "react";
import { useAutoConnect } from "./useAutoConnect";

export type AgentStatus = "offline" | "connecting" | "idle" | "thinking" | "working";

export const useAgentStatus = (serverUrl: string) => {
  const { isConnected, isConnecting, testConnection } = useAutoConnect(serverUrl);
  const [activityStatus, setActivityStatus] = useState<"idle" | "thinking" | "working">("idle");
  const [lastToolUsed, setLastToolUsed] = useState<string | null>(null);

  // Determine overall agent status based on connection and activity
  const getOverallStatus = (): AgentStatus => {
    if (!isConnected && isConnecting) return "connecting";
    if (!isConnected) return "offline";
    return activityStatus;
  };

  const overallStatus = getOverallStatus();

  const updateActivityStatus = (status: "idle" | "thinking" | "working") => {
    setActivityStatus(status);
  };

  const updateLastToolUsed = (tool: string | null) => {
    setLastToolUsed(tool);
  };

  return {
    status: overallStatus,
    isConnected,
    isConnecting,
    lastToolUsed,
    testConnection,
    updateActivityStatus,
    updateLastToolUsed,
  };
};
