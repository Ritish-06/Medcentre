'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, X, Send, Bot, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
}

const PRESET_PROMPTS = [
  'What medicines are in my prescription?',
  'Check pharmacy availability nearby.',
  'How do I book a doctor appointment?',
  'Where are my medical health records stored?',
];

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your MedCentre AI healthcare information assistant. How can I help you navigate your prescriptions, medicines, appointments, or health records today?',
      timestamp: 'Just now',
    },
  ]);

  const pathname = usePathname();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Hide on login/register
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMessage: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    // Context-aware healthcare response generator
    setTimeout(() => {
      let replyText = 'I am here to help you navigate MedCentre.';
      let actionUrl: string | undefined;
      let actionLabel: string | undefined;

      const lower = query.toLowerCase();
      if (lower.includes('prescription') || lower.includes('ocr') || lower.includes('scan')) {
        replyText =
          'You can upload prescription images or PDFs to our smart OCR Scanner. It extracts the medicine names, dosage forms, strength, and automatically searches partner pharmacies.';
        actionUrl = '/prescriptions/scan';
        actionLabel = 'Open Prescription Scanner →';
      } else if (lower.includes('availability') || lower.includes('pharmacy') || lower.includes('stock')) {
        replyText =
          'You can search any medicine in our database and check real-time stock, batch numbers, and prices across verified partner pharmacies.';
        actionUrl = '/pharmacy/availability';
        actionLabel = 'Check Pharmacy Availability →';
      } else if (lower.includes('doctor') || lower.includes('appointment') || lower.includes('specialist')) {
        replyText =
          'We have certified medical practitioners across cardiology, neurology, pediatrics, and general medicine with live slot booking.';
        actionUrl = '/doctors';
        actionLabel = 'Explore Doctors Directory →';
      } else if (lower.includes('record') || lower.includes('history') || lower.includes('vault')) {
        replyText =
          'All your digital prescriptions, clinical visit summaries, and medical documents are stored in your 256-bit encrypted Health Records vault.';
        actionUrl = '/health-records';
        actionLabel = 'View Health Records →';
      } else if (lower.includes('reminder') || lower.includes('dose')) {
        replyText =
          'Set up daily medication alarms and track your adherence compliance in the Medication Reminders tool.';
        actionUrl = '/reminders';
        actionLabel = 'View Medication Schedule →';
      } else if (lower.includes('medicine') || lower.includes('catalog')) {
        replyText =
          'Browse our comprehensive catalog of verified pharmaceutical products, therapeutic categories, and active ingredients.';
        actionUrl = '/medicines';
        actionLabel = 'Browse Medicines Catalog →';
      } else {
        replyText =
          `I can help you find medicines, book specialist appointments, scan prescriptions, or check order delivery. How would you like to proceed?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionUrl,
          actionLabel,
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          id="medcentre-ai-button"
          aria-label="Open MedCentre AI Assistant"
        >
          <Sparkles className="w-5 h-5 text-sky-200 animate-pulse" />
          <span className="text-xs font-bold tracking-wide pr-1">Ask MedCentre AI</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></span>
        </button>
      </div>

      {/* Slide-Up / Popup Dialog Card */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-50 w-[92vw] sm:w-[400px] max-h-[580px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Top Bar Header */}
          <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-sky-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold leading-tight flex items-center gap-1.5">
                  MedCentre AI
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/30 text-sky-200">Assistant</span>
                </h3>
                <p className="text-[11px] text-sky-200">Healthcare information guide</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-sky-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 max-h-[340px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  {msg.actionUrl && (
                    <button
                      onClick={() => {
                        router.push(msg.actionUrl!);
                        setIsOpen(false);
                      }}
                      className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200/70"
                    >
                      {msg.actionLabel || 'View Details'}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  <span
                    className={`block text-[9px] mt-1 ${
                      msg.sender === 'user' ? 'text-sky-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <Bot className="w-4 h-4 text-sky-500 animate-spin" />
                <span>MedCentre AI is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Container */}
          <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {PRESET_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 px-2.5 py-1 rounded-full border border-slate-200/70 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about prescriptions, medicines..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-40 disabled:hover:bg-sky-600 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
