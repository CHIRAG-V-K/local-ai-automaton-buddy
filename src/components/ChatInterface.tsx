import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, User, Bot, Paperclip, X, Image, Video, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { chatStorage, ChatMessage, ChatHistory } from "@/utils/chatStorage";
import { MessageContent } from "./MessageContent";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { 
  setMessages, 
  addMessage, 
  updateMessage, 
  setLoading, 
  setCurrentChatId,
  addUploadedFile,
  removeUploadedFile,
  clearUploadedFiles
} from "@/store/chatSlice";
import { motion, AnimatePresence } from "framer-motion";

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
  const { messages, isLoading, uploadedFiles } = useAppSelector(state => state.chat);
  const settings = useAppSelector(state => state.settings);
  const dispatch = useAppDispatch();
  
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load chat history on mount or when chatId changes
  useEffect(() => {
    loadChatHistory();
    dispatch(setCurrentChatId(chatId));
  }, [chatId]);

  // Auto-scroll when messages change (only if auto-scroll is enabled)
  useEffect(() => {
    if (settings.autoScroll && messagesEndRef.current && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, settings.autoScroll]);

  const loadChatHistory = async () => {
    try {
      const chat = await chatStorage.getChatById(chatId);
      if (chat) {
        dispatch(setMessages(chat.messages));
      } else {
        const welcomeMessage: ChatMessage = {
          id: "1",
          role: "assistant",
          content: "Hello! I'm your AI agent. I can help you with various tasks. What would you like me to do?",
          timestamp: new Date(),
        };
        dispatch(setMessages([welcomeMessage]));
        await saveChatHistory([welcomeMessage]);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const saveChatHistory = async (updatedMessages: ChatMessage[]) => {
    try {
      const maxMessages = parseInt(settings.maxMessages) || 100;
      const trimmedMessages = updatedMessages.slice(-maxMessages);
      
      const chat: ChatHistory = {
        id: chatId,
        name: trimmedMessages.length > 1 
          ? trimmedMessages[1].content.slice(0, 50) + "..." 
          : "New Chat",
        messages: trimmedMessages,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await chatStorage.saveChat(chat);
      onChatUpdate(chat);
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      let fileType: 'image' | 'video' | 'file' = 'file';
      
      if (file.type.startsWith('image/')) {
        fileType = 'image';
      } else if (file.type.startsWith('video/')) {
        fileType = 'video';
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const uploadedFile = {
          id: fileId,
          file,
          preview: e.target?.result as string,
          type: fileType,
        };
        
        dispatch(addUploadedFile(uploadedFile));
      };
      
      if (fileType === 'image' || fileType === 'video') {
        reader.readAsDataURL(file);
      } else {
        const uploadedFile = {
          id: fileId,
          file,
          preview: '',
          type: 'file',
        };
        dispatch(addUploadedFile(uploadedFile));
      }
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    dispatch(removeUploadedFile(fileId));
  };

  const handleSend = async () => {
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    dispatch(addMessage(userMessage));
    setInput("");
    dispatch(clearUploadedFiles());
    dispatch(setLoading(true));
    onStatusChange("thinking");

    try {
      // Prepare conversation context (last 10 messages for context)
      const contextMessages = messages.slice(-10);
      
      const response = await fetch(`${settings.serverUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          conversation_id: chatId,
          stream: true,
          files: uploadedFiles.map(f => ({ 
            name: f.file.name, 
            type: f.file.type,
            size: f.file.size,
            preview: f.preview 
          })),
          context: contextMessages,
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

      dispatch(addMessage(assistantMessage));

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

          dispatch(updateMessage({ id: assistantId, content: assistantContent, toolUsed }));
        }
      }

      await saveChatHistory([...messages, userMessage, { ...assistantMessage, content: assistantContent, toolUsed }]);

      if (toolUsed) {
        onToolUsed(toolUsed);
      }
      onStatusChange("idle");
    } catch (error) {
      console.error("Error:", error);

      const mockResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you want me to: "${input}". Currently, I'm not connected to the local Python agent. Please make sure your Python agent is running on ${settings.serverUrl} with a /chat endpoint.`,
        timestamp: new Date(),
      };

      dispatch(addMessage(mockResponse));
      await saveChatHistory([...messages, userMessage, mockResponse]);
      onStatusChange("idle");

      toast({
        title: "Connection Error",
        description: "Could not connect to local Python agent. Make sure it's running.",
        variant: "destructive",
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getFileIcon = (type: string) => {
    if (type === 'image') return <Image className="w-4 h-4" />;
    if (type === 'video') return <Video className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <motion.div 
      className="flex flex-col h-full max-h-[calc(100vh-200px)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="flex-1 flex flex-col glass-strong border-border/50 shadow-xl min-h-0">
        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card/50 glass">
          <h2 className="text-lg font-semibold text-card-foreground">Chat with AI Agent</h2>
        </div>

        <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg glass border border-border/50 transition-all duration-200 hover:scale-[1.02] ${
                      message.role === "user"
                        ? "bg-primary/10 text-primary-foreground ml-12"
                        : "bg-muted/50 text-muted-foreground mr-12"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === "user" ? (
                        <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Bot className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm">
                          <MessageContent content={message.content} />
                        </div>
                        {message.toolUsed && (
                          <p className="text-xs opacity-75 mt-1">
                            Used tool: {message.toolUsed}
                          </p>
                        )}
                        {settings.showTimestamps && (
                          <p className="text-xs opacity-75 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-start"
              >
                <div className="glass bg-muted/50 text-muted-foreground p-3 rounded-lg mr-12 border border-border/50">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </Card>

      {/* File Upload Preview */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b border-border/50 glass"
          >
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <motion.div 
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-center gap-2 p-2 glass rounded-lg border border-border/50"
                >
                  {file.type === 'image' && file.preview && (
                    <img 
                      src={file.preview} 
                      alt={file.file.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                  {file.type === 'video' && file.preview && (
                    <video 
                      src={file.preview}
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                  {file.type === 'file' && getFileIcon(file.type)}
                  <span className="text-xs text-muted-foreground truncate max-w-20">
                    {file.file.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="h-4 w-4 p-0 hover:bg-destructive/20 hover:text-destructive hover:scale-110 transition-all duration-200"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Section */}
      <div className="p-4 glass border-t border-border/50">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="btn-glass hover:scale-110 transition-all duration-200"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything or upload files..."
            className="flex-1 glass border-border/50 focus:border-primary/50 transition-all duration-200"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && uploadedFiles.length === 0)}
            size="sm"
            className="btn-glass hover:scale-110 transition-all duration-200"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
