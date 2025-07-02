
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, Zap, Wifi, WifiOff } from "lucide-react";

export type AgentStatus = "offline" | "connecting" | "idle" | "thinking" | "working";

interface StatusBarProps {
  status: AgentStatus;
  lastToolUsed: string | null;
  isConnected: boolean;
}

export const StatusBar = ({ status, lastToolUsed, isConnected }: StatusBarProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "offline":
        return "bg-red-500";
      case "connecting":
        return "bg-yellow-500";
      case "idle":
        return "bg-green-500";
      case "thinking":
        return "bg-yellow-500";
      case "working":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "offline":
        return "Agent Offline";
      case "connecting":
        return "Connecting...";
      case "idle":
        return "Ready";
      case "thinking":
        return "Processing...";
      case "working":
        return "Using tools...";
      default:
        return "Unknown";
    }
  };

  const getConnectionIcon = () => {
    if (status === "offline") {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
    return <Wifi className="w-4 h-4 text-green-500" />;
  };

  return (
    <Card className="p-3 glass shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getConnectionIcon()}
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <p className="text-xs sm:text-xs text-muted-foreground">
              AI Assistant is
            </p>
            <span className="text-sm font-medium text-foreground">
              {getStatusText()}
            </span>
          </div>
          {status === "thinking" && (
            <Activity className="w-4 h-4 text-yellow-500 animate-pulse" />
          )}
        </div>

        <div className="flex items-center gap-3">
          {lastToolUsed && isConnected && (
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary" />
              <Badge
                variant="secondary"
                className="text-xs glass bg-primary/10"
              >
                {lastToolUsed}
              </Badge>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </Card>
  );
};
