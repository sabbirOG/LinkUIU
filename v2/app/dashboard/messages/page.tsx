"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Send,
  Search,
  ChevronLeft,
  MessageSquare,
  Loader2,
  Star,
  Users,
  CheckCheck,
  Check,
  MoreHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

type Message = { id: string; content: string; sender_id: string; created_at: string };
type ConvoStore = Record<string, Message[]>;

// MOCK DATA REMOVED: ConvoStore now initializes as an empty real-time mapped object.

export default function MessagesPage() {
  const { alumni, isLoaded, userSession, isCloudMode } = useGlobalStore();
  const searchParams = useSearchParams();

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [messageText, setMessageText] = useState("");
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [favourites, setFavourites] = useState<string[]>(["2"]);
  const [unreadIds, setUnreadIds] = useState<string[]>(["1", "3"]);
  const [convoStore, setConvoStore] = useState<ConvoStore>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const chatParam = searchParams.get("chat");
    if (chatParam) setSelectedChatId(chatParam);
  }, [searchParams]);

  const connectedAlumni = useMemo(() => {
    if (!userSession) return [];
    let filtered = alumni.filter(a => a.id !== userSession.user.id);
    if (activeFilter === "unread") filtered = filtered.filter(a => unreadIds.includes(a.id));
    else if (activeFilter === "favourites") filtered = filtered.filter(a => favourites.includes(a.id));
    else if (activeFilter === "groups") return [];
    return filtered.filter(a => a.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [alumni, searchQuery, activeFilter, unreadIds, favourites, userSession]);

  const selectedChat = useMemo(() => alumni.find(c => c.id === selectedChatId), [alumni, selectedChatId]);
  const chatMessages = useMemo(() => selectedChatId ? (convoStore[selectedChatId] ?? []) : [], [convoStore, selectedChatId]);

  const handleSelectChat = useCallback((id: string) => {
    setSelectedChatId(id);
    setMessageText("");
    setUnreadIds(prev => prev.filter(uid => uid !== id));
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (!selectedChatId || !isCloudMode || !userSession) return;
    setIsFetchingMessages(true);
    (async () => {
      const { data, error } = await supabase
        .from("messages").select("*")
        .or(`and(sender_id.eq.${userSession.user.id},receiver_id.eq.${selectedChatId}),and(sender_id.eq.${selectedChatId},receiver_id.eq.${userSession.user.id})`)
        .order("created_at", { ascending: true });
      if (!error && data) setConvoStore(prev => ({ ...prev, [selectedChatId]: data }));
      setIsFetchingMessages(false);
    })();
    const channel = supabase.channel(`chat:${selectedChatId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `sender_id=eq.${selectedChatId}` }, (payload) => {
        setConvoStore(prev => ({ ...prev, [selectedChatId]: [...(prev[selectedChatId] ?? []), payload.new as Message] }));
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedChatId, isCloudMode, userSession]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages]);

  const handleSend = useCallback(async () => {
    if (!messageText.trim() || !selectedChatId || !userSession?.user?.id) return;
    const content = messageText.trim();
    
    // Optimistic UI Update
    const tempId = Date.now().toString();
    const newMessage: Message = { id: tempId, content, sender_id: userSession.user.id, created_at: new Date().toISOString() };
    setConvoStore(prev => ({ ...prev, [selectedChatId]: [...(prev[selectedChatId] ?? []), newMessage] }));
    setMessageText("");
    
    if (isCloudMode) {
      await supabase.from("messages").insert([{ sender_id: userSession.user.id, receiver_id: selectedChatId, content }]);
    }
  }, [messageText, selectedChatId, userSession, isCloudMode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const toggleFavourite = (id: string) => setFavourites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  const getLastMessage = (id: string) => { const msgs = convoStore[id]; return msgs?.length ? msgs[msgs.length - 1] : null; };

  const formatSidebarTime = (iso: string) => {
    const d = new Date(iso), now = new Date(), diff = (now.getTime() - d.getTime()) / 3600000;
    if (diff < 24) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 168) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const formatMsgTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Group messages: add date separators and detect consecutive sender groups
  const groupedMessages = useMemo(() => {
    const result: Array<{ type: "separator"; label: string } | { type: "message"; msg: Message; isFirst: boolean; isLast: boolean }> = [];
    let lastDate = "";
    chatMessages.forEach((msg, i) => {
      const dateStr = new Date(msg.created_at).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
      if (dateStr !== lastDate) { result.push({ type: "separator", label: dateStr }); lastDate = dateStr; }
      const prev = chatMessages[i - 1], next = chatMessages[i + 1];
      const isFirst = !prev || prev.sender_id !== msg.sender_id || new Date(msg.created_at).toDateString() !== new Date(prev.created_at).toDateString();
      const isLast = !next || next.sender_id !== msg.sender_id || new Date(msg.created_at).toDateString() !== new Date(next.created_at).toDateString();
      result.push({ type: "message", msg, isFirst, isLast });
    });
    return result;
  }, [chatMessages]);

  const myId = userSession?.user?.id ?? "self";

  if (!isLoaded) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-[#f97316] mb-3" size={28} />
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Connecting…</p>
    </div>
  );

  return (
    <div className="fixed top-[64px] bottom-0 left-0 right-0 flex bg-white font-sans overflow-hidden -mt-[64px] mt-0">

      {/* ─── SIDEBAR ───────────────────────────────────────────────── */}
      <div className={cn(
        "w-full md:w-[320px] lg:w-[360px] flex flex-col bg-white border-r border-slate-100 shrink-0",
        selectedChatId ? "hidden md:flex" : "flex"
      )}>

        {/* Sidebar Header */}
        <div className="px-4 pt-5 pb-3 space-y-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-slate-900">Messages</h2>
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search…"
              className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:bg-white transition-all border border-transparent focus:border-[#f97316]/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1">
            {[
              { key: "all", label: "All" },
              { key: "unread", label: "Unread", count: unreadIds.length },
              { key: "favourites", label: "Starred" },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1",
                  activeFilter === key
                    ? "bg-[#f97316]/10 text-[#f97316]"
                    : "text-slate-500 hover:bg-slate-50"
                )}
              >
                {label}
                {count && count > 0 ? <span className="h-4 min-w-[14px] px-1 bg-[#f97316] text-white rounded-full text-[9px] font-bold flex items-center justify-center">{count}</span> : null}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {connectedAlumni.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-3">
              <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                {activeFilter === "favourites" ? <Star size={20} /> : <Users size={20} />}
              </div>
              <p className="text-sm font-semibold text-slate-500">No {activeFilter !== "all" ? activeFilter : "conversations"} yet</p>
            </div>
          ) : (
            <div className="py-1">
              {connectedAlumni.map((chat) => {
                const lastMsg = getLastMessage(chat.id);
                const isUnread = unreadIds.includes(chat.id);
                const isFav = favourites.includes(chat.id);
                const isSelected = selectedChatId === chat.id;
                const lastMsgIsMe = lastMsg?.sender_id === myId;

                return (
                  <div
                    key={chat.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectChat(chat.id)}
                    onKeyDown={(e) => e.key === "Enter" && handleSelectChat(chat.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 relative group transition-all cursor-pointer",
                      isSelected ? "bg-orange-50" : "hover:bg-slate-50"
                    )}
                  >
                    {isSelected && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-[#f97316] rounded-r-full" />}

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className={cn(
                        "h-11 w-11 rounded-full flex items-center justify-center font-bold text-[15px] transition-all",
                        isSelected ? "bg-[#f97316] text-white" : "bg-slate-200 text-slate-600"
                      )}>
                        {chat.name.charAt(0)}
                      </div>
                      {/* Online dot */}
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                      {isUnread && (
                        <div className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-[#f97316] border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white">
                          {/* dot */}
                        </div>
                      )}
                    </div>

                    {/* Name + preview */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <span className={cn("text-[13px] truncate mr-2", isUnread ? "font-bold text-slate-900" : "font-semibold text-slate-700")}>
                          {chat.name}
                        </span>
                        {lastMsg && (
                          <span className={cn("text-[10px] shrink-0 font-medium", isUnread ? "text-[#f97316]" : "text-slate-400")}>
                            {formatSidebarTime(lastMsg.created_at)}
                          </span>
                        )}
                      </div>
                      <p className={cn("text-[12px] truncate", isUnread ? "font-semibold text-slate-600" : "font-normal text-slate-400")}>
                        {lastMsg
                          ? `${lastMsgIsMe ? "You: " : ""}${lastMsg.content}`
                          : `${chat.job} · ${chat.company}`}
                      </p>
                    </div>

                    {/* Star */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavourite(chat.id); }}
                      className={cn("shrink-0 p-1 rounded transition-all", isFav ? "text-amber-400 opacity-100" : "text-slate-300 opacity-0 group-hover:opacity-100")}
                    >
                      <Star size={13} fill={isFav ? "currentColor" : "none"} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── CHAT PANEL ────────────────────────────────────────────── */}
      <div className={cn("flex-1 flex flex-col min-w-0 bg-[#f8f9fb]", !selectedChatId ? "hidden md:flex" : "flex")}>

        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-[64px] px-5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedChatId(null)} className="md:hidden p-1.5 -ml-1.5 text-slate-500 hover:text-slate-800 transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-[#f97316] flex items-center justify-center text-white font-bold text-[13px]">
                    {selectedChat.name.charAt(0)}
                  </div>
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900 leading-tight">{selectedChat.name}</p>
                  <p className="text-[11px] text-green-500 font-semibold leading-tight">Active now</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/dashboard/profile/${selectedChat.id}`}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg transition-all uppercase tracking-wider"
                >
                  View Profile
                </Link>
                <button
                  onClick={() => toggleFavourite(selectedChat.id)}
                  className={cn("p-2 rounded-xl transition-all", favourites.includes(selectedChat.id) ? "text-amber-400" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50")}
                >
                  <Star size={17} fill={favourites.includes(selectedChat.id) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-16 py-6 space-y-[2px]">
              {isFetchingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="animate-spin text-[#f97316]" size={24} />
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="h-14 w-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 shadow-sm">
                    <MessageSquare size={22} />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Start the conversation</p>
                  <p className="text-xs text-slate-400">Send a message to {selectedChat.name}.</p>
                </div>
              ) : (
                groupedMessages.map((item, i) => {
                  if (item.type === "separator") {
                    return (
                      <div key={`sep-${i}`} className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2 shrink-0 whitespace-nowrap">{item.label}</span>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>
                    );
                  }

                  const { msg, isFirst, isLast } = item;
                  const isMe = msg.sender_id === myId;

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex items-end gap-2 group",
                        isMe ? "flex-row-reverse" : "flex-row",
                        isFirst ? "mt-4" : "mt-[2px]"
                      )}
                    >
                      {/* Avatar */}
                      <div className="w-7 shrink-0 mb-0.5">
                        {!isMe && isLast && (
                          <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-500">
                            {selectedChat.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Bubble */}
                      <div className={cn("flex flex-col max-w-[65%]", isMe ? "items-end" : "items-start")}>
                        {isFirst && !isMe && (
                          <span className="text-[11px] font-semibold text-slate-500 mb-1 ml-1">{selectedChat.name}</span>
                        )}
                        <div className={cn(
                          "px-4 py-2.5 text-[13.5px] leading-[1.5] font-normal shadow-sm",
                          isMe
                            ? cn("bg-[#f97316] text-white", isFirst && isLast ? "rounded-2xl" : isFirst ? "rounded-2xl rounded-br-lg" : isLast ? "rounded-2xl rounded-tr-lg" : "rounded-lg rounded-r-lg")
                            : cn("bg-white text-slate-800 border border-slate-100", isFirst && isLast ? "rounded-2xl" : isFirst ? "rounded-2xl rounded-bl-lg" : isLast ? "rounded-2xl rounded-tl-lg" : "rounded-lg rounded-l-lg")
                        )}>
                          {msg.content}
                        </div>
                        {isLast && (
                          <div className={cn("flex items-center gap-1 mt-1 px-1", isMe ? "flex-row-reverse" : "flex-row")}>
                            <span className="text-[10px] text-slate-400 font-medium">{formatMsgTime(msg.created_at)}</span>
                            {isMe && <CheckCheck size={12} className="text-slate-400" />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <div className="px-4 md:px-8 lg:px-16 py-4 bg-white border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 focus-within:bg-white focus-within:border-[#f97316]/30 focus-within:ring-4 focus-within:ring-[#f97316]/8 transition-all shadow-sm">
                <input
                  ref={inputRef}
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${selectedChat.name}…`}
                  className="flex-1 bg-transparent text-[13.5px] font-medium text-slate-800 placeholder:text-slate-400 outline-none py-1.5 pl-2"
                />
                <button
                  onClick={handleSend}
                  disabled={!messageText.trim()}
                  className={cn(
                    "p-2 rounded-xl transition-all shrink-0",
                    messageText.trim()
                      ? "bg-[#f97316] text-white hover:bg-orange-600 active:scale-95 shadow-md shadow-orange-500/20"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  )}
                >
                  <Send size={15} />
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
                <kbd className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-bold">Enter</kbd> to send &nbsp;·&nbsp; <kbd className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-bold">Shift + Enter</kbd> for new line
              </p>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="relative mb-8">
              <div className="h-24 w-24 bg-white border border-slate-100 rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-slate-100">
                <MessageSquare size={36} className="text-[#f97316]" />
              </div>
              <div className="absolute -top-1 -right-1 h-8 w-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <Check size={14} className="text-white" strokeWidth={3} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Your Messages</h3>
            <p className="text-sm text-slate-400 font-medium max-w-[260px] leading-relaxed mb-8">
              Connect and communicate with UIU alumni across the globe.
            </p>
            <Link
              href="/dashboard/connections"
              className="px-6 py-2.5 bg-[#f97316] text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
            >
              Find Connections
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
