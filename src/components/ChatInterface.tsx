
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, User, Bot, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { chatStorage, ChatMessage, ChatHistory } from "@/utils/chatStorage";

interface ChatInterfaceProps {
  onStatusChange: (status: "idle" | "thinking" | "working") => void;
  onToolUsed: (tool: string) => void;
  chatId: string;
  onChatUpdate: (chat: ChatHistory) => void;
}

export const ChatInterface = ({
  onStatusChange,
  onToolUsed,
  chatId,
  onChatUpdate,
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load chat history on mount or when chatId changes
  useEffect(() => {
    loadChatHistory();
  }, [chatId]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  const loadChatHistory = async () => {
    try {
      const chat = await chatStorage.getChatById(chatId);
      if (chat) {
        setMessages(chat.messages);
      } else {
        // Create new chat with welcome message
        const welcomeMessage: ChatMessage = {
          id: "1",
          role: "assistant",
          content: "Hello! I'm your AI agent. I can help you with scheduling meetings, searching Wikipedia, web searches, and more. What would you like me to do?",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
        await saveChatHistory([welcomeMessage]);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const saveChatHistory = async (updatedMessages: ChatMessage[]) => {
    try {
      const chat: ChatHistory = {
        id: chatId,
        name: updatedMessages.length > 1 
          ? updatedMessages[1].content.slice(0, 50) + "..." 
          : "New Chat",
        messages: updatedMessages,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await chatStorage.saveChat(chat);
      onChatUpdate(chat);
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    onStatusChange("thinking");

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          conversation_id: chatId,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to local agent");
      }

      const assistantId = (Date.now() + 1).toString();
      let assistantContent = "";
      let toolUsed: string | undefined = undefined;

      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      const messagesWithAssistant = [...updatedMessages, assistantMessage];
      setMessages(messagesWithAssistant);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          try {
            const lines = chunk.split("\n").filter(Boolean);
            for (const line of lines) {
              const data = JSON.parse(line);
              if (data.response !== undefined) {
                assistantContent += data.response;
              }
              if (data.tool_used !== undefined) {
                toolUsed = data.tool_used;
              }
            }
          } catch {
            assistantContent += chunk;
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: assistantContent, toolUsed }
                : msg
            )
          );
        }
      }

      const finalMessages = messagesWithAssistant.map((msg) =>
        msg.id === assistantId
          ? { ...msg, content: assistantContent, toolUsed }
          : msg
      );

      await saveChatHistory(finalMessages);

      if (toolUsed) {
        onToolUsed(toolUsed);
      }
      onStatusChange("idle");
    } catch (error) {
      console.error("Error:", error);

      const mockResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you want me to: "${input}". Currently, I'm not connected to the local Python agent. Please make sure your Python agent is running on http://localhost:8000 with a /chat endpoint.`,
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, mockResponse];
      setMessages(finalMessages);
      await saveChatHistory(finalMessages);
      onStatusChange("idle");

      toast({
        title: "Connection Error",
        description: "Could not connect to local Python agent. Make sure it's running on port 8000.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col bg-background/50 backdrop-blur-sm min-h-0">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chat with AI Agent</h2>
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
          </div>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", message.content);
                }}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg transition-colors ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-12"
                      : "bg-muted mr-12"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.role === "user" ? (
                      <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Bot className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.toolUsed && (
                        <p className="text-xs opacity-75 mt-1">
                          Used tool: {message.toolUsed}
                        </p>
                      )}
                      <p className="text-xs opacity-75 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg mr-12">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </Card>

      {/* Sticky Input Section */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to schedule a meeting, search Wikipedia, or anything else..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
