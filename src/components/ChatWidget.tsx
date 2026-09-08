"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, ChevronLeft } from 'lucide-react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { mockStudents, mockTeachers } from '@/lib/mockData';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chats, setChats] = usePersistentState<Record<string, any[]>>('app-chats', {});
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = "admin"; 

  useEffect(() => {
    const handleOpenChat = (e: any) => {
      setIsOpen(true);
      if (e.detail?.userId) {
        setActiveChat(e.detail.userId);
      }
    };
    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeChat, isOpen]);

  const allUsers = [...mockStudents, ...mockTeachers].map(u => ({ id: u.id, name: u.name }));
  const getChatName = (id: string) => allUsers.find(u => u.id === id)?.name || id;

  const sendMessage = () => {
    if (!message.trim() || !activeChat) return;
    
    const newMsg = {
      id: Date.now().toString(),
      senderId: currentUser,
      text: message,
      timestamp: new Date().toISOString()
    };
    
    const currentChatMsgs = chats[activeChat] || [];
    setChats({
      ...chats,
      [activeChat]: [...currentChatMsgs, newMsg]
    });
    
    setMessage('');
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-violet-600 text-white shadow-lg hover:bg-violet-700 transition-all z-40 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-violet-600 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                {activeChat && (
                  <button onClick={() => setActiveChat(null)} className="hover:bg-violet-700 p-1 rounded transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <h3 className="font-bold">{activeChat ? getChatName(activeChat) : 'Wiadomości'}</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-violet-700 p-1 rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4">
              {!activeChat ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-4">Wybierz osobę do czatu</p>
                  {allUsers.map(user => {
                    const lastMsg = chats[user.id]?.slice(-1)[0];
                    return (
                      <button 
                        key={user.id}
                        onClick={() => setActiveChat(user.id)}
                        className="w-full text-left p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-300 transition-colors flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                          {lastMsg && (
                            <p className="text-xs text-slate-500 truncate">
                              {lastMsg.senderId === currentUser ? 'Ty: ' : ''}{lastMsg.text}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4 flex flex-col justify-end min-h-full">
                  {(chats[activeChat] || []).length === 0 ? (
                    <div className="text-center text-slate-500 my-auto text-sm">
                      Brak wiadomości. Napisz jako pierwszy!
                    </div>
                  ) : (
                    (chats[activeChat] || []).map(msg => {
                      const isMe = msg.senderId === currentUser;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-2xl ${isMe ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none'}`}>
                            <p className="text-sm">{msg.text}</p>
                            <span className={`text-[10px] opacity-70 mt-1 block ${isMe ? 'text-right' : 'text-left'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Footer / Input */}
            {activeChat && (
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 shrink-0">
                <input 
                  type="text" 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Napisz wiadomość..."
                  className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-violet-500 text-slate-900 dark:text-white"
                />
                <button 
                  onClick={sendMessage}
                  className="p-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
