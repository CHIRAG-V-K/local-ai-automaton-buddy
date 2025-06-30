import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageSquare, Trash2, X } from "lucide-react";
import { chatStorage, ChatHistory } from "@/utils/chatStorage";
import { useToast } from "@/hooks/use-toast";

interface ChatHistoryPanelProps {
  onClose: () => void;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  currentChatId?: string;
}

export const ChatHistoryPanel = ({
  onClose,
  onSelectChat,
  onNewChat,
  currentChatId,
}: ChatHistoryPanelProps) => {
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const chatHistory = await chatStorage.getChats();
      setChats(chatHistory);
    } catch (error) {
      console.error("Failed to load chats:", error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await chatStorage.deleteChat(chatId);
      setChats(chats.filter((chat) => chat.id !== chatId));
      toast({
        title: "Chat Deleted",
        description: "Chat history has been deleted",
      });
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours =
      (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      return new Date(date).toLocaleDateString([], { weekday: "short" });
    } else {
      return new Date(date).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <Card className="glass-strong h-full flex flex-col">
      <div className="p-4 border-b border-border/10 flex items-center justify-between flex-shrink-0">
        <h3 className="text-lg font-semibold text-foreground">Chat History</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 flex-1 flex flex-col min-h-0">
        <Button
          onClick={onNewChat}
          className="w-full mb-4 gap-2 glass hover:bg-primary/20"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>

        <ScrollArea className="flex-1 -mx-2">
          <div className="px-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading chat history...
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No chat history yet
              </div>
            ) : (
              <div className="space-y-2">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`w-full p-3 rounded-lg glass cursor-pointer hover:bg-accent/20 transition-all duration-200 ${
                      currentChatId === chat.id
                        ? "bg-primary/20 border border-primary/30"
                        : ""
                    }`}
                    onClick={() => onSelectChat(chat.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate mb-1">
                          {chat.name.length > 25
                            ? chat.name.slice(0, 25) + "..."
                            : chat.name}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <Badge
                            variant="secondary"
                            className="text-xs glass bg-accent/10"
                          >
                            {chat.messages.length}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatDate(chat.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};
