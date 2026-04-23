"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-32 px-6 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#f97316_0.5px,transparent_0.5px)] [background-size:32px_32px] opacity-5"></div>
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-4 gap-20 mb-24">
          
          {/* Brand Info */}
          <div className="lg:col-span-1 space-y-10">
            <div className="flex flex-col gap-10">
              <div className="flex items-center gap-5">
                <img src="/assets/images/uiu_logo.png" alt="UIU" className="h-8 brightness-0 invert opacity-40" />
                <div className="w-px h-6 bg-white/10"></div>
                <img src="/assets/images/linkuiu_logo.png" alt="LinkedUIU" className="h-7 opacity-90 cursor-pointer" onClick={() => window.location.href = '/'} />
              </div>
              <p className="text-slate-500 font-bold text-[14px] leading-relaxed max-w-xs tracking-tight italic">
                Forging connections between institutional leaders and global achievers. The official professional ecosystem for United International University.
              </p>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-3 grid sm:grid-cols-3 gap-16 pt-2">
            {[
              { 
                title: "Network Nodes", 
                links: [
                  { name: "Global Directory", path: "/dashboard/directory" },
                  { name: "Career Hub", path: "/dashboard/jobs" },
                  { name: "Pulse Feed", path: "/dashboard" },
                  { name: "Identity Portal", path: "/dashboard/profile/self" }
                ] 
              },
              { 
                title: "Institutional", 
                links: [
                  { name: "Campus Primary", path: "https://www.uiu.ac.bd", external: true },
                  { name: "Governance", path: "https://www.uiu.ac.bd/about-uiu/governance/", external: true },
                  { name: "Privacy Protocol", path: "https://www.uiu.ac.bd/privacy-policy/", external: true },
                  { name: "Global Terms", path: "https://www.uiu.ac.bd/site-info/", external: true }
                ] 
              },
              { 
                title: "Signal Center", 
                links: [
                  { name: "Help Desk", path: "mailto:alumni@uiu.ac.bd", external: true },
                  { name: "Status Report", path: "mailto:support@uiu.ac.bd?subject=LinkedUIU Issue Report", external: true },
                  { name: "Archivist", path: "https://www.uiu.ac.bd/about-uiu/", external: true },
                  { name: "Login Gateway", path: "/login" }
                ] 
              }
            ].map((col, idx) => (
              <div key={idx} className="space-y-8">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] text-[#f97316]">{col.title}</h4>
                <ul className="space-y-5 text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      {link.external ? (
                        <a href={link.path} target="_blank" className="hover:text-white transition-all">{link.name}</a>
                      ) : (
                        <Link href={link.path} className="hover:text-white transition-all">{link.name}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">
            &copy; 2026 <span className="text-[#f97316]">UIU ALUMNI PROTOCOL</span> · Institutional Grade Edition
          </p>

          <div className="flex items-center gap-8 opacity-20 hover:opacity-50 transition-opacity duration-500 grayscale">
             <img src="/assets/images/uiu_logo.png" alt="UIU" className="h-6 brightness-0 invert" />
          </div>
        </div>
      </div>
    </footer>
  );
}
