
import { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { ToolResults } from '@/components/ToolResults';
import { StatusBar } from '@/components/StatusBar';
import { ConfigPanel } from '@/components/ConfigPanel';
import { ChatHistoryPanel } from '@/components/ChatHistoryPanel';
import { MobileMenuDrawer } from '@/components/MobileMenuDrawer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Settings, Bot, History, Plus } from 'lucide-react';
import { chatStorage, ChatHistory } from '@/utils/chatStorage';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [showConfig, setShowConfig] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'idle' | 'thinking' | 'working'>('idle');
  const [lastToolUsed, setLastToolUsed] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [currentChat, setCurrentChat] = useState<ChatHistory | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with a new chat on first load
    const chatId = chatStorage.generateChatId();
    setCurrentChatId(chatId);
  }, []);

  const handleNewChat = () => {
    const chatId = chatStorage.generateChatId();
    setCurrentChatId(chatId);
    setCurrentChat(null);
    toast({
      title: "New Chat",
      description: "Started a new conversation",
    });
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setShowHistory(false);
  };

  const handleChatUpdate = (chat: ChatHistory) => {
    setCurrentChat(chat);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background to-muted/20 overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AI Agent Dashboard</h1>
                <p className="text-sm text-muted-foreground">Local LLM-powered assistant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              {/* Desktop Controls */}
              <div className="hidden lg:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewChat}
                  className="gap-2 border-border bg-background text-foreground hover:bg-accent"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="gap-2 border-border bg-background text-foreground hover:bg-accent"
                >
                  <History className="w-4 h-4" />
                  History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfig(!showConfig)}
                  className="gap-2 border-border bg-background text-foreground hover:bg-accent"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </div>

              {/* Mobile Controls */}
              <MobileMenuDrawer
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                currentChatId={currentChatId}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="container mx-auto px-4 py-6 flex gap-6 h-full overflow-hidden">
          {/* Chat Interface - Main Column */}
          <div className="flex-1 flex flex-col space-y-6 min-w-0 overflow-hidden">
            <StatusBar 
              status={agentStatus} 
              lastToolUsed={lastToolUsed}
            />
            {currentChatId && (
              <ChatInterface 
                onStatusChange={setAgentStatus}
                onToolUsed={setLastToolUsed}
                chatId={currentChatId}
                onChatUpdate={handleChatUpdate}
              />
            )}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:flex flex-col gap-6 w-80 overflow-hidden">
            {showHistory && (
              <div className="flex-1 min-h-0">
                <ChatHistoryPanel
                  onClose={() => setShowHistory(false)}
                  onSelectChat={handleSelectChat}
                  onNewChat={handleNewChat}
                  currentChatId={currentChatId}
                />
              </div>
            )}
            {showConfig && (
              <div className="flex-1 min-h-0">
                <ConfigPanel onClose={() => setShowConfig(false)} />
              </div>
            )}
            <div className="flex-1 min-h-0">
              <ToolResults />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
