import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, Loader, AlertCircle } from 'lucide-react';
import api from '../api';

export default function MedicalChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "👋 Hello! I'm your AI Medical Assistant. I can help answer general medical questions about symptoms, health conditions, and wellness tips. How can I help you today?", sender: 'bot', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post(
        '/api/chat/medical',
        { query: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const botMessage = {
        id: messages.length + 2,
        text: res.data.response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = {
        id: messages.length + 2,
        text: "⚠️ I encountered an error. Please try again or consult a healthcare professional for personalized advice.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-gradient-to-br from-[#2563eb] to-[#1e40af] text-white rounded-full shadow-xl shadow-blue-600/40 hover:shadow-2xl hover:shadow-blue-600/60 transition-all flex items-center justify-center z-40 animate-pulse hover:animate-bounce group"
          title="Open Medical Chatbot"
        >
          <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 ${
          isMinimized 
            ? 'w-80 h-20' 
            : 'w-full md:w-96 h-screen md:h-[600px]'
        } ${
          isMinimized
            ? 'bottom-6 right-6 md:bottom-8 md:right-8'
            : 'inset-x-0 md:inset-x-auto bottom-0 md:bottom-6 md:right-6 md:top-auto'
        } md:rounded-3xl rounded-none md:rounded-b-none md:rounded-t-3xl overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1a1f35] border border-[#1e293b]/50 shadow-2xl flex flex-col backdrop-blur-xl`}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2563eb] via-[#1e40af] to-[#1e40af] px-6 py-4 md:py-5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div className="hidden md:block">
                <h3 className="text-white font-black uppercase text-sm tracking-tight">Elite Medical AI</h3>
                <p className="text-blue-100 text-xs font-semibold">24/7 Medical Assistant</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2.5 hover:bg-white/10 rounded-lg transition-all duration-300 text-white/80 hover:text-white hidden md:flex"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2.5 hover:bg-white/10 rounded-lg transition-all duration-300 text-white/80 hover:text-white"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div
                      className={`max-w-xs px-4 py-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-br from-[#2563eb] to-[#1e40af] text-white rounded-br-none shadow-lg shadow-blue-600/20'
                          : 'bg-[#1e3a8a]/40 border border-[#1e3a8a]/50 text-[#cbd5e1] rounded-bl-none hover:bg-[#1e3a8a]/50 transition-all'
                      }`}
                    >
                      <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
                      <span className={`text-xs ${msg.sender === 'user' ? 'text-blue-100' : 'text-[#64748b]'} mt-2 block opacity-75`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-[#1e3a8a]/40 border border-[#1e3a8a]/50 text-[#cbd5e1] px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[#60a5fa] rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                        <div className="w-2 h-2 bg-[#60a5fa] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-[#60a5fa] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      <span className="text-sm font-semibold">AI is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Emergency Disclaimer */}
              <div className="border-t border-[#334155]/30 bg-[#1e3a8a]/20 px-5 md:px-6 py-3 flex items-start gap-3 flex-shrink-0">
                <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#94a3b8] font-bold leading-snug">
                  For medical emergencies, always contact your healthcare provider or emergency services immediately.
                </p>
              </div>

              {/* Input Area */}
              <div className="border-t border-[#334155]/30 bg-gradient-to-br from-[#050810] to-[#0f172a] px-5 md:px-6 py-4 flex-shrink-0">
                <div className="flex gap-3 items-end">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask your health question..."
                    className="flex-1 bg-[#1e293b]/50 border border-[#334155]/50 hover:border-[#334155] focus:border-[#3b82f6] text-white placeholder-[#64748b] px-4 py-3 rounded-2xl outline-none transition-all duration-300 text-sm font-medium"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="bg-gradient-to-r from-[#2563eb] to-[#1e40af] hover:from-[#3b82f6] hover:to-[#2563eb] text-white p-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 hover:shadow-lg hover:shadow-blue-600/30"
                    title="Send message"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </>
  );
}
