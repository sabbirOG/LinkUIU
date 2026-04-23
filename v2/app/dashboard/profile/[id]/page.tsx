"use client";

import React, { useState, useMemo } from "react";
import {
  User, Mail, MapPin, Briefcase, GraduationCap, Globe,
  Code, Link2, Pencil, Plus, FileText, ShieldCheck,
  Star, Award, ChevronLeft, MoreVertical, Camera, Check,
  X, Phone, MessageSquare, Users, BookOpen, Building2, 
  Calendar, ExternalLink, Send, Share, Link, Settings
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/lib/store";
import { storageService } from "@/lib/storage";
import { Loader2 } from "lucide-react";

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────
function EditModal({ field, value, onSave, onClose }: {
  field: string; value: any; onSave: (v: any) => void; onClose: () => void;
}) {
  const [val, setVal] = useState(value);
  const [formData, setFormData] = useState<any>(
    field === "experience" 
    ? (typeof value === 'object' ? value : { title: "", company: "", period: "", desc: "" })
    : field === "education" 
    ? (typeof value === 'object' ? value : { degree: "", school: "", period: "", grade: "" })
    : field === "links"
    ? (typeof value === 'object' ? value : { linkedin: "", github: "" })
    : value
  );

  const isComplex = field === "experience" || field === "education" || field === "links";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-xl shadow-2xl border border-slate-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Edit {field}</h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Update your professional details</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-2 rounded-full"><X size={20} /></button>
        </div>

        <div className="space-y-5">
           {field === "links" ? (
             <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">LinkedIn Username</label>
                  <input value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="w-full bg-slate-50 border-slate-100 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-[#f97316] border" placeholder="e.g. linkedin.com/in/username" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">GitHub Username</label>
                  <input value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} className="w-full bg-slate-50 border-slate-100 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-[#f97316] border" placeholder="e.g. github.com/username" />
                </div>
             </div>
           ) : field === "experience" ? (
             <>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Title</label>
                    <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border-slate-100 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-[#f97316] border" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Company</label>
                    <input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-slate-50 border-slate-100 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-[#f97316] border" />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Duration (e.g. 2021 - Present)</label>
                  <input value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} className="w-full bg-slate-50 border-slate-100 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-[#f97316] border" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</label>
                  <textarea rows={4} value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full bg-slate-50 border-slate-100 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-[#f97316] border resize-none" />
               </div>
             </>
           ) : field === "education" ? (
             <>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Degree</label>
                    <input value={formData.degree} onChange={e => setFormData({...formData, degree: e.target.value})} className="w-full bg-slate-50 border-slate-100 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-[#f97316] border" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">School / Uni</label>
                    <input value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} className="w-full bg-slate-50 border-slate-100 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-[#f97316] border" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Duration</label>
                    <input value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} className="w-full bg-slate-50 border-slate-100 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-[#f97316] border" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">CGPA / Grade</label>
                    <input value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full bg-slate-50 border-slate-100 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-[#f97316] border" />
                  </div>
               </div>
             </>
           ) : field === "bio" ? (
            <textarea rows={5} value={val} onChange={e => setVal(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#f97316] resize-none transition-all bg-slate-50" />
           ) : (
            <input value={val} onChange={e => setVal(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#f97316] transition-all bg-slate-50" />
           )}
        </div>

        <div className="flex gap-4 mt-10">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-100 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all">Cancel</button>
          <button onClick={() => { onSave(isComplex ? formData : val); onClose(); }} className="flex-1 py-4 bg-[#0f172a] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#f97316] transition-all active:scale-[0.98] shadow-lg shadow-slate-200">Save Snapshot</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { alumni, currentUser, updateProfile, toggleConnection, isLoaded } = useGlobalStore();
  const rawId = params.id as string;

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      setIsUploading(true);
      const publicUrl = await storageService.uploadProfilePhoto(currentUser.id, file);
      await updateProfile({ profile_photo: publicUrl });
    } catch (err: any) {
      alert("Failed to upload photo: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const profile = useMemo(() => {
    if (!currentUser) return alumni[0] || {};
    if (rawId === "self" || rawId === currentUser.id) {
       return { ...currentUser, isSelf: true };
    }
    const target = alumni.find(a => a.id === rawId) || alumni[0] || {};
    return { ...target, isSelf: false };
  }, [rawId, alumni, currentUser]);

  const isConnectedToProfile = useMemo(() => {
    const target = alumni.find(a => a.id === rawId);
    return target?.isConnected ?? false;
  }, [alumni, rawId]);

  const [activeTab, setActiveTab] = useState<"about" | "experience" | "education" | "achievements">("about");
  const [editModal, setEditModal] = useState<{ field: string; value: string } | null>(null);
  
  // Connection state managed by store via toggleConnection
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = (field: string, value: any) => {
    if (field === "skills") {
      const skillsArray = value.split(",").map((name: string) => name.trim()).filter((s: string) => s !== "");
      updateProfile({ skills: skillsArray });
    } else if (field === "achievements") {
      const array = value.split(",").map((s: string) => s.trim()).filter((s: string) => s !== "");
      updateProfile({ achievements: array });
    } else if (field === "experience") {
      const currentExp = currentUser?.experience || [];
      // Find and Replace or Append
      const existsIdx = currentExp.findIndex((e: any) => e.company === value.company && e.title === value.title);
      const newExp = [...currentExp];
      if (existsIdx >= 0) newExp[existsIdx] = value;
      else newExp.unshift(value);
      updateProfile({ experience: newExp });
    } else if (field === "education") {
      const currentEdu = currentUser?.education || [];
      const existsIdx = currentEdu.findIndex((e: any) => e.school === value.school && e.degree === value.degree);
      const newEdu = [...currentEdu];
      if (existsIdx >= 0) newEdu[existsIdx] = value;
      else newEdu.unshift(value);
      updateProfile({ education: newEdu });
    } else {
      updateProfile({ [field]: value });
    }
  };

  if (!isLoaded) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Identity...</div>;

  const tabs: { key: "about" | "experience" | "education" | "achievements"; label: string; icon: any }[] = [
    { key: "about", label: "About", icon: User },
    { key: "experience", label: "Experience", icon: Briefcase },
    { key: "education", label: "Education", icon: GraduationCap },
    { key: "achievements", label: "Achievements", icon: Star },
  ];

  const skillsList = typeof profile.skills === "string" 
    ? profile.skills.split(",").map((s: string) => s.trim()).filter((s: string) => s !== "")
    : Array.isArray(profile.skills) ? profile.skills : [];

  return (
    <div className="min-h-screen bg-[#f8f9fb] pb-24">

      {/* ── HERO BANNER ──────────────────────────────────────────────────── */}
      <div className="relative h-40 sm:h-56 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#f97316_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/40" />

        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          className="absolute top-6 left-4 sm:left-6 flex items-center gap-2 text-white/50 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest group z-10 bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
      </div>

      {/* ── PROFILE CONTENT ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-xl -mt-16 sm:-mt-20 relative z-10 overflow-hidden max-w-full">
          <div className="p-6 sm:p-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8 pb-10 border-b border-slate-50">
              
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-[32px] bg-slate-50 border-4 border-white shadow-2xl flex items-center justify-center text-5xl font-black text-[#f97316] overflow-hidden">
                  {profile.profile_photo ? (
                    <img 
                      src={profile.profile_photo} 
                      alt={profile.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    profile.name.charAt(0)
                  )}
                  
                  {isUploading && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center text-white">
                      <Loader2 size={24} className="animate-spin" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 h-10 w-10 sm:h-12 sm:w-12 bg-[#f97316] text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-xl animate-in zoom-in duration-500">
                  <ShieldCheck size={24} strokeWidth={3} />
                </div>
                {profile.isSelf && (
                  <>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <button 
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 left-0 h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#f97316] shadow-lg transition-all active:scale-90"
                    >
                      <Camera size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Identity Info */}
              <div className="flex-1 text-center lg:text-left space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-none">{profile.name}</h1>
                      <div className="px-3 py-1 bg-orange-50 border border-orange-100/50 text-[#f97316] font-black text-[9px] uppercase tracking-widest rounded-lg">Institutional Identity</div>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-lg sm:text-xl text-slate-500 font-bold tracking-tight">
                      {profile.job ? (
                        <span>{profile.job}</span>
                      ) : profile.isSelf ? (
                        <button onClick={() => setEditModal({ field: "job", value: "" })} className="text-slate-300 hover:text-[#f97316] italic text-sm">Define Role</button>
                      ) : null}
                      
                      {profile.company && <span className="text-slate-200">/</span>}
                      
                      {profile.company && (
                        <span className="text-slate-900">{profile.company}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 pt-1 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><MapPin size={14} className="text-[#f97316]" /> {profile.location}</span>
                      <span className="flex items-center gap-2"><GraduationCap size={14} className="text-[#f97316]" /> UIU · {profile.dept} · {profile.batch}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-3 w-full sm:w-auto">
                    {profile.isSelf ? (
                      <>
                        <button onClick={() => setEditModal({ field: "bio", value: profile.bio || "" })} className="flex-1 sm:flex-none px-8 py-3.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-[#f97316] transition-all active:scale-95 shadow-xl shadow-slate-200">
                           Edit Portal
                        </button>
                      </>
                    ) : (
                      <>
                        <Link 
                           href={`/dashboard/messages?user=${profile.id}`}
                           className="flex-1 sm:flex-none h-12 px-8 bg-white text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-slate-200 hover:border-[#f97316]/20 transition-all flex items-center justify-center shadow-sm"
                        >
                           Message
                        </Link>
                        <button onClick={() => toggleConnection(rawId)} className={cn("flex-1 sm:flex-none h-12 px-8 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl active:scale-95", isConnectedToProfile ? "bg-slate-100 text-slate-400" : "bg-[#f97316] text-white shadow-orange-100")}>
                          {isConnectedToProfile ? "Connected" : "Connect"}
                        </button>
                      </>
                    )}

                    <div className="relative" ref={moreMenuRef}>
                      <button 
                        onClick={() => setIsMoreOpen(!isMoreOpen)}
                        className="h-12 w-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-95"
                      >
                        <MoreVertical size={20} />
                      </button>
                      {isMoreOpen && (
                        <div className="absolute top-full right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 py-3 animate-in fade-in slide-in-from-top-4 duration-300">
                          <button onClick={() => setIsMoreOpen(false)} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 text-slate-900 text-[11px] font-black uppercase tracking-widest transition-colors">
                            <Share size={16} className="text-[#f97316]" /> Share Profile
                          </button>
                          <button 
                            onClick={() => { navigator.clipboard.writeText(window.location.href); setIsMoreOpen(false); alert("Link copied!"); }} 
                            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 text-slate-900 text-[11px] font-black uppercase tracking-widest transition-colors"
                          >
                            <Link size={16} className="text-[#f97316]" /> Copy Hub Link
                          </button>
                          <div className="h-px bg-slate-100 my-2" />
                          <button onClick={() => setIsMoreOpen(false)} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 text-slate-900 text-[11px] font-black uppercase tracking-widest transition-colors">
                            <Settings size={16} className="text-slate-400" /> Preferences
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-8">
              {profile.links?.github && (
                <a href={`https://${profile.links.github}`} className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-[#f97316]/30 hover:text-[#f97316] transition-all">
                  <Code size={16} /> GitHub
                </a>
              )}
              {profile.links?.linkedin && (
                <a href={`https://${profile.links.linkedin}`} className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-[#f97316]/30 hover:text-[#f97316] transition-all">
                  <Link2 size={16} /> LinkedIn
                </a>
              )}
              {profile.isSelf && (
                <button 
                  onClick={() => setEditModal({ field: "links", value: profile.links || { linkedin: "", github: "" } })}
                  className="flex items-center gap-2 px-5 py-2.5 border border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-[#f97316] hover:border-[#f97316]/30 transition-all"
                >
                   <Plus size={16} /> Add Link
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT GRID ───────────────────────────────────────────── */}
        <div className="mt-8 flex flex-col lg:grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8 min-w-0">
            
            {/* Tabs Navigation - Scrollable on mobile */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-1.5 flex gap-1 shadow-sm overflow-x-auto no-scrollbar whitespace-nowrap max-w-full">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button 
                  key={key} 
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "flex-1 min-w-[100px] flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === key ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="bg-white border border-slate-200/60 rounded-[32px] p-6 sm:p-12 space-y-12 shadow-sm min-h-[500px]">
              
              {activeTab === "about" && (
                <div className="space-y-16 animate-in fade-in duration-500">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f97316]">Professional Profile</h2>
                      {profile.isSelf && <button onClick={() => setEditModal({ field: "bio", value: profile.bio || "" })} className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#f97316] transition-all"><Pencil size={16} /></button>}
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed tracking-tight italic opacity-80">{profile.bio || "No professional bio provided yet."}</p>
                  </div>
                  
                  <div className="pt-16 border-t border-slate-50 space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Expertise Matrix</h3>
                      {profile.isSelf && (
                        <button 
                          onClick={() => setEditModal({ field: "skills", value: skillsList.join(", ") })}
                          className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
                        >
                          <Plus size={20} />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                       {skillsList.map((skill: string, idx: number) => (
                         <span key={idx} className="px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:border-[#f97316]/30 hover:text-[#f97316] transition-all cursor-default shadow-sm">
                           {skill}
                         </span>
                       ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "experience" && (
                <div className="space-y-10 animate-in fade-in duration-500">
                    {(profile.experience || []).map((exp: any, i: number) => (
                      <div key={i} className="flex gap-6 group relative">
                         <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-[#f97316] shrink-0 group-hover:bg-[#f97316] group-hover:text-white transition-all duration-300">
                            <Briefcase size={32} />
                         </div>
                         <div className="flex-1 space-y-2 pt-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                               <h4 className="text-xl font-black text-slate-900 tracking-tight">{exp.title}</h4>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{exp.period}</p>
                            </div>
                            <p className="text-sm font-black text-[#f97316] uppercase tracking-[0.1em]">{exp.company}</p>
                            <p className="text-base font-medium text-slate-500 mt-4 leading-relaxed max-w-2xl">{exp.desc}</p>
                         </div>
                         {profile.isSelf && (
                           <button onClick={() => setEditModal({ field: "experience", value: exp })} className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#f97316] transition-all"><Pencil size={18} /></button>
                         )}
                      </div>
                    ))}
                    {profile.isSelf && (
                      <button 
                        onClick={() => setEditModal({ field: "experience", value: "" })}
                        className="w-full h-20 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest text-slate-300 hover:text-[#f97316] hover:border-[#f97316]/30 transition-all shadow-sm"
                      >
                        <Plus size={24} /> Register Experience
                      </button>
                    )}
                </div>
              )}

              {activeTab === "education" && (
                <div className="space-y-10 animate-in fade-in duration-500">
                    {(profile.education || []).map((edu: any, i: number) => (
                      <div key={i} className="flex gap-6 group relative">
                         <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-[#f97316] shrink-0 group-hover:bg-[#f97316] group-hover:text-white transition-all duration-300">
                            <GraduationCap size={32} />
                         </div>
                         <div className="flex-1 space-y-2 pt-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                               <h4 className="text-xl font-black text-slate-900 tracking-tight">{edu.degree}</h4>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{edu.period}</p>
                            </div>
                            <p className="text-sm font-black text-[#f97316] uppercase tracking-[0.1em]">{edu.school}</p>
                            <div className="mt-4 flex">
                               <span className="px-3 py-1.5 bg-slate-900 text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-slate-200">{edu.grade}</span>
                            </div>
                         </div>
                         {profile.isSelf && (
                           <button onClick={() => setEditModal({ field: "education", value: edu })} className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#f97316] transition-all"><Pencil size={18} /></button>
                         )}
                      </div>
                    ))}
                    {profile.isSelf && (
                      <button 
                        onClick={() => setEditModal({ field: "education", value: "" })}
                        className="w-full h-20 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest text-slate-300 hover:text-[#f97316] hover:border-[#f97316]/30 transition-all shadow-sm"
                      >
                        <Plus size={24} /> Register Education
                      </button>
                    )}
                </div>
              )}
              
              {activeTab === "achievements" && (
                <div className="space-y-4 animate-in fade-in duration-500">
                   {(profile.achievements || []).map((ach: string, i: number) => (
                     <div key={i} className="flex items-center gap-6 p-6 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-[#f97316]/30 transition-all shadow-sm">
                        <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-[#f97316] shadow-sm group-hover:bg-[#f97316] group-hover:text-white transition-all">
                           <Star size={24} strokeWidth={3} />
                        </div>
                        <span className="text-base font-black text-slate-900 flex-1 tracking-tight">{ach}</span>
                        {profile.isSelf && (
                           <button onClick={() => setEditModal({ field: "achievements", value: (profile.achievements || []).join(", ") })} className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-[#f97316] transition-all shadow-sm"><Pencil size={16} /></button>
                         )}
                     </div>
                   ))}
                   {profile.isSelf && (
                      <button 
                        onClick={() => setEditModal({ field: "achievements", value: (profile.achievements || []).join(", ") })}
                        className="w-full h-20 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest text-slate-300 hover:text-[#f97316] hover:border-[#f97316]/30 transition-all shadow-sm"
                      >
                        <Plus size={24} /> Submit Achievement
                      </button>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShieldCheck size={120} />
               </div>
               <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#f97316]" strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f97316]">Institutional Node</span>
                  </div>
               </div>
               <div className="relative z-10 space-y-1">
                  <h3 className="text-3xl font-black tracking-tighter leading-none">{profile.dept || "Academic Dept"}</h3>
                  <p className="text-[#f97316] text-xs font-black uppercase tracking-[0.2em]">Wave {profile.batch}</p>
                  <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] pt-4 border-t border-white/10 mt-6">United International University</p>
               </div>
               <div className="relative z-10 flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-white/60 uppercase tracking-widest">
                    <Users size={14} className="text-[#f97316]" /> {profile.connections_count || 0} Professional Nodes
                  </div>
               </div>
            </div>

            {!profile.isSelf && (
               <div className="bg-white border border-slate-200/60 rounded-[32px] p-8 space-y-6 shadow-sm">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Interaction Portal</h3>
                 <div className="space-y-3">
                   <Link 
                     href={`/dashboard/messages?user=${profile.id}`}
                     className="w-full h-14 bg-[#f97316] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-orange-100"
                   >
                     <Send size={16} /> Request Intel
                   </Link>
                   <button 
                     onClick={() => toggleConnection(rawId)}
                     className="w-full h-14 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-white hover:border-[#f97316]/30 transition-all active:scale-95 flex items-center justify-center"
                   >
                     {isConnectedToProfile ? "Linked in Graph" : "Connect Node"}
                   </button>
                 </div>
                 <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest text-center">Verified Peer Communication</p>
               </div>
            )}

            <div className="bg-white border border-slate-200/60 rounded-[32px] p-8 space-y-6 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Communication</h3>
              <div className="space-y-6">
                 <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0"><Mail size={18} /></div>
                    <div className="space-y-0.5 overflow-hidden">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Digital Mail</p>
                       <p className="text-sm font-bold text-slate-900 truncate">{profile.email}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0"><Phone size={18} /></div>
                    <div className="space-y-0.5">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mobile Line</p>
                       <p className="text-sm font-bold text-slate-900">{profile.phone || "Private Connection"}</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Edit Modal */}
      {editModal && (
        <EditModal 
          field={editModal.field} 
          value={editModal.value} 
          onSave={(v) => handleSave(editModal.field, v)} 
          onClose={() => setEditModal(null)} 
        />
      )}
    </div>
  );
}
