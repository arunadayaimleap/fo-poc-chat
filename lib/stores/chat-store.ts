import { create } from 'zustand'
import { DataSource } from '@/lib/db'

export type ChatHistory = {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  dataSourceId: string
}

interface ChatState {
  // Data sources
  activeDataSource: DataSource | null
  setActiveDataSource: (dataSource: DataSource | null) => void
  
  // Chat history
  chatHistory: ChatHistory[]
  addChatMessage: (message: Omit<ChatHistory, 'timestamp'>) => void
  clearChatHistory: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  // Data sources
  activeDataSource: null,
  setActiveDataSource: (dataSource) => set({ activeDataSource: dataSource }),
  
  // Chat history
  chatHistory: [],
  addChatMessage: (message) => 
    set((state) => ({ 
      chatHistory: [...state.chatHistory, { ...message, timestamp: new Date() }] 
    })),
  clearChatHistory: () => set({ chatHistory: [] })
}))
