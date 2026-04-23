"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { supabase } from "./supabase";

// MOCK DATA REMOVED: 
// The system has been audited and all hardcoded 'INITIAL_XXX' placeholder collections
// have been permanently eliminated to establish a strict, real-world data flow.

const STORE_KEY = "linkuiu_global_store_v2";

interface GlobalContextType {
  alumni: any[];
  jobs: any[];
  events: any[];
  posts: any[];
  applications: any[];
  notifications: any[];
  currentUser: any;
  userSession: any;
  pulseFeed: any[];
  isLoaded: boolean;
  isCloudMode: boolean;
  // Actions
  updateProfile: (updates: any) => Promise<void>;
  addJob: (job: any) => Promise<void>;
  addPost: (content: string) => Promise<void>;
  applyToJob: (application: any) => Promise<void>;
  toggleConnection: (alumniId: string) => Promise<void>;
  joinEvent: (eventId: number) => Promise<void>;
  markNotificationRead: (id: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  addNotification: (title: string, type: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  commentOnPost: (postId: string, comment: string) => Promise<void>;
  sendMessage: (convoId: string, text: string) => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCloudMode, setIsCloudMode] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);

  const buildInitialData = () => ({
    alumni: [] as any[],
    jobs: [] as any[],
    events: [] as any[],
    posts: [] as any[],
    applications: [] as any[],
    notifications: [] as any[],
    currentUser: null,
  });

  const [data, setData] = useState(buildInitialData);

  // ─── THE LINKPULSE™ ALGORITHM ─────────────────────────────────────────────
  const pulseFeed = useMemo(() => {
    const stream = [
      ...data.posts.map(p => ({ ...p, type: 'post', feedId: `post-${p.id}` })),
      ...data.jobs.map(j => ({ ...j, type: 'job', feedId: `job-${j.id}` })),
      ...data.events.map(e => ({ ...e, type: 'event', feedId: `event-${e.id}` })),
    ];

    return stream.map(item => {
      const author = data.alumni.find(a => a.id === (item.authorId || item.postedBy?.id));
      const ageHours = (Date.now() - new Date(item.createdAt || Date.now()).getTime()) / 3600000;
      
      // Ranking Weights
      const weights: Record<string, number> = { job: 1.2, event: 1.0, post: 0.8 };
      let score = (weights[item.type] || 1.0) / Math.pow(ageHours + 2, 1.8);

      // Personalization Bias (Same Dept)
      if (author?.dept === data.currentUser?.dept) score *= 1.5;
      
      return { ...item, author, pulseScore: score };
    }).sort((a, b) => b.pulseScore - a.pulseScore);
  }, [data.posts, data.jobs, data.events, data.alumni, data.currentUser]);

  // ─── INITIALIZATION & LIVE SUPABASE SYNC ──────────────────────────────────
  useEffect(() => {
    let authListener: any = null;

    async function fetchFullDatabase(session: any) {
      if (!session) return;
      try {
        const [profilesRes, jobsRes, eventsRes, postsRes] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('jobs').select('*, posted_by(*)'),
          supabase.from('events').select('*'),
          supabase.from('posts').select('*, author_id(*)')
        ]);

        const currentUser = profilesRes.data?.find(p => p.id === session.user.id) || null;
        
        // Profiles, Jobs, Events, and Posts are now in state
        setData(prev => ({
          ...prev,
          alumni: profilesRes.data || [],
          jobs: jobsRes.data || [],
          events: eventsRes.data || [],
          posts: postsRes.data || [],
          currentUser
        }));
          
      } catch (error) {
        console.error("Live DB Sync Failed:", error);
      }
    }

    async function init() {
      const hasCloudKeys = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      setIsCloudMode(hasCloudKeys);

      if (hasCloudKeys) {
        // 1. Initial Load Config
        const { data: { session } } = await supabase.auth.getSession();
        setUserSession(session);
        if (session) await fetchFullDatabase(session);

        // 2. Real-time Auth Listener (Fires on Login/Logout without refreshing)
        const { data: listener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          setUserSession(newSession);
          if (newSession) {
            await fetchFullDatabase(newSession);
          } else {
             setData(buildInitialData()); // Purge state on logout
          }
        });
        authListener = listener;
      } else {
        console.warn("⚠️ MOCK DATA PURGED: The platform has been converted to Production Data Flow. Please connect Supabase credentials to view data.");
      }
      setIsLoaded(true);
    }
    
    init();

    return () => {
       if (authListener?.subscription) authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isCloudMode || !userSession) return;

    const channel = supabase.channel(`public:notifications:${userSession.user.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications', 
        filter: `profile_id=eq.${userSession.user.id}` 
      }, payload => {
        setData(prev => ({ ...prev, notifications: [payload.new, ...prev.notifications] }));
        // Also fire a native notification if supported
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("LinkUIU Update", { body: payload.new.title });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isCloudMode, userSession]);

  useEffect(() => {
    if (isLoaded && data.currentUser) {
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  // ─── REAL-TIME SYSTEM (Now handled natively above) ─────────────────────

  // ─── ACTIONS ──────────────────────────────────────────────────────────────
  const updateProfile = async (updates: any) => {
    if (!userSession) return;
    setData(prev => {
      const updatedUser = { ...prev.currentUser, ...updates };
      const updatedAlumni = prev.alumni.map(a => a.id === userSession.user.id ? updatedUser : a);
      return { ...prev, currentUser: updatedUser, alumni: updatedAlumni };
    });
    if (isCloudMode) await supabase.from('profiles').update(updates).eq('id', userSession.user.id);
  };

  const addJob = async (job: any) => {
    const jobWithMeta = { ...job, createdAt: new Date().toISOString() };
    setData(prev => ({ ...prev, jobs: [jobWithMeta, ...prev.jobs] }));
    addNotification(`New Position: ${job.title} at ${job.company}`, "job");
    if (isCloudMode && userSession) await supabase.from('jobs').insert([jobWithMeta]);
  };

  const addPost = async (content: string) => {
    const newPost = { id: `p${Date.now()}`, authorId: 'self', content, likes: 0, createdAt: new Date().toISOString() };
    setData(prev => ({ ...prev, posts: [newPost, ...prev.posts] }));
    if (isCloudMode && userSession) await supabase.from('posts').insert([{ author_id: userSession.user.id, content }]);
  };

  const applyToJob = async (application: any) => {
    setData(prev => {
      if (prev.applications.some(a => a.jobId === application.jobId && a.applicantId === application.applicantId)) return prev;
      return { ...prev, applications: [application, ...prev.applications] };
    });
    addNotification(`Application submitted for ${application.jobId}`, "system");
    if (isCloudMode && userSession) await supabase.from('job_applications').insert([application]);
  };

  const toggleConnection = async (alumniId: string) => {
    setData(prev => ({
      ...prev,
      alumni: prev.alumni.map(a => a.id === alumniId ? { ...a, isConnected: !a.isConnected } : a)
    }));
    if (isCloudMode && userSession) {
      const isConnecting = !data.alumni.find(a => a.id === alumniId)?.isConnected;
      if (isConnecting) await supabase.from('connections').insert([{ user_id: userSession.user.id, friend_id: alumniId, status: 'accepted' }]);
      else await supabase.from('connections').delete().eq('user_id', userSession.user.id).eq('friend_id', alumniId);
    }
  };

  const joinEvent = async (eventId: number) => {
    setData(prev => ({ ...prev, events: prev.events.map(e => e.id === eventId ? { ...e, isJoined: true } : e) }));
    if (isCloudMode && userSession) await supabase.from('event_attendance').insert([{ event_id: eventId, profile_id: userSession.user.id }]);
  };

  const markNotificationRead = async (id: number) => {
    setData(prev => ({ ...prev, notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));
  };

  const markAllNotificationsRead = async () => {
    setData(prev => ({ ...prev, notifications: prev.notifications.map(n => ({ ...n, read: true })) }));
  };

  const addNotification = async (title: string, type: string) => {
    const newNotif = { id: Date.now(), title, type, createdAt: new Date().toISOString(), read: false };
    setData(prev => ({ ...prev, notifications: [newNotif, ...prev.notifications] }));
  };

  const likePost = async (postId: string) => {
    setData(prev => ({
      ...prev,
      posts: prev.posts.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p)
    }));
  };

  const commentOnPost = async (postId: string, comment: string) => {
    // In a real app, you'd add to a comments array on the post
    addNotification(`You commented: "${comment}"`, "system");
  };

  const sendMessage = async (convoId: string, text: string) => {
    // Send a message via global store context
    // This is often handled in a local convestore, but allows global hooks
  };

  return (
    <GlobalContext.Provider value={{ 
      ...data, 
      userSession, pulseFeed, isLoaded, isCloudMode,
      updateProfile, addJob, addPost, applyToJob, toggleConnection, joinEvent, 
      markNotificationRead, markAllNotificationsRead, addNotification,
      likePost, commentOnPost, sendMessage
    }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalStore() {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobalStore must be used within GlobalProvider");
  return context;
}
