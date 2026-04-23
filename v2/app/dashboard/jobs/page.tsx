"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  MapPin, 
  Plus, 
  Search, 
  Filter,
  ArrowUpRight,
  Clock,
  Target,
  X,
  SlidersHorizontal,
  ChevronDown,
  LayoutGrid,
  RotateCcw,
  MessageSquare,
  ShieldCheck,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export default function JobsPage() {
  const { jobs: storeJobs, addJob, applyToJob, currentUser, applications } = useGlobalStore();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["All Employment"]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  
  const [newJob, setNewJob] = useState({ title: "", company: "", location: "", salary: "", description: "" });

  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

  const filteredJobs = useMemo(() => {
    return storeJobs.map(job => ({
      ...job,
      isApplied: applications.some(app => app.jobId === job.id && app.applicantId === currentUser.id)
    })).filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.company.toLowerCase().includes(searchQuery.toLowerCase());
      const jobType = job.type || "Full-time";
      const matchesType = selectedTypes.includes("All Employment") || selectedTypes.includes(jobType);
      
      let matchesTab = true;
      if (activeTab === "recommended") matchesTab = job.category === "Engineering";
      if (activeTab === "applied") matchesTab = job.isApplied === true;
      
      return matchesSearch && matchesType && matchesTab;
    });
  }, [searchQuery, selectedTypes, activeTab, storeJobs, applications, currentUser.id]);

  const executeApplication = async () => {
    if (!currentUser || !selectedJob) return;
    setIsApplying(true);
    try {
      let resume_url = "";
      // Handle File Upload if selected
      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from("resumes").upload(fileName, resumeFile);
        
        if (uploadError) {
          alert("Error: Supabase Storage bucket 'resumes' might not be created or is missing public access.");
          setIsApplying(false);
          return;
        }
        resume_url = supabase.storage.from("resumes").getPublicUrl(fileName).data.publicUrl;
      }

      const applicationRecord = {
        job_id: selectedJob.id,
        applicant_id: currentUser.id,
        cover_letter: coverLetter,
        resume_url,
      };

      await applyToJob(applicationRecord); // Assuming store handles the DB call now

      // Notify the job author
      if (selectedJob.posted_by?.id) {
         await supabase.from("notifications").insert([{
            profile_id: selectedJob.posted_by.id,
            title: `${currentUser.name} applied to your job: ${selectedJob.title}`,
            type: "job"
         }]);
      }

      setSelectedJob({ ...selectedJob, isApplied: true });
      setApplyingJobId(null);
      setCoverLetter("");
      setResumeFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplying(false);
    }
  };

  const confirmPublish = () => {
    if (!newJob.title || !newJob.company) return;
    
    const jobData = {
      ...newJob,
      id: Date.now(),
      type: "Full-time",
      posted: "Just now",
      category: "Engineering",
      postedBy: {
        name: currentUser.name,
        dept: currentUser.dept,
        batch: currentUser.batch,
        id: currentUser.id
      }
    };
    addJob(jobData);
    setIsPostModalOpen(false);
    setNewJob({ title: "", company: "", location: "", salary: "", description: "" });
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => {
      if (type === "All Employment") return ["All Employment"];
      const newTypes = prev.filter(t => t !== "All Employment");
      if (newTypes.includes(type)) {
        const filtered = newTypes.filter(t => t !== type);
        return filtered.length === 0 ? ["All Employment"] : filtered;
      }
      return newTypes.length >= 3 ? [...newTypes.slice(0, 2), type] : [...newTypes, type];
    });
  };

  const employmentTypes = ["All Employment", "Full-time", "Part-time", "Hybrid", "Remote", "Contract", "Internship"];

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans">
      
      {/* 1. HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-[64px] z-30 pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
             <div>
               <p className="text-[10px] font-bold text-[#f97316] uppercase tracking-widest flex items-center gap-1.5 mb-1">
                 <Briefcase size={12} strokeWidth={2.5} /> Career Hub
               </p>
               <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 leading-none">
                 Professional <span className="text-slate-300 font-light">Opportunities</span>
               </h1>
             </div>
             <button 
                onClick={() => setIsPostModalOpen(true)}
                className="bg-[#0f172a] text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                 <Plus size={18} /> Post a Job
              </button>
           </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6">
             <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#f97316] transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by role, company or expertise..." 
                  className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#f97316]/20 focus:ring-4 focus:ring-[#f97316]/5 rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium transition-all outline-none" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
             </div>
             <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {["all", "recommended", "applied"].map(tab => (
                   <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-widest transition-all py-2.5 px-6 rounded-lg", 
                      activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                      {tab}
                   </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* 2. BODY */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="grid lg:grid-cols-12 gap-10">
           
           <aside className="lg:col-span-3">
              <div className="sticky top-[260px] space-y-8">
                 <div className="space-y-6">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="font-bold text-[11px] uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <SlidersHorizontal size={12} /> Employment
                        </h3>
                        <button onClick={() => setSelectedTypes(["All Employment"])} className="text-[10px] font-bold text-[#f97316] hover:underline">Reset</button>
                    </div>
                    <div className="space-y-2.5">
                       {employmentTypes.map((type) => {
                         const isChecked = selectedTypes.includes(type);
                         return (
                           <button 
                             key={type} 
                             onClick={() => toggleType(type)} 
                             className={cn(
                               "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                               isChecked ? "bg-white border-[#f97316]/20 text-[#f97316] shadow-sm" : "bg-transparent border-transparent text-slate-500 hover:bg-white hover:border-slate-200"
                             )}
                           >
                              <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center transition-all", isChecked ? "border-[#f97316] bg-[#f97316]" : "border-slate-300 bg-white")}>
                                 {isChecked && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                              </div>
                              {type}
                           </button>
                         );
                       })}
                    </div>
                 </div>
              </div>
           </aside>

           <div className="lg:col-span-9 space-y-6">
              {filteredJobs.length > 0 ? (
                <div className="space-y-6">
                  {filteredJobs.map((job) => (
                    <div 
                      key={job.id} 
                      onClick={() => setSelectedJob(job)}
                      className="group bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:border-[#f97316]/30 transition-all cursor-pointer relative overflow-hidden"
                    >
                       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="flex gap-5">
                             <div className="h-14 w-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-[#f97316] group-hover:bg-[#f97316]/5 transition-all"><Briefcase size={24} /></div>
                             <div className="space-y-1">
                                <h3 className="text-xl font-bold text-slate-900 leading-tight">{job.title}</h3>
                                 <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                                    <span className="text-[#f97316] font-bold">{job.company}</span>
                                    <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
                                    <span>{job.type}</span>
                                    <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
                                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-300" /> {job.location}</span>
                                 </div>
                             </div>
                          </div>
                           <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end pt-4 md:pt-0 border-t md:border-none border-slate-50">
                              <span className="text-lg font-bold text-slate-900">{job.salary}</span>
                              {job.isApplied ? (
                                 <div className="px-5 py-2.5 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Check size={14} /> Applied
                                 </div>
                              ) : (
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); handleApply(job.id); }}
                                    className="bg-[#0f172a] text-white px-8 py-3 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                                 >
                                    Apply Now
                                 </button>
                              )}
                           </div>
                       </div>
                       <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             <Clock size={12} /> Posted {job.posted} · {job.postedBy?.name || "UIU Verified"}
                          </div>
                          <span className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded border border-slate-100 uppercase tracking-wide">{job.category}</span>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center space-y-4">
                   <div className="h-16 w-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-200 mx-auto shadow-sm"><Search size={28} /></div>
                   <h3 className="text-lg font-bold text-slate-900">No vacancies match your criteria</h3>
                   <p className="text-sm text-slate-400 font-medium">Try adjusting your search or filters to find more opportunities.</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* POST MODAL */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
           <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                 <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Post Opportunity</h2>
                 <button onClick={() => setIsPostModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              
              <div className="p-8 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Job Title</label>
                       <input type="text" placeholder="e.g. Senior Developer" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#f97316] transition-all" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company</label>
                       <input type="text" placeholder="Company Name" value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#f97316] transition-all" />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                    <textarea rows={4} placeholder="Describe the role and requirements..." value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[#f97316] transition-all resize-none" />
                 </div>
                 <button onClick={confirmPublish} className="w-full h-12 bg-[#0f172a] text-white rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">Submit Posting</button>
              </div>
           </div>
        </div>
      )}

      {/* DETAILS & APPLICATION MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-10 py-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-start shrink-0">
                 <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedJob.title}</h2>
                    <p className="font-bold text-[#f97316] mt-1 uppercase tracking-wide text-xs">{selectedJob.company} · {selectedJob.location}</p>
                 </div>
                 <button onClick={() => { setSelectedJob(null); setApplyingJobId(null); setResumeFile(null); }} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full"><X size={18} /></button>
              </div>
              
              <div className="p-10 space-y-8 overflow-y-auto">
                 {applyingJobId === selectedJob.id ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cover Letter (Optional)</label>
                          <textarea 
                             rows={5} 
                             value={coverLetter}
                             onChange={e => setCoverLetter(e.target.value)}
                             placeholder="Introduce yourself and explain why you're a great fit..." 
                             className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[#f97316] transition-all resize-none" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Attach Resume (PDF limit 5MB)</label>
                          <input 
                             type="file" 
                             accept=".pdf,.doc,.docx"
                             onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                             className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#f97316]/10 file:text-[#f97316] hover:file:bg-[#f97316]/20 transition-all font-medium border border-slate-100 p-2 rounded-xl bg-slate-50"
                          />
                       </div>
                    </div>
                 ) : (
                    <div className="space-y-4 animate-in fade-in">
                       <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Position Overview</h3>
                       <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
                    </div>
                 )}
              </div>

              <div className="p-10 pt-6 flex gap-4 border-t border-slate-100 bg-white shrink-0">
                 {applyingJobId === selectedJob.id ? (
                    <>
                       <button onClick={() => setApplyingJobId(null)} className="h-14 px-8 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-slate-200 transition-all">Cancel</button>
                       <button 
                          onClick={executeApplication} 
                          disabled={isApplying}
                          className="flex-1 h-14 bg-[#0f172a] hover:bg-[#f97316] text-white rounded-xl font-bold uppercase tracking-widest text-[11px] active:scale-95 transition-all shadow-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                       >
                          {isApplying ? "Submitting..." : "Send Application"}
                       </button>
                    </>
                 ) : (
                    <>
                       <button className="flex-1 h-14 bg-slate-50 text-slate-600 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all">Save Position</button>
                       {selectedJob.isApplied ? (
                          <div className="flex-1 h-14 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center rounded-xl border border-green-100"><Check size={16} className="mr-2" /> Application Sent</div>
                       ) : (
                          <button onClick={() => setApplyingJobId(selectedJob.id)} className="flex-1 h-14 bg-[#f97316] text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-500/20">Apply Now</button>
                       )}
                    </>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
