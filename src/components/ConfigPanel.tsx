
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Server, Wifi, WifiOff, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAutoConnect } from "@/hooks/useAutoConnect";

interface ConfigPanelProps {
  onClose: () => void;
}

export const ConfigPanel = ({ onClose }: ConfigPanelProps) => {
  const [serverUrl, setServerUrl] = useState("http://localhost:8000");
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [maxMessages, setMaxMessages] = useState("100");
  const [accentColor, setAccentColor] = useState("#3b82f6");
  const { toast } = useToast();
  const { isConnected, isConnecting, testConnection } = useAutoConnect(serverUrl);

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem("aiAgentSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setServerUrl(settings.serverUrl || "http://localhost:8000");
      setAutoScroll(settings.autoScroll ?? true);
      setShowTimestamps(settings.showTimestamps ?? true);
      setMaxMessages(settings.maxMessages || "100");
      setAccentColor(settings.accentColor || "#3b82f6");
    }
  }, []);

  const saveSettings = () => {
    const settings = {
      serverUrl,
      autoScroll,
      showTimestamps,
      maxMessages,
      accentColor,
    };
    localStorage.setItem("aiAgentSettings", JSON.stringify(settings));
    
    // Apply accent color
    document.documentElement.style.setProperty("--accent-color", accentColor);
    
    toast({
      title: "Settings Saved",
      description: "Your configuration has been saved successfully.",
    });
  };

  return (
    <Card className="bg-background/95 backdrop-blur-sm border">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold">Configuration</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Server Configuration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="server-url" className="text-sm font-medium">
              Python Agent Server
            </Label>
            <Badge
              variant={isConnected ? "default" : "secondary"}
              className="text-xs"
            >
              {isConnecting ? (
                <>
                  <Wifi className="w-3 h-3 mr-1 animate-pulse" />
                  Connecting...
                </>
              ) : isConnected ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Input
              id="server-url"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="flex-1"
            />
            <Button 
              onClick={() => testConnection()} 
              size="sm" 
              variant="outline"
              disabled={isConnecting}
            >
              <Server className="w-4 h-4 mr-1" />
              Test
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            URL of your local Python AI agent server. Make sure it has endpoints
            for /chat and /health.
          </p>
        </div>

        {/* Appearance Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </h4>

          <div className="space-y-2">
            <Label htmlFor="accent-color" className="text-sm">
              Accent Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="accent-color"
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-16 h-10 p-1 rounded"
              />
              <Input
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Chat Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Chat Settings</h4>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-scroll" className="text-sm">
                Auto-scroll
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically scroll to latest message
              </p>
            </div>
            <Switch
              id="auto-scroll"
              checked={autoScroll}
              onCheckedChange={setAutoScroll}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-timestamps" className="text-sm">
                Show timestamps
              </Label>
              <p className="text-xs text-muted-foreground">
                Display message timestamps
              </p>
            </div>
            <Switch
              id="show-timestamps"
              checked={showTimestamps}
              onCheckedChange={setShowTimestamps}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-messages" className="text-sm">
              Max messages to keep
            </Label>
            <Input
              id="max-messages"
              type="number"
              value={maxMessages}
              onChange={(e) => setMaxMessages(e.target.value)}
              min="10"
              max="1000"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of messages to keep in chat history
            </p>
          </div>
        </div>

        {/* Available Tools */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Available Tools</h4>
          <div className="grid grid-cols-2 gap-2">
            <Badge variant="outline" className="justify-center py-2">
              📅 Calendar
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              🔍 Wikipedia
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              🦆 DuckDuckGo
            </Badge>
            <Badge variant="outline" className="justify-center py-2">
              🌐 Web Search
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            These tools will be available when your Python agent is connected
          </p>
        </div>

        {/* Save Button */}
        <Button onClick={saveSettings} className="w-full">
          Save Configuration
        </Button>
      </div>
    </Card>
  );
};
