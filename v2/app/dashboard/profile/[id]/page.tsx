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
    : value
  );

  const isComplex = field === "experience" || field === "education";

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
           {field === "experience" ? (
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

  const tabs = [
    { key: "about", label: "About", icon: User },
    { key: "experience", label: "Experience", icon: Briefcase },
    { key: "education", label: "Education", icon: GraduationCap },
    { key: "achievements", label: "Achievements", icon: Award },
  ] as const;

  const skillsList: string[] = profile.skills || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans leading-relaxed">

      {/* ── HERO BANNER ──────────────────────────────────────────────────── */}
      <div className="relative h-48 bg-slate-200 overflow-hidden">
        <div className="absolute inset-0 bg-[#0f172a] opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(#f97316_0.5px,transparent_0.5px)] [background-size:20px_20px] opacity-10" />

        {/* Back Button */}
        <button onClick={() => router.back()} className="absolute top-6 left-6 flex items-center gap-1.5 text-white/50 hover:text-white transition-all text-xs font-bold group z-10">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
      </div>

      {/* ── PROFILE CONTENT ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 lg:px-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm -mt-12 relative z-10 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6 border-b border-slate-100 pb-8">
              
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-32 w-32 rounded-xl bg-slate-50 border-4 border-white shadow-sm flex items-center justify-center text-5xl font-bold text-[#f97316] overflow-hidden">
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
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white">
                      <Loader2 size={20} className="animate-spin" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 h-9 w-9 bg-[#f97316] text-white rounded-lg flex items-center justify-center border-4 border-white shadow-sm">
                  <ShieldCheck size={18} />
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
                      className="absolute bottom-0 left-0 h-8 w-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#f97316] shadow-sm transition-all focus:ring-2 focus:ring-[#f97316]/20 disabled:opacity-50"
                    >
                      <Camera size={14} />
                    </button>
                  </>
                )}
              </div>

              {/* Identity Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wide">Verified</span>
                      {profile.isSelf && (
                        <button onClick={() => setEditModal({ field: "name", value: profile.name })} className="text-slate-300 hover:text-slate-500 transition-colors">
                          <Pencil size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-base text-slate-600 font-medium">
                      {profile.job} <span className="text-slate-300 mx-1">at</span>
                      <span className="text-[#f97316] font-semibold">{profile.company}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" />{profile.location}</span>
                      <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-slate-400" />UIU · {profile.dept} · {profile.batch}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {profile.isSelf ? (
                      <>
                        <button onClick={() => setEditModal({ field: "bio", value: profile.bio || "" })} className="px-5 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all active:scale-[0.98]">
                          Edit Profile
                        </button>
                        <button className="px-5 py-2.5 bg-[#0f172a] text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all active:scale-[0.98]">
                          <FileText size={14} className="inline mr-2" />
                          CV
                        </button>
                      </>
                    ) : (
                      <>
                        <Link 
                           href={`/dashboard/messages?user=${profile.id}`}
                           className="px-4 py-2.5 bg-white text-[#f97316] text-xs font-bold rounded-lg border border-slate-200 hover:border-orange-100 hover:bg-orange-50 transition-all active:scale-[0.98] flex items-center gap-2 shadow-sm"
                        >
                           <MessageSquare size={14} /> Message
                        </Link>
                        <button onClick={() => toggleConnection(rawId)} className={cn("px-5 py-2.5 text-xs font-bold rounded-lg transition-all active:scale-[0.98]", isConnectedToProfile ? "bg-slate-100 text-slate-500 border border-slate-200" : "bg-[#0f172a] text-white hover:bg-slate-800")}>
                          {isConnectedToProfile ? "Connected" : "Connect"}
                        </button>
                      </>
                    )}

                    <div className="relative" ref={moreMenuRef}>
                      <button 
                        onClick={() => setIsMoreOpen(!isMoreOpen)}
                        className={cn(
                          "h-10 w-10 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#f97316] hover:border-[#f97316]/30 transition-all",
                          isMoreOpen && "text-[#f97316] border-[#f97316]/30 bg-[#f97316]/5"
                        )}
                      >
                        <MoreVertical size={18} />
                      </button>
                      {isMoreOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          <button onClick={() => setIsMoreOpen(false)} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors">
                            <Share size={14} className="text-slate-400" /> Share Profile
                          </button>
                          <button 
                            onClick={() => { navigator.clipboard.writeText(window.location.href); setIsMoreOpen(false); alert("Link copied to clipboard!"); }} 
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                          >
                            <Link size={14} className="text-slate-400" /> Copy Hub Link
                          </button>
                          <div className="h-px bg-slate-100 my-1" />
                          <button onClick={() => setIsMoreOpen(false)} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors">
                            <Settings size={14} className="text-slate-400" /> Account Settings
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="flex items-center gap-3 pt-6">
              {profile.links?.github && (
                <a href={`https://${profile.links.github}`} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold text-slate-600 hover:border-[#f97316]/30 transition-all">
                  <Code size={14} /> GitHub
                </a>
              )}
              {profile.links?.linkedin && (
                <a href={`https://${profile.links.linkedin}`} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold text-slate-600 hover:border-[#f97316]/30 transition-all">
                  <Link2 size={14} /> LinkedIn
                </a>
              )}
              {profile.isSelf && (
                <button className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-slate-200 rounded-lg text-xs font-semibold text-slate-300 hover:text-[#f97316] transition-all">
                   Add Link
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT GRID ───────────────────────────────────────────── */}
        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          
          {/* Main Content Areas */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs Navigation */}
            <div className="bg-white border border-slate-200 rounded-xl p-1 flex gap-1 shadow-sm">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button 
                  key={key} 
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all",
                    activeTab === key ? "bg-[#0f172a] text-white" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 lg:p-10 space-y-10 shadow-sm min-h-[500px]">
              
              {/* About Tab with Detailed Skills */}
              {activeTab === "about" && (
                <div className="space-y-12">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">About</h2>
                      {profile.isSelf && <button onClick={() => setEditModal({ field: "bio", value: profile.bio || "" })} className="text-slate-300 hover:text-[#f97316]"><Pencil size={15} /></button>}
                    </div>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-l-2 border-slate-100 pl-4">{profile.bio}</p>
                  </div>
                  
                  {/* Skills Section */}
                  <div className="pt-10 border-t border-slate-100 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">Skills</h3>
                      {profile.isSelf && (
                        <button 
                          onClick={() => setEditModal({ field: "skills", value: skillsList.join(", ") })}
                          className="h-9 w-9 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-all"
                        >
                          <Plus size={20} />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {skillsList.map((skill: string, idx: number) => (
                         <span key={idx} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 hover:border-[#f97316]/30 hover:text-[#f97316] transition-colors cursor-default">
                           {skill}
                         </span>
                       ))}
                       {skillsList.length === 0 && (
                         <p className="text-sm text-slate-400 italic">No skills added yet</p>
                       )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "experience" && (
                <div className="space-y-8">
                    {(profile.experience || []).map((exp: any, i: number) => (
                      <div key={i} className="flex gap-5 group relative">
                         <div className="h-14 w-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-[#f97316] shrink-0 group-hover:bg-[#f97316]/5 transition-colors">
                            <Briefcase size={28} />
                         </div>
                         <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                               <h4 className="text-lg font-bold text-slate-900 group-hover:text-[#f97316] transition-colors">{exp.title}</h4>
                               <p className="text-xs font-bold text-slate-400">{exp.period}</p>
                            </div>
                            <p className="text-sm font-semibold text-[#f97316]">{exp.company}</p>
                            <p className="text-sm font-medium text-slate-500 mt-3 leading-relaxed">{exp.desc}</p>
                         </div>
                         {profile.isSelf && (
                           <button onClick={() => setEditModal({ field: "experience", value: exp })} className="text-slate-300 hover:text-[#f97316] opacity-0 group-hover:opacity-100 transition-all ml-2">
                             <Pencil size={18} />
                           </button>
                         )}
                      </div>
                    ))}
                    {(profile.experience || []).length === 0 && !profile.isSelf && (
                      <p className="text-sm text-slate-400 italic">No experience shared</p>
                    )}
                    {profile.isSelf && (
                      <button 
                        onClick={() => setEditModal({ field: "experience", value: "" })}
                        className="w-full h-16 border border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-base font-bold text-slate-300 hover:text-[#f97316] hover:border-[#f97316]/30 transition-all mt-4"
                      >
                        <Plus size={20} /> Add Experience
                      </button>
                    )}
                </div>
              )}

              {activeTab === "education" && (
                <div className="space-y-8">
                    {(profile.education || []).map((edu: any, i: number) => (
                      <div key={i} className="flex gap-5 group relative">
                         <div className="h-14 w-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-[#f97316] shrink-0 group-hover:bg-[#f97316]/5 transition-colors">
                            <GraduationCap size={28} />
                         </div>
                         <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                               <h4 className="text-lg font-bold text-slate-900 group-hover:text-[#f97316] transition-colors">{edu.degree}</h4>
                               <p className="text-xs font-bold text-slate-400">{edu.period}</p>
                            </div>
                            <p className="text-sm font-semibold text-[#f97316]">{edu.school}</p>
                            <span className="inline-block mt-3 px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded uppercase border border-slate-100">{edu.grade}</span>
                         </div>
                         {profile.isSelf && (
                           <button onClick={() => setEditModal({ field: "education", value: edu })} className="text-slate-300 hover:text-[#f97316] opacity-0 group-hover:opacity-100 transition-all ml-2">
                             <Pencil size={18} />
                           </button>
                         )}
                      </div>
                    ))}
                    {(profile.education || []).length === 0 && !profile.isSelf && (
                      <p className="text-sm text-slate-400 italic">No education shared</p>
                    )}
                    {profile.isSelf && (
                      <button 
                        onClick={() => setEditModal({ field: "education", value: "" })}
                        className="w-full h-16 border border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-base font-bold text-slate-300 hover:text-[#f97316] hover:border-[#f97316]/30 transition-all mt-4"
                      >
                        <Plus size={20} /> Add Education
                      </button>
                    )}
                </div>
              )}
              
              {activeTab === "achievements" && (
                <div className="space-y-4">
                   {(profile.achievements || []).map((ach: string, i: number) => (
                     <div key={i} className="flex items-center gap-5 p-5 bg-slate-50 border border-slate-100 rounded-xl group hover:border-[#f97316]/30 transition-all">
                        <Star size={20} className="text-[#f97316] group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold text-slate-700 flex-1">{ach}</span>
                        {profile.isSelf && (
                           <button onClick={() => setEditModal({ field: "achievements", value: (profile.achievements || []).join(", ") })} className="text-slate-300 hover:text-[#f97316] opacity-0 group-hover:opacity-100 transition-all">
                             <Pencil size={15} />
                           </button>
                         )}
                     </div>
                   ))}
                   {(profile.achievements || []).length === 0 && !profile.isSelf && (
                      <p className="text-sm text-slate-400 italic">No achievements shared</p>
                    )}
                   {profile.isSelf && (
                      <button 
                        onClick={() => setEditModal({ field: "achievements", value: (profile.achievements || []).join(", ") })}
                        className="w-full h-16 border border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-base font-bold text-slate-300 hover:text-[#f97316] hover:border-[#f97316]/30 transition-all"
                      >
                        <Plus size={20} /> Add Honor / Award
                      </button>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#0f172a] rounded-xl p-6 text-white space-y-4 shadow-sm relative overflow-hidden group/badge">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShieldCheck size={80} />
               </div>
               <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className={cn(profile.userType === 'alumni' ? "text-[#f97316]" : "text-blue-400")} />
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", profile.userType === 'alumni' ? "text-[#f97316]" : "text-blue-400")}>
                      Verified {profile.userType === 'alumni' ? "Alumnus" : "Student"}
                    </span>
                  </div>
                  {profile.isSelf && (
                    <button onClick={() => setEditModal({ field: "dept", value: profile.dept || "" })} className="text-white/20 hover:text-white transition-colors opacity-0 group-hover/badge:opacity-100">
                      <Settings size={14} />
                    </button>
                  )}
               </div>
               <div className="relative z-10">
                 <div className="flex items-baseline gap-2">
                    <p className="text-xl font-black tracking-tight">{profile.dept || "Department"}</p>
                    <p className="text-white/40 text-xs font-bold">{profile.batch}</p>
                 </div>
                 <p className="text-white/50 text-[10px] uppercase font-bold tracking-wider mt-1">United International University</p>
               </div>
               <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    <Users size={12} /> {profile.connections_count || 0} Connections
                  </div>
                  {profile.isSelf && (
                    <button onClick={() => setEditModal({ field: "batch", value: profile.batch || "" })} className="text-[10px] font-bold text-[#f97316] hover:underline uppercase tracking-tighter">
                      Update Batch
                    </button>
                  )}
               </div>
            </div>

            {!profile.isSelf && (
               <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Networking</h3>
                 <div className="space-y-3">
                   <Link 
                     href={`/dashboard/messages?user=${profile.id}`}
                     className="w-full py-3 bg-[#f97316] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                   >
                     <MessageSquare size={14} /> 
                     {profile.userType === 'alumni' ? "Request Referral" : "Start Collaboration"}
                   </Link>
                   <button 
                     onClick={() => toggleConnection(rawId)}
                     className="w-full py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                   >
                     {isConnectedToProfile ? "Linked in Network" : "Add to Network"}
                   </button>
                 </div>
                 <p className="text-[10px] text-slate-400 font-medium text-center">Connected via United International University</p>
               </div>
            )}

            {profile.isSelf && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Hub Contact</h3>
                <div className="space-y-4">
                   <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 text-sm text-slate-600 font-medium overflow-hidden">
                        <Mail size={16} className="text-slate-400 shrink-0" /> 
                        <span className="truncate">{profile.email}</span>
                      </div>
                      <button onClick={() => setEditModal({ field: "email", value: profile.email })} className="text-slate-300 hover:text-[#f97316] opacity-0 group-hover:opacity-100 transition-all shrink-0">
                        <Pencil size={13} />
                      </button>
                   </div>
                   <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 text-sm text-slate-600 font-medium overflow-hidden">
                        <Phone size={16} className="text-slate-400 shrink-0" /> 
                        <span className="truncate">{profile.phone}</span>
                      </div>
                      <button onClick={() => setEditModal({ field: "phone", value: profile.phone })} className="text-slate-300 hover:text-[#f97316] opacity-0 group-hover:opacity-100 transition-all shrink-0">
                        <Pencil size={13} />
                      </button>
                   </div>
                </div>
              </div>
            )}
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
