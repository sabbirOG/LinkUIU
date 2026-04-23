"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-20 px-6 border-t border-white/5">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <img src="/assets/images/uiu_logo.png" alt="UIU" className="h-7 brightness-0 invert opacity-40" />
                <div className="w-px h-5 bg-white/10"></div>
                <img src="/assets/images/linkuiu_logo.png" alt="LinkUIU" className="h-6 opacity-80 cursor-pointer" onClick={() => window.location.href = '/'} />
              </div>
              <p className="text-slate-500 font-medium text-[13px] leading-relaxed max-w-xs">
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
                  { name: "UIU Campus Home", path: "https://www.uiu.ac.bd", external: true },
                  { name: "Governance", path: "https://www.uiu.ac.bd/about-uiu/governance/", external: true },
                  { name: "Privacy Protocol", path: "https://www.uiu.ac.bd/privacy-policy/", external: true },
                  { name: "Network Terms", path: "https://www.uiu.ac.bd/site-info/", external: true }
                ] 
              },
              { 
                title: "Support", 
                links: [
                  { name: "Help Desk", path: "mailto:alumni@uiu.ac.bd", external: true },
                  { name: "Report Issue", path: "mailto:support@uiu.ac.bd?subject=LinkUIU Issue Report", external: true },
                  { name: "Developer Team", path: "https://www.uiu.ac.bd/about-uiu/", external: true },
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

          {/* Hiding Softrover Branding for now - Re-enable on request */}
          {/* <div className="flex items-center gap-4 opacity-50">
             <img src="/assets/images/softrover-logo.png" alt="SoftRover" className="h-4 brightness-0 invert" />
          </div> */}

        </div>
      </div>
    </footer>
  );
}
