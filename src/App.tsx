import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import LibraryView from "./components/LibraryView";
import KnowledgeBaseView from "./components/KnowledgeBaseView";
import UploadView from "./components/UploadView";
import QuizView from "./components/QuizView";
import FlashcardsView from "./components/FlashcardsView";
import ChatView from "./components/ChatView";
import WelcomeScreen from "./components/WelcomeScreen";
import AuthPortal from "./components/AuthPortal";
import StudyPlannerView from "./components/StudyPlannerView";
import CollaborationHubView from "./components/CollaborationHubView";
import ClassroomHubView from "./components/ClassroomHubView";
import AchievementsView from "./components/AchievementsView";
import AdminPanel from "./components/AdminPanel";
import AILearningCoachView from "./components/AILearningCoachView";
import GlobalEcosystemView from "./components/GlobalEcosystemView";
import AcademicManagementView from "./components/academic/AcademicManagementView";
import AcademicIntelligenceDashboard from "./components/academic/AcademicIntelligenceDashboard";
import { SummariesView } from "./components/SummariesView";
import { PracticeExamsView } from "./components/PracticeExamsView";
import { RevisionPacksView } from "./components/RevisionPacksView";
import { CommandPaletteModal } from "./components/workspace/CommandPaletteModal";
import { NotificationCenter } from "./components/workspace/NotificationCenter";
import { UserProfileModal } from "./components/workspace/UserProfileModal";
import { SettingsView } from "./components/workspace/SettingsView";
import { MasterUnifiedWorkspace } from "./components/workspace/MasterUnifiedWorkspace";
import { useAuth } from "./context/AuthContext";
import { INITIAL_STATS } from "./data";
import { DocumentItem, StudyStats, ChatMessage, UserAccount, QuizQuestion, Flashcard, NotificationItem } from "./types";
import { 
  FileText, 
  Sparkles, 
  GraduationCap, 
  Share2, 
  Lightbulb, 
  HelpCircle,
  Clock,
  ChevronRight,
  Menu,
  Crown,
  Search,
  Bell,
  Plus,
  Sun,
  User as UserIcon,
  Zap,
  BookOpen,
  Brain,
  Award,
  Calendar,
  BarChart2,
} from "lucide-react";

export default function App() {
  // 1. Session load & active user state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const activeData = localStorage.getItem("studymate_active_user_v1");
      return activeData ? JSON.parse(activeData) : null;
    } catch {
      return null;
    }
  });

  // 2. React state initialized from active session or empty arrays
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    return currentUser?.documents || [];
  });
  const [selectedDocId, setSelectedDocId] = useState<string | null>(() => {
    return currentUser && currentUser.documents && currentUser.documents.length > 0 
      ? currentUser.documents[0].id 
      : null;
  });
  const [activeTab, setActiveTab] = useState<string>("home");
  const [stats, setStats] = useState<StudyStats>(() => {
    return currentUser?.stats || INITIAL_STATS;
  });
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>(() => {
    return currentUser?.chatHistories || {};
  });

  // Active selected document
  const activeDoc = documents.find((doc) => doc.id === selectedDocId) || null;

  // Sync and upgrade modal states
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "offline">("synced");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeatureName, setUpgradeFeatureName] = useState("");

  // Phase 3.4 Workspace & Modal States
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      title: "🧠 Flashcards Due Today",
      message: "12 spaced-repetition flashcards in Database Systems need review.",
      timestamp: "10 mins ago",
      isRead: false,
      type: "due",
      priority: "high",
      actionTab: "flashcards",
    },
    {
      id: "notif-2",
      title: "📊 Semester GPA Projected: 4.38",
      message: "Based on current quiz attempts, your predicted CGPA is on First Class track.",
      timestamp: "1 hour ago",
      isRead: false,
      type: "academic",
      priority: "medium",
      actionTab: "academic-intelligence",
    },
    {
      id: "notif-3",
      title: "💡 Weak Topic Diagnostic",
      message: "AI Coach detected lower scores in Numerical Analysis. Practice quiz available.",
      timestamp: "2 hours ago",
      isRead: false,
      type: "recommendation",
      priority: "high",
      actionTab: "quiz",
    },
    {
      id: "notif-4",
      title: "🏆 Achievement Unlocked!",
      message: "You earned the 7-Day Study Streak Badge (+100 XP).",
      timestamp: "Yesterday",
      isRead: true,
      type: "unlock",
      priority: "medium",
      actionTab: "achievements",
    },
  ]);

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Listen for global Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);


  // Upgrade simulation state
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const handleSimulateUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpgrading(true);
    
    // Simulate payment processor ping
    setTimeout(() => {
      setIsUpgrading(false);
      setShowUpgradeModal(false);
      
      // Upgrade subscription state and notify backend
      if (currentUser) {
        saveToDatabase(documents, stats, chatHistories, currentUser, { subscription: "premium" });
        handleAddStatsReward(300, "SaaS Premium Membership Upgrade Unlock");
      }
      
      alert("🎉 CONGRATULATIONS! Your StudyMate account has been upgraded to Premium Elite! 🚀 You have unlocked unlimited syllabus uploads, unrestricted AI specialized tutor chats, voice briefings, and advanced admin diagnostics. Earned 300 bonus XP!");
    }, 2000);
  };

  // 3. Centralized synchronization helper
  const saveToDatabase = async (
    docs: DocumentItem[],
    st: StudyStats,
    chats: Record<string, ChatMessage[]>,
    user: UserAccount,
    profileUpdates?: Partial<UserAccount>
  ) => {
    const updatedUser: UserAccount = {
      ...user,
      ...profileUpdates,
      documents: docs,
      stats: st,
      chatHistories: chats,
    };
    
    setCurrentUser(updatedUser);
    localStorage.setItem("studymate_active_user_v1", JSON.stringify(updatedUser));
    
    try {
      const dbStr = localStorage.getItem("studymate_users_v1");
      const db = dbStr ? JSON.parse(dbStr) : {};
      db[updatedUser.username.toLowerCase()] = updatedUser;
      localStorage.setItem("studymate_users_v1", JSON.stringify(db));
    } catch (e) {
      console.error("Failed to sync to database", e);
    }

    // Server-side synchronization background trigger
    setSyncStatus("syncing");
    try {
      const res = await fetch("/api/auth/sync-userdata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: updatedUser.username,
          documents: updatedUser.documents,
          stats: updatedUser.stats,
          chatHistories: updatedUser.chatHistories,
          subscription: updatedUser.subscription,
          role: updatedUser.role,
          targetGrade: updatedUser.targetGrade,
          studyGoalHours: updatedUser.studyGoalHours
        })
      });

      if (res.ok) {
        setSyncStatus("synced");
      } else {
        setSyncStatus("offline");
      }
    } catch (err) {
      console.warn("Background sync failed (operating offline mode)", err);
      setSyncStatus("offline");
    }
  };

  // Wrapper handlers that perform reactivity & immediate DB synchronization
  const updateDocuments = (newDocs: DocumentItem[]) => {
    if (newDocs.length > documents.length && currentUser?.subscription === "free" && newDocs.length > 3) {
      setUpgradeFeatureName("Advanced Syllabus & Course File Uploads");
      setShowUpgradeModal(true);
      return;
    }
    setDocuments(newDocs);
    if (currentUser) {
      saveToDatabase(newDocs, stats, chatHistories, currentUser);
    }
  };

  const updateStats = (newStats: StudyStats) => {
    setStats(newStats);
    if (currentUser) {
      saveToDatabase(documents, newStats, chatHistories, currentUser);
    }
  };

  const updateChatHistories = (newChats: Record<string, ChatMessage[]>) => {
    setChatHistories(newChats);
    if (currentUser) {
      saveToDatabase(documents, stats, newChats, currentUser);
    }
  };

  // Profile Edit Callback
  const handleUpdateProfile = (profileUpdates: Partial<UserAccount>) => {
    if (!currentUser) return;
    saveToDatabase(documents, stats, chatHistories, currentUser, profileUpdates);
  };

  // Live updates to document quizzes & flashcards
  const handleUpdateDocumentQuiz = (docId: string, quiz: QuizQuestion[]) => {
    const updatedDocs = documents.map(doc => {
      if (doc.id === docId) {
        return { ...doc, quiz };
      }
      return doc;
    });
    updateDocuments(updatedDocs);
  };

  const handleUpdateDocumentFlashcards = (docId: string, flashcards: Flashcard[]) => {
    const updatedDocs = documents.map(doc => {
      if (doc.id === docId) {
        return { ...doc, flashcards };
      }
      return doc;
    });
    updateDocuments(updatedDocs);
  };

  // Import a shared library document into user's own knowledge base
  const handleImportDocument = (title: string, content: string, subject: string) => {
    const newDoc: DocumentItem = {
      id: "doc-" + Date.now(),
      title,
      content,
      subject: subject || "General",
      uploadedAt: new Date().toISOString(),
      wordCount: content.split(/\s+/).filter(Boolean).length,
      paragraphs: content.split("\n\n").filter(Boolean)
    };
    const updatedDocs = [newDoc, ...documents];
    updateDocuments(updatedDocs);
    if (!selectedDocId) {
      setSelectedDocId(newDoc.id);
    }
    alert(`"${title}" has been successfully imported into your library!`);
  };

  // Switch role between student and teacher
  const handleUpdateUserRole = (role: "student" | "teacher") => {
    if (!currentUser) return;
    saveToDatabase(documents, stats, chatHistories, currentUser, { role });
  };

  // Dynamic experience points and badge rewards
  const handleAddStatsReward = (points: number, contributionReward: string) => {
    const currentXp = stats.experiencePoints || 0;
    const newXp = Math.max(0, currentXp + points);
    const newLevel = Math.max(1, Math.floor(newXp / 500) + 1);
    
    // Add badge earned on certain milestones
    const earned = [...(stats.badgesEarned || [])];
    if (newXp >= 200 && !earned.includes("Active Collaborator")) {
      earned.push("Active Collaborator");
    }
    if (newXp >= 500 && !earned.includes("Mentor Persona")) {
      earned.push("Mentor Persona");
    }

    const newStats: StudyStats = {
      ...stats,
      experiencePoints: newXp,
      level: newLevel,
      badgesEarned: earned
    };
    updateStats(newStats);
  };

  // Toggle completed topics callback
  const handleToggleCompletedTopic = (topicName: string) => {
    const currentCompleted = stats.completedTopics || [];
    let updatedCompleted: string[];
    if (currentCompleted.includes(topicName)) {
      updatedCompleted = currentCompleted.filter(t => t !== topicName);
    } else {
      updatedCompleted = [...currentCompleted, topicName];
    }
    
    const newStats: StudyStats = {
      ...stats,
      completedTopics: updatedCompleted
    };
    updateStats(newStats);
  };

  const { user: authUser, isAuthenticated, logout: authLogout } = useAuth();

  // Sync Supabase Auth session into local application state when user logs in
  useEffect(() => {
    if (isAuthenticated && authUser && (!currentUser || currentUser.id !== authUser.id)) {
      handleLoginSuccess(authUser);
    }
  }, [isAuthenticated, authUser]);

  // Authorization state changes
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setDocuments(user.documents || []);
    setStats(user.stats || INITIAL_STATS);
    setChatHistories(user.chatHistories || {});
    
    if (user.documents && user.documents.length > 0) {
      setSelectedDocId(user.documents[0].id);
    } else {
      setSelectedDocId(null);
    }
    setActiveTab("home");
    localStorage.setItem("studymate_active_user_v1", JSON.stringify(user));
  };

  const handleLogout = async () => {
    await authLogout();
    setCurrentUser(null);
    setDocuments([]);
    setStats(INITIAL_STATS);
    setChatHistories({});
    setSelectedDocId(null);
    setActiveTab("home");
    localStorage.removeItem("studymate_active_user_v1");
  };

  // Handler: Add study minutes (adds to database)
  const addStudyMinutes = (mins: number) => {
    const todayName = new Date().toLocaleDateString(undefined, { weekday: "short" });
    const updatedWeekly = stats.weeklyProgress.map((dayObj) => {
      if (dayObj.day === todayName) {
        return { ...dayObj, minutes: dayObj.minutes + mins };
      }
      return dayObj;
    });

    const newStats: StudyStats = {
      ...stats,
      studyTimeMinutes: stats.studyTimeMinutes + mins,
      weeklyProgress: updatedWeekly,
    };

    updateStats(newStats);
  };

  // Handler: Quiz Complete (adds to database)
  const handleQuizCompleted = (score: number, total: number) => {
    addStudyMinutes(15);
    
    const newQuizzesCount = stats.quizzesTakenCount + 1;
    const scorePct = Math.round((score / total) * 100);
    const newAvgScore = Math.round(
      (stats.averageQuizScore * stats.quizzesTakenCount + scorePct) / newQuizzesCount
    );

    // Get current active document info for history and topic mastery
    const activeDoc = documents.find((doc) => doc.id === selectedDocId) || null;
    const documentId = activeDoc?.id || "unknown";
    const documentTitle = activeDoc?.title || "General Study";
    const subject = activeDoc?.subject || activeDoc?.summary?.subject || "General Study";

    const attempt = {
      id: "quiz_" + Date.now(),
      documentId,
      documentTitle,
      subject,
      score: scorePct,
      totalQuestions: total,
      correctAnswers: score,
      takenAt: new Date().toISOString()
    };

    const currentHistory = stats.quizHistory || [];
    const newQuizHistory = [attempt, ...currentHistory];

    // Automatically complete/master topics if the student scores 80% or more
    let updatedCompletedTopics = [...(stats.completedTopics || [])];
    if (scorePct >= 80) {
      if (activeDoc?.summary?.topics) {
        activeDoc.summary.topics.forEach((topic) => {
          if (!updatedCompletedTopics.includes(topic)) {
            updatedCompletedTopics.push(topic);
          }
        });
      }
      if (activeDoc?.summary?.chapters) {
        activeDoc.summary.chapters.forEach((ch) => {
          if (!updatedCompletedTopics.includes(ch.title)) {
            updatedCompletedTopics.push(ch.title);
          }
        });
      }
    }

    // Trigger achievement unlocks
    const updatedAchievements = stats.achievements.map((badge) => {
      if (badge.id === "quiz_champion" && score === total) {
        return { ...badge, unlocked: true, unlockedAt: new Date().toISOString() };
      }
      return badge;
    });

    const newStats: StudyStats = {
      ...stats,
      quizzesTakenCount: newQuizzesCount,
      averageQuizScore: newAvgScore,
      achievements: updatedAchievements,
      quizHistory: newQuizHistory,
      completedTopics: updatedCompletedTopics
    };

    updateStats(newStats);
  };

  // Handler: Mastering Flashcard (adds to database)
  const handleCardMastered = () => {
    addStudyMinutes(2);
    
    const newMasteredCount = stats.flashcardsMasteredCount + 1;
    const updatedAchievements = stats.achievements.map((badge) => {
      if (badge.id === "flashcard_master" && newMasteredCount >= 6) {
        return { ...badge, unlocked: true, unlockedAt: new Date().toISOString() };
      }
      return badge;
    });

    const newStats: StudyStats = {
      ...stats,
      flashcardsMasteredCount: newMasteredCount,
      achievements: updatedAchievements,
    };

    updateStats(newStats);
  };

  const handleShareLibrary = () => {
    alert("🔗 Study Library shared successfully! Shared link copied to clipboard (Simulated).");
  };

  // Render AuthPortal if there is no active logged in student
  if (!currentUser) {
    return <AuthPortal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#FAFAFA] font-sans text-[#1A1A1A] overflow-hidden" id="app-root">
      
      {/* Sidebar (Responsive navigation + selection + user profiles) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        documents={documents}
        selectedDocId={selectedDocId}
        setSelectedDocId={setSelectedDocId}
        currentUser={currentUser}
        onLogout={handleLogout}
        unreadNotificationCount={notifications.filter((n) => !n.isRead).length}
      />

      {/* Main Panel wrapper */}
      <main className="flex-1 flex flex-col overflow-hidden lg:pl-72">
        
        {/* TOP NAVIGATION BAR */}
        <header className="hidden lg:flex h-20 bg-white dark:bg-slate-900 border-b border-gray-150 dark:border-slate-800 px-6 lg:px-8 items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            {/* Global Search Trigger Bar */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-150 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-semibold transition-all border border-transparent focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-indigo-500" />
                <span>Search documents, quizzes, flashcards, chats (Ctrl + K)...</span>
              </div>
              <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                Ctrl K
              </span>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            
            {/* Quick Create Button & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Quick Create
              </button>

              {isQuickCreateOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-30 text-xs font-semibold"
                  onClick={() => setIsQuickCreateOpen(false)}
                >
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-800 dark:text-slate-200"
                  >
                    <FileText className="w-4 h-4 text-indigo-500" /> Compile New Notes
                  </button>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-800 dark:text-slate-200"
                  >
                    <Brain className="w-4 h-4 text-teal-500" /> Ask AI Tutor
                  </button>
                  <button
                    onClick={() => setActiveTab("quiz")}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-800 dark:text-slate-200"
                  >
                    <Award className="w-4 h-4 text-amber-500" /> Generate Quiz
                  </button>
                  <button
                    onClick={() => setActiveTab("flashcards")}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-800 dark:text-slate-200"
                  >
                    <Zap className="w-4 h-4 text-rose-500" /> Practice Flashcards
                  </button>
                  <button
                    onClick={() => setActiveTab("academic-intelligence")}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-800 dark:text-slate-200"
                  >
                    <BarChart2 className="w-4 h-4 text-emerald-500" /> Open CGPA Calculator
                  </button>
                </div>
              )}
            </div>

            {/* Notification Center Trigger */}
            <button
              onClick={() => setIsNotificationCenterOpen(true)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 relative transition-colors cursor-pointer"
              title="Notification Center"
            >
              <Bell className="w-4 h-4" />
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </button>

            {/* Theme & Settings Trigger */}
            <button
              onClick={() => setActiveTab("settings")}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Workspace & Theme Settings"
            >
              <Sun className="w-4 h-4 text-amber-500" />
            </button>

            {/* Quick Elite upgrade badge */}
            {currentUser?.subscription === "free" && (
              <button
                onClick={() => {
                  setUpgradeFeatureName("Premium Academic Suite");
                  setShowUpgradeModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-250 hover:bg-amber-100 text-amber-800 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer"
              >
                <Crown className="h-3 w-3 text-amber-500 fill-amber-500" />
                Upgrade Elite
              </button>
            )}

            {/* User Profile Avatar Trigger */}
            <button
              onClick={() => setIsUserProfileModalOpen(true)}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-2xs">
                {currentUser.avatarEmoji || "🎓"}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 pr-1 hidden xl:inline">
                {currentUser.displayName}
              </span>
            </button>
          </div>
        </header>

        {/* Core content display area wrapped in Unified Intelligent Workspace */}
        <MasterUnifiedWorkspace
          documents={documents}
          selectedDocId={selectedDocId}
          setSelectedDocId={setSelectedDocId}
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          renderCenterContent={(tab) => (
            <>
              {tab === "home" && (
                documents.length === 0 ? (
                  <WelcomeScreen
                    currentUser={currentUser!}
                    setDocuments={updateDocuments}
                    setSelectedDocId={setSelectedDocId}
                    setActiveTab={setActiveTab}
                    addStudyMinutes={addStudyMinutes}
                  />
                ) : (
                  <div className="space-y-8 p-2 lg:p-4">
                    {/* If we have an active doc, render its full compiled AI Summary prominently */}
                    {activeDoc && activeDoc.summary && (
                      <div className="max-w-7xl mx-auto space-y-6" id="summary-section">
                        {/* Summary Card Header */}
                        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-5">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                              AI Summary & Study Outline
                            </span>
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                              Generated by StudyMate
                            </span>
                          </div>

                          <div className="space-y-3.5">
                            <h2 className="text-2xl font-black tracking-tight text-gray-900 leading-snug">
                              {activeDoc.summary.title}
                            </h2>
                            <p className="text-sm text-gray-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-gray-100">
                              {activeDoc.summary.summaryText}
                            </p>
                          </div>

                          {/* Quick navigation pills inside document context */}
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider self-center mr-1">Study Modules:</span>
                            <button 
                              onClick={() => setActiveTab("doc-reader")}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                            >
                              📖 Document Reader
                            </button>
                            <button 
                              onClick={() => setActiveTab("quiz")}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all"
                            >
                              Practice Quiz
                            </button>
                            <button 
                              onClick={() => setActiveTab("flashcards")}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition-all"
                            >
                              Study Flashcards
                            </button>
                            <button 
                              onClick={() => setActiveTab("chat")}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-100 rounded-lg text-xs font-bold transition-all"
                            >
                              Ask AI Chatbot
                            </button>
                          </div>
                        </div>

                        {/* Two-Column details: Key Concepts vs Key Highlights */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          
                          {/* Key Concepts (Cards) */}
                          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                            <h3 className="text-base font-black uppercase tracking-wider text-gray-400">
                              Key Concepts & Terminology
                            </h3>
                            <div className="space-y-3.5">
                              {activeDoc.summary.keyConcepts.map((concept, idx) => (
                                <div key={idx} className="p-4 bg-[#F8F9FF] border border-gray-150 rounded-2xl space-y-1 hover:border-indigo-150 transition-colors">
                                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide">
                                    {concept.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 leading-relaxed">
                                    {concept.explanation}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Bullet takeaways & Practical Tips */}
                          <div className="space-y-6">
                            
                            {/* highlights */}
                            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                              <h3 className="text-base font-black uppercase tracking-wider text-gray-400">
                                Essential takeaways
                              </h3>
                              <ul className="space-y-3">
                                {activeDoc.summary.bulletPoints.map((pt, idx) => (
                                  <li key={idx} className="flex gap-2.5 text-xs text-gray-700 leading-relaxed font-medium">
                                    <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 mt-2" />
                                    <span>{pt}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Study Tips block */}
                            <div className="bg-slate-900 p-6 rounded-3xl text-white border border-slate-800 space-y-4 shadow-sm">
                              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                                <Lightbulb className="h-4 w-4 text-amber-400 animate-pulse" />
                                Student Memory Hooks & study tips
                              </h3>
                              <ul className="space-y-3 pl-1">
                                {activeDoc.summary.studyTips.map((tip, idx) => (
                                  <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                                    <span className="font-bold text-indigo-400 shrink-0 select-none">#{idx + 1}</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                          </div>

                        </div>

                      </div>
                    )}

                    {/* Stats dashboard */}
                    <Dashboard
                      stats={stats}
                      documents={documents}
                      setSelectedDocId={setSelectedDocId}
                      setActiveTab={setActiveTab}
                      currentUser={currentUser}
                      onUpdateProfile={handleUpdateProfile}
                      onToggleCompletedTopic={handleToggleCompletedTopic}
                    />
                  </div>
                )
              )}

              {tab === "library" && (
                <LibraryView
                  documents={documents}
                  setDocuments={updateDocuments}
                  selectedDocId={selectedDocId}
                  setSelectedDocId={setSelectedDocId}
                  setActiveTab={setActiveTab}
                />
              )}

              {tab === "academic" && (
                <AcademicManagementView />
              )}

              {tab === "coach" && (
                <AILearningCoachView
                  documents={documents}
                  currentUser={currentUser!}
                  onAddStatsReward={handleAddStatsReward}
                />
              )}

              {tab === "ecosystem" && (
                <GlobalEcosystemView
                  documents={documents}
                  currentUser={currentUser!}
                  onAddStatsReward={handleAddStatsReward}
                />
              )}

              {tab === "knowledge-base" && (
                <KnowledgeBaseView
                  documents={documents}
                  selectedDocId={selectedDocId}
                  setSelectedDocId={setSelectedDocId}
                  setActiveTab={setActiveTab}
                  currentUser={currentUser}
                />
              )}

              {tab === "upload" && (
                <UploadView
                  documents={documents}
                  setDocuments={updateDocuments}
                  setSelectedDocId={setSelectedDocId}
                  setActiveTab={setActiveTab}
                  addStudyMinutes={addStudyMinutes}
                  currentUser={currentUser}
                />
              )}

              {tab === "planner" && (
                <StudyPlannerView
                  documents={documents}
                  currentUser={currentUser}
                  onUpdateProfile={handleUpdateProfile}
                  setActiveTab={setActiveTab}
                />
              )}

              {tab === "quiz" && (
                <QuizView
                  documents={documents}
                  selectedDocId={selectedDocId}
                  setSelectedDocId={setSelectedDocId}
                  onQuizCompleted={handleQuizCompleted}
                  onUpdateDocumentQuiz={handleUpdateDocumentQuiz}
                />
              )}

              {tab === "flashcards" && (
                <FlashcardsView
                  documents={documents}
                  selectedDocId={selectedDocId}
                  setSelectedDocId={setSelectedDocId}
                  onCardMastered={handleCardMastered}
                  onUpdateDocumentFlashcards={handleUpdateDocumentFlashcards}
                />
              )}

              {tab === "chat" && (
                <ChatView
                  documents={documents}
                  selectedDocId={selectedDocId}
                  setSelectedDocId={setSelectedDocId}
                  chatHistories={chatHistories}
                  setChatHistories={updateChatHistories}
                  currentUser={currentUser}
                />
              )}

              {tab === "collaboration" && (
                <CollaborationHubView
                  currentUser={currentUser!}
                  documents={documents}
                  onImportDocument={handleImportDocument}
                  onAddStatsReward={handleAddStatsReward}
                />
              )}

              {tab === "classroom" && (
                <ClassroomHubView
                  currentUser={currentUser!}
                  documents={documents}
                  onUpdateUserRole={handleUpdateUserRole}
                  onAddStatsReward={handleAddStatsReward}
                />
              )}

              {tab === "achievements" && (
                <AchievementsView
                  currentUser={currentUser!}
                  onAddStatsReward={handleAddStatsReward}
                />
              )}

              {tab === "academic-intelligence" && (
                <AcademicIntelligenceDashboard />
              )}

              {tab === "summaries" && (
                <SummariesView
                  documents={documents}
                  selectedDocId={selectedDocId}
                  setSelectedDocId={setSelectedDocId}
                  setActiveTab={setActiveTab}
                />
              )}

              {tab === "practice-exams" && (
                <PracticeExamsView
                  documents={documents}
                  selectedDocId={selectedDocId}
                  setSelectedDocId={setSelectedDocId}
                  onExamCompleted={handleQuizCompleted}
                />
              )}

              {tab === "revision" && (
                <RevisionPacksView
                  documents={documents}
                  selectedDocId={selectedDocId}
                  setSelectedDocId={setSelectedDocId}
                />
              )}

              {tab === "settings" && (
                <SettingsView
                  currentUser={currentUser}
                  syncStatus={syncStatus}
                  onUpdateProfile={handleUpdateProfile}
                  onOpenUpgradeModal={() => {
                    setUpgradeFeatureName("Workspace Settings Pro");
                    setShowUpgradeModal(true);
                  }}
                />
              )}

              {tab === "notifications" && (
                <div className="p-8 text-center">
                  <button
                    onClick={() => setIsNotificationCenterOpen(true)}
                    className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-md"
                  >
                    Open Notification Center Drawer 🔔
                  </button>
                </div>
              )}

              {tab === "admin" && (
                <AdminPanel
                  currentUser={currentUser!}
                  onAddStatsReward={handleAddStatsReward}
                />
              )}
            </>
          )}
        />

      </main>

      {/* 🔍 Global Search & Command Palette Modal (Ctrl + K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        documents={documents}
        currentUser={currentUser}
        onSelectAction={(targetTab, docId) => {
          if (docId) setSelectedDocId(docId);
          setActiveTab(targetTab);
        }}
      />

      {/* 🔔 Notification Center Drawer */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onDeleteNotification={handleDeleteNotification}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* 👤 User Profile Modal */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        currentUser={currentUser}
        academicProfile={currentUser?.academicProfile}
        onUpdateProfile={handleUpdateProfile}
        onOpenUpgradeModal={() => {
          setIsUserProfileModalOpen(false);
          setUpgradeFeatureName("Elite Student Profile");
          setShowUpgradeModal(true);
        }}
      />

      {/* 💳 SaaS Upgrade Elite Subscription Modal Overlay */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-fade-in" id="upgrade-modal-overlay">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-gray-100 shadow-2xl animate-scale-up text-left flex flex-col">
            
            {/* Header banner */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-6 text-white relative">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm font-extrabold cursor-pointer h-7 w-7 rounded-full bg-white/10 flex items-center justify-center"
              >
                ✕
              </button>
              <span className="text-[9px] bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest">
                StudyMate Pro Elite Upgrade
              </span>
              <h3 className="text-xl font-black mt-2 tracking-tight flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-400 fill-amber-400" />
                Unlock Unlimited Academics
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-semibold">
                You reached the free limit for <strong className="text-amber-400">{upgradeFeatureName || "Active Studies"}</strong>. Choose StudyMate Elite to unlock our full cognitive potential.
              </p>
            </div>

            {/* Content area */}
            <div className="p-6 space-y-5 text-slate-700 text-xs flex-1 overflow-y-auto">
              
              {/* Features unlock list */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Elite Member Perks</p>
                <div className="grid grid-cols-2 gap-2 font-bold text-slate-800">
                  <div className="flex items-center gap-1.5 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-emerald-500">✔</span>
                    <span>Unlimited Uploads</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-emerald-500">✔</span>
                    <span>Unlimited AI Chat</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-emerald-500">✔</span>
                    <span>Full Voice Engine</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-emerald-500">✔</span>
                    <span>Custom AI Agents</span>
                  </div>
                </div>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleSimulateUpgrade} className="space-y-3 pt-3 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Simulate Checkout • $14.99/mo</p>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Cardholder Name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 focus:bg-white focus:border-indigo-500 rounded-xl outline-none font-semibold transition-all"
                  />
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="Card Number (e.g. 4242 4242 4242 4242)"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ""))}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 focus:bg-white focus:border-indigo-500 rounded-xl outline-none font-semibold transition-all"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="MM / YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-200 focus:bg-white focus:border-indigo-500 rounded-xl outline-none font-semibold transition-all text-center"
                    />
                    <input
                      type="text"
                      required
                      placeholder="CVC"
                      maxLength={3}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-200 focus:bg-white focus:border-indigo-500 rounded-xl outline-none font-semibold transition-all text-center"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpgrading}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isUpgrading ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authorizing Payment...</span>
                      </>
                    ) : (
                      <>
                        <span>Upgrade Instantly</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-2 font-semibold">
                    🔒 SSL Secured Checkout. Cancel anytime with a single click.
                  </p>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
