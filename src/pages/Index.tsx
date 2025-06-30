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
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      {/* Header */}
      <div className="glass shadow-sm flex-shrink-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded-lg">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">AI Agent</h1>
                <p className="text-xs text-muted-foreground">Local Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              {/* Desktop Controls */}
              <div className="hidden lg:flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewChat}
                  className="btn-glass gap-2 text-xs"
                >
                  <Plus className="w-3 h-3" />
                  New
                </Button>
                <Button
                  variant={activeSidebarPanel === 'history' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSidebarToggle('history')}
                  className="btn-glass gap-2 text-xs"
                >
                  <History className="w-3 h-3" />
                  History
                </Button>
                <Button
                  variant={activeSidebarPanel === 'tools' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSidebarToggle('tools')}
                  className="btn-glass gap-2 text-xs"
                >
                  <Wrench className="w-3 h-3" />
                  Tools
                </Button>
                <Button
                  variant={activeSidebarPanel === 'config' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSidebarToggle('config')}
                  className="btn-glass gap-2 text-xs"
                >
                  <Settings className="w-3 h-3" />
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
        <div className="container mx-auto px-4 py-4 flex gap-4 h-full overflow-hidden">
          {/* Chat Interface - Main Column */}
          <div className="flex-1 flex flex-col space-y-4 min-w-0 overflow-hidden">
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
