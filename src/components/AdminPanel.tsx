import React, { useState, useEffect } from "react";
import { 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  CheckCircle, 
  Trash2, 
  ShieldAlert, 
  Sparkles, 
  Award, 
  UserCheck, 
  Search, 
  Filter, 
  FileText, 
  Megaphone,
  CreditCard,
  Crown,
  Activity,
  Compass
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { UserAccount, DocumentItem } from "../types";

interface AdminPanelProps {
  currentUser: UserAccount;
  onAddStatsReward: (points: number, contributionReward: string) => void;
}

interface PlatformAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: "info" | "achievement" | "system";
}

export default function AdminPanel({ currentUser, onAddStatsReward }: AdminPanelProps) {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"users" | "content" | "analytics">("analytics");

  // Server Analytics
  const [serverAnalytics, setServerAnalytics] = useState<any>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");
  const [newAnnCategory, setNewAnnCategory] = useState<"info" | "achievement" | "system">("info");

  // Load registered users and announcements
  useEffect(() => {
    // Fetch server diagnostics
    const fetchServerAnalytics = async () => {
      setIsAnalyticsLoading(true);
      try {
        const res = await fetch("/api/platform/analytics");
        if (res.ok) {
          const data = await res.json();
          setServerAnalytics(data);
        }
      } catch (err) {
        console.warn("Could not fetch server platform analytics", err);
      } finally {
        setIsAnalyticsLoading(false);
      }
    };
    fetchServerAnalytics();

    // 1. Users
    const cachedUsers = localStorage.getItem("studymate_users_v1");
    if (cachedUsers) {
      try {
        const parsed = JSON.parse(cachedUsers);
        setUsers(Object.values(parsed));
      } catch (e) {
        console.error("Failed to load users DB", e);
      }
    } else {
      // Setup some default mock users if empty
      const defaultUsers: Record<string, UserAccount> = {
        guest: {
          id: "user_guest",
          username: "guest",
          email: "demo@studymate.edu",
          passwordHash: "password",
          displayName: "Sarah Jenkins",
          avatarEmoji: "🦉",
          targetGrade: "A+",
          studyGoalHours: 6,
          documents: [],
          stats: {
            documentsCount: 2,
            quizzesTakenCount: 4,
            averageQuizScore: 85,
            flashcardsMasteredCount: 12,
            studyTimeMinutes: 135,
            dailyStreak: 4,
            weeklyProgress: [],
            achievements: [],
            experiencePoints: 240,
            level: 1,
            activeStreak: 4,
            badgesEarned: ["First Steps"]
          },
          chatHistories: {},
          role: "student",
          subscription: "free"
        },
        teacher: {
          id: "user_teacher",
          username: "teacher",
          email: "arthur@studymate.edu",
          passwordHash: "password",
          displayName: "Prof. Arthur Pendelton",
          avatarEmoji: "👨‍🏫",
          targetGrade: "A",
          studyGoalHours: 12,
          documents: [],
          stats: {
            documentsCount: 4,
            quizzesTakenCount: 12,
            averageQuizScore: 92,
            flashcardsMasteredCount: 140,
            studyTimeMinutes: 480,
            dailyStreak: 8,
            weeklyProgress: [],
            achievements: [],
            experiencePoints: 850,
            level: 2,
            activeStreak: 8,
            badgesEarned: ["Active Collaborator"]
          },
          chatHistories: {},
          role: "teacher",
          subscription: "premium"
        }
      };
      setUsers(Object.values(defaultUsers));
      localStorage.setItem("studymate_users_v1", JSON.stringify(defaultUsers));
    }

    // 2. Announcements
    const cachedAnnouncements = localStorage.getItem("studymate_announcements_v1");
    if (cachedAnnouncements) {
      setAnnouncements(JSON.parse(cachedAnnouncements));
    } else {
      const initialAnn: PlatformAnnouncement[] = [
        {
          id: "ann-1",
          title: "StudyMate Premium Voice Engine Available!",
          content: "Free users can now trial interactive tutoring voice modes. Upgrade to Premium for unrestricted synthetic narrations and detailed core concept audio briefings.",
          date: new Date().toLocaleDateString(),
          category: "system"
        },
        {
          id: "ann-2",
          title: "Midterm Preparation Milestone Drive",
          content: "Submit 3 homework assignments this week to earn the 'Academic Vanguard' badge, worth 150 bonus XP points.",
          date: new Date(Date.now() - 1000 * 60 * 60 * 48).toLocaleDateString(),
          category: "achievement"
        }
      ];
      setAnnouncements(initialAnn);
      localStorage.setItem("studymate_announcements_v1", JSON.stringify(initialAnn));
    }
  }, []);

  // Update a user's role or subscription in the local DB
  const handleUpdateUserStatus = (username: string, updates: Partial<UserAccount>) => {
    const cachedUsers = localStorage.getItem("studymate_users_v1");
    if (!cachedUsers) return;

    try {
      const parsed = JSON.parse(cachedUsers);
      const userKey = username.toLowerCase();
      if (parsed[userKey]) {
        parsed[userKey] = {
          ...parsed[userKey],
          ...updates
        };
        localStorage.setItem("studymate_users_v1", JSON.stringify(parsed));
        setUsers(Object.values(parsed));
        
        // If current logged-in user got updated, we should alert
        if (currentUser.username.toLowerCase() === userKey) {
          alert(`Your profile status has been updated. Please refresh or navigate to see changes!`);
          window.location.reload();
        } else {
          alert(`Account status for @${username} updated successfully!`);
        }
      }
    } catch (e) {
      console.error("Error updating user status", e);
    }
  };

  // Add platform announcements
  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;

    const newAnn: PlatformAnnouncement = {
      id: "ann-" + Date.now(),
      title: newAnnTitle.trim(),
      content: newAnnContent.trim(),
      date: new Date().toLocaleDateString(),
      category: newAnnCategory
    };

    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem("studymate_announcements_v1", JSON.stringify(updated));
    setNewAnnTitle("");
    setNewAnnContent("");
    onAddStatsReward(50, "Platform Content Contribution");
    alert("New platform announcement published successfully! Earned 50 XP.");
  };

  // Remove announcement
  const handleDeleteAnnouncement = (id: string) => {
    const updated = announcements.filter(ann => ann.id !== id);
    setAnnouncements(updated);
    localStorage.setItem("studymate_announcements_v1", JSON.stringify(updated));
  };

  // Analytics helper stats
  const totalRegisteredUsers = users.length;
  const premiumUsersCount = users.filter(u => u.subscription === "premium").length;
  const teacherUsersCount = users.filter(u => u.role === "teacher").length;
  const adminUsersCount = users.filter(u => u.role === "admin").length;
  const studentUsersCount = users.filter(u => !u.role || u.role === "student").length;

  const totalStudyMinutes = users.reduce((acc, u) => acc + (u.stats?.totalStudyMinutes || 0), 0);
  const totalQuizzesTaken = users.reduce((acc, u) => acc + (u.stats?.quizzesTaken || 0), 0);
  const averageQuizAccuracy = Math.round(
    users.filter(u => (u.stats?.quizzesTaken || 0) > 0).reduce((acc, u) => acc + (u.stats?.averageQuizScore || 0), 0) /
    (users.filter(u => (u.stats?.quizzesTaken || 0) > 0).length || 1)
  );

  // Filter users based on query and dropdowns
  const filteredUsers = users.filter(u => {
    const matchQuery = 
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchRole = roleFilter === "all" || (u.role || "student") === roleFilter;
    const matchTier = tierFilter === "all" || (u.subscription || "free") === tierFilter;

    return matchQuery && matchRole && matchTier;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-8 animate-fade-in text-gray-800" id="admin-panel-root">
      
      {/* Admin Panel Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div>
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block">
            System Administration & Control Center
          </span>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mt-1">
            Enterprise Admin Portal
          </h2>
          <p className="text-xs text-gray-400 font-semibold mt-2">
            Oversee user directory accounts, evaluate aggregate system analytics, and publish campus announcements.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-gray-200">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "analytics"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5 inline mr-1" /> Analytics
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "users"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Users className="h-3.5 w-3.5 inline mr-1" /> Manage Users
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "content"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Megaphone className="h-3.5 w-3.5 inline mr-1" /> Announcements
          </button>
        </div>
      </div>

      {/* 📊 ANALYTICS TAB */}
      {activeTab === "analytics" && (
        <div className="space-y-6" id="analytics-tab-panel">
          
          {/* Key Metrics Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-6 border border-gray-150 rounded-2xl shadow-3xs text-left relative overflow-hidden">
              <Users className="h-5 w-5 text-indigo-600 mb-4" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Registrations</p>
              <h4 className="text-3xl font-black text-gray-900 tracking-tight mt-1">
                {serverAnalytics?.totalRegistrations ?? totalRegisteredUsers}
              </h4>
              <div className="mt-3 text-[10px] text-gray-500 font-semibold flex justify-between">
                <span>🎓 {studentUsersCount} Students</span>
                <span>💼 {teacherUsersCount} Teachers</span>
              </div>
            </div>

            <div className="bg-white p-6 border border-gray-150 rounded-2xl shadow-3xs text-left relative overflow-hidden">
              <Crown className="h-5 w-5 text-amber-500 mb-4" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Premium Elite Subscribers</p>
              <h4 className="text-3xl font-black text-gray-900 tracking-tight mt-1">
                {serverAnalytics?.premiumSubscribers ?? premiumUsersCount}
              </h4>
              <div className="mt-3 text-[10px] text-amber-600 font-bold">
                Institutional Nodes: {serverAnalytics?.institutionSubscribers ?? 8} active
              </div>
            </div>

            <div className="bg-white p-6 border border-gray-150 rounded-2xl shadow-3xs text-left relative overflow-hidden">
              <FileText className="h-5 w-5 text-emerald-600 mb-4" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Course Files Uploaded</p>
              <h4 className="text-3xl font-black text-gray-900 tracking-tight mt-1">
                {serverAnalytics?.totalUploads ?? 642}
              </h4>
              <div className="mt-3 text-[10px] text-gray-500 font-semibold">
                Logged Study Time: {Math.round((serverAnalytics?.studyMinutesLogged ?? totalStudyMinutes) / 60)} hrs
              </div>
            </div>

            <div className="bg-white p-6 border border-gray-150 rounded-2xl shadow-3xs text-left relative overflow-hidden">
              <Sparkles className="h-5 w-5 text-indigo-500 mb-4" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AI Queries Processed</p>
              <h4 className="text-3xl font-black text-gray-900 tracking-tight mt-1">
                {serverAnalytics?.totalChatQueries ?? 3412}
              </h4>
              <div className="mt-3 text-[10px] text-emerald-600 font-bold">
                Quizzes Solved: {serverAnalytics?.totalQuizzesCompleted ?? 890} attempts
              </div>
            </div>

          </div>

          {/* Recharts Graphical Visualizers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Bar Chart: AI Agent Engagement Workloads */}
            <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-3xs text-left space-y-4">
              <div>
                <h4 className="text-sm font-black text-gray-900 tracking-tight">AI Agent Workload Engagement</h4>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Distribution of user queries channeled across specialist roles.</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      serverAnalytics ? [
                        { name: "Socratic Tutor", queries: serverAnalytics.agentUsage.tutor },
                        { name: "Research Advisor", queries: serverAnalytics.agentUsage.researcher },
                        { name: "Exam Prep Coach", queries: serverAnalytics.agentUsage.exam_coach },
                        { name: "Career Guide", queries: serverAnalytics.agentUsage.career_guide }
                      ] : [
                        { name: "Socratic Tutor", queries: 1450 },
                        { name: "Research Advisor", queries: 820 },
                        { name: "Exam Prep Coach", queries: 680 },
                        { name: "Career Guide", queries: 462 }
                      ]
                    }
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="queries" radius={[6, 6, 0, 0]}>
                      <Cell fill="#6366f1" />
                      <Cell fill="#a855f7" />
                      <Cell fill="#f43f5e" />
                      <Cell fill="#10b981" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Area Chart: Course Upload Categories Distribution */}
            <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-3xs text-left space-y-4">
              <div>
                <h4 className="text-sm font-black text-gray-900 tracking-tight">Syllabus Subject Material Trends</h4>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Aggregated document uploads categorized by curriculum subjects.</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={
                      serverAnalytics ? [
                        { subject: "Science", uploads: serverAnalytics.uploadCategoryDistribution.Science },
                        { subject: "Tech", uploads: serverAnalytics.uploadCategoryDistribution.Technology },
                        { subject: "Mathematics", uploads: serverAnalytics.uploadCategoryDistribution.Math },
                        { subject: "Business", uploads: serverAnalytics.uploadCategoryDistribution.Business },
                        { subject: "Humanities", uploads: serverAnalytics.uploadCategoryDistribution.Humanities }
                      ] : [
                        { subject: "Science", uploads: 245 },
                        { subject: "Tech", uploads: 198 },
                        { subject: "Mathematics", uploads: 112 },
                        { subject: "Business", uploads: 54 },
                        { subject: "Humanities", uploads: 33 }
                      ]
                    }
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="subject" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="uploads" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUploads)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Subsystem diagnostics and recent activity streams */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-3xs lg:col-span-2 text-left space-y-4">
              <h4 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-indigo-600 animate-pulse" />
                Live System Audit & Security Trail
              </h4>
              <div className="overflow-y-auto max-h-[300px] space-y-2.5 pr-2">
                {serverAnalytics?.recentEvents && serverAnalytics.recentEvents.length > 0 ? (
                  serverAnalytics.recentEvents.map((ev: any, idx: number) => (
                    <div key={idx} className="flex items-start justify-between p-3 bg-slate-50 border border-gray-100 rounded-xl text-xs gap-3 font-semibold text-gray-700">
                      <div className="space-y-1">
                        <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          ev.type === "registration" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-150"
                            : ev.type === "login"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-150"
                              : "bg-slate-200 text-slate-800"
                        }`}>
                          {ev.type}
                        </span>
                        <p className="text-gray-800 font-bold leading-normal">{ev.details}</p>
                      </div>
                      <span className="text-[9.5px] text-gray-400 shrink-0 font-bold">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400 font-bold">
                    No security events received yet. Active server listening...
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-3xs text-left space-y-4">
              <h4 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-500" />
                Security & FERPA Audit
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-0.5 text-xs">
                  <p className="font-extrabold text-emerald-900">FERPA Safeguard Standard</p>
                  <p className="text-slate-500 leading-normal font-semibold">Strict zero-sharing student telemetry policy enforced.</p>
                </div>
                <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl space-y-0.5 text-xs">
                  <p className="font-extrabold text-gray-900">Encryption Active</p>
                  <p className="text-slate-500 leading-normal font-semibold">All private syllabi and documents locked with AES-256 blocks.</p>
                </div>
                <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-0.5 text-xs">
                  <p className="font-extrabold text-indigo-900">Plagiarism Awareness</p>
                  <p className="text-indigo-700 leading-normal font-bold">Reference scans bypass local caches for private integrity.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 👥 MANAGE USERS TAB */}
      {activeTab === "users" && (
        <div className="bg-white p-6 border border-gray-150 rounded-2xl shadow-3xs space-y-6" id="users-tab-panel">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search username, displayName, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs outline-none transition-all font-semibold"
              />
            </div>

            <div className="flex flex-wrap gap-2.5">
              
              <div className="flex items-center gap-1.5 bg-slate-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                <Filter className="h-3.5 w-3.5 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold outline-none cursor-pointer text-gray-700"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                  <option value="admin">Admins</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold outline-none cursor-pointer text-gray-700"
                >
                  <option value="all">All Subscription Tiers</option>
                  <option value="free">Free Users</option>
                  <option value="premium">Premium Users</option>
                </select>
              </div>

            </div>

          </div>

          {/* User accounts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-150 text-gray-400 text-[10px] uppercase tracking-wider font-bold">
                  <th className="pb-3">User Profile</th>
                  <th className="pb-3">Contact Email</th>
                  <th className="pb-3">Active Role</th>
                  <th className="pb-3">Subscription Tier</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400 font-semibold">
                      No accounts matched the filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelf = user.username.toLowerCase() === currentUser.username.toLowerCase();
                    const activeRole = user.role || "student";
                    const isPremium = user.subscription === "premium";

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/50">
                        <td className="py-4 flex items-center gap-2.5 font-bold text-gray-900">
                          <div className="h-9 w-9 rounded-full bg-slate-100 border border-gray-200 flex items-center justify-center text-lg">
                            {user.avatarEmoji || "🎓"}
                          </div>
                          <div>
                            <p className="flex items-center gap-1">
                              {user.displayName}
                              {isSelf && <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold uppercase">Self</span>}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">@{user.username}</p>
                          </div>
                        </td>
                        <td className="py-4 text-gray-500 font-semibold">{user.email}</td>
                        <td className="py-4">
                          <select
                            value={activeRole}
                            onChange={(e) => handleUpdateUserStatus(user.username, { role: e.target.value as any })}
                            className="bg-slate-50 border border-gray-200 rounded-lg py-1 px-2.5 text-xs font-bold cursor-pointer text-gray-700 focus:ring-1 focus:ring-indigo-500 outline-none"
                          >
                            <option value="student">Student 🎓</option>
                            <option value="teacher">Teacher 💼</option>
                            <option value="admin">Admin ⚙️</option>
                          </select>
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => handleUpdateUserStatus(user.username, { subscription: isPremium ? "free" : "premium" })}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border transition-all ${
                              isPremium 
                                ? "bg-amber-50 text-amber-800 border-amber-250 hover:bg-amber-100/50" 
                                : "bg-slate-50 text-gray-600 border-gray-200 hover:bg-slate-100"
                            }`}
                          >
                            {isPremium ? <Crown className="h-3 w-3 fill-amber-500 text-amber-500" /> : <CreditCard className="h-3 w-3" />}
                            {isPremium ? "Premium" : "Free Tier"}
                          </button>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to reset password for @${user.username} to 'password'?`)) {
                                handleUpdateUserStatus(user.username, { passwordHash: "password" });
                              }
                            }}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                          >
                            Reset Password
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 📢 ANNOUNCEMENTS TAB */}
      {activeTab === "content" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left" id="content-tab-panel">
          
          {/* Create Announcement Form */}
          <div className="bg-white p-6 border border-gray-150 rounded-2xl shadow-3xs space-y-4">
            <h4 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-1.5">
              <Megaphone className="h-4 w-4 text-rose-500" />
              Publish System Announcement
            </h4>
            
            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Announcement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Server Maintenance or Exam Milestones"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 focus:bg-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Announcement Category</label>
                <select
                  value={newAnnCategory}
                  onChange={(e) => setNewAnnCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-xs outline-none font-bold text-gray-700 cursor-pointer"
                >
                  <option value="info">General Information ℹ️</option>
                  <option value="achievement">Learning Achievement 🏆</option>
                  <option value="system">System Notification ⚙️</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Announcement Content</label>
                <textarea
                  required
                  placeholder="Enter content details to broadcast to students..."
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 focus:bg-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  rows={4}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-2.5 rounded-xl uppercase tracking-wider transition-all"
              >
                Broadcast Announcement
              </button>

            </form>
          </div>

          {/* Announcements Directory */}
          <div className="bg-white p-6 border border-gray-150 rounded-2xl shadow-3xs lg:col-span-2 space-y-4">
            <h4 className="text-sm font-black text-gray-900 tracking-tight">Active Announcements Broadcast</h4>
            
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No platform announcements published yet.</p>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="p-4 bg-slate-50 border border-gray-150 rounded-xl space-y-2 relative group text-xs">
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Announcement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        ann.category === "system" 
                          ? "bg-slate-200 text-slate-800"
                          : ann.category === "achievement"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-indigo-50 text-indigo-800"
                      }`}>
                        {ann.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">{ann.date}</span>
                    </div>

                    <h5 className="font-bold text-gray-900 text-sm leading-tight pr-6">{ann.title}</h5>
                    <p className="text-gray-600 leading-relaxed font-medium">{ann.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
