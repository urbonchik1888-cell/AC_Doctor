import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';

interface InputAreaProps {
  onSendMessage: (text: string, attachment?: { mimeType: string; data: string }) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<{ mimeType: string; data: string; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, загрузите изображение.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Extract plain base64 and mime type
        const base64Data = base64String.split(',')[1];
        const mimeType = file.type;

        setAttachment({
          mimeType,
          data: base64Data,
          preview: base64String
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if ((!text.trim() && !attachment) || isLoading) return;
    
    onSendMessage(text, attachment ? { mimeType: attachment.mimeType, data: attachment.data } : undefined);
    
    // Reset state
    setText('');
    setAttachment(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  return (
    <div className="bg-white p-4 border-t border-slate-200 sticky bottom-0 z-20">
      <div className="max-w-3xl mx-auto">
        
        {/* Attachment Preview */}
        {attachment && (
          <div className="mb-3 relative inline-block">
            <img 
              src={attachment.preview} 
              alt="Preview" 
              className="h-20 w-20 object-cover rounded-lg border border-slate-300 shadow-sm" 
            />
            <button 
              onClick={() => {
                setAttachment(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* File Upload Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Прикрепить фото"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </button>

          {/* Text Input */}
          <div className="relative flex-grow">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={autoResize}
              onKeyDown={handleKeyDown}
              placeholder="Опишите проблему (например: кондиционер не дует холодным...)"
              className="w-full py-3 px-4 bg-slate-100 border-transparent focus:bg-white border border-slate-200 focus:border-blue-500 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 placeholder-slate-400 max-h-40"
              rows={1}
            />
          </div>

          {/* Send Button */}
          <button 
            onClick={handleSend}
            disabled={(!text.trim() && !attachment) || isLoading}
            className={`p-3 rounded-full shadow-lg transition-all duration-200 flex-shrink-0
              ${(!text.trim() && !attachment) || isLoading
                ? 'bg-slate-300 cursor-not-allowed text-slate-500' 
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
              }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
