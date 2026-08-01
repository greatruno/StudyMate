import React, { useState, useEffect } from "react";
import { 
  Award, 
  Flame, 
  Zap, 
  BookOpen, 
  Clock, 
  Brain, 
  TrendingUp, 
  FileText, 
  ArrowRight,
  Sparkles,
  Edit2,
  Check,
  User,
  Target,
  Mail,
  Plus,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Activity,
  ChevronRight,
  Settings,
  TrendingDown,
  ListTodo
} from "lucide-react";
import { DocumentItem, StudyStats, UserAccount, QuizAttempt } from "../types";
import { WorkspaceWidgetGrid } from "./workspace/WorkspaceWidgetGrid";

interface DashboardProps {
  stats: StudyStats;
  documents: DocumentItem[];
  setSelectedDocId: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
  currentUser: UserAccount | null;
  onUpdateProfile: (updated: Partial<UserAccount>) => void;
  onToggleCompletedTopic: (topicName: string) => void;
}

const AVATAR_OPTIONS = ["🎓", "🧠", "🔬", "🔭", "🎨", "✍️", "💻", "🧬", "📚", "🦁", "🦊", "🦉"];
const GRADE_OPTIONS = ["A+", "A", "A-", "B+", "B", "First Class", "Distinction", "Pass"];

export default function Dashboard({
  stats,
  documents,
  setSelectedDocId,
  setActiveTab,
  currentUser,
  onUpdateProfile,
  onToggleCompletedTopic
}: DashboardProps) {
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [subTab, setSubTab] = useState<"overview" | "analytics">("overview");

  // Profile fields
  const [editDisplayName, setEditDisplayName] = useState(currentUser?.displayName || "");
  const [editEmail, setEditEmail] = useState(currentUser?.email || "");
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatarEmoji || "🎓");
  const [editGrade, setEditGrade] = useState(currentUser?.targetGrade || "A+");
  const [editGoal, setEditGoal] = useState(currentUser?.studyGoalHours || 5);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // AI Insights State
  const [insights, setInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState("");

  // Sync profile fields if currentUser updates
  useEffect(() => {
    if (currentUser) {
      setEditDisplayName(currentUser.displayName);
      setEditEmail(currentUser.email);
      setEditAvatar(currentUser.avatarEmoji);
      setEditGrade(currentUser.targetGrade);
      setEditGoal(currentUser.studyGoalHours);
    }
  }, [currentUser]);

  // Dynamic automatic fetch of AI insights upon loading analytics tab
  useEffect(() => {
    if (subTab === "analytics" && !insights && !loadingInsights) {
      fetchInsights();
    }
  }, [subTab]);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    setInsightsError("");
    try {
      const response = await fetch("/api/generate/learning-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stats,
          documents,
          username: currentUser?.username || "Sarah Jenkins"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to compile cognitive analytics insights.");
      }

      const data = await response.json();
      setInsights(data);
    } catch (err: any) {
      console.error(err);
      setInsightsError(err.message || "Failed to establish live analytical connection.");
    } finally {
      setLoadingInsights(false);
    }
  };

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    const studentName = currentUser?.displayName || "Student";
    const grade = currentUser?.targetGrade || "A+";

    if (hour < 12) {
      return {
        text: `Good morning, ${studentName}! 🌅`,
        sub: `Ready to level up your study session to hit your ${grade} target?`
      };
    } else if (hour < 18) {
      return {
        text: `Good afternoon, ${studentName}! ☀️`,
        sub: `Take a focused study interval to secure your ${grade} milestone.`
      };
    } else {
      return {
        text: `Good evening, ${studentName}! 🌙`,
        sub: `Wind down your day with some active recall or chat with your tutor.`
      };
    }
  };

  const greeting = getGreeting();

  // Calculate learning progress metrics
  const totalWords = documents.reduce((sum, doc) => sum + doc.wordCount, 0);
  
  // Weekly minutes goal vs current
  const weeklyGoalMinutes = (currentUser?.studyGoalHours || 5) * 60;
  const currentWeeklyMinutes = stats.studyTimeMinutes;
  const weeklyProgressPct = Math.min(100, Math.round((currentWeeklyMinutes / weeklyGoalMinutes) * 100));

  // Extract subjects data
  const getSubjectsData = () => {
    const subjectsMap: Record<string, {
      name: string;
      topics: string[];
      documents: DocumentItem[];
    }> = {};

    // Merge in user's actual documents
    documents.forEach(doc => {
      const subName = doc.subject || doc.summary?.subject || "General Study";
      
      let docTopics: string[] = [];
      if (doc.summary?.topics) {
        docTopics = [...doc.summary.topics];
      } else if (doc.summary?.chapters) {
        docTopics = doc.summary.chapters.map(c => c.title);
      }
      
      if (!subjectsMap[subName]) {
        subjectsMap[subName] = {
          name: subName,
          topics: docTopics.length > 0 ? docTopics : ["Core Concepts", "Definitions", "Revision Topics"],
          documents: [doc]
        };
      } else {
        if (!subjectsMap[subName].documents.some(d => d.id === doc.id)) {
          subjectsMap[subName].documents.push(doc);
        }
        docTopics.forEach(t => {
          if (!subjectsMap[subName].topics.includes(t)) {
            subjectsMap[subName].topics.push(t);
          }
        });
      }
    });

    return Object.values(subjectsMap).map(sub => {
      const completed = sub.topics.filter(t => (stats.completedTopics || []).includes(t));
      const remaining = sub.topics.filter(t => !(stats.completedTopics || []).includes(t));
      const percentage = sub.topics.length > 0 
        ? Math.round((completed.length / sub.topics.length) * 100) 
        : 0;

      return {
        ...sub,
        completed,
        remaining,
        percentage
      };
    });
  };

  const subjects = getSubjectsData();

  // Quick Action Handler
  const handleQuickStudy = (docId: string, tab: string) => {
    setSelectedDocId(docId);
    setActiveTab(tab);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      displayName: editDisplayName.trim() || currentUser?.displayName,
      email: editEmail.trim() || currentUser?.email,
      avatarEmoji: editAvatar,
      targetGrade: editGrade,
      studyGoalHours: editGoal > 0 ? editGoal : 5,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditingProfile(false);
    }, 800);
  };

  // Generate SVG custom styling constants for visual charts
  const maxWeeklyMinutes = Math.max(...stats.weeklyProgress.map(d => d.minutes), 30);

  return (
    <div className="space-y-8 animate-fade-in p-4 lg:p-8 max-w-7xl mx-auto" id="dashboard-view">
      
      {/* Top Local Sub-navigation Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight">StudyMate Workspace</h1>
          <p className="text-xs text-gray-500 mt-1">Your decentralized adaptive cognitive learning analytics base.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200/50 self-start sm:self-center">
          <button
            onClick={() => setSubTab("overview")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              subTab === "overview"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Classic Overview
          </button>
          <button
            onClick={() => setSubTab("analytics")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              subTab === "analytics"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
            Progress & Analytics
          </button>
        </div>
      </div>

      {subTab === "overview" ? (
        <>
          {/* Classic Overview Layout */}
          {/* Personalized Greeting & Study Tracker Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Welcome Hero Panel (Left Column) */}
            <div className="lg:col-span-8 relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 lg:p-8 text-white border border-slate-800 shadow-xl flex flex-col justify-between">
              <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10 space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
                  <Sparkles className="h-3 w-3" />
                  Adaptive Learning Companion
                </span>
                <div className="space-y-1">
                  <h2 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                    {greeting.text}
                  </h2>
                  <p className="text-slate-300 text-xs lg:text-sm leading-relaxed">
                    {greeting.sub}
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex flex-wrap gap-3 pt-6">
                <button
                  onClick={() => setActiveTab("upload")}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                  id="dash-upload-btn"
                >
                  Upload New Notes
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (documents.length > 0) {
                      setSelectedDocId(documents[0].id);
                      setActiveTab("chat");
                    } else {
                      setActiveTab("upload");
                    }
                  }}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs border border-slate-700/60 transition-all"
                  id="dash-chat-btn"
                >
                  Consult Study Tutor
                </button>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ml-auto border border-white/10"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Learning Progress Goal (Right Column) */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-3xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Learning Progress</h3>
                  <span className="text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full uppercase">
                    Goal: {currentUser?.targetGrade || "A+"} Grade
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[11px] text-gray-400 font-bold uppercase">Weekly Goal</p>
                      <p className="text-2xl font-black text-gray-900 leading-none mt-1">
                        {currentWeeklyMinutes} <span className="text-xs font-medium text-gray-400">/ {weeklyGoalMinutes} mins</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-indigo-600 leading-none">{weeklyProgressPct}%</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Completed</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${weeklyProgressPct}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-gray-500 leading-normal">
                    {weeklyProgressPct >= 100 
                      ? "🎉 Incredible effort! You've crushed your weekly study target!"
                      : `Keep studying! Just ${Math.max(0, weeklyGoalMinutes - currentWeeklyMinutes)} more minutes to complete your weekly target.`}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center gap-2.5 mt-4">
                <div className="h-9 w-9 rounded-full bg-slate-50 border border-gray-150 flex items-center justify-center text-lg shadow-3xs shrink-0">
                  {currentUser?.avatarEmoji || "🎓"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{currentUser?.displayName || "Student"}</p>
                  <p className="text-[10px] text-gray-400 font-medium truncate">{currentUser?.email || "studymate@academy.edu"}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Modular Workspace Widgets Section */}
          <WorkspaceWidgetGrid
            documents={documents}
            currentUser={currentUser}
            stats={stats}
            onNavigateTab={(tab, docId) => {
              if (docId) setSelectedDocId(docId);
              setActiveTab(tab);
            }}
            onToggleCompletedTopic={onToggleCompletedTopic}
          />

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard-stats-grid">
            
            {/* Study Time */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Study Time</p>
                <p className="text-2xl font-black text-gray-900">{stats.studyTimeMinutes} <span className="text-sm font-medium text-gray-500">mins</span></p>
                <p className="text-[11px] text-green-500 font-semibold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Active study intervals tracked
                </p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <Clock className="h-6 w-6" />
              </div>
            </div>

            {/* Quizzes Taken & Avg Score */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quiz Performance</p>
                <p className="text-2xl font-black text-gray-900">
                  {stats.averageQuizScore}% <span className="text-xs text-gray-500 font-normal">avg ({stats.quizzesTakenCount} taken)</span>
                </p>
                <p className="text-[11px] text-indigo-500 font-semibold">Keep accuracy &gt;80%</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <Award className="h-6 w-6" />
              </div>
            </div>

            {/* Flashcards Mastered */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Flashcards Mastered</p>
                <p className="text-2xl font-black text-gray-900">{stats.flashcardsMasteredCount}</p>
                <p className="text-[11px] text-gray-500">Active recall builds muscle memory</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-xl text-pink-600">
                <Brain className="h-6 w-6" />
              </div>
            </div>

            {/* Daily Streak */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Daily Streak</p>
                <div className="flex items-center gap-1.5">
                  <Flame className="h-6 w-6 text-amber-500 fill-amber-500 animate-bounce" />
                  <p className="text-2xl font-black text-gray-900">{stats.dailyStreak} Days</p>
                </div>
                <p className="text-[11px] text-amber-600 font-semibold">Keep the flame alive!</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                <Zap className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Two Column Layout: Recent Study Materials & Achievements */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Recent Study Materials (2 Columns wide) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Recently Accessed Materials</h3>
                    <p className="text-xs text-gray-500">Reopen, test, or trigger AI studies from saved files</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("library")}
                    className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1"
                    id="view-all-materials"
                  >
                    Go to Library ({documents.length})
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {documents.length === 0 ? (
                  <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-600">No study materials found</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Upload your first lecture note to compile structured active studies!</p>
                    <button
                      onClick={() => setActiveTab("upload")}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                    >
                      Compile Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {documents.slice(0, 3).map((doc) => {
                      const hasAI = !!doc.summary;
                      return (
                        <div key={doc.id} className="p-4 bg-gray-50 hover:bg-slate-50 border border-gray-150 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all group">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-white border border-gray-200 rounded-xl text-indigo-600 shadow-2xs group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate pr-4">{doc.title}</p>
                              <div className="flex flex-wrap gap-x-2.5 gap-y-1 mt-1 text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                                <span>{doc.wordCount} words</span>
                                <span>•</span>
                                <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {hasAI ? (
                              <>
                                <button
                                  onClick={() => handleQuickStudy(doc.id, "home")}
                                  className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-all shadow-3xs"
                                >
                                  Summary
                                </button>
                                <button
                                  onClick={() => handleQuickStudy(doc.id, "quiz")}
                                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-bold transition-all"
                                >
                                  Quiz
                                </button>
                                <button
                                  onClick={() => handleQuickStudy(doc.id, "chat")}
                                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-lg text-xs transition-all shadow-3xs"
                                  title="Consult Chatbot"
                                >
                                  <Brain className="h-3.5 w-3.5" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleQuickStudy(doc.id, "upload")}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all"
                              >
                                Compile
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Weekly target reached</span>
                  <p className="text-xs text-indigo-900 font-medium">You have compiled <strong>{documents.length} materials</strong> totaling <strong>{totalWords} words</strong>.</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-indigo-700 leading-none">+{Math.ceil(totalWords / 15)} XP</p>
                  <p className="text-[10px] text-indigo-500 font-medium">Weekly XP bonus</p>
                </div>
              </div>
            </div>

            {/* Achievements / Unlocks (1 Column wide) */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight mb-1">Badges & Unlocks</h3>
                <p className="text-xs text-gray-500 mb-5">Earn motivation badges as you study harder</p>

                <div className="space-y-4">
                  {stats.achievements.map((badge) => {
                    const isUnlocked = badge.unlocked;
                    return (
                      <div 
                        key={badge.id} 
                        className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                          isUnlocked 
                            ? "bg-[#F8F9FF] border-indigo-100 text-gray-900" 
                            : "bg-gray-50/50 border-gray-150 text-gray-400 opacity-65"
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          isUnlocked 
                            ? "bg-indigo-600 text-white shadow-xs" 
                            : "bg-gray-200 text-gray-400"
                        }`}>
                          {badge.iconName === "FileUp" && <FileText className="h-4.5 w-4.5" />}
                          {badge.iconName === "Award" && <Award className="h-4.5 w-4.5" />}
                          {badge.iconName === "BrainCircuit" && <Brain className="h-4.5 w-4.5" />}
                          {badge.iconName === "Flame" && <Flame className="h-4.5 w-4.5" />}
                          {badge.iconName === "Zap" && <Zap className="h-4.5 w-4.5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className={`text-xs font-bold ${isUnlocked ? "text-gray-900" : "text-gray-500"}`}>
                              {badge.title}
                            </p>
                            {isUnlocked && (
                              <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1 py-0.2 rounded-md">
                                Earned
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{badge.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500 font-medium">
                  Daily Challenge: Complete at least 1 study summary to maintain your streak.
                </p>
              </div>
            </div>

          </div>
        </>
      ) : (
        <>
          {/* Brand New Advanced Analytics & Subject Progress Dashboard! */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* LEFT COLUMN: Subject Progress Tracking Cards */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    Subject Tracking Cards
                  </h2>
                  <p className="text-xs text-gray-500">Track and manually toggle chapter mastery separately for each domain.</p>
                </div>
                <span className="text-[10px] font-black bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full uppercase">
                  {subjects.length} Active Fields
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subjects.map(subject => {
                  return (
                    <div 
                      key={subject.name} 
                      className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-100 hover:shadow-sm transition-all"
                    >
                      {/* Subject Card Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                            Subject Domain
                          </span>
                          <h3 className="text-base font-black text-gray-900 tracking-tight mt-1">{subject.name}</h3>
                        </div>
                        
                        {/* Interactive Circular Progress Ring */}
                        <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke="#F1F5F9"
                              strokeWidth="4.5"
                              fill="transparent"
                            />
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke="#4F46E5"
                              strokeWidth="4.5"
                              fill="transparent"
                              strokeDasharray={`${2 * Math.PI * 20}`}
                              strokeDashoffset={`${2 * Math.PI * 20 * (1 - subject.percentage / 100)}`}
                              className="transition-all duration-700 ease-out"
                            />
                          </svg>
                          <span className="absolute text-[10px] font-black text-gray-800">{subject.percentage}%</span>
                        </div>
                      </div>

                      {/* Topic Completion Tracker */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          <span>Conceptual Chapters</span>
                          <span className="text-gray-900">{subject.completed.length}/{subject.topics.length} Mastered</span>
                        </div>
                        
                        {/* Chapter List with Toggles */}
                        <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                          {subject.topics.map(topic => {
                            const isTopicCompleted = (stats.completedTopics || []).includes(topic);
                            return (
                              <button
                                key={topic}
                                onClick={() => onToggleCompletedTopic(topic)}
                                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs font-semibold transition-all group ${
                                  isTopicCompleted
                                    ? "bg-indigo-50/40 border-indigo-100 text-indigo-900"
                                    : "bg-slate-50/50 border-gray-150 hover:bg-slate-50 text-gray-600"
                                }`}
                              >
                                <span className="truncate pr-2">{topic}</span>
                                <div className="shrink-0">
                                  {isTopicCompleted ? (
                                    <CheckCircle2 className="h-4.5 w-4.5 text-indigo-600 fill-indigo-100" />
                                  ) : (
                                    <div className="h-4.5 w-4.5 rounded-full border border-gray-300 bg-white group-hover:border-indigo-400" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Associated Materials Links */}
                      {subject.documents.length > 0 && (
                        <div className="pt-3 border-t border-gray-100 space-y-1.5">
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Linked Materials</p>
                          <div className="flex flex-wrap gap-1.5">
                            {subject.documents.map(doc => (
                              <button
                                key={doc.id}
                                onClick={() => handleQuickStudy(doc.id, "home")}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-100 rounded-lg text-[10px] font-bold text-gray-700 hover:text-indigo-700 transition-all truncate max-w-[140px]"
                                title={doc.title}
                              >
                                📄 {doc.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Advanced SVG Analytics Charts Section */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-600" />
                    Learning Progression Analytics
                  </h3>
                  <p className="text-xs text-gray-500">Visual mapping of your weekly active study time and historic quiz accuracy.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  
                  {/* Chart 1: Study Minutes Bar Chart */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Weekly Study Minutes</p>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        Total: {currentWeeklyMinutes}m
                      </span>
                    </div>
                    
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-gray-150 h-44 flex flex-col justify-end">
                      <svg className="w-full h-36" viewBox="0 0 320 120" preserveAspectRatio="none">
                        {stats.weeklyProgress.map((dayObj, index) => {
                          const barHeight = Math.max(2, (dayObj.minutes / maxWeeklyMinutes) * 80);
                          const x = 10 + index * 44;
                          const y = 95 - barHeight;
                          return (
                            <g key={dayObj.day} className="group cursor-pointer">
                              <rect
                                x={x}
                                y={y}
                                width={24}
                                height={barHeight}
                                rx={4}
                                className="fill-indigo-500 hover:fill-indigo-600 transition-colors"
                              />
                              <text
                                x={x + 12}
                                y={112}
                                textAnchor="middle"
                                className="text-[9px] font-bold fill-gray-400 font-sans"
                              >
                                {dayObj.day}
                              </text>
                              <text
                                x={x + 12}
                                y={y - 5}
                                textAnchor="middle"
                                className="text-[9px] font-black fill-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-sans"
                              >
                                {dayObj.minutes}m
                              </text>
                            </g>
                          );
                        })}
                        <line x1="0" y1="95" x2="320" y2="95" stroke="#E2E8F0" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Chart 2: Quiz Scores Line Chart */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Quiz Accuracy Progress</p>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        Average: {stats.averageQuizScore}%
                      </span>
                    </div>

                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-gray-150 h-44 flex flex-col justify-center">
                      {(stats.quizHistory || []).length === 0 ? (
                        <div className="text-center space-y-2 py-6">
                          <Award className="h-8 w-8 text-gray-300 mx-auto" />
                          <p className="text-[11px] font-bold text-gray-500">No quiz history available</p>
                          <p className="text-[9px] text-gray-400 max-w-xs mx-auto">Take a generated quiz on any study material to plot progression trends.</p>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col justify-end">
                          <svg className="w-full h-32" viewBox="0 0 320 100" preserveAspectRatio="none">
                            {(() => {
                              const recentHistory = [...(stats.quizHistory || [])].reverse().slice(-6);
                              const points = recentHistory.map((attempt, idx) => {
                                const x = 20 + (idx * 280) / Math.max(1, recentHistory.length - 1);
                                const y = 80 - (attempt.score / 100) * 60;
                                return { x, y, score: attempt.score, docTitle: attempt.documentTitle };
                              });

                              const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                              return (
                                <g>
                                  {/* Grid Lines */}
                                  <line x1="10" y1="20" x2="310" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,3" />
                                  <line x1="10" y1="50" x2="310" y2="50" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,3" />
                                  <line x1="10" y1="80" x2="310" y2="80" stroke="#E2E8F0" strokeWidth="1" />

                                  {/* Polyline Path */}
                                  <path
                                    d={pathD}
                                    fill="none"
                                    stroke="#4F46E5"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="animate-pulse"
                                  />

                                  {/* Coordinate dots */}
                                  {points.map((p, index) => (
                                    <g key={index} className="group cursor-pointer">
                                      <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r="4"
                                        className="fill-indigo-600 stroke-white stroke-2 hover:r-6 hover:fill-indigo-800 transition-all"
                                      />
                                      {/* Hover tooltip for score */}
                                      <text
                                        x={p.x}
                                        y={p.y - 10}
                                        textAnchor="middle"
                                        className="text-[9px] font-black fill-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity font-sans bg-white"
                                      >
                                        {p.score}%
                                      </text>
                                    </g>
                                  ))}
                                </g>
                              );
                            })()}
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: AI Insights, Next Steps, and Consistency Calendar */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* 1. Study Streak and Consistency Rewards Tracker */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Consistency Engine</h3>
                  <span className="flex items-center gap-0.5 text-xs font-black text-amber-500">
                    <Flame className="h-4.5 w-4.5 fill-amber-500 animate-bounce" />
                    {stats.dailyStreak} Day Streak
                  </span>
                </div>

                {/* 7-Day Visual Calendar Grid */}
                <div className="grid grid-cols-7 gap-1.5 py-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => {
                    const todayName = new Date().toLocaleDateString(undefined, { weekday: "short" });
                    const isToday = day === todayName;
                    
                    // Match day index with weekly study records
                    const matchingDay = stats.weeklyProgress.find(d => d.day === day);
                    const hasStudied = (matchingDay?.minutes || 0) > 0;

                    return (
                      <div key={day} className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] font-bold ${isToday ? "text-indigo-600" : "text-gray-400"}`}>
                          {day}
                        </span>
                        <div 
                          className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all border ${
                            hasStudied
                              ? "bg-amber-100 border-amber-200 text-amber-700 shadow-3xs"
                              : isToday
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700 animate-pulse"
                                : "bg-slate-50 border-gray-150 text-gray-300"
                          }`}
                          title={matchingDay ? `${matchingDay.minutes} study minutes logged` : "No activity"}
                        >
                          {hasStudied ? "🔥" : "•"}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-[11px] text-gray-500 leading-normal text-center bg-gray-50 p-2.5 rounded-xl border border-gray-150/55">
                  ✨ Maintaining your streak preserves focus memory and triggers progress unlocks!
                </div>
              </div>

              {/* 2. Real-Time Gemini Powered Learning Insights */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-indigo-300">
                      Cognitive AI Insights
                    </h3>
                  </div>
                  <button
                    onClick={fetchInsights}
                    disabled={loadingInsights}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-white transition-all disabled:opacity-50"
                    title="Recalculate Insights"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>

                {loadingInsights ? (
                  <div className="py-12 text-center space-y-3 relative z-10">
                    <Activity className="h-8 w-8 text-indigo-400 animate-spin mx-auto" />
                    <p className="text-xs text-slate-300 font-medium animate-pulse">Running cognitive analytics model...</p>
                  </div>
                ) : insightsError ? (
                  <div className="py-8 text-center space-y-2.5 relative z-10">
                    <HelpCircle className="h-8 w-8 text-rose-400 mx-auto" />
                    <p className="text-xs text-rose-300 font-semibold">{insightsError}</p>
                    <button
                      onClick={fetchInsights}
                      className="mt-2 px-3 py-1 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg transition-all"
                    >
                      Retry Connection
                    </button>
                  </div>
                ) : insights ? (
                  <div className="space-y-4 relative z-10 animate-fade-in text-left">
                    {/* Supportive feedback analysis */}
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                      <p className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">AI Assessment</p>
                      <p className="text-xs text-slate-200 leading-normal font-medium">{insights.behaviorInsight}</p>
                    </div>

                    {/* Weak Areas List */}
                    {insights.weakAreas && insights.weakAreas.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Focus Recommended</p>
                        <div className="space-y-2">
                          {insights.weakAreas.map((wa: any, i: number) => (
                            <div key={i} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-black text-amber-400 uppercase tracking-wide">
                                <span>{wa.subject} : {wa.topic}</span>
                                <span>⚠️ Attention Required</span>
                              </div>
                              <p className="text-xs text-slate-200 leading-snug">{wa.issue}</p>
                              <p className="text-[11px] text-amber-300/90 leading-snug font-medium">💡 {wa.remedy}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actionable recommendations */}
                    {insights.recommendations && insights.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Suggested Next Actions</p>
                        <div className="space-y-2">
                          {insights.recommendations.map((rec: any, i: number) => {
                            // Find corresponding tab based on action label
                            const targetTab = rec.actionLabel?.toLowerCase().includes("quiz") 
                              ? "quiz" 
                              : rec.actionLabel?.toLowerCase().includes("flash")
                                ? "flashcards"
                                : "home";

                            return (
                              <button
                                key={i}
                                onClick={() => {
                                  if (rec.docId && rec.docId !== "unknown" && rec.docId !== "") {
                                    handleQuickStudy(rec.docId, targetTab);
                                  } else if (documents.length > 0) {
                                    handleQuickStudy(documents[0].id, targetTab);
                                  } else {
                                    setActiveTab("upload");
                                  }
                                }}
                                className="w-full text-left p-3 bg-white/5 border border-white/10 hover:border-indigo-400/50 hover:bg-white/10 rounded-xl flex items-center justify-between gap-3 group transition-all"
                              >
                                <div className="min-w-0 space-y-0.5">
                                  <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-400 uppercase tracking-wide">
                                    <span>{rec.subject}</span>
                                    <span>•</span>
                                    <span>{rec.actionLabel || "Revise"}</span>
                                  </div>
                                  <p className="text-xs font-bold text-white truncate group-hover:text-indigo-200 transition-colors">{rec.title}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{rec.reason}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-4 relative z-10">
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      Unlock custom generative AI recommendations, behavioral assessments, and concept revisions based on your latest study behaviors.
                    </p>
                    <button
                      onClick={fetchInsights}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/10 transition-all flex items-center gap-1.5 mx-auto"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Compile AI Insights
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Recommended Next Study Actions Shortcut Panel */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Recommended Actions</h3>
                  <p className="text-[11px] text-gray-500">Fast action buttons to hit target grade milestones.</p>
                </div>

                <div className="space-y-2.5">
                  <button 
                    onClick={() => {
                      if (documents.length > 0) {
                        setSelectedDocId(documents[0].id);
                        setActiveTab("quiz");
                      } else {
                        setActiveTab("upload");
                      }
                    }}
                    className="w-full p-3 bg-gray-50 hover:bg-slate-50 border border-gray-150 rounded-2xl text-left flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                        <Award className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 text-xs">
                        <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Test conceptual mastery</p>
                        <p className="text-[10px] text-gray-400 truncate">Take an automated multiple choice quiz</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button 
                    onClick={() => {
                      if (documents.length > 0) {
                        setSelectedDocId(documents[0].id);
                        setActiveTab("flashcards");
                      } else {
                        setActiveTab("upload");
                      }
                    }}
                    className="w-full p-3 bg-gray-50 hover:bg-slate-50 border border-gray-150 rounded-2xl text-left flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-pink-50 text-pink-600 rounded-xl shrink-0">
                        <Brain className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 text-xs">
                        <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Practice active recall</p>
                        <p className="text-[10px] text-gray-400 truncate">Practice with generated flashcards</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button 
                    onClick={() => {
                      if (documents.length > 0) {
                        setSelectedDocId(documents[0].id);
                        setActiveTab("chat");
                      } else {
                        setActiveTab("upload");
                      }
                    }}
                    className="w-full p-3 bg-gray-50 hover:bg-slate-50 border border-gray-150 rounded-2xl text-left flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                        <Sparkles className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 text-xs">
                        <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Consult personal AI tutor</p>
                        <p className="text-[10px] text-gray-400 truncate">Ask questions first indexed in saved notes</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </>
      )}

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-150 max-w-md w-full p-6 space-y-6 shadow-2xl animate-scale-up" id="edit-profile-modal">
            
            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900">Configure Student Profile</h3>
              <p className="text-xs text-gray-400">Personalize your student workspace targets and presentation.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Avatar Emoji Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  Select Custom Avatar
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 border border-gray-150 rounded-xl justify-between">
                  {AVATAR_OPTIONS.slice(0, 8).map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setEditAvatar(emoji)}
                      className={`h-8 w-8 rounded-lg text-sm flex items-center justify-center transition-all ${
                        editAvatar === emoji
                          ? "bg-indigo-600 scale-110 shadow-md text-white shadow-indigo-600/10"
                          : "bg-white border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade and Goal hours */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Target Grade */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                    Target Grade
                  </label>
                  <select
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none cursor-pointer"
                  >
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Weekly Goal Hours */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                    Weekly Study Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editGoal}
                    onChange={(e) => setEditGoal(parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none"
                  />
                </div>

              </div>

              {/* Actions row */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/15 transition-all flex items-center justify-center gap-1.5"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="h-4.5 w-4.5 text-white" />
                      Saved!
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
