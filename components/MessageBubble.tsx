import React from 'react';
import { Message, Role } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  // Function to process bold text marked with **
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Helper to format specific diagnostic headers with colors
  const formatContent = (text: string) => {
    // We split by lines to handle formatting better
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.includes('🛠️ Возможные причины')) {
        return <h3 key={idx} className="mt-4 mb-2 font-bold text-blue-700 text-lg border-b border-blue-100 pb-1">{line}</h3>;
      }
      if (line.includes('🔍 Что проверить')) {
        return <h3 key={idx} className="mt-4 mb-2 font-bold text-amber-600 text-lg border-b border-amber-100 pb-1">{line}</h3>;
      }
      if (line.includes('✅ Рекомендуемые действия')) {
        return <h3 key={idx} className="mt-4 mb-2 font-bold text-green-600 text-lg border-b border-green-100 pb-1">{line}</h3>;
      }
      if (line.includes('⚠️ Когда требуется вызов специалиста')) {
        return <h3 key={idx} className="mt-4 mb-2 font-bold text-red-600 text-lg border-b border-red-100 pb-1">{line}</h3>;
      }
      
      // Regular text formatting
      return <div key={idx} className="min-h-[1.2em]">{formatText(line)}</div>;
    });
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-100 ml-3' : 'bg-blue-600 mr-3'}`}>
          {isUser ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          )}
        </div>

        {/* Content Bubble */}
        <div className={`relative px-5 py-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden
          ${isUser 
            ? 'bg-indigo-50 text-slate-800 rounded-tr-none' 
            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
          } ${message.isError ? 'border-red-300 bg-red-50' : ''}`}>
          
          {message.attachment && (
            <div className="mb-3">
              <img 
                src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`} 
                alt="Uploaded attachment" 
                className="max-h-64 rounded-lg object-cover border border-slate-200"
              />
            </div>
          )}
          
          <div className="whitespace-pre-wrap">
             {isUser ? message.text : formatContent(message.text)}
          </div>
          
          <div className={`text-[10px] mt-2 opacity-70 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
