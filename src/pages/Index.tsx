
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Agent Dashboard</h1>
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
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="gap-2"
                >
                  <History className="w-4 h-4" />
                  History
                </Button>
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
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
          {/* Chat Interface - Main Column */}
          <div className="lg:col-span-3 flex flex-col space-y-6">
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
          <div className="hidden lg:block space-y-6">
            {showHistory && (
              <ChatHistoryPanel
                onClose={() => setShowHistory(false)}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                currentChatId={currentChatId}
              />
            )}
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
