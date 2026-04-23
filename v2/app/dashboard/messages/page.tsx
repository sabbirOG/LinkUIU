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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
          setIsSidebarOpen(false); // On mobile, close sidebar if chat open
          await loadMessages(convoId);
          await markAsRead(convoId);
        }
      } else if (conversations.length > 0 && !activeConvo) {
        // Desktop default, but don't force sidebar closed on mobile yet
        // setActiveConvo(conversations[0]);
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
    await sendMessage(otherUserId, text);
  };

  const getOtherUser = (convo: any) => {
    const otherId = convo.user_1_id === currentUser?.id ? convo.user_2_id : convo.user_1_id;
    return alumni.find(a => a.id === otherId) || { name: "Institutional Node", dept: "UIU" };
  };

  if (!isLoaded) return (
    <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center gap-6">
      <Loader2 className="animate-spin text-[#f97316]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Secure Protocol</p>
    </div>
  );

  return (
    <div className="h-[calc(100vh-80px)] max-w-screen-2xl mx-auto md:p-6 lg:p-8 animate-in fade-in duration-700">
      <div className="bg-white border border-slate-200/60 md:rounded-[40px] shadow-2xl h-full flex overflow-hidden">
        
        {/* LEFT: Conversation List */}
        <aside className={cn(
          "w-full md:w-80 lg:w-[400px] border-r border-slate-100 flex flex-col shrink-0 transition-all",
          !isSidebarOpen && "hidden md:flex"
        )}>
          <div className="p-8 border-b border-slate-50 space-y-6">
            <div>
              <p className="text-[10px] font-black text-[#f97316] uppercase tracking-[0.2em] mb-1">Signal Hub</p>
              <h2 className="text-2xl font-black tracking-tighter text-slate-900">Conversations</h2>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#f97316] transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search encrypted signals..." 
                className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-xs font-black uppercase tracking-widest placeholder:text-slate-300 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
            {conversations.length > 0 ? conversations.map((convo) => {
              const other = getOtherUser(convo);
              const isActive = activeConvo?.id === convo.id;
              return (
                <button 
                  key={convo.id}
                  onClick={() => { setActiveConvo(convo); loadMessages(convo.id); setIsSidebarOpen(false); }}
                  className={cn(
                    "w-full p-5 rounded-[28px] flex gap-5 transition-all text-left group",
                    isActive ? "bg-slate-900 text-white shadow-2xl shadow-slate-300" : "hover:bg-slate-50 text-slate-500"
                  )}
                >
                  <div className="h-14 w-14 rounded-2xl bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-300 font-black text-xl border border-slate-50 group-hover:bg-[#f97316] group-hover:text-white group-hover:border-transparent transition-all">
                    {other.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex justify-between items-center mb-1">
                       <h4 className={cn("text-sm font-black truncate tracking-tight", isActive ? "text-white" : "text-slate-900")}>{other.name}</h4>
                       <span className="text-[9px] font-black uppercase opacity-40">{formatRelativeTime(convo.updated_at)}</span>
                    </div>
                    <p className="text-[11px] truncate opacity-60 font-bold uppercase tracking-tighter">{convo.last_message || "Initialize protocol"}</p>
                  </div>
                </button>
              );
            }) : (
              <div className="p-12 text-center space-y-4">
                 <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto border border-dashed border-slate-200">
                   <MessageSquare size={24} />
                 </div>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Graph Empty</p>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT: Chat Window */}
        <main className={cn(
          "flex-1 flex flex-col bg-slate-50/20 relative",
          isSidebarOpen && "hidden md:flex"
        )}>
          {activeConvo ? (
            <>
              {/* Header */}
              <header className="px-6 md:px-10 py-6 border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-20 flex justify-between items-center">
                 <div className="flex items-center gap-5">
                    <button 
                      onClick={() => setIsSidebarOpen(true)}
                      className="md:hidden h-10 w-10 flex items-center justify-center text-slate-400"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div className="h-12 w-12 rounded-2xl bg-[#f97316] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-orange-100">
                       {getOtherUser(activeConvo).name.charAt(0)}
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">{getOtherUser(activeConvo).name}</h3>
                       {isOtherTyping ? (
                         <p className="text-[10px] font-black text-[#f97316] uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                           <span className="flex gap-1"><span className="h-1 w-1 bg-[#f97316] rounded-full animate-bounce" /><span className="h-1 w-1 bg-[#f97316] rounded-full animate-bounce [animation-delay:0.2s]" /><span className="h-1 w-1 bg-[#f97316] rounded-full animate-bounce [animation-delay:0.4s]" /></span>
                           Writing...
                         </p>
                       ) : (
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mt-1.5">
                            <span className="h-1.5 w-1.5 bg-green-500 rounded-full" /> Authorized Channel
                         </p>
                       )}
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <button className="h-12 w-12 rounded-2xl flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all"><MoreVertical size={20} /></button>
                 </div>
              </header>

              {/* Messages Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 no-scrollbar">
                 {messageStream.map((msg) => {
                    const isMine = msg.sender_id === currentUser?.id;
                    return (
                      <div key={msg.id} className={cn("flex flex-col animate-in slide-in-from-bottom-2 duration-500", isMine ? "items-end" : "items-start")}>
                         <div className={cn(
                           "max-w-[85%] md:max-w-[70%] px-6 py-4 rounded-[28px] text-[15px] font-bold leading-relaxed shadow-sm relative",
                           isMine 
                            ? "bg-slate-900 text-white rounded-tr-none shadow-xl shadow-slate-200" 
                            : "bg-white text-slate-900 border border-slate-100 rounded-tl-none"
                         )}>
                            {msg.content}
                            {isMine && msg.is_read && (
                              <div className="absolute -bottom-5 right-0 flex items-center gap-1 text-[8px] font-black text-[#f97316] uppercase tracking-widest">
                                <ShieldCheck size={10} /> Seen
                              </div>
                            )}
                         </div>
                         <span className="text-[9px] font-black text-slate-300 mt-2 uppercase tracking-[0.1em]">{formatRelativeTime(msg.created_at)}</span>
                      </div>
                    );
                 })}
                 {messageStream.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center space-y-6">
                      <div className="h-20 w-20 bg-white rounded-[32px] flex items-center justify-center border border-slate-100 shadow-xl text-[#f97316] animate-pulse">
                        <MessageSquare size={32} />
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#f97316]">Encrypted Protocol</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2">Initialize your professional signal.</p>
                      </div>
                   </div>
                 )}
              </div>

              {/* Input Area */}
              <footer className="p-6 md:p-10 bg-white border-t border-slate-50">
                 <form onSubmit={handleSend} className="relative group">
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      placeholder="Type a professional signal..." 
                      className="w-full h-16 md:h-20 bg-slate-50 border-none rounded-[28px] pl-8 pr-24 text-base font-bold placeholder:text-slate-300 focus:bg-white focus:ring-[12px] focus:ring-orange-500/5 transition-all outline-none"
                    />
                    <button 
                      type="submit"
                      disabled={!inputText.trim()}
                      className="absolute right-3 top-3 md:right-4 md:top-4 h-10 md:h-12 px-8 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 hover:bg-[#f97316] transition-all active:scale-90 disabled:opacity-20 shadow-xl"
                    >
                       <Send size={16} /> <span className="hidden sm:inline">Dispatch</span>
                    </button>
                 </form>
              </footer>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-10">
               <div className="relative">
                 <div className="h-32 w-32 bg-white rounded-[40px] border border-slate-100 flex items-center justify-center text-slate-100 shadow-2xl rotate-6 animate-pulse">
                    <MessageSquare size={60} />
                 </div>
                 <div className="absolute -bottom-4 -right-4 h-16 w-16 bg-[#f97316] rounded-3xl flex items-center justify-center text-white shadow-xl -rotate-12">
                    <ShieldCheck size={32} />
                 </div>
               </div>
               <div className="space-y-4">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Signal <span className="text-[#f97316]">Intercept</span></h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">Select a professional node from the signal hub to initialize communication protocol.</p>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
