
import { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { ToolResults } from '@/components/ToolResults';
import { StatusBar } from '@/components/StatusBar';
import { ConfigPanel } from '@/components/ConfigPanel';
import { ChatHistoryPanel } from '@/components/ChatHistoryPanel';
import { MobileMenuDrawer } from '@/components/MobileMenuDrawer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Settings, Bot, History, Plus, Wrench, Menu } from 'lucide-react';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
    setShowMobileMenu(false);
    toast({
      title: "New Chat",
      description: "Started a new conversation",
    });
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setActiveSidebarPanel(null);
    setShowMobileMenu(false);
  };

  const handleChatUpdate = (chat: ChatHistory) => {
    setCurrentChat(chat);
  };

  const handleSidebarToggle = (panel: SidebarPanel) => {
    setActiveSidebarPanel(activeSidebarPanel === panel ? null : panel);
    setShowMobileMenu(false);
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
        <div className="container mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded-lg">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">AI Agent</h1>
                <p className="text-xs text-muted-foreground">Local Assistant</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-semibold text-foreground">AI Agent</h1>
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

              {/* Mobile Hamburger Menu */}
              <div className="lg:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="btn-glass"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden mt-3 pt-3 border-t border-border/20"
              >
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewChat}
                    className="btn-glass gap-2 text-xs w-full"
                  >
                    <Plus className="w-3 h-3" />
                    New Chat
                  </Button>
                  <Button
                    variant={activeSidebarPanel === 'history' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSidebarToggle('history')}
                    className="btn-glass gap-2 text-xs w-full"
                  >
                    <History className="w-3 h-3" />
                    History
                  </Button>
                  <Button
                    variant={activeSidebarPanel === 'tools' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSidebarToggle('tools')}
                    className="btn-glass gap-2 text-xs w-full"
                  >
                    <Wrench className="w-3 h-3" />
                    Tools
                  </Button>
                  <Button
                    variant={activeSidebarPanel === 'config' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSidebarToggle('config')}
                    className="btn-glass gap-2 text-xs w-full"
                  >
                    <Settings className="w-3 h-3" />
                    Settings
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4 flex gap-2 sm:gap-4 h-full overflow-hidden">
          {/* Chat Interface - Main Column */}
          <div className="flex-1 flex flex-col space-y-2 sm:space-y-4 min-w-0 overflow-hidden">
            {/* Status Bar - Hidden on mobile to save space */}
            <div className="hidden sm:block">
              <StatusBar 
                status={agentStatus} 
                lastToolUsed={lastToolUsed}
              />
            </div>
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

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {activeSidebarPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setActiveSidebarPanel(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 h-full w-full max-w-sm bg-background/95 backdrop-blur-md border-l border-border/20 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {renderSidebarContent()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
