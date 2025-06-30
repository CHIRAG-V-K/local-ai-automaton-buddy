
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Server, Wifi, WifiOff, Palette, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAutoConnect } from "@/hooks/useAutoConnect";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { updateSetting, resetSettings } from "@/store/settingsSlice";
import { motion } from "framer-motion";

interface ConfigPanelProps {
  onClose: () => void;
}

export const ConfigPanel = ({ onClose }: ConfigPanelProps) => {
  const settings = useAppSelector(state => state.settings);
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { isConnected, isConnecting, testConnection } = useAutoConnect(settings.serverUrl);

  const handleUpdateSetting = (key: string, value: any) => {
    dispatch(updateSetting({ key: key as any, value }));
    toast({
      title: "Setting Updated",
      description: `${key} has been updated successfully.`,
    });
  };

  const handleResetSettings = () => {
    dispatch(resetSettings());
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
    });
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className="h-full flex flex-col glass-strong border-border/50 shadow-xl">
        <div className="p-4 border-b border-border/50 flex items-center justify-between flex-shrink-0 glass">
          <h3 className="text-lg font-semibold text-card-foreground">Configuration</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="hover:bg-muted/50 hover:scale-110 transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Server Configuration */}
            <motion.div 
              className="space-y-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <Label htmlFor="server-url" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  Python Agent Server
                </Label>
                <Badge
                  variant={isConnected ? "default" : "secondary"}
                  className="text-xs glass"
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
                  onChange={(e) => handleUpdateSetting('serverUrl', e.target.value)}
                  placeholder="http://localhost:8000"
                  className="flex-1 glass border-border/50 focus:border-primary/50 transition-all duration-200"
                />
                <Button 
                  onClick={() => testConnection()} 
                  size="sm" 
                  variant="outline"
                  disabled={isConnecting}
                  className="btn-glass"
                >
                  <Server className="w-4 h-4 mr-1" />
                  Test
                </Button>
              </div>
            </motion.div>

            {/* Appearance Settings */}
            <motion.div 
              className="space-y-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
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
                    onChange={(e) => handleUpdateSetting('accentColor', e.target.value)}
                    className="w-16 h-10 p-1 rounded cursor-pointer border-border/50 glass"
                  />
                  <Input
                    value={settings.accentColor}
                    onChange={(e) => handleUpdateSetting('accentColor', e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1 glass border-border/50 focus:border-primary/50 transition-all duration-200"
                  />
                </div>
              </div>
            </motion.div>

            {/* Chat Settings */}
            <motion.div 
              className="space-y-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="text-sm font-medium text-foreground">Chat Settings</h4>

              <div className="flex items-center justify-between p-3 rounded-lg glass border border-border/50">
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
                  onCheckedChange={(checked) => handleUpdateSetting('autoScroll', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg glass border border-border/50">
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
                  onCheckedChange={(checked) => handleUpdateSetting('showTimestamps', checked)}
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
                  onChange={(e) => handleUpdateSetting('maxMessages', e.target.value)}
                  min="10"
                  max="1000"
                  className="w-full glass border-border/50 focus:border-primary/50 transition-all duration-200"
                />
              </div>
            </motion.div>

            {/* Reset Button */}
            <motion.div 
              className="pt-4 border-t border-border/50"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                onClick={handleResetSettings} 
                variant="outline" 
                className="w-full btn-glass hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
            </motion.div>
          </div>
        </ScrollArea>
      </Card>
    </motion.div>
  );
};
