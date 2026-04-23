"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Target, Clock, Calendar, Share2, Quote } from "lucide-react";

export default function InterviewDetailPage() {
  const params = useParams();
  const id = params.id;

  // In a real app, this would be fetched from an API/DB
  const stories = [
    {
      id: "1",
      name: "Md Faisal Kabir",
      role: "Assistant Professor, Penn State",
      tag: "Academic Leadership",
      title: "Scaling Global Frontiers: A Journey from UIU to the World Stage",
      quote: "The foundation built at UIU wasn't just technical—it was about the resilience to compete on the world stage.",
      content: `
        <p>In the quiet corridors of the United International University, many dreams are born. For Dr. Md Faisal Kabir, those dreams didn't just take flight—they crossed oceans. Now an Assistant Professor at Penn State, Dr. Kabir's journey is a masterclass in academic excellence and strategic networking.</p>
        
        <h4>The UIU Foundation</h4>
        <p>\"UIU was where I learned that being from Bangladesh wasn't a limitation; it was a unique perspective,\" Dr. Kabir shares during our conversation. He emphasizes that the rigorous curriculum and the accessibility of faculty members allowed him to explore research far beyond the standard undergraduate scope.</p>
        
        <blockquote>
          \"I remember spending hours in the lab, not just because I had to, but because my professors made me feel like I was part of a global scientific community even then.\"
        </blockquote>

        <h4>Navigating Global Academia</h4>
        <p>Transitioning from Dhaka to the United States was a challenge, but Dr. Kabir notes that the 'survival instinct' and the solid mathematical foundation provided by UIU's CSE department were his secret weapons.</p>
        
        <p>Today, as he manages his own research lab, he looks back at the UIU alumni network as a sleeping giant. \"We have brilliant minds at Google, Intel, and top-tier universities. Connecting these dots is the next big step for our institution.\"</p>
      `,
      image: "/assets/images/featured/alumni-kabir.jpg",
      batch: "2012",
      date: "Oct 12, 2025"
    },
    {
      id: "2",
      name: "Achia Nila",
      role: "Founder, Women in Digital",
      tag: "Innovation & Tech",
      title: "From Code to Impact: Empowering the Next Generation of Women in Tech",
      quote: "Your network is your net worth in the global economy. UIU gave me the starting capital.",
      content: `
        <p>Achia Nila's name is synonymous with female empowerment in Bangladesh's tech landscape. As the founder of 'Women in Digital', she has turned social impact into a scalable reality through the power of the UIU network.</p>

        <h4>The Spark of Innovation</h4>
        <p>\"I didn't just want to be another developer,\" Achia explains. \"I wanted to create a platform where women could not only learn to code but also find mentors and jobs. UIU's collaborative culture was the blueprint for what I built.\"</p>

        <blockquote>
           \"Innovation isn't just about new tech; it's about solving old problems in new ways. UIU gave me the problem-solving toolkit I needed.\"
        </blockquote>

        <h4>Building the Network</h4>
        <p>Achia emphasizes that the alumni network is the most valuable asset any graduate carries. She frequently recruits from UIU, citing the 'specialized mindset' and work ethic that the institution instills in its students.</p>
      `,
      image: "/assets/images/featured/alumni-nila.jpg",
      batch: "2010",
      date: "Oct 08, 2025"
    },
    {
      id: "3",
      name: "Zakir Hossen",
      role: "SDE at Amazon",
      tag: "Big Tech",
      title: "Navigating the FAANG Interview Trail: Strategies for Success",
      quote: "Consistency is more powerful than brilliance. The culture of hard work at UIU stayed with me.",
      content: `
        <p>Cracking the FAANG interview is often seen as a mountain to climb. For Zakir Hossen, a Software Development Engineer at Amazon, the ascent was steady, fueled by the fundamentals he mastered at UIU.</p>

        <h4>The FAANG Mindset</h4>
        <p>\"Most people focus on the complex algorithms,\" Zakir notes. \"But companies like Amazon care about how you think through a problem. The design principles we were taught at UIU are exactly what they look for.\"</p>

        <blockquote>
          \"Preparation isn't a one-month sprint; it's a four-year lifestyle. UIU's environment naturally encourages that steady growth.\"
        </blockquote>

        <h4>Advice for Aspiring Graduates</h4>
        <p>Zakir's advice is simple: master the basics and leverage your alumni. \"There's likely someone from UIU in almost every major tech company now. Reach out, ask for referrals, and keep the UIU flag flying high.\""</p>
      `,
      image: "/assets/images/featured/alumni-zakir.jpg",
      batch: "2014",
      date: "Sep 28, 2025"
    }
  ];

  const story = stories.find(s => s.id === id) || stories[0];

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-[#0f172a] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(#f97316_0.5px,transparent_0.5px)] [background-size:32px_32px]"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
            <Link href="/interviews" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#f97316] transition-colors mb-8 text-[10px] font-black uppercase tracking-widest">
               <ArrowLeft size={14} /> Back to Spotlight
            </Link>
            <div className="max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-[#f97316]/10 px-4 py-1.5 rounded-full border border-[#f97316]/20 mb-6 font-black uppercase tracking-[0.2em] text-[10px] text-[#f97316]">
                  {story.tag}
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-8">
                  {story.title}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                   <div className="flex items-center gap-2">
                     <Calendar size={14} className="text-[#f97316]" /> {story.date}
                   </div>
                   <div className="flex items-center gap-2">
                     <Clock size={14} className="text-[#f97316]" /> 6 Min Read
                   </div>
                   <div className="flex items-center gap-2">
                     <Target size={14} className="text-[#f97316]" /> Batch {story.batch}
                   </div>
                </div>
            </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-20">
         <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
               <div className="relative aspect-video rounded-[3rem] overflow-hidden mb-16 shadow-2xl shadow-orange-500/10 border-4 border-slate-50">
                  <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
               </div>

               <div className="prose prose-slate prose-lg max-w-none">
                  <div className="flex items-center gap-4 mb-12 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                     <Quote className="text-[#f97316] shrink-0" size={32} />
                     <p className="text-xl font-bold text-[#0f172a] italic m-0">
                        {story.quote}
                     </p>
                  </div>

                  <div 
                    className="text-slate-600 leading-relaxed space-y-6 text-lg font-medium"
                    dangerouslySetInnerHTML={{ __html: story.content }}
                  ></div>
               </div>

               <div className="mt-16 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-4">
                     <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 border-2 border-[#f97316]/20">
                        <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
                     </div>
                     <div>
                        <p className="text-[14px] font-black text-[#0f172a] uppercase tracking-widest leading-none mb-1">{story.name}</p>
                        <p className="text-[12px] font-bold text-[#f97316] uppercase tracking-widest">{story.role}</p>
                     </div>
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => {
                        const shareData = {
                          title: story.title,
                          text: story.quote,
                          url: window.location.href,
                        };
                        
                        if (navigator.share) {
                          navigator.share(shareData);
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          const toast = document.getElementById("share-toast");
                          if (toast) {
                            toast.style.opacity = "1";
                            toast.style.transform = "translateY(0)";
                            setTimeout(() => {
                              toast.style.opacity = "0";
                              toast.style.transform = "translateY(10px)";
                            }, 2000);
                          }
                        }
                      }}
                      className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#0f172a] hover:bg-slate-100 transition-all active:scale-95"
                    >
                       <Share2 size={16} /> Share Story
                    </button>
                    <div 
                      id="share-toast" 
                      className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full opacity-0 translate-y-2 transition-all duration-300 pointer-events-none"
                    >
                      Link Copied!
                    </div>
                  </div>
               </div>
            </div>
         </div>
      </article>

      {/* Recommended Section */}
      <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-6">
             <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-black text-[#0f172a] tracking-tight mb-12">More Spotlight Stories</h3>
                <div className="grid gap-6">
                   {stories.filter(s => s.id !== id).map(other => (
                      <Link key={other.id} href={`/interviews/${other.id}`} className="group bg-white p-6 rounded-[2rem] border border-transparent hover:border-[#f97316]/20 shadow-sm transition-all flex items-center gap-6">
                         <div className="h-20 w-20 rounded-2xl overflow-hidden shrink-0">
                            <img src={other.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-[#f97316] uppercase tracking-[0.2em] mb-1">{other.tag}</p>
                            <h4 className="font-black text-[#0f172a] group-hover:text-[#f97316] transition-colors line-clamp-1">{other.title}</h4>
                         </div>
                      </Link>
                   ))}
                </div>
             </div>
          </div>
      </section>

      <Footer />
    </div>
  );
}
