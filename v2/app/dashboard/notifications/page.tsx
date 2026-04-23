"use client";

import React, { useState, useMemo } from "react";
import { 
  Bell, 
  Briefcase, 
  CheckCircle2, 
  RefreshCcw,
  Zap,
  Target,
  Users,
  Heart,
  MessageSquare,
  UserPlus,
  Send,
  Loader2
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useGlobalStore } from "@/lib/store";

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, isLoaded } = useGlobalStore();
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    return notifications.filter(n => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'job': return <Briefcase size={16} />;
      case 'system': return <Bell size={16} />;
      case 'like': return <Heart size={16} />;
      case 'comment': return <MessageSquare size={16} />;
      case 'connection': return <UserPlus size={16} />;
      case 'message': return <Send size={16} />;
      default: return <CheckCircle2 size={16} />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'job': return 'Career Alert';
      case 'system': return 'System Notice';
      case 'like': return 'New Like';
      case 'comment': return 'Post Activity';
      case 'connection': return 'Network Update';
      case 'message': return 'Direct Message';
      default: return 'Institutional Update';
    }
  };

  const getActionText = (type: string) => {
    switch (type) {
      case 'job': return 'View Job';
      case 'like': case 'comment': return 'View Post';
      case 'connection': return 'View Profile';
      case 'message': return 'Open Inbox';
      default: return 'Review Update';
    }
  };

  const getIconStyle = (type: string, isRead: boolean) => {
    if (isRead) return "bg-slate-50 border-slate-100 text-slate-400";
    switch (type) {
      case 'job': return "bg-orange-50 border-[#f97316]/20 text-[#f97316]";
      case 'system': return "bg-[#0f172a] border-[#0f172a] text-white";
      default: return "bg-slate-50 border-slate-100 text-slate-500";
    }
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
       <Loader2 className="animate-spin text-[#f97316] mb-4" size={32} />
       <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Loading Alerts</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans">
      
      {/* ── STICKY HEADER ─────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-[64px] z-30 pt-6 pb-4">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
             <div>
               <p className="text-[10px] font-bold text-[#f97316] uppercase tracking-widest flex items-center gap-1.5 mb-1">
                 <Bell size={12} strokeWidth={2.5} /> Identity Updates
               </p>
               <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 leading-none">
                 Notification <span className="text-slate-300 font-light">Center</span>
               </h1>
             </div>
             
             <button 
               onClick={markAllNotificationsRead}
               className="px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-slate-500 hover:text-slate-900 bg-slate-50 border border-slate-200 hover:bg-slate-100"
             >
                <CheckCircle2 size={13} /> Mark all read
             </button>
           </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
             {["all", "job", "system"].map((f) => (
                <button 
                  key={f} 
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    "text-[11px] font-bold uppercase tracking-widest transition-all px-6 py-2 rounded-lg whitespace-nowrap",
                    activeFilter === f ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-transparent"
                  )}
                >
                   {f}
                   {f === 'all' && unreadCount > 0 && (
                     <span className="ml-2 bg-[#f97316] text-white px-1.5 py-0.5 rounded-full text-[9px] font-black">
                       {unreadCount}
                     </span>
                   )}
                </button>
             ))}
          </div>
        </div>
      </div>

      {/* ── FEED ──────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        <div className="space-y-3">
           {filteredNotifications.length > 0 ? (
             filteredNotifications.map((notif) => {
               const isRead = notif.read;
               
               return (
                 <div 
                   key={notif.id} 
                   onClick={() => markNotificationRead(notif.id)}
                   className={cn(
                     "group relative p-5 bg-white rounded-2xl flex flex-col sm:flex-row gap-5 sm:items-center transition-all cursor-pointer shadow-sm border",
                     !isRead ? "border-[#f97316]/20 hover:border-[#f97316]/40" : "border-slate-200 opacity-80 hover:opacity-100 hover:shadow-md"
                   )}
                 >
                    {/* Unread indicator line */}
                    {!isRead && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#f97316] rounded-r-md" />}

                    <div className="flex gap-4 items-start flex-1">
                      <div className="shrink-0 relative">
                        <div className={cn(
                          "h-14 w-14 rounded-full flex items-center justify-center transition-all border-2 shrink-0",
                          !isRead && notif.type === 'job' && "bg-orange-50 border-orange-100 text-[#f97316]",
                          !isRead && notif.type === 'system' && "bg-slate-900 border-slate-800 text-white",
                          !isRead && notif.type === 'like' && "bg-pink-50 border-pink-100 text-pink-500",
                          !isRead && notif.type === 'comment' && "bg-blue-50 border-blue-100 text-blue-500",
                          !isRead && notif.type === 'connection' && "bg-emerald-50 border-emerald-100 text-emerald-500",
                          !isRead && notif.type === 'message' && "bg-purple-50 border-purple-100 text-purple-500",
                          !isRead && !['job','system','like','comment','connection','message'].includes(notif.type) && "bg-blue-50 border-blue-100 text-blue-500",
                          isRead && "bg-slate-50 border-slate-100 text-slate-400"
                        )}>
                           {getIcon(notif.type)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 pt-1">
                         <p className={cn("text-sm sm:text-base leading-tight pr-4", !isRead ? "text-slate-900 font-bold" : "text-slate-600 font-medium")}>{notif.title}</p>
                         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                            <span>{formatRelativeTime(notif.createdAt)}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span className="text-[#f97316]">{getTypeText(notif.type)}</span>
                         </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 sm:mt-0 ml-16 sm:ml-0 self-start sm:self-auto">
                       <button className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap">
                          {getActionText(notif.type)}
                       </button>
                       <button className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-transparent transition-all" title="Mark as done">
                          <CheckCircle2 size={16} />
                       </button>
                    </div>
                 </div>
               );
             })
           ) : (
             <div className="py-24 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
                <div className="h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300 mb-5">
                   <Bell size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">All caught up</h3>
                <p className="text-sm text-slate-400 font-medium">You have no new notifications.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
