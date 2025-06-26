import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Server, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConfigPanelProps {
  onClose: () => void;
}

export const ConfigPanel = ({ onClose }: ConfigPanelProps) => {
  const [serverUrl, setServerUrl] = useState('http://localhost:8000');
  const [isConnected, setIsConnected] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [maxMessages, setMaxMessages] = useState('100');
  const { toast } = useToast();

  const testConnection = async () => {
    try {
      const response = await fetch(`${serverUrl}/health`, {
        method: 'GET',
      });
      
      if (response.ok) {
        setIsConnected(true);
        toast({
          title: "Connection Successful",
          description: "Successfully connected to the AI agent server.",
        });
      } else {
        throw new Error('Server responded with error');
      }
    } catch (error) {
      setIsConnected(false);
      toast({
        title: "Connection Failed",
        description: "Could not connect to the AI agent server. Make sure it's running.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
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
              {isConnected ? (
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
            <Button onClick={testConnection} size="sm" variant="outline">
              <Server className="w-4 h-4 mr-1" />
              Test
            </Button>
          </div>
          
          <p className="text-xs text-gray-600">
            URL of your local Python AI agent server. Make sure it has endpoints for /chat and /health.
          </p>
        </div>

        {/* Chat Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Chat Settings</h4>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-scroll" className="text-sm">Auto-scroll</Label>
              <p className="text-xs text-gray-600">Automatically scroll to latest message</p>
            </div>
            <Switch
              id="auto-scroll"
              checked={autoScroll}
              onCheckedChange={setAutoScroll}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-timestamps" className="text-sm">Show timestamps</Label>
              <p className="text-xs text-gray-600">Display message timestamps</p>
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
            <p className="text-xs text-gray-600">
              Maximum number of messages to keep in chat history
            </p>
          </div>
        </div>

        {/* Available Tools */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Available Tools</h4>
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
          <p className="text-xs text-gray-600">
            These tools will be available when your Python agent is connected
          </p>
        </div>
      </div>
    </Card>
  );
};
