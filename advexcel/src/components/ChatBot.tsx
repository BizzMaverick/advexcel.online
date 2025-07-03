import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, AlertCircle, Lightbulb, HelpCircle, Mail } from 'lucide-react';
import { ChatMessage, SuggestionFeedback } from '../types/chat';

interface ChatBotProps {
  isVisible: boolean;
  onClose: () => void;
  onSuggestionSubmit: (suggestion: SuggestionFeedback) => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ isVisible, onClose, onSuggestionSubmit }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your Excel Analyzer assistant. I can help you with:\n\n• Application features and how to use them\n• Excel operations and formulas\n• Troubleshooting issues\n• Submitting suggestions for improvements\n\nHow can I assist you today?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestionData, setSuggestionData] = useState({
    suggestion: '',
    category: 'general' as 'feature' | 'bug' | 'improvement' | 'general',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  const quickReplies = [
    { text: 'How to import Excel files?', type: 'help' },
    { text: 'How to create pivot tables?', type: 'help' },
    { text: 'Natural language queries', type: 'help' },
    { text: 'Data privacy and security', type: 'help' },
    { text: 'Submit a suggestion', type: 'suggestion' },
    { text: 'Report a bug', type: 'suggestion' },
    { text: 'Contact support', type: 'contact' }
  ];

  const botResponses = {
    'how to import excel files?': 'To import Excel files:\n\n1. Click the "Import Data" button in the sidebar\n2. Select your Excel (.xlsx, .xls), CSV, or other supported file\n3. The file will be processed and loaded into the spreadsheet\n4. You can then use natural language queries or Excel functions\n\nSupported formats: Excel, CSV, PDF, Word documents',
    
    'how to create pivot tables?': 'Creating pivot tables is easy:\n\n1. Import your data first\n2. Click "Pivot Tables" in the sidebar\n3. Drag fields to Rows, Columns, and Values areas\n4. Choose your aggregation method (sum, count, average, etc.)\n5. Click "Generate Pivot Table"\n6. Use the command bar for additional operations\n\nYou can also use natural language: "create pivot table from sales data"',
    
    'natural language queries': 'You can ask questions in plain English:\n\n• "Extract west region data"\n• "Show top 10 sales records"\n• "Find products with highest revenue"\n• "Filter by category electronics"\n• "Compare north vs south region"\n\nThe AI will understand your intent and process the data accordingly!',
    
    'data privacy and security': 'Your privacy is our top priority:\n\n✅ All data processing happens locally in your browser\n✅ We don\'t store or upload your files to any server\n✅ No data is transmitted over the internet\n✅ Your files remain completely private and secure\n✅ You can use the app offline once loaded\n\nYour data never leaves your device!',
    
    'submit a suggestion': 'I\'d love to hear your suggestions! Click the "Submit Suggestion" button below to share:\n\n• New features you\'d like to see\n• Improvements to existing functionality\n• User experience enhancements\n• Any other ideas\n\nYour feedback helps make the app better for everyone!',
    
    'report a bug': 'Found a bug? Please report it so we can fix it:\n\n• Describe what happened\n• Steps to reproduce the issue\n• What you expected to happen\n• Any error messages you saw\n\nClick "Submit Suggestion" and select "Bug" as the category.',

    'contact support': 'Need additional help? You can reach our support team:\n\n📧 Email: contact@advexcel.online\n\nOur team typically responds within 24 hours. For urgent issues, please include "URGENT" in your subject line.\n\nYou can also use the suggestion form below to send us detailed feedback or questions.'
  };

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for exact matches first
    for (const [key, response] of Object.entries(botResponses)) {
      if (lowerMessage.includes(key.toLowerCase())) {
        return response;
      }
    }
    
    // Check for keywords
    if (lowerMessage.includes('import') || lowerMessage.includes('upload') || lowerMessage.includes('file')) {
      return botResponses['how to import excel files?'];
    }
    
    if (lowerMessage.includes('pivot') || lowerMessage.includes('table')) {
      return botResponses['how to create pivot tables?'];
    }
    
    if (lowerMessage.includes('query') || lowerMessage.includes('natural') || lowerMessage.includes('language')) {
      return botResponses['natural language queries'];
    }
    
    if (lowerMessage.includes('privacy') || lowerMessage.includes('security') || lowerMessage.includes('safe')) {
      return botResponses['data privacy and security'];
    }
    
    if (lowerMessage.includes('suggestion') || lowerMessage.includes('feature') || lowerMessage.includes('improve')) {
      return botResponses['submit a suggestion'];
    }
    
    if (lowerMessage.includes('bug') || lowerMessage.includes('error') || lowerMessage.includes('problem')) {
      return botResponses['report a bug'];
    }

    if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('email')) {
      return botResponses['contact support'];
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'Hello! I\'m here to help you with Excel Analyzer Pro. What would you like to know about?';
    }
    
    if (lowerMessage.includes('thank')) {
      return 'You\'re welcome! Is there anything else I can help you with? You can also contact our support team at contact@advexcel.online for additional assistance.';
    }
    
    // Default response
    return 'I\'m here to help! You can ask me about:\n\n• How to use app features\n• Excel operations and formulas\n• Data import and export\n• Privacy and security\n• Submitting suggestions\n\nFor additional support, email us at contact@advexcel.online\n\nOr choose from the quick replies below.';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: generateBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickReply = (reply: { text: string; type: string }) => {
    if (reply.type === 'suggestion') {
      setShowSuggestionForm(true);
      return;
    }

    if (reply.type === 'contact') {
      window.open('mailto:contact@advexcel.online?subject=Excel Analyzer Pro - Support Request', '_blank');
      return;
    }

    setInputMessage(reply.text);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleSuggestionSubmit = () => {
    if (!suggestionData.suggestion.trim()) return;

    const suggestion: SuggestionFeedback = {
      id: Date.now().toString(),
      userId: 'current-user',
      suggestion: suggestionData.suggestion,
      category: suggestionData.category,
      priority: suggestionData.priority,
      status: 'pending',
      timestamp: new Date()
    };

    onSuggestionSubmit(suggestion);

    const confirmationMessage: ChatMessage = {
      id: Date.now().toString(),
      content: `Thank you for your ${suggestionData.category} suggestion! I've forwarded it to the development team. They'll review it and consider it for future updates.\n\nYour feedback helps make Excel Analyzer Pro better for everyone! 🚀\n\nFor urgent matters, you can also email us directly at contact@advexcel.online`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, confirmationMessage]);
    setShowSuggestionForm(false);
    setSuggestionData({ suggestion: '', category: 'general', priority: 'medium' });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-white">
            <h3 className="font-semibold">Excel Assistant</h3>
            <p className="text-xs text-blue-100">Always here to help</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-blue-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' ? 'bg-blue-600' : 'bg-gray-100'
              }`}>
                {message.sender === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-gray-600" />
                )}
              </div>
              <div className={`rounded-2xl px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Bot className="h-4 w-4 text-gray-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {!showSuggestionForm && (
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors flex items-center space-x-1"
              >
                {reply.type === 'help' ? <HelpCircle className="h-3 w-3" /> : 
                 reply.type === 'contact' ? <Mail className="h-3 w-3" /> :
                 <Lightbulb className="h-3 w-3" />}
                <span>{reply.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggestion Form */}
      {showSuggestionForm && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Submit Suggestion</h4>
          <div className="space-y-3">
            <div>
              <select
                value={suggestionData.category}
                onChange={(e) => setSuggestionData({ ...suggestionData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="general">General Feedback</option>
                <option value="feature">New Feature</option>
                <option value="improvement">Improvement</option>
                <option value="bug">Bug Report</option>
              </select>
            </div>
            <div>
              <textarea
                value={suggestionData.suggestion}
                onChange={(e) => setSuggestionData({ ...suggestionData, suggestion: e.target.value })}
                placeholder="Describe your suggestion or issue..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSuggestionSubmit}
                disabled={!suggestionData.suggestion.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
              <button
                onClick={() => setShowSuggestionForm(false)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Or email us directly at{' '}
              <a 
                href="mailto:contact@advexcel.online" 
                className="text-blue-600 hover:text-blue-700"
              >
                contact@advexcel.online
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      {!showSuggestionForm && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs text-gray-500 text-center mt-2">
            Need more help? Email{' '}
            <a 
              href="mailto:contact@advexcel.online" 
              className="text-blue-600 hover:text-blue-700"
            >
              contact@advexcel.online
            </a>
          </div>
        </div>
      )}
    </div>
  );
};