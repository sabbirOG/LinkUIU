"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-24 px-6 relative overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-4 gap-16 mb-20">
          
          {/* Brand Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <img src="/assets/images/uiu_logo.png" alt="UIU" className="h-8 brightness-0 invert" />
                <div className="w-px h-6 bg-white/10"></div>
                <img src="/assets/images/linkuiu_logo.png" alt="LinkUIU" className="h-7 cursor-pointer" onClick={() => window.location.href = '/'} />
              </div>
              <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs">
                The official professional portal for UIU graduates. Bridging the gap between academic excellence and global career success.
              </p>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-3 grid sm:grid-cols-3 gap-12 pt-2">
            {[
              { 
                title: "Network Hub", 
                links: [
                  { name: "Alumni Directory", path: "/dashboard/directory" },
                  { name: "Career Services", path: "/dashboard/jobs" },
                  { name: "Institutional Pulse", path: "/dashboard" },
                  { name: "Identity Portal", path: "/dashboard/profile/self" }
                ] 
              },
              { 
                title: "Institutional", 
                links: [
                  { name: "UIU Campus Home", path: "https://uiu.ac.bd", external: true },
                  { name: "Governance", path: "#" },
                  { name: "Privacy Protocol", path: "#" },
                  { name: "Network Terms", path: "#" }
                ] 
              },
              { 
                title: "Support", 
                links: [
                  { name: "Help Desk", path: "mailto:alumni@uiu.ac.bd", external: true },
                  { name: "Report Issue", path: "#" },
                  { name: "Developer Team", path: "#" },
                  { name: "Admin Portal", path: "/login" }
                ] 
              }
            ].map((col, idx) => (
              <div key={idx} className="space-y-6">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest">{col.title}</h4>
                <ul className="space-y-3.5 text-xs font-medium text-slate-500">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      {link.external ? (
                        <a href={link.path} target="_blank" className="hover:text-[#f97316] transition-all">{link.name}</a>
                      ) : (
                        <Link href={link.path} className="hover:text-[#f97316] transition-all">{link.name}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            &copy; 2026 UIU ALUMNI PROTOCOL · <span className="text-slate-400">Institutional Edition</span>
          </p>
          <div className="flex items-center gap-4 opacity-50">
             <img src="/assets/images/softrover-logo.png" alt="SoftRover" className="h-4 brightness-0 invert" />
          </div>
        </div>
      </div>
    </footer>
  );
}
