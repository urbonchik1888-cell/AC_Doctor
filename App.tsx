import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import { Message, Role } from './types';
import { sendMessageToGemini } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      text: "Здравствуйте! Я ваш виртуальный инженер по климатическому оборудованию.\n\nОпишите проблему с вашим кондиционером, и я помогу провести диагностику.\n\nЕсли есть возможность, сфотографируйте внутренний блок, шильдик или код ошибки на дисплее.",
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string, attachment?: { mimeType: string; data: string }) => {
    // 1. Add User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text,
      attachment: attachment,
      timestamp: Date.now()
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // 2. Get AI Response
      // Filter out the initial welcome message before sending to the API
      const historyForApi = newHistory.filter(msg => msg.id !== 'welcome');
      const responseText = await sendMessageToGemini(historyForApi, text, attachment);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: "⚠️ Произошла ошибка при соединении с сервером. Пожалуйста, проверьте интернет и попробуйте снова.",
        isError: true,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header />
      
      {/* Main Chat Area */}
      <main className="flex-grow overflow-y-auto scrollbar-hide p-4">
        <div className="max-w-3xl mx-auto flex flex-col">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Section */}
      <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;
