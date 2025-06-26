
import { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { ToolResults } from '@/components/ToolResults';
import { StatusBar } from '@/components/StatusBar';
import { ConfigPanel } from '@/components/ConfigPanel';
import { Button } from '@/components/ui/button';
import { Settings, Bot, Zap } from 'lucide-react';

const Index = () => {
  const [showConfig, setShowConfig] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'idle' | 'thinking' | 'working'>('idle');
  const [lastToolUsed, setLastToolUsed] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Agent Dashboard</h1>
                <p className="text-sm text-gray-600">Local LLM-powered assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfig(!showConfig)}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface - Main Column */}
          <div className="lg:col-span-3 space-y-6">
            <StatusBar 
              status={agentStatus} 
              lastToolUsed={lastToolUsed}
            />
            <ChatInterface 
              onStatusChange={setAgentStatus}
              onToolUsed={setLastToolUsed}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {showConfig && (
              <ConfigPanel onClose={() => setShowConfig(false)} />
            )}
            <ToolResults />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
