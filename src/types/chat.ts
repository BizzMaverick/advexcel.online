export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'suggestion' | 'help' | 'feedback';
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  isActive: boolean;
  createdAt: Date;
}

export interface SuggestionFeedback {
  id: string;
  userId: string;
  suggestion: string;
  category: 'feature' | 'bug' | 'improvement' | 'general';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewed' | 'implemented';
  timestamp: Date;
}