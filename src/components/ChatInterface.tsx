import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, User, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolUsed?: string;
}

interface ChatInterfaceProps {
  onStatusChange: (status: "idle" | "thinking" | "working") => void;
  onToolUsed: (tool: string) => void;
}

export const ChatInterface = ({
  onStatusChange,
  onToolUsed,
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI agent. I can help you with scheduling meetings, searching Wikipedia, web searches, and more. What would you like me to do?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
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
          conversation_id: "default",
          stream: true, // Optional: let backend know you want a stream
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to local agent");
      }

      // Create a new assistant message and add it to state
      const assistantId = (Date.now() + 1).toString();
      let assistantContent = "";
      let toolUsed: string | undefined = undefined;

      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          // If your backend sends JSON lines, parse each line
          // Otherwise, just append the chunk
          try {
            // Try to parse as JSON line (if backend sends JSON per chunk)
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
            // If not JSON, treat as plain text
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

      if (toolUsed) {
        onToolUsed(toolUsed);
      }
      onStatusChange("idle");
    } catch (error) {
      console.error("Error:", error);

      const mockResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you want me to: "${input}". Currently, I'm not connected to the local Python agent. Please make sure your Python agent is running on http://localhost:8000 with a /chat endpoint.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, mockResponse]);
      onStatusChange("idle");

      toast({
        title: "Connection Error",
        description:
          "Could not connect to local Python agent. Make sure it's running on port 8000.",
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
    <Card className="flex flex-col h-[600px] bg-white/50 backdrop-blur-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          Chat with AI Agent
        </h2>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white ml-12"
                    : "bg-gray-100 text-gray-900 mr-12"
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.role === "user" ? (
                    <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Bot className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
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
              <div className="bg-gray-100 text-gray-900 p-3 rounded-lg mr-12">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
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
    </Card>
  );
};
