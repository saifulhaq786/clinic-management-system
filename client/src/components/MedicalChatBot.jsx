import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, AlertCircle } from 'lucide-react';
import api from '../api';

export default function MedicalChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI Medical Assistant. I can help answer general medical questions about symptoms, health conditions, and wellness tips. How can I help you today?", sender: 'bot', timestamp: new Date() }
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
        text: "I encountered an error. Please try again or consult a healthcare professional for personalized advice.",
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
      {/* FAB */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-2xl shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 transition-all flex items-center justify-center z-40 animate-pulse-glow group"
          title="Open Medical Chatbot"
        >
          <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 ${
          isMinimized 
            ? 'w-72 h-16' 
            : 'w-full md:w-[380px] h-screen md:h-[560px]'
        } ${
          isMinimized
            ? 'bottom-6 right-6 md:bottom-8 md:right-8'
            : 'inset-x-0 md:inset-x-auto bottom-0 md:bottom-6 md:right-6 md:top-auto'
        } md:rounded-2xl rounded-none overflow-hidden bg-[#0c1222] border border-white/[0.06] shadow-2xl shadow-black/40 flex flex-col`}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle size={18} className="text-white" />
              </div>
              {!isMinimized && (
                <div>
                  <h3 className="text-white font-medium text-sm">Medical Assistant</h3>
                  <p className="text-teal-100/60 text-xs">AI-powered support</p>
                </div>
              )}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white hidden md:flex"
              >
                {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-teal-500 text-white rounded-br-md'
                          : 'bg-white/[0.04] border border-white/[0.06] text-slate-300 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <span className={`text-[0.65rem] mt-1 block opacity-50 ${msg.sender === 'user' ? 'text-teal-100' : 'text-slate-500'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-white/[0.04] border border-white/[0.06] text-slate-400 px-4 py-2.5 rounded-2xl rounded-bl-md flex items-center gap-2.5">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-teal-400/60 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
                        <div className="w-1.5 h-1.5 bg-teal-400/60 rounded-full animate-bounce" style={{animationDelay: '0.15s'}} />
                        <div className="w-1.5 h-1.5 bg-teal-400/60 rounded-full animate-bounce" style={{animationDelay: '0.3s'}} />
                      </div>
                      <span className="text-xs">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Disclaimer */}
              <div className="border-t border-white/[0.04] bg-amber-500/[0.03] px-4 py-2.5 flex items-start gap-2 flex-shrink-0">
                <AlertCircle size={13} className="text-amber-400/60 flex-shrink-0 mt-0.5" />
                <p className="text-[0.65rem] text-slate-500 leading-snug">
                  For medical emergencies, contact your healthcare provider or emergency services immediately.
                </p>
              </div>

              {/* Input */}
              <div className="border-t border-white/[0.04] bg-[#060b18] px-4 py-3 flex-shrink-0">
                <div className="flex gap-2 items-end">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a health question..."
                    className="flex-1 text-sm !py-2.5 !rounded-xl"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="bg-teal-500 hover:bg-teal-400 text-white p-2.5 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
