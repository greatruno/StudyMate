import React from "react";
import { 
  BookOpen, 
  Library,
  FileText, 
  FileUp, 
  Award, 
  Brain, 
  MessageSquare, 
  Menu, 
  X, 
  ChevronRight, 
  GraduationCap,
  LogOut,
  Database,
  Calendar,
  Users,
  School,
  Trophy,
  Shield,
  Sparkles,
  Globe,
  Bell,
  Settings,
  Target,
  BarChart2,
  FileCheck2,
} from "lucide-react";
import { DocumentItem, UserAccount } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  documents: DocumentItem[];
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
  unreadNotificationCount?: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  documents,
  selectedDocId,
  setSelectedDocId,
  currentUser,
  onLogout,
  unreadNotificationCount = 0,
}: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedDoc = documents.find((doc) => doc.id === selectedDocId) || null;

  const menuItems = [
    { id: "home", label: "Dashboard 🏠", icon: BookOpen },
    { id: "library", label: "Documents 📄", icon: Library },
    { id: "chat", label: "AI Tutor 🤖", icon: MessageSquare },
    { id: "summaries", label: "AI Summaries 📚", icon: FileText },
    { id: "flashcards", label: "Flashcards 🧠", icon: Brain },
    { id: "quiz", label: "Quizzes 📝", icon: Award },
    { id: "practice-exams", label: "Practice Exams 🎯", icon: Target },
    { id: "revision", label: "Revision Packs 📖", icon: FileCheck2 },
    { id: "planner", label: "Study Plans 🗺", icon: Calendar },
    { id: "academic", label: "Academic Profile 🎓", icon: GraduationCap },
    { id: "academic-intelligence", label: "Academic Intelligence 📊", icon: BarChart2 },
    { id: "knowledge-base", label: "Memory Dashboard 🧠", icon: Database },
    { id: "coach", label: "AI Coach Hub ✨", icon: Sparkles },
    { id: "collaboration", label: "Collaboration Hub 👥", icon: Users },
    { id: "classroom", label: "Classroom Hub 🏫", icon: School },
    { id: "achievements", label: "Achievements 🏆", icon: Trophy },
    { id: "notifications", label: "Notifications 🔔", icon: Bell, badge: unreadNotificationCount },
    { id: "settings", label: "Settings ⚙️", icon: Settings },
  ];


  if (currentUser?.role === "admin") {
    menuItems.push({ id: "admin", label: "Admin Panel 🛡️", icon: Shield });
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden h-16 bg-white border-b border-gray-100 px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-gray-900 tracking-tight">StudyMate</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-500 hover:text-indigo-600 focus:outline-none"
          id="mobile-menu-toggle"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:z-30 w-72 bg-slate-900 text-slate-100 border-r border-slate-800 flex flex-col transition-transform duration-300 transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Branding Area */}
        <div className="h-20 border-b border-slate-800 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500 rounded-xl text-white shadow-sm shadow-indigo-500/20">
              <GraduationCap className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                StudyMate
              </h1>
              <p className="text-xs text-slate-400 font-medium">Learning Companion</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Document Context */}
        <div className="px-4 py-6 border-b border-slate-800 bg-slate-950/40">
          <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 block mb-2 px-2">
            Active Study Material
          </label>
          <div className="relative">
            <select
              value={selectedDocId || ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedDocId(val ? val : null);
              }}
              className="w-full bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer pr-10"
              id="document-selector"
            >
              {documents.length === 0 ? (
                <option value="">No materials uploaded</option>
              ) : (
                documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title.length > 28 ? doc.title.substring(0, 28) + "..." : doc.title}
                  </option>
                ))
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <ChevronRight className="h-4 w-4 rotate-90" />
            </div>
          </div>
          {selectedDoc && (
            <div className="mt-2.5 px-2 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3 text-indigo-400" />
                {selectedDoc.wordCount} words
              </span>
              <span>
                {new Date(selectedDoc.uploadedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3 px-2">
            Workspace Hub
          </label>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                id={`nav-${item.id}`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r" />
                )}
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User context footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20 text-xs text-slate-400">
          <div className="flex items-center justify-between gap-2.5 px-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-lg shadow-inner shrink-0">
                {currentUser?.avatarEmoji || "🎓"}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-slate-200 text-xs truncate">
                  {currentUser?.displayName || "Student Account"}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold truncate">
                  {currentUser?.email || "studymate@academy.edu"}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              title="Logout Session"
              id="sidebar-logout-btn"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
