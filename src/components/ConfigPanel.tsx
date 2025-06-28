
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

  // Load settings on mount
  useEffect(() => {
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

  // Apply settings immediately when they change
  useEffect(() => {
    try {
      localStorage.setItem("aiAgentSettings", JSON.stringify(settings));
      
      // Apply accent color to CSS custom properties
      const root = document.documentElement;
      root.style.setProperty("--primary", `${hexToHsl(settings.accentColor)}`);
      
      // Apply other settings for global access
      root.setAttribute("data-auto-scroll", settings.autoScroll.toString());
      root.setAttribute("data-show-timestamps", settings.showTimestamps.toString());
      root.setAttribute("data-max-messages", settings.maxMessages);
      
      // Dispatch custom event for chat component to listen to
      window.dispatchEvent(new CustomEvent('settingsChanged', { 
        detail: settings 
      }));
    } catch (error) {
      console.error("Failed to apply settings:", error);
    }
  }, [settings]);

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
    document.documentElement.style.removeProperty("--primary");
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
    });
  };

  return (
    <Card className="h-full flex flex-col bg-card border-border">
      <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0 bg-card">
        <h3 className="text-lg font-semibold text-card-foreground">Configuration</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-muted">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Server Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="server-url" className="text-sm font-medium text-foreground">
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
                className="flex-1 bg-background border-border text-foreground"
              />
              <Button 
                onClick={() => testConnection()} 
                size="sm" 
                variant="outline"
                disabled={isConnecting}
                className="border-border hover:bg-muted"
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
            <h4 className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Palette className="w-4 h-4" />
              Appearance
            </h4>

            <div className="space-y-2">
              <Label htmlFor="accent-color" className="text-sm text-foreground">
                Accent Color
              </Label>
              <div className="flex gap-2">
                <Input
                  id="accent-color"
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => updateSetting('accentColor', e.target.value)}
                  className="w-16 h-10 p-1 rounded cursor-pointer border-border"
                />
                <Input
                  value={settings.accentColor}
                  onChange={(e) => updateSetting('accentColor', e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1 bg-background border-border text-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Choose your preferred accent color for the interface
              </p>
            </div>
          </div>

          {/* Chat Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Chat Settings</h4>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
              <div>
                <Label htmlFor="auto-scroll" className="text-sm text-foreground">
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

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
              <div>
                <Label htmlFor="show-timestamps" className="text-sm text-foreground">
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
              <Label htmlFor="max-messages" className="text-sm text-foreground">
                Max messages to keep
              </Label>
              <Input
                id="max-messages"
                type="number"
                value={settings.maxMessages}
                onChange={(e) => updateSetting('maxMessages', e.target.value)}
                min="10"
                max="1000"
                className="w-full bg-background border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of messages to keep in chat history
              </p>
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-border">
            <Button 
              onClick={resetSettings} 
              variant="outline" 
              className="w-full border-border hover:bg-muted text-foreground"
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};
