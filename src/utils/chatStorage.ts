
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolUsed?: string;
}

interface ChatHistory {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

class ChatStorageManager {
  private dbName = "ChatHistory";
  private version = 1;
  private storeName = "chats";

  async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: "id",
          });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      };
    });
  }

  async saveChat(chat: ChatHistory): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);
    
    chat.updatedAt = new Date();
    await store.put(chat);
  }

  async getChats(): Promise<ChatHistory[]> {
    const db = await this.initDB();
    const transaction = db.transaction([this.storeName], "readonly");
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const chats = request.result.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        resolve(chats);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getChatById(id: string): Promise<ChatHistory | null> {
    const db = await this.initDB();
    const transaction = db.transaction([this.storeName], "readonly");
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteChat(id: string): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);
    
    await store.delete(id);
  }

  generateChatId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const chatStorage = new ChatStorageManager();
export type { ChatMessage, ChatHistory };
