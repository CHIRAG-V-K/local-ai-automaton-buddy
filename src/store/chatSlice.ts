
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // Changed from Date to string for serialization
  toolUsed?: string;
  files?: Array<{ name: string; type: string; preview?: string }>;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  currentChatId: string;
  uploadedFiles: Array<{
    id: string;
    file: File;
    preview: string;
    type: 'image' | 'video' | 'file';
  }>;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  currentChatId: '',
  uploadedFiles: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    updateMessage: (state, action: PayloadAction<{ id: string; content: string; toolUsed?: string }>) => {
      const { id, content, toolUsed } = action.payload;
      const message = state.messages.find(msg => msg.id === id);
      if (message) {
        message.content = content;
        if (toolUsed) message.toolUsed = toolUsed;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCurrentChatId: (state, action: PayloadAction<string>) => {
      state.currentChatId = action.payload;
    },
    addUploadedFile: (state, action) => {
      state.uploadedFiles.push(action.payload);
    },
    removeUploadedFile: (state, action: PayloadAction<string>) => {
      state.uploadedFiles = state.uploadedFiles.filter(f => f.id !== action.payload);
    },
    clearUploadedFiles: (state) => {
      state.uploadedFiles = [];
    },
  },
});

export const {
  setMessages,
  addMessage,
  updateMessage,
  setLoading,
  setCurrentChatId,
  addUploadedFile,
  removeUploadedFile,
  clearUploadedFiles,
} = chatSlice.actions;

export default chatSlice.reducer;
