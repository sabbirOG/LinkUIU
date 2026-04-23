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
      isApplied: applications.some(app => app.jobId === job.id && app.applicantId === currentUser?.id)
    })).filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.company.toLowerCase().includes(searchQuery.toLowerCase());
      const jobType = job.type || "Full-time";
      const matchesType = selectedTypes.includes("All Employment") || selectedTypes.includes(jobType);
      
      let matchesTab = true;
      if (activeTab === "recommended") matchesTab = job.category === "Engineering";
      if (activeTab === "applied") matchesTab = job.isApplied === true;
      
      return matchesSearch && matchesType && matchesTab;
    });
  }, [searchQuery, selectedTypes, activeTab, storeJobs, applications, currentUser?.id]);

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
    if (!newJob.title || !newJob.company || !currentUser) return;
    
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
    <div className="min-h-screen bg-[#f8f9fb]">
      
      <div className="bg-white border-b border-slate-200 sticky top-[64px] z-30 pt-8 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-8">
             <div className="space-y-4">
               <div className="inline-flex items-center gap-2 text-[#f97316] font-black text-[10px] uppercase tracking-widest">
                 <Briefcase size={14} strokeWidth={3} /> Career Hub
               </div>
               <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none">
                 Professional <span className="text-slate-200 font-normal">Opportunities</span>
               </h1>
             </div>
             <button 
                onClick={() => setIsPostModalOpen(true)}
                className="w-full lg:w-auto bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#f97316] transition-all active:scale-95 shadow-xl shadow-slate-200"
              >
                 <Plus size={18} strokeWidth={3} /> Post a Job
              </button>
           </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
             <div className="flex-1 relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#f97316] transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by role, company or expertise..." 
                  className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#f97316]/20 focus:ring-4 focus:ring-[#f97316]/5 rounded-[20px] pl-14 pr-6 py-4 text-[14px] font-medium transition-all outline-none" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
             </div>
             
             <div className="flex items-center gap-2">
                <div className="flex-1 lg:flex-none flex items-center bg-slate-100 p-1 rounded-[16px] gap-1">
                   {["all", "recommended", "applied"].map(tab => (
                      <button 
                       key={tab} 
                       onClick={() => setActiveTab(tab)} 
                       className={cn(
                         "flex-1 lg:flex-none text-[9px] font-black uppercase tracking-[0.2em] transition-all py-3 px-6 rounded-[12px]", 
                         activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                       )}
                     >
                         {tab}
                      </button>
                   ))}
                </div>
                <button 
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden h-14 w-14 bg-slate-100 flex items-center justify-center rounded-2xl text-slate-600 active:scale-95 transition-all"
                >
                   <SlidersHorizontal size={20} />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* 2. BODY - Adaptive Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
           
           {/* LEFT COLUMN: Filters (Desktop) */}
           <aside className="lg:col-span-3 hidden lg:block">
              <div className="sticky top-[260px] space-y-8">
                 <div className="space-y-6">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                          <Target size={14} className="text-[#f97316]" /> Categorization
                        </h3>
                        <button onClick={() => setSelectedTypes(["All Employment"])} className="text-[10px] font-bold text-[#f97316] hover:underline">Reset</button>
                    </div>
                    <div className="space-y-2">
                       {employmentTypes.map((type) => {
                         const isChecked = selectedTypes.includes(type);
                         return (
                           <button 
                             key={type} 
                             onClick={() => toggleType(type)} 
                             className={cn(
                               "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border",
                               isChecked ? "bg-white border-[#f97316]/20 text-[#f97316] shadow-sm" : "bg-transparent border-transparent text-slate-500 hover:bg-white hover:border-slate-200"
                             )}
                           >
                              <div className={cn("h-4 w-4 rounded-md border flex items-center justify-center transition-all", isChecked ? "border-[#f97316] bg-[#f97316]" : "border-slate-300 bg-white")}>
                                 {isChecked && <Check size={10} className="text-white" strokeWidth={4} />}
                              </div>
                              {type}
                           </button>
                         );
                       })}
                    </div>
                 </div>
              </div>
           </aside>

           {/* Mobile Filter Drawer */}
           {isMobileFilterOpen && (
             <div className="fixed inset-0 z-[200] lg:hidden">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsMobileFilterOpen(false)} />
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-8 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto">
                   <div className="flex justify-between items-center mb-8">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Employment Filters</h3>
                      <button onClick={() => setIsMobileFilterOpen(false)} className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center"><X size={20} /></button>
                   </div>
                   <div className="grid grid-cols-2 gap-3 pb-8">
                      {employmentTypes.map((type) => (
                        <button 
                          key={type}
                          onClick={() => toggleType(type)}
                          className={cn(
                            "px-4 py-4 rounded-xl text-xs font-bold transition-all border text-center",
                            selectedTypes.includes(type) ? "bg-[#f97316] border-[#f97316] text-white shadow-lg shadow-orange-200" : "bg-slate-50 border-slate-100 text-slate-500"
                          )}
                        >
                           {type}
                        </button>
                      ))}
                   </div>
                   <button 
                     onClick={() => setIsMobileFilterOpen(false)}
                     className="w-full bg-slate-900 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200"
                   >
                      Apply Filters
                   </button>
                </div>
             </div>
           )}

           <div className="lg:col-span-9 space-y-4 sm:space-y-6">
              {filteredJobs.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {filteredJobs.map((job) => (
                    <div 
                      key={job.id} 
                      onClick={() => setSelectedJob(job)}
                      className="group bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm hover:border-[#f97316]/30 transition-all duration-300 cursor-pointer relative overflow-hidden"
                    >
                       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="flex gap-4 sm:gap-5">
                             <div className="h-14 w-14 sm:h-16 sm:w-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-[#f97316] group-hover:bg-[#f97316]/5 transition-all"><Briefcase size={28} /></div>
                             <div className="space-y-1 pt-1">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-[#f97316] transition-colors">{job.title}</h3>
                                 <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-bold text-slate-400 mt-2">
                                    <span className="text-[#f97316] uppercase tracking-wider">{job.company}</span>
                                    <span className="h-1 w-1 bg-slate-200 rounded-full hidden sm:block"></span>
                                    <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase tracking-tighter">{job.type}</span>
                                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-300" /> {job.location}</span>
                                 </div>
                             </div>
                          </div>
                           <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end pt-5 md:pt-0 border-t md:border-none border-slate-50">
                              <span className="text-xl font-black text-slate-900 tracking-tighter">{job.salary}</span>
                              {job.isApplied ? (
                                 <div className="px-6 py-3 bg-green-50 text-green-600 border border-green-100 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Check size={16} /> Applied
                                 </div>
                              ) : (
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); setSelectedJob(job); setApplyingJobId(job.id); }}
                                    className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#f97316] transition-all active:scale-95 shadow-xl shadow-slate-200 hover:shadow-orange-200"
                                 >
                                    Apply Now
                                 </button>
                              )}
                           </div>
                       </div>
                       <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             <Clock size={12} className="text-[#f97316]" /> {job.posted} · <span className="opacity-60">{job.postedBy?.name || "Verified"}</span>
                          </div>
                          <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[9px] font-black rounded border border-slate-100 uppercase tracking-widest">{job.category}</span>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center space-y-6 bg-white border border-dashed border-slate-200 rounded-3xl">
                   <div className="h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto shadow-sm"><Search size={32} /></div>
                   <div className="space-y-1">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">No Active Vacancies</h3>
                      <p className="text-sm text-slate-400 font-medium">Try adjusting your filters to find matching opportunities.</p>
                   </div>
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
