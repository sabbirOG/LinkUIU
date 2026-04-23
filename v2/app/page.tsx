"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronLeft, ChevronRight, Phone, Mail, MapPin, Globe, User, Briefcase, GraduationCap, Target, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/lib/store";

export default function LandingPage() {
  const { userSession, isLoaded } = useGlobalStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && userSession) {
      router.replace("/dashboard");
    }
  }, [isLoaded, userSession, router]);

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
      <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/images/banner.jpg" 
            alt="UIU" 
            className="w-full h-full object-cover opacity-30 grayscale-[0.5]" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80 leading-none">The Official United International University (UIU) Alumni Connect</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-8 animate-in fade-in zoom-in duration-1000">
            The Elite <span className="text-[#f97316]">Alumni Community</span> <br /> of UIU Graduates
          </h1>
          
          <p className="max-w-2xl mx-auto text-base sm:text-lg font-medium text-slate-300 leading-relaxed px-4 opacity-80 mb-12">
            Join the official UIU Alumni Association network. Connecting leaders and global achievers through the definitive alumni directory and professional hub.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <Link href="/dashboard/directory" className="w-full sm:w-auto bg-[#f97316] hover:bg-orange-600 text-white px-10 py-4 rounded-xl font-bold text-sm transition-all shadow-xl active:scale-95">Explore Alumni Directory</Link>
            <Link href="/login" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/20 px-10 py-4 rounded-xl font-bold text-sm transition-all active:scale-95">Sign In to LinkedUIU</Link>
          </div>
        </div>
      </section>

      {/* FEATURED ALUMNI */}
      <section className="py-32 bg-white relative overflow-hidden" 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12 mb-20">
            <div className="space-y-4 text-left">
               <div className="text-[#f97316] font-black uppercase tracking-[0.3em] text-[11px]">
                  Global Footprint
               </div>
               <h2 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter leading-none">Institutional Leaders</h2>
            </div>
          </div>

          <div 
            ref={scrollRef} 
            className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8"
          >
            {extendedAlumni.map((alumnus, i) => (
              <div key={i} className="min-w-full sm:min-w-[50%] lg:min-w-[40%] snap-center px-2">
                <Link href={`/dashboard/profile/${alumnus.id}`} className="bg-slate-50 border border-slate-50 rounded-[40px] p-10 flex flex-col items-center text-center space-y-8 hover:bg-white hover:border-slate-100 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500 group">
                  <div className="h-28 w-28 rounded-[32px] bg-white border border-slate-100 flex items-center justify-center text-3xl font-black text-slate-200 group-hover:border-[#f97316]/30 group-hover:shadow-xl transition-all overflow-hidden shadow-sm">
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
                  
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">{alumnus.name}</h4>
                    <p className="text-[11px] font-black text-[#f97316] uppercase tracking-[0.2em]">{alumnus.profession}</p>
                    <p className="text-sm font-bold text-slate-400 mt-2 tracking-tight italic opacity-70">{alumnus.company}</p>
                  </div>

                  <div className="w-full pt-8 border-t border-slate-100 mt-6">
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                        Node {alumnus.batch} · Active Signal
                     </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Navigation Arrows - Centered and Smaller */}
          <div className="flex justify-center gap-3 mt-4">
             <button onClick={() => scroll('left')} className="h-10 w-10 bg-white border border-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90">
               <ChevronLeft size={18} />
             </button>
             <button onClick={() => scroll('right')} className="h-10 w-10 bg-white border border-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90">
               <ChevronRight size={18} />
             </button>
          </div>
        </div>
      </section>

      {/* WORLD EVENTS */}
      <section className="py-32 bg-[#f8f9fb]">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12 mb-20">
            <div className="space-y-4 text-left">
               <div className="text-[#f97316] font-black uppercase tracking-[0.4em] text-[10px]">Temporal Vectors</div>
               <h2 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">Event <br /> <span className="text-slate-300">Timeline</span></h2>
            </div>
            <Link href="/dashboard/events" className="group flex items-center gap-3 text-[11px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.3em] ml-0 md:ml-auto">
              View All <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {[
              { title: "ANNUAL ALUMNI IFTAR MAHFIL 2026", date: "MAR 14", location: "Dhaka HQ", image: "/assets/images/banner.jpg" },
              { title: "NORTH AMERICA REUNION GALA", date: "APR 05", location: "Toronto Node", image: "/assets/images/uiu-godhuli.jpg" }
            ].map((event, idx) => (
              <div key={idx} className="group flex flex-col md:flex-row bg-white border border-slate-200/60 rounded-[40px] overflow-hidden hover:shadow-2xl hover:border-transparent transition-all duration-500">
                <div className="md:w-2/5 relative h-64 md:h-auto overflow-hidden bg-slate-900">
                   <img src={event.image} alt="" className="w-full h-full object-cover opacity-60 md:grayscale md:group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                   <div className="absolute inset-0 bg-gradient-to-r from-slate-950 to-transparent md:hidden"></div>
                </div>
                <div className="md:w-3/5 p-10 flex flex-col justify-between">
                   <div className="space-y-6">
                      <div className="flex items-center gap-6">
                         <div className="bg-slate-900 border border-white/10 px-4 py-3 rounded-2xl text-center shadow-xl">
                            <p className="text-2xl font-black text-[#f97316] leading-none tracking-tighter">{event.date.split(' ')[1]}</p>
                            <p className="text-[9px] font-black text-white uppercase tracking-[0.2em] mt-1">{event.date.split(' ')[0]}</p>
                         </div>
                         <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <MapPin size={14} className="text-[#f97316]" /> {event.location}
                         </div>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#f97316] transition-colors leading-tight tracking-tight uppercase">{event.title}</h3>
                   </div>
                   <Link href="/dashboard/events" className="mt-10 inline-flex items-center gap-3 text-[11px] font-black text-slate-900 hover:text-[#f97316] transition-colors uppercase tracking-[0.3em]">
                      Secure Entry <ArrowRight size={16} />
                   </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <section className="py-40 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#f97316_0.5px,transparent_0.5px)] [background-size:40px_40px] opacity-10"></div>
        <div className="max-w-5xl mx-auto px-6 text-center space-y-12 relative z-10">
          <h2 className="text-4xl sm:text-7xl font-black text-white tracking-tighter leading-[0.9] uppercase">Bridge the <br /> <span className="text-[#f97316]">Professional</span> void</h2>
          <p className="text-lg sm:text-xl font-bold text-slate-400 max-w-2xl mx-auto tracking-tight">Join the elite network of UIU graduates utilizing the graph to accelerate their trajectories and forge permanent institutional bonds.</p>
          <div className="pt-8">
             <Link href="/register" className="bg-[#f97316] hover:bg-orange-600 text-white px-16 py-6 rounded-[24px] font-black uppercase tracking-[0.3em] text-[12px] transition-all shadow-[0_32px_64px_-12px_rgba(249,115,22,0.3)] inline-block active:scale-95">Initiate Membership</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
