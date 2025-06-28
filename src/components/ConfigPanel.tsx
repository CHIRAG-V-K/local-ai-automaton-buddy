
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Server, Wifi, WifiOff, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAutoConnect } from "@/hooks/useAutoConnect";

interface ConfigPanelProps {
  onClose: () => void;
}

interface Settings {
  serverUrl: string;
  autoScroll: boolean;
  showTimestamps: boolean;
  maxMessages: string;
  accentColor: string;
}

export const ConfigPanel = ({ onClose }: ConfigPanelProps) => {
  const [settings, setSettings] = useState<Settings>({
    serverUrl: "http://localhost:8000",
    autoScroll: true,
    showTimestamps: true,
    maxMessages: "100",
    accentColor: "#3b82f6",
  });
  
  const { toast } = useToast();
  const { isConnected, isConnecting, testConnection } = useAutoConnect(settings.serverUrl);

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem("aiAgentSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          serverUrl: parsed.serverUrl || "http://localhost:8000",
          autoScroll: parsed.autoScroll ?? true,
          showTimestamps: parsed.showTimestamps ?? true,
          maxMessages: parsed.maxMessages || "100",
          accentColor: parsed.accentColor || "#3b82f6",
        });
      } catch (error) {
        console.error("Failed to parse saved settings:", error);
      }
    }
  }, []);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    try {
      localStorage.setItem("aiAgentSettings", JSON.stringify(settings));
      
      // Apply accent color to CSS custom properties
      document.documentElement.style.setProperty("--accent-color", settings.accentColor);
      
      // Apply other settings to document for global access
      document.documentElement.setAttribute("data-auto-scroll", settings.autoScroll.toString());
      document.documentElement.setAttribute("data-show-timestamps", settings.showTimestamps.toString());
      document.documentElement.setAttribute("data-max-messages", settings.maxMessages);
      
      toast({
        title: "Settings Saved",
        description: "Your configuration has been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetSettings = () => {
    const defaultSettings: Settings = {
      serverUrl: "http://localhost:8000",
      autoScroll: true,
      showTimestamps: true,
      maxMessages: "100",
      accentColor: "#3b82f6",
    };
    
    setSettings(defaultSettings);
    localStorage.removeItem("aiAgentSettings");
    document.documentElement.style.removeProperty("--accent-color");
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
    });
  };

  return (
    <Card className="h-full flex flex-col bg-card/95 backdrop-blur-sm border-border">
      <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <h3 className="text-lg font-semibold text-card-foreground">Configuration</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
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
                value={settings.serverUrl}
                onChange={(e) => updateSetting('serverUrl', e.target.value)}
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
                  value={settings.accentColor}
                  onChange={(e) => updateSetting('accentColor', e.target.value)}
                  className="w-16 h-10 p-1 rounded cursor-pointer"
                />
                <Input
                  value={settings.accentColor}
                  onChange={(e) => updateSetting('accentColor', e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Choose your preferred accent color for the interface
              </p>
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
                checked={settings.autoScroll}
                onCheckedChange={(checked) => updateSetting('autoScroll', checked)}
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
                checked={settings.showTimestamps}
                onCheckedChange={(checked) => updateSetting('showTimestamps', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-messages" className="text-sm">
                Max messages to keep
              </Label>
              <Input
                id="max-messages"
                type="number"
                value={settings.maxMessages}
                onChange={(e) => updateSetting('maxMessages', e.target.value)}
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

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={saveSettings} className="flex-1">
              Save Configuration
            </Button>
            <Button onClick={resetSettings} variant="outline" className="flex-1">
              Reset to Defaults
            </Button>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};
