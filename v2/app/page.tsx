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
      <section className="relative h-[85vh] flex items-center justify-center text-white overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/images/banner.jpg" 
            alt="UIU Campus" 
            className="w-full h-full object-cover opacity-30" 
          />
          <div className="absolute inset-0 bg-slate-950/60"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-10">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f97316]"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 leading-none">The Global UIU Institutional Network</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
             The Professional <span className="text-[#f97316]">Network</span> <br /> of UIU Graduates
          </h1>
          
          <p className="max-w-xl mx-auto mt-8 text-base font-medium text-slate-400">
            Connecting leaders and global achievers. A secure professional hub built for the United International University community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
            <Link href="/dashboard/directory" className="bg-[#f97316] hover:bg-orange-600 text-white px-10 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md">Expand Your Network</Link>
            <Link href="/login" className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-3.5 rounded-xl font-bold text-sm transition-all">Sign In to Dashboard</Link>
          </div>
        </div>
      </section>

      {/* FEATURED ALUMNI */}
      <section className="py-24 bg-white border-b border-slate-100" 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
            <div className="space-y-2">
               <div className="text-[#f97316] font-bold uppercase tracking-widest text-[9px]">Global Footprint</div>
               <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Institutional Leaders</h2>
            </div>
            <div className="flex gap-3">
               <button onClick={() => scroll('left')} className="h-10 w-10 bg-white border border-slate-200 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                 <ChevronLeft size={18} />
               </button>
               <button onClick={() => scroll('right')} className="h-10 w-10 bg-white border border-slate-200 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                 <ChevronRight size={18} />
               </button>
            </div>
          </div>

          <div 
            ref={scrollRef} 
            className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4"
          >
            {extendedAlumni.map((alumnus, i) => (
              <div key={i} className="min-w-full sm:min-w-[50%] lg:min-w-[33.33%] snap-center px-1">
                <Link href={`/dashboard/profile/${alumnus.id}`} className="bg-slate-50/50 border border-slate-100 rounded-xl p-8 flex flex-col items-center text-center space-y-6 hover:bg-white hover:border-slate-200 hover:shadow-lg transition-all duration-300 group">
                  <div className="h-20 w-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl font-bold text-slate-300 group-hover:border-[#f97316]/30 transition-all overflow-hidden shadow-sm">
                    {alumnus.image ? (
                      <img 
                        src={`/assets/images/featured/${alumnus.image}`} 
                        alt={alumnus.name}
                        className="h-full w-full object-cover"
                        onError={(e) => (e.target as any).style.display = 'none'}
                      />
                    ) : null}
                    <span>{alumnus.name.charAt(0)}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-slate-900">{alumnus.name}</h4>
                    <p className="text-[10px] font-bold text-[#f97316] uppercase tracking-wider">{alumnus.profession}</p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1">{alumnus.company}</p>
                  </div>

                  <div className="w-full pt-6 border-t border-slate-100 mt-4">
                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Batch {alumnus.batch} · Verified Member
                     </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORLD EVENTS */}
      <section className="py-24 bg-slate-50/50">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="space-y-2">
               <div className="text-[#f97316] font-bold uppercase tracking-widest text-[9px]">Upcoming Gatherings</div>
               <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Institutional Events</h2>
            </div>
            <Link href="/dashboard/events" className="group flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
              Explore All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {[
              { title: "ANNUAL ALUMNI IFTAR MAHFIL 2026", date: "MAR 14", location: "UIU Campus, Dhaka", image: "/assets/images/banner.jpg" },
              { title: "UIU NORTH AMERICA REUNION", date: "APR 05", location: "Toronto, Canada", image: "/assets/images/uiu-godhuli.jpg" }
            ].map((event, idx) => (
              <div key={idx} className="group flex flex-col md:flex-row bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
                <div className="md:w-1/3 relative h-48 md:h-auto overflow-hidden bg-slate-100">
                   <img src={event.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                </div>
                <div className="md:w-2/3 p-8 flex flex-col justify-between">
                   <div className="space-y-4">
                      <div className="flex items-center gap-4">
                         <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-center">
                            <p className="text-lg font-bold text-slate-900 leading-none">{event.date.split(' ')[1]}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{event.date.split(' ')[0]}</p>
                         </div>
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <MapPin size={12} /> {event.location}
                         </div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#f97316] transition-colors leading-tight">{event.title}</h3>
                   </div>
                   <Link href="#" className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold text-slate-900 hover:text-[#f97316] transition-colors uppercase tracking-widest">
                      Register Interest <ArrowRight size={14} />
                   </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">Bridge the gap in your <br /> <span className="text-[#f97316]">Professional</span> journey</h2>
          <p className="text-base font-medium text-slate-400 max-w-xl mx-auto">Join thousands of UIU graduates using the portal to accelerate their careers and build institutional connections.</p>
          <div className="pt-4">
             <Link href="/register" className="bg-[#f97316] hover:bg-orange-600 text-white px-10 py-4 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/10 inline-block">Join the Network Today</Link>
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
