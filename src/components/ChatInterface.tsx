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

  useEffect(() => {
    loadChatHistory();
    dispatch(setCurrentChatId(chatId));
  }, [chatId]);

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
          timestamp: new Date().toISOString(),
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
      timestamp: new Date().toISOString(),
    };

    dispatch(addMessage(userMessage));
    const currentInput = input;
    setInput("");
    dispatch(clearUploadedFiles());
    dispatch(setLoading(true));
    onStatusChange("thinking");

    try {
      const contextMessages = messages.slice(-10);
      
      const formData = new FormData();
      formData.append('message', currentInput);
      formData.append('context', JSON.stringify(contextMessages));
      formData.append('stream', 'true');
      
      uploadedFiles.forEach((uploadedFile, index) => {
        formData.append('files', uploadedFile.file);
      });

      const response = await fetch(`${settings.serverUrl}/chat`, {
        method: "POST",
        body: formData,
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
        timestamp: new Date().toISOString(),
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
        content: `I understand you want me to: "${currentInput}". Currently, I'm not connected to the local Python agent. Please make sure your Python agent is running on ${settings.serverUrl} with a /chat endpoint.`,
        timestamp: new Date().toISOString(),
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
    <div className="flex flex-col h-full">
      {/* Chat Messages - Takes remaining space */}
      <div className="flex-1 min-h-0 mb-2 sm:mb-4">
        <Card className="h-full flex flex-col glass-strong shadow-lg">
          <div className="p-3 sm:p-4 glass flex-shrink-0">
            <h2 className="text-base sm:text-lg font-medium text-card-foreground">Chat</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">AI Assistant</p>
          </div>

          <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 pb-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-2 sm:gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] p-2 sm:p-3 rounded-2xl glass transition-all duration-200 ${
                      message.role === "user"
                        ? "bg-primary/20 text-foreground ml-4 sm:ml-8"
                        : "bg-card/60 text-foreground mr-4 sm:mr-8"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user" 
                          ? "bg-primary/30 text-primary" 
                          : "bg-accent/30 text-accent-foreground"
                      }`}>
                        {message.role === "user" ? (
                          <User className="w-2 h-2 sm:w-3 sm:h-3" />
                        ) : (
                          <Bot className="w-2 h-2 sm:w-3 sm:h-3" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs sm:text-sm">
                          <MessageContent content={message.content} />
                        </div>
                        {message.toolUsed && (
                          <div className="mt-2 px-2 py-1 bg-accent/20 rounded-md text-xs text-accent-foreground">
                            🔧 {message.toolUsed}
                          </div>
                        )}
                        {settings.showTimestamps && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="glass bg-card/60 p-2 sm:p-3 rounded-2xl mr-4 sm:mr-8">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent/30 text-accent-foreground flex items-center justify-center">
                        <Bot className="w-2 h-2 sm:w-3 sm:h-3" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        <span className="text-xs sm:text-sm text-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* File Upload Preview - Fixed positioning above input */}
      {uploadedFiles.length > 0 && (
        <div className="p-2 sm:p-3 glass rounded-xl mb-2 flex-shrink-0">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file) => (
              <div 
                key={file.id}
                className="flex items-center gap-2 p-2 glass rounded-lg bg-accent/10"
              >
                {file.type === 'image' && file.preview && (
                  <img 
                    src={file.preview} 
                    alt={file.file.name}
                    className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded"
                  />
                )}
                {file.type === 'video' && file.preview && (
                  <video 
                    src={file.preview}
                    className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded"
                  />
                )}
                {file.type === 'file' && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/20 rounded flex items-center justify-center">
                    <File className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  </div>
                )}
                <span className="text-xs sm:text-sm text-foreground truncate max-w-16 sm:max-w-24">
                  {file.file.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="h-4 w-4 sm:h-5 sm:w-5 p-0 hover:bg-destructive/20 hover:text-destructive rounded-full"
                >
                  <X className="w-2 h-2" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Section - Fixed at bottom */}
      <div className="flex-shrink-0">
        <div className="p-2 sm:p-3 glass rounded-xl bg-background/95 backdrop-blur-md border border-border/20">
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
              className="btn-glass flex-shrink-0"
            >
              <Paperclip className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 glass focus:shadow-md transition-all duration-200 text-sm sm:text-base"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && uploadedFiles.length === 0)}
              size="sm"
              className="btn-glass bg-primary/20 text-primary-foreground hover:bg-primary/30 flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
