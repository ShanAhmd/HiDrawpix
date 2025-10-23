import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

interface ChatbotProps {
    onOrderInfoExtracted: (info: { customerName: string; contactNumber: string; email: string; details: string; service: string; }) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onOrderInfoExtracted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: "Hello! I'm the Hi Drawpix assistant. How can I help you with our services or an order today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await getChatbotResponse([...messages], inputValue);
      const botMessage: ChatMessage = { sender: 'bot', text: responseText };
      
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const orderInfo = JSON.parse(jsonMatch[1]);
          onOrderInfoExtracted(orderInfo);
          botMessage.text = "Great! I've filled out the order form for you with the details provided. Please review and submit it.";
        } catch (error) {
          console.error("Failed to parse JSON from bot response:", error);
        }
      }

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { sender: 'bot', text: "Sorry, I'm having trouble connecting. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 bg-accent text-primary-bg rounded-full p-4 shadow-lg hover:bg-opacity-90 transition-transform transform hover:scale-110 z-50 flex items-center justify-center glowing-btn"
        aria-label="Open AI Assistant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="m12 14 4-4"/><path d="m16 14-4-4"/><path d="M18 10V8a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"/><path d="M20 14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3"/><path d="M4 14a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h3"/></svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 sm:right-auto sm:left-6 md:right-6 md:left-auto w-full max-w-sm h-[70vh] max-h-[600px] glass-card flex flex-col z-50 transition-all duration-300 origin-bottom-right">
          <div className="p-4 bg-black bg-opacity-20 flex justify-between items-center rounded-t-xl">
            <h3 className="font-bold text-lg text-accent">AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-text-secondary hover:text-text-primary text-2xl">&times;</button>
          </div>
          <div ref={chatMessagesRef} className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                <div className={`rounded-2xl p-3 max-w-xs md:max-w-sm text-sm ${msg.sender === 'user' ? 'bg-accent text-primary-bg rounded-br-none' : 'bg-black bg-opacity-20 text-text-primary rounded-bl-none'}`}>
                   {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </div>
            ))}
             {isLoading && (
                <div className="flex items-end gap-2">
                  <div className="rounded-2xl p-3 max-w-xs bg-black bg-opacity-20 text-text-primary rounded-bl-none">
                    <div className="flex items-center space-x-1">
                        <span className="h-2 w-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-accent rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
          </div>
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white border-opacity-10">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="w-full pl-4 pr-12 py-2 bg-black bg-opacity-20 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-accent text-white"
                disabled={isLoading}
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-primary-bg rounded-full h-8 w-8 flex items-center justify-center hover:bg-opacity-90 disabled:bg-gray-500" disabled={isLoading || !inputValue.trim()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;