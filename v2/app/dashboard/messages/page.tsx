"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Send, 
  Search, 
  MoreVertical, 
  User, 
  MessageSquare, 
  Clock,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useGlobalStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const userIdFromUrl = searchParams.get('user');
  
  const { 
    currentUser, 
    alumni, 
    conversations, 
    activeMessages, 
    loadMessages, 
    sendMessage, 
    createConversation,
    markAsRead,
    isLoaded 
  } = useGlobalStore();

  const [activeConvo, setActiveConvo] = useState<any>(null);
  const [inputText, setInputText] = useState("");
  const [messageStream, setMessageStream] = useState<any[]>([]);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize from URL or first conversation
  useEffect(() => {
    async function initChat() {
      if (!isLoaded || !currentUser) return;
      
      if (userIdFromUrl) {
        const convoId = await createConversation(userIdFromUrl);
        if (convoId) {
          const convo = conversations.find(c => c.id === convoId) || { id: convoId, user_1_id: currentUser.id, user_2_id: userIdFromUrl };
          setActiveConvo(convo);
          await loadMessages(convoId);
          await markAsRead(convoId);
        }
      } else if (conversations.length > 0 && !activeConvo) {
        setActiveConvo(conversations[0]);
        await loadMessages(conversations[0].id);
        await markAsRead(conversations[0].id);
      }
    }
    initChat();
  }, [userIdFromUrl, isLoaded, conversations.length]);

  // Sync Global store messages to local stream
  useEffect(() => {
    setMessageStream(activeMessages);
  }, [activeMessages]);

  // REAL-TIME: Listen for new messages, typing status, and read receipts
  useEffect(() => {
    if (!activeConvo || !currentUser) return;

    const channel = supabase
      .channel(`chat:${activeConvo.id}`, {
        config: {
          presence: {
            key: currentUser.id,
          },
        },
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages', 
        filter: `conversation_id=eq.${activeConvo.id}` 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessageStream(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          // Auto-mark as read if we are looking at it
          markAsRead(activeConvo.id);
        } else if (payload.eventType === 'UPDATE') {
          setMessageStream(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const otherId = activeConvo.user_1_id === currentUser.id ? activeConvo.user_2_id : activeConvo.user_1_id;
        const otherPresence = state[otherId] as any[];
        setIsOtherTyping(!!otherPresence?.some(p => p.typing));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConvo?.id]);

  // Broadcast typing status
  useEffect(() => {
    if (!activeConvo || !currentUser) return;
    const channel = supabase.channel(`chat:${activeConvo.id}`);
    
    if (inputText.length > 0) {
      channel.track({ typing: true, user: currentUser?.name });
    } else {
      channel.track({ typing: false, user: currentUser?.name });
    }
  }, [inputText]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messageStream]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvo || !currentUser) return;
    
    const otherUserId = activeConvo.user_1_id === currentUser.id ? activeConvo.user_2_id : activeConvo.user_1_id;
    const text = inputText;
    setInputText("");
    if (currentUser) {
      await sendMessage(otherUserId, text);
    }
  };

  const getOtherUser = (convo: any) => {
    const otherId = convo.user_1_id === currentUser?.id ? convo.user_2_id : convo.user_1_id;
    return alumni.find(a => a.id === otherId) || { name: "UIU Connect User", dept: "Unknown" };
  };

  if (!isLoaded) return <div className="p-10 text-center">Synchronizing Secure Stream...</div>;

  return (
    <div className="h-[calc(100vh-160px)] max-w-7xl mx-auto px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl h-full flex overflow-hidden">
        
        {/* LEFT: Conversation List */}
        <aside className="w-80 md:w-96 border-r border-slate-100 flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-50 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <MessageSquare size={16} className="text-[#f97316]" /> Networking Center
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="text" 
                placeholder="Find a conversation..." 
                className="w-full bg-slate-50 border-none rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-orange-500/10 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {conversations.length > 0 ? conversations.map((convo) => {
              const other = getOtherUser(convo);
              const isActive = activeConvo?.id === convo.id;
              return (
                <button 
                  key={convo.id}
                  onClick={() => { setActiveConvo(convo); loadMessages(convo.id); }}
                  className={cn(
                    "w-full p-4 rounded-2xl flex gap-4 transition-all text-left",
                    isActive ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "hover:bg-slate-50 text-slate-500"
                  )}
                >
                  <div className="h-12 w-12 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                    {other.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                       <h4 className={cn("text-sm font-bold truncate", isActive ? "text-white" : "text-slate-900")}>{other.name}</h4>
                       <span className="text-[10px] opacity-50"><Clock size={10} className="inline mr-1" /> {formatRelativeTime(convo.updated_at)}</span>
                    </div>
                    <p className="text-xs truncate opacity-70 font-medium">{convo.last_message || "Start a conversation"}</p>
                  </div>
                </button>
              );
            }) : (
              <div className="p-8 text-center space-y-2">
                 <p className="text-xs font-bold text-slate-300 uppercase underline decoration-[#f97316]/30">No Active Chats</p>
                 <p className="text-[10px] text-slate-400 font-medium">Head to the Directory to find mentors and peers.</p>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT: Chat Window */}
        <main className="flex-1 flex flex-col bg-slate-50/20 relative">
          {activeConvo ? (
            <>
              {/* Header */}
              <header className="px-8 py-5 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#f97316] text-white flex items-center justify-center font-bold shadow-sm">
                       {getOtherUser(activeConvo).name.charAt(0)}
                    </div>
                    <div>
                       <h3 className="text-base font-bold text-slate-900">{getOtherUser(activeConvo).name}</h3>
                       {isOtherTyping ? (
                         <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest animate-pulse">Typing...</p>
                       ) : (
                         <p className="text-[10px] font-bold text-[#f97316] uppercase tracking-widest flex items-center gap-1.5 pt-0.5">
                            <ShieldCheck size={12} /> {getOtherUser(activeConvo).dept} Alumni
                         </p>
                       )}
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <button className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-slate-900 transition-colors"><MoreVertical size={20} /></button>
                 </div>
              </header>

              {/* Messages Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-4">
                 {messageStream.map((msg) => {
                    const isMine = msg.sender_id === currentUser?.id;
                    return (
                      <div key={msg.id} className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
                         <div className={cn(
                           "max-w-[70%] px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm relative",
                           isMine ? "bg-slate-900 text-white rounded-tr-none" : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                         )}>
                            {msg.content}
                            {isMine && msg.is_read && (
                              <div className="absolute -bottom-4 right-0 text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Seen</div>
                            )}
                         </div>
                         <span className="text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">{formatRelativeTime(msg.created_at)}</span>
                      </div>
                    );
                 })}
                 {messageStream.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center space-y-4 text-slate-300">
                      <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm animate-pulse">
                        <MessageSquare size={24} />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#f97316]">Secure Connection Established</p>
                   </div>
                 )}
              </div>

              {/* Input Area */}
              <footer className="p-8 bg-white border-t border-slate-100">
                 <form onSubmit={handleSend} className="relative">
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      placeholder="Type your message here..." 
                      className="w-full h-14 bg-slate-50 border-none rounded-2xl pl-6 pr-20 text-sm font-semibold focus:ring-4 focus:ring-orange-500/5 transition-all outline-none"
                    />
                    <button 
                      type="submit"
                      disabled={!inputText.trim()}
                      className="absolute right-2 top-2 h-10 px-6 bg-[#f97316] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
                    >
                       <Send size={14} /> Send
                    </button>
                 </form>
              </footer>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
               <div className="h-24 w-24 bg-white rounded-3xl border border-slate-100 flex items-center justify-center text-slate-200 shadow-xl shadow-slate-100 rotate-3">
                  <MessageSquare size={40} />
               </div>
               <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">Professional Messaging</h3>
                  <p className="text-xs font-medium text-slate-400 max-w-xs">Select an alumni from the sidebar to begin your professional conversation.</p>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
