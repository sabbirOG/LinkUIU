"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Briefcase, 
  Users, 
  MessageSquare, 
  Bell, 
  UserCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileLinks = [
  { name: "Feed", href: "/dashboard", icon: Home },
  { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { name: "Network", href: "/dashboard/connections", icon: Users },
  { name: "Chat", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Profile", href: "/dashboard/profile/self", icon: UserCircle },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[110] bg-white border-t border-slate-100 pb-safe shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-4">
        {mobileLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 min-w-[70px] h-full transition-all relative group",
                isActive ? "text-[#f97316]" : "text-slate-300 hover:text-slate-900"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive ? "bg-orange-50" : "bg-transparent group-hover:bg-slate-50"
              )}>
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 3 : 2}
                  className={cn("transition-transform group-active:scale-90")}
                />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-[0.2em] transition-all",
                isActive ? "opacity-100 scale-110" : "opacity-40"
              )}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
