import React, { useState, useEffect, useRef } from 'react';
import { Message, Sender } from './types';
import { createChatSession, sendMessageToGemini } from './services/geminiService';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial setup: Start the chat session invisibly
  useEffect(() => {
    const initChat = async () => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      try {
        setIsLoading(true);
        // Reset chat session
        createChatSession();
        
        // Trigger the "Step 1" by sending a hidden command
        const initialResponse = await sendMessageToGemini("Bắt đầu quy trình. Hãy thực hiện Bước 1.");
        
        const welcomeMessage: Message = {
          id: uuidv4(),
          sender: Sender.AI,
          content: initialResponse,
          timestamp: Date.now(),
        };
        setMessages([welcomeMessage]);
      } catch (error) {
        console.error("Initialization error:", error);
        setMessages([{
          id: uuidv4(),
          sender: Sender.AI,
          content: "Lỗi kết nối. Vui lòng kiểm tra API Key và tải lại trang.",
          timestamp: Date.now(),
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, []);

  const handleSendMessage = async (content: string) => {
    // Add user message to state
    const userMsg: Message = {
      id: uuidv4(),
      sender: Sender.USER,
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Send to Gemini
      const responseText = await sendMessageToGemini(content);
      
      // Add AI response to state
      const aiMsg: Message = {
        id: uuidv4(),
        sender: Sender.AI,
        content: responseText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
       const errorMsg: Message = {
        id: uuidv4(),
        sender: Sender.AI,
        content: "Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Bạn có chắc muốn bắt đầu lại hội thoại mới không?")) {
      setMessages([]);
      hasInitialized.current = false;
      // Re-trigger initialization
      window.location.reload(); 
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
            <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-blue-200 shadow-md">
                FR
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Luyện Viết Tiếng Pháp</h1>
                <p className="text-xs text-slate-500 font-medium">Trợ lý AI Gemini</p>
            </div>
        </div>
        <button 
            onClick={handleReset}
            className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors px-3 py-1 rounded-lg hover:bg-slate-100"
        >
            Làm mới
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="max-w-4xl mx-auto">
            {messages.length === 0 && isLoading && (
                <div className="flex justify-center items-center h-64 text-slate-400 animate-pulse">
                    Đang khởi tạo gia sư ảo...
                </div>
            )}
            
            {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
            ))}

            {isLoading && messages.length > 0 && (
                <div className="flex justify-start mb-6">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <InputArea onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default App;
