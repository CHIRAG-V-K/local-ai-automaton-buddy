
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ConfigPanel } from "./ConfigPanel";
import { ToolResults } from "./ToolResults";
import { ChatHistoryPanel } from "./ChatHistoryPanel";
import { Menu, Settings, History, Wrench } from "lucide-react";

interface MobileMenuDrawerProps {
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  currentChatId?: string;
}

export const MobileMenuDrawer = ({
  onSelectChat,
  onNewChat,
  currentChatId,
}: MobileMenuDrawerProps) => {
  const [activePanel, setActivePanel] = useState<"config" | "tools" | "history" | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handlePanelSelect = (panel: "config" | "tools" | "history") => {
    setActivePanel(panel);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setActivePanel(null);
  };

  const renderContent = () => {
    switch (activePanel) {
      case "config":
        return <ConfigPanel onClose={handleClose} />;
      case "tools":
        return <ToolResults />;
      case "history":
        return (
          <ChatHistoryPanel
            onClose={handleClose}
            onSelectChat={(chatId) => {
              onSelectChat(chatId);
              handleClose();
            }}
            onNewChat={() => {
              onNewChat();
              handleClose();
            }}
            currentChatId={currentChatId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="lg:hidden">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePanelSelect("history")}
          className="gap-2"
        >
          <History className="w-4 h-4" />
          History
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePanelSelect("config")}
          className="gap-2"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePanelSelect("tools")}
          className="gap-2"
        >
          <Wrench className="w-4 h-4" />
          Tools
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          {renderContent()}
        </SheetContent>
      </Sheet>
    </div>
  );
};
