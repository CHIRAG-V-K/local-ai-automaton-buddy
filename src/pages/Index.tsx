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
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-border/50 glass-strong flex-shrink-0 z-50 shadow-lg"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-lg">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AI Agent Dashboard</h1>
                <p className="text-sm text-muted-foreground">Local LLM-powered assistant</p>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              {/* Desktop Controls */}
              <div className="hidden lg:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewChat}
                  className="btn-glass gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </Button>
                <Button
                  variant={activeSidebarPanel === 'history' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSidebarToggle('history')}
                  className="btn-glass gap-2"
                >
                  <History className="w-4 h-4" />
                  History
                </Button>
                <Button
                  variant={activeSidebarPanel === 'tools' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSidebarToggle('tools')}
                  className="btn-glass gap-2"
                >
                  <Wrench className="w-4 h-4" />
                  Tools
                </Button>
                <Button
                  variant={activeSidebarPanel === 'config' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSidebarToggle('config')}
                  className="btn-glass gap-2"
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
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="container mx-auto px-4 py-6 flex gap-6 h-full overflow-hidden">
          {/* Chat Interface - Main Column */}
          <motion.div 
            className="flex-1 flex flex-col space-y-6 min-w-0 overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>

          {/* Desktop Sidebar */}
          <AnimatePresence>
            {activeSidebarPanel && (
              <div className="hidden lg:flex flex-col w-80 h-full overflow-hidden">
                {renderSidebarContent()}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Index;
