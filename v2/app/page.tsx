"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronLeft, ChevronRight, Phone, Mail, MapPin, Globe, User, Briefcase, GraduationCap, Target, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const [featuredAlumni] = useState<any[]>([
    { "name": "Md. Tarek Hasan", "profession": "Software Engineer", "company": "Samsung R&D", "image": "alumni-tarek.jpg", "batch": "131", "id": "tarek-hasan" },
    { "name": "Md Mahbub Hossain", "profession": "Lead Engineer", "company": "Apple Inc. (USA)", "image": "alumni-mahbub.jpg", "batch": "083", "id": "mahbub-hossain" },
    { "name": "Zakir Hossen", "profession": "Software Development Engineer", "company": "Amazon", "image": "alumni-zakir.jpg", "batch": "161", "id": "zakir-hossen" },
    { "name": "Hasan Sonet", "profession": "Senior Programmer", "company": "CITS UIU", "image": "alumni-sonet.jpg", "batch": "092", "id": "hasan-sonet" },
    { "name": "Nizamuddin Rashid", "profession": "Additional Managing Director", "company": "United Group", "image": "alumni-nizamuddin.jpg", "batch": "052", "id": "nizamuddin-rashid" },
    { "name": "Md Faisal Kabir", "profession": "Assistant Professor", "company": "Penn State University", "image": "alumni-kabir.jpg", "batch": "101", "id": "faisal-kabir" },
    { "name": "Ashikur Rahman", "profession": "Senior Physical Design Engineer", "company": "Intel Corporation", "image": "alumni-ashikur.jpg", "batch": "121", "id": "ashikur-rahman" },
    { "name": "Achia Nila", "profession": "Founder", "company": "Women in Digital", "image": "alumni-nila.jpg", "batch": "112", "id": "achia-nila" },
    { "name": "Esfaquel Hoque", "profession": "AGM & Marketing Lead", "company": "RFL Group", "image": "alumni-esfaquel.jpg", "batch": "102", "id": "esfaquel-hoque" },
    { "name": "Foysal Ahamed", "profession": "Principal Software Engineer", "company": "TigerIT Bangladesh Limited", "image": "alumni-foysal.jpg", "batch": "091", "id": "foysal-ahamed" }
  ]);
  
  const extendedAlumni = [...featuredAlumni, ...featuredAlumni, ...featuredAlumni];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: any;
    if (!isPaused) {
      interval = setInterval(() => {
        if (scrollRef.current) {
          const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
          const cardWidth = clientWidth > 1024 ? clientWidth / 3 : clientWidth > 640 ? clientWidth / 2 : clientWidth;
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollRef.current.scrollTo({ left: scrollWidth / 3, behavior: 'auto' });
          } else {
            scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
          }
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (scrollRef.current) {
      const { scrollWidth } = scrollRef.current;
      scrollRef.current.scrollTo({ left: scrollWidth / 3, behavior: 'auto' });
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
      const cardWidth = clientWidth > 1024 ? clientWidth / 3 : clientWidth > 640 ? clientWidth / 2 : clientWidth;
      if (direction === 'right' && scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: scrollWidth / 3, behavior: 'auto' });
      } else if (direction === 'left' && scrollLeft <= 10) {
        scrollRef.current.scrollTo({ left: scrollWidth / 3, behavior: 'auto' });
      } else {
        scrollRef.current.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative h-[90vh] flex items-center justify-center text-white overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/images/banner.jpg" 
            alt="UIU Campus" 
            className="w-full h-full object-cover opacity-40 transform scale-110 animate-slow-zoom" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/80"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-top duration-1000">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f97316]"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 leading-none mb-0.5">The Global UIU Institutional Network</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] animate-in fade-in slide-in-from-bottom duration-1000">
             The Professional <br /> <span className="text-[#f97316]">Network</span> Of UIU
          </h1>
          
          <p className="max-w-xl mx-auto mt-8 text-lg font-medium text-slate-400 animate-in fade-in duration-1000 delay-300">
            Connecting leaders, innovators, and global achievers. A secure professional hub built for the elite UIU community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12 animate-in fade-in duration-1000 delay-500">
            <Link href="/dashboard/directory" className="bg-[#f97316] hover:bg-orange-600 text-white px-10 py-4 rounded-xl font-bold text-sm transition-all shadow-xl shadow-orange-500/20">Expand Your Network</Link>
            <Link href="/login" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 px-10 py-4 rounded-xl font-bold text-sm transition-all">Sign In to Dashboard</Link>
          </div>
        </div>
      </section>

      {/* FEATURED ALUMNI */}
      <section className="py-32 bg-slate-50 relative border-b border-slate-200" 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="space-y-3">
               <div className="inline-flex items-center gap-2 text-[#f97316] font-bold uppercase tracking-widest text-[10px]">
                  <Target size={14} className="stroke-[3px]" /> Global Footprint
               </div>
               <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Institutional <span className="text-slate-400 font-light">Leaders</span></h2>
            </div>
            <div className="flex gap-4">
               <button onClick={() => scroll('left')} className="h-12 w-12 bg-white border border-slate-200 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">
                 <ChevronLeft size={20} />
               </button>
               <button onClick={() => scroll('right')} className="h-12 w-12 bg-white border border-slate-200 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">
                 <ChevronRight size={20} />
               </button>
            </div>
          </div>

          <div 
            ref={scrollRef} 
            className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pt-4 pb-8"
          >
            {extendedAlumni.map((alumnus, i) => (
              <div key={i} className="min-w-full sm:min-w-[50%] lg:min-w-[33.33%] snap-center">
                <Link href={`/dashboard/profile/${alumnus.id}`} className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center text-center space-y-6 hover:shadow-xl hover:border-[#f97316]/20 transition-all duration-300 group">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl font-bold text-slate-200 group-hover:bg-[#f97316] group-hover:text-white group-hover:border-[#f97316] transition-all duration-300 overflow-hidden shadow-sm">
                      {alumnus.image ? (
                        <img 
                          src={`/assets/images/featured/${alumnus.image}`} 
                          alt={alumnus.name}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => (e.target as any).style.display = 'none'}
                        />
                      ) : null}
                      <span className="group-hover:scale-110 transition-transform">{alumnus.name.charAt(0)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-slate-900 group-hover:text-[#f97316] transition-colors">{alumnus.name}</h4>
                    <div>
                      <p className="text-xs font-bold text-[#f97316] uppercase tracking-wider">{alumnus.profession}</p>
                      <p className="text-xs font-semibold text-slate-400 mt-1">{alumnus.company}</p>
                    </div>
                  </div>

                  <div className="w-full pt-6 border-t border-slate-50">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1">
                        Batch {alumnus.batch} · UIU Verified Member
                     </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORLD EVENTS */}
      <section className="py-32 bg-white">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
            <div className="space-y-3">
               <div className="text-[#f97316] font-bold uppercase tracking-widest text-[10px]">Upcoming Gatherings</div>
               <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Institutional <span className="text-slate-400 font-light">Events</span></h2>
            </div>
            <Link href="/dashboard/events" className="group flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-[#f97316] transition-colors uppercase tracking-widest">
              Explore All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {[
              { title: "ANNUAL ALUMNI IFTAR MAHFIL 2026", date: "MAR 14", location: "UIU Campus, Dhaka", image: "/assets/images/banner.jpg" },
              { title: "UIU NORTH AMERICA REUNION", date: "APR 05", location: "Toronto, Canada", image: "/assets/images/uiu-godhuli.jpg" }
            ].map((event, idx) => (
              <div key={idx} className="group flex flex-col md:flex-row bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:bg-white transition-all duration-300">
                <div className="md:w-1/3 relative h-48 md:h-auto overflow-hidden">
                   <img src={event.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                </div>
                <div className="md:w-2/3 p-8 flex flex-col justify-between">
                   <div className="space-y-5">
                      <div className="flex items-center gap-6">
                         <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center shadow-sm">
                            <p className="text-xl font-bold text-[#f97316] leading-none mb-1">{event.date.split(' ')[1]}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{event.date.split(' ')[0]}</p>
                         </div>
                         <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                            <MapPin size={12} className="text-[#f97316]/60" /> {event.location}
                         </div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 group-hover:text-[#f97316] transition-colors leading-tight">{event.title}</h3>
                   </div>
                   <Link href="#" className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-slate-900 hover:text-[#f97316] transition-colors uppercase tracking-widest">
                      Register Interest <ArrowRight size={14} />
                   </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <section className="py-32 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f97316] blur-[160px] opacity-10 rounded-full -mr-48 -mt-48"></div>
        <div className="max-w-4xl mx-auto px-6 text-center space-y-10 relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">Ready to bridge the gap in your <span className="text-[#f97316]">Professional</span> journey?</h2>
          <p className="text-lg font-medium text-slate-400 max-w-2xl mx-auto">Join thousands of UIU graduates already using the portal to accelerate their careers and build institutional connections.</p>
          <div className="pt-4">
             <Link href="/register" className="bg-[#f97316] hover:bg-orange-600 text-white px-12 py-5 rounded-xl font-bold text-base transition-all shadow-xl shadow-orange-500/20 inline-block">Join the Network Today</Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  );
}
