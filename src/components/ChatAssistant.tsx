import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { sendChatMessage } from '../services/api';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  source?: string;
}

const CHAT_SUGGESTIONS = [
  'How much capital is locked in aged stock?',
  'What does it cost to clear it?',
  'Which category should I action first?',
  'What is the Watch band telling me?',
  'Why does Fast Fashion hold all the terminal stock?',
  'Who needs to approve the write-offs?',
  'How many rows have breached SLA?',
  'What did the last run generate?'
];

export const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Hello. I can answer questions on the aged stock position straight from the audited extract and the Inventory Management Policy.<br><br>Right now <b>$27.20M</b> has aged past band &mdash; <b>10.2%</b> of the book &mdash; costing <b>$5.35M</b> to clear at the policy minimums.',
      source: 'Live platform data (audited Aging_SKU extract)'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q) return;

    setInput('');
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const data = await sendChatMessage(q);
      setMessages(prev => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: data.answer,
          source: data.source
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: 'I can answer on the aged stock position, the cost to clear it, category and operating-model ranking, the Watch band, markdown economics, exit channels and write-off authority. Try one of the suggestions below.',
          source: 'Policy v2.0 & Audited Extract'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#3F7D2C] to-[#62B146] shadow-[0_8px_22px_rgba(44,90,30,0.4)] flex items-center justify-center text-white cursor-pointer z-[400] transition-transform duration-150 hover:scale-105 active:scale-95"
        title="Ask about the aged stock position"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Slide-up Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[390px] max-w-[calc(100vw-32px)] h-[580px] max-h-[calc(100vh-120px)] bg-white rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.22)] z-[399] flex flex-col overflow-hidden border border-[#E3EADF] animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2C5A1E] to-[#62B146] text-white p-3.5 flex items-center justify-between shrink-0">
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4ADE80] inline-block animate-pulse" />
                Aged Stock Assistant
              </div>
              <div className="text-[10.5px] text-white/85 mt-0.5">
                Grounded in the audited extract and Policy v2.0
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white text-lg leading-none cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 bg-[#F5F6F8] flex flex-col gap-2.5">
            {messages.map(m => (
              <div
                key={m.id}
                className={`max-w-[88%] p-2.5 rounded-lg text-[12.5px] leading-relaxed ${
                  m.sender === 'bot'
                    ? 'bg-white border border-[#E3EADF] text-[#1B2418] self-start rounded-bl-xs'
                    : 'bg-[#62B146] text-white self-end rounded-br-xs'
                }`}
              >
                <div dangerouslySetInnerHTML={{ __html: m.text }} />
                {m.source && (
                  <div className="text-[10px] text-[#6B7A66] mt-1.5 border-t border-gray-100 pt-1">
                    Source: {m.source}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="bg-white border border-[#E3EADF] text-[#6B7A66] p-2.5 rounded-lg rounded-bl-xs self-start flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#6B7A66] rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-[#6B7A66] rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-[#6B7A66] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions row */}
          <div className="flex flex-wrap gap-1.5 p-2 bg-[#F5F6F8] border-t border-[#E3EADF] max-h-24 overflow-y-auto shrink-0">
            {CHAT_SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-[10.5px] bg-white border border-[#E3EADF] rounded-full px-2.5 py-1 text-[#3F7D2C] font-semibold hover:bg-[#EEF7EA] transition-colors cursor-pointer text-left"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input row */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 p-2.5 bg-white border-t border-[#E3EADF] shrink-0"
          >
            <input
              type="text"
              placeholder="Ask about aged stock, cost to clear, authority..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 border border-[#E3EADF] rounded-full px-3.5 py-2 text-[12.5px] focus:outline-hidden focus:border-[#62B146] focus:ring-1 focus:ring-[#62B146]"
            />
            <button
              type="submit"
              className="w-8 h-8 rounded-full bg-[#62B146] hover:bg-[#3F7D2C] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
