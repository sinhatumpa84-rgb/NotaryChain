import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineChatBubbleLeftRight,
  HiXMark,
  HiMinus,
  HiPaperAirplane,
  HiOutlineSparkles,
} from 'react-icons/hi2';
import { groqChat } from '../../api/aiApi';

const ChatBubble = ({ msg }) => (
  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-2.5`}>
    {msg.role === 'assistant' && (
      <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-[10px] mr-2 mt-0.5 flex-shrink-0 font-bold">✦</div>
    )}
    <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
      msg.role === 'user'
        ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-500/20'
        : 'bg-slate-700/80 text-slate-200 border border-slate-600/50 rounded-tl-sm'
    }`}>
      {msg.content}
    </div>
  </div>
);

export default function FloatingChatbot({ documentId = null, documentContext = '' }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [history, setHistory] = useState([
    {
      role: 'assistant',
      content: documentId
        ? "Hi! I'm your document assistant. I've loaded this document's context — ask me anything about it before you sign."
        : "Hi! I'm NotaryChain's AI assistant. I can help you upload documents, understand the verification process, or explain how notarization works. What do you need?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && !minimized) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, open, minimized]);

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, minimized]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await groqChat(documentId, userMsg, history.slice(-8), documentContext);
      setHistory(prev => [...prev, { role: 'assistant', content: res.data.data.reply }]);
    } catch {
      setHistory(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const quickPrompts = documentId
    ? ['Summarize key risks', 'Who are the parties?', 'Any missing clauses?']
    : ['How do I upload a document?', 'What is notarization?', 'How does fraud detection work?'];

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/40 flex items-center justify-center border border-white/10"
          >
            <HiOutlineChatBubbleLeftRight className="w-6 h-6" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full animate-ping bg-indigo-500 opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] rounded-2xl bg-slate-900 border border-slate-700/60 shadow-2xl shadow-slate-900/60 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-indigo-600/20 to-purple-600/10 border-b border-slate-700/60">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <HiOutlineSparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold leading-tight">
                  {documentId ? 'Document Assistant' : 'NotaryChain AI'}
                </p>
                <p className="text-indigo-300 text-[10px]">Llama 3.3 · Always online</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMinimized(v => !v)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                >
                  <HiMinus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body (collapsible) */}
            <AnimatePresence>
              {!minimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  {/* Messages */}
                  <div className="h-72 overflow-y-auto p-4 space-y-1 scroll-smooth">
                    {history.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                    {loading && (
                      <div className="flex justify-start mb-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-[10px] mr-2 mt-0.5 font-bold">✦</div>
                        <div className="bg-slate-700/80 rounded-2xl rounded-tl-sm px-3.5 py-2.5 border border-slate-600/50 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick Prompts */}
                  <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
                    {quickPrompts.map(q => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); setTimeout(() => sendMessage(), 50); }}
                        disabled={loading}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="px-4 pb-4">
                    <form onSubmit={sendMessage} className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type your question..."
                        disabled={loading}
                        className="flex-1 px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-40 shadow-lg shadow-indigo-500/20 flex-shrink-0"
                      >
                        <HiPaperAirplane className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
