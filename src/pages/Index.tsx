
import { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { ToolResults } from '@/components/ToolResults';
import { StatusBar } from '@/components/StatusBar';
import { ConfigPanel } from '@/components/ConfigPanel';
import { ChatHistoryPanel } from '@/components/ChatHistoryPanel';
import { MobileMenuDrawer } from '@/components/MobileMenuDrawer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Settings, Bot, History, Plus, Wrench } from 'lucide-react';
import { chatStorage, ChatHistory } from '@/utils/chatStorage';
import { useToast } from '@/hooks/use-toast';

type SidebarPanel = 'history' | 'config' | 'tools' | null;

const Index = () => {
  const [activeSidebarPanel, setActiveSidebarPanel] = useState<SidebarPanel>(null);
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
    setActiveSidebarPanel(null);
  };

  const handleChatUpdate = (chat: ChatHistory) => {
    setCurrentChat(chat);
  };

  const handleSidebarToggle = (panel: SidebarPanel) => {
    setActiveSidebarPanel(activeSidebarPanel === panel ? null : panel);
  };

  const renderSidebarContent = () => {
    switch (activeSidebarPanel) {
      case 'history':
        return (
          <ChatHistoryPanel
            onClose={() => setActiveSidebarPanel(null)}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            currentChatId={currentChatId}
          />
        );
      case 'config':
        return <ConfigPanel onClose={() => setActiveSidebarPanel(null)} />;
      case 'tools':
        return <ToolResults />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card flex-shrink-0 z-50">
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
                  className="gap-2 border-border bg-background text-foreground hover:bg-muted"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </Button>
                <Button
                  variant={activeSidebarPanel === 'history' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSidebarToggle('history')}
                  className="gap-2 border-border bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <History className="w-4 h-4" />
                  History
                </Button>
                <Button
                  variant={activeSidebarPanel === 'tools' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSidebarToggle('tools')}
                  className="gap-2 border-border bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <Wrench className="w-4 h-4" />
                  Tools
                </Button>
                <Button
                  variant={activeSidebarPanel === 'config' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSidebarToggle('config')}
                  className="gap-2 border-border bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </div>

              {/* Mobile/Tablet Controls */}
              <div className="lg:hidden">
                <MobileMenuDrawer
                  onSelectChat={handleSelectChat}
                  onNewChat={handleNewChat}
                  currentChatId={currentChatId}
                />
              </div>
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
          {activeSidebarPanel && (
            <div className="hidden lg:flex flex-col w-80 h-full overflow-hidden">
              {renderSidebarContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
