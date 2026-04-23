"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Target, Clock, MessageSquare, Search, Filter } from "lucide-react";

export default function InterviewsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeSector, setActiveSector] = React.useState("All Sectors");
  const [activeBatch, setActiveBatch] = React.useState("All Batches");
  const [isSectorOpen, setIsSectorOpen] = React.useState(false);
  const [isBatchOpen, setIsBatchOpen] = React.useState(false);

  const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

  const stories = [
    {
      id: 1,
      name: "Md Faisal Kabir",
      role: "Assistant Professor, Penn State",
      tag: "Academic Leadership",
      title: "Scaling Global Frontiers: A Journey from UIU to the World Stage",
      quote: "The foundation built at UIU wasn't just technical—it was about the resilience to compete on the world stage.",
      excerpt: "In this exclusive interview, Dr. Kabir discusses how his time at UIU prepared him for the rigors of Ivy League research and his passion for mentoring the next generation of Bangladeshi scholars.",
      image: "/assets/images/featured/alumni-kabir.jpg",
      batch: "2012"
    },
    {
      id: 2,
      name: "Achia Nila",
      role: "Founder, Women in Digital",
      tag: "Innovation & Tech",
      title: "From Code to Impact: Empowering the Next Generation of Women in Tech",
      quote: "Your network is your net worth in the global economy. UIU gave me the starting capital.",
      excerpt: "Achia shares her story of founding one of Bangladesh's most influential digital platforms and why she believes the alumni network is the most valuable asset for any graduate.",
      image: "/assets/images/featured/alumni-nila.jpg",
      batch: "2010"
    },
    {
      id: 3,
      name: "Zakir Hossen",
      role: "SDE at Amazon",
      tag: "Big Tech",
      title: "Navigating the FAANG Interview Trail: Strategies for Success",
      quote: "Consistency is more powerful than brilliance. The culture of hard work at UIU stayed with me.",
      excerpt: "Zakir walks us through his preparation strategy for Amazon, his daily routine, and how Bangladeshi engineers can position themselves for global roles.",
      image: "/assets/images/featured/alumni-zakir.jpg",
      batch: "2014"
    }
  ];

  const sectors = ["All Sectors", ...Array.from(new Set(stories.map(s => s.tag)))];
  const batches = ["All Batches", ...Array.from(new Set(stories.map(s => `Batch ${s.batch}`)))];

  const filteredStories = stories.filter(story => {
    const matchesSearch = 
      story.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSector = activeSector === "All Sectors" || story.tag === activeSector;
    const matchesBatch = activeBatch === "All Batches" || `Batch ${story.batch}` === activeBatch;

    return matchesSearch && matchesSector && matchesBatch;
  });

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 bg-[#0f172a] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(#f97316_0.5px,transparent_0.5px)] [background-size:32px_32px]"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 mb-6 font-semibold uppercase tracking-wider text-[10px] text-[#f97316]">
              <Target size={14} /> Global Conversations
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-8">
              Alumni <span className="text-[#f97316]">Spotlight</span>
            </h1>
            <p className="text-lg text-slate-400 font-medium leading-relaxed opacity-90">
              In-depth conversations with the minds shaping the future of global industry, academia, and innovation. Insights from the UIU network.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="sticky top-[72px] z-30 bg-white border-b border-slate-100 py-4">
        <div className="container mx-auto px-6 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Search stories by name, role or keyword..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 transition-all"
              />
           </div>
           <div className="flex items-center gap-3 w-full md:w-auto relative">
              {/* Sector Filter */}
              <div className="relative">
                <button 
                  onClick={() => setIsSectorOpen(!isSectorOpen)}
                  className={cn(
                    "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeSector !== "All Sectors" ? "bg-[#0f172a] text-white" : "bg-slate-50 border border-slate-100 text-[#0f172a] hover:bg-slate-100"
                  )}
                >
                  <Filter size={14} /> {activeSector}
                </button>
                {isSectorOpen && (
                  <div className="absolute top-14 left-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 z-50">
                    {sectors.map(sector => (
                      <button 
                        key={sector}
                        onClick={() => { setActiveSector(sector); setIsSectorOpen(false); }}
                        className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 text-[#0f172a]"
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Batch Filter */}
              <div className="relative">
                <button 
                  onClick={() => setIsBatchOpen(!isBatchOpen)}
                  className={cn(
                    "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeBatch !== "All Batches" ? "bg-[#0f172a] text-white" : "bg-slate-50 border border-slate-100 text-[#0f172a] hover:bg-slate-100"
                  )}
                >
                  {activeBatch}
                </button>
                {isBatchOpen && (
                  <div className="absolute top-14 left-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 z-50">
                    {batches.map(batch => (
                      <button 
                        key={batch}
                        onClick={() => { setActiveBatch(batch); setIsBatchOpen(false); }}
                        className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 text-[#0f172a]"
                      >
                        {batch}
                      </button>
                    ))}
                  </div>
                )}
              </div>
           </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-20 bg-slate-50/50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-1 gap-16 max-w-5xl mx-auto">
            {filteredStories.length > 0 ? (
              filteredStories.map((story) => (
                <div key={story.id} className="group grid md:grid-cols-2 gap-12 items-center">
                   <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl order-2 md:order-1">
                      <img src={story.image} alt={story.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 text-white">
                         <p className="text-[10px] font-bold uppercase tracking-wider mb-1">{story.name}</p>
                         <p className="text-xs font-medium text-white/90">{story.role}</p>
                      </div>
                   </div>
                   
                   <div className="space-y-6 order-1 md:order-2">
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-bold text-[#f97316] uppercase tracking-wider bg-[#f97316]/10 px-3 py-1 rounded-md">{story.tag}</span>
                         <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Batch {story.batch}</span>
                      </div>
                      <h2 className="text-3xl font-bold text-[#0f172a] leading-tight group-hover:text-[#f97316] transition-colors duration-300">
                        {story.title}
                      </h2>
                      <p className="text-lg italic font-medium text-slate-600 leading-relaxed border-l-2 border-[#f97316]/30 pl-6">
                        "{story.quote}"
                      </p>
                      <p className="text-slate-500 leading-relaxed text-sm">
                        {story.excerpt}
                      </p>
                      <div className="pt-4">
                         <Link href={`/interviews/${story.id}`} className="inline-flex items-center gap-2 bg-[#0f172a] text-white px-6 py-3 rounded-lg font-semibold text-[11px] hover:bg-[#f97316] transition-all shadow-sm">
                            Read Full Story <ArrowRight size={14} />
                         </Link>
                      </div>
                   </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center bg-white border border-slate-100 border-dashed rounded-[3rem]">
                <p className="text-xs font-black text-slate-300 uppercase tracking-[0.4em]">No matching stories found</p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="mt-6 text-[10px] font-black text-[#f97316] uppercase tracking-widest hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Suggest a Story CTA */}
      <section className="py-24 bg-[#f97316] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-white/5 -skew-x-12 translate-x-32 transition-transform"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
           <MessageSquare className="mx-auto mb-8 text-white/50" size={48} />
           <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Know an <span className="text-[#0f172a]">Impactful</span> Story?</h2>
           <p className="text-xl font-bold mb-10 max-w-2xl mx-auto text-orange-950/60">Help us tell the stories that matter. Suggest yourself or a fellow alumnus for our next Spotlight.</p>
           <button className="bg-[#0f172a] text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#0f172a] transition-all shadow-2xl">
              Nominate Someone
           </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
