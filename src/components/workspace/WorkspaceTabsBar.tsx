import React from "react";
import {
  X,
  Plus,
  FileText,
  BookOpen,
  Brain,
  Award,
  BarChart2,
  Calendar,
  Zap,
  Target,
  FileCheck2,
  Sparkles,
  Search,
} from "lucide-react";

export interface WorkspaceTab {
  id: string;
  title: string;
  type: string; // "home" | "library" | "chat" | "quiz" | "flashcards" | "summaries" | "practice-exams" | "revision" | "planner" | "academic-intelligence" | "doc"
  docId?: string;
  isPinned?: boolean;
}

interface WorkspaceTabsBarProps {
  openTabs: WorkspaceTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewTabClick: () => void;
}

export const WorkspaceTabsBar: React.FC<WorkspaceTabsBarProps> = ({
  openTabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTabClick,
}) => {
  const getTabIcon = (type: string) => {
    switch (type) {
      case "doc":
      case "library":
        return <FileText className="w-3.5 h-3.5 text-indigo-500" />;
      case "chat":
        return <Brain className="w-3.5 h-3.5 text-teal-500" />;
      case "quiz":
        return <Award className="w-3.5 h-3.5 text-amber-500" />;
      case "flashcards":
        return <Zap className="w-3.5 h-3.5 text-rose-500" />;
      case "summaries":
        return <BookOpen className="w-3.5 h-3.5 text-indigo-500" />;
      case "practice-exams":
        return <Target className="w-3.5 h-3.5 text-rose-500" />;
      case "revision":
        return <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />;
      case "academic-intelligence":
        return <BarChart2 className="w-3.5 h-3.5 text-emerald-500" />;
      case "planner":
        return <Calendar className="w-3.5 h-3.5 text-indigo-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center px-2 pt-1.5 overflow-x-auto scrollbar-none text-xs font-semibold select-none">
      <div className="flex items-center gap-1 min-w-0">
        {openTabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-t-xl transition-all cursor-pointer border-t border-x ${
                isActive
                  ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold shadow-2xs"
                  : "bg-slate-200/60 dark:bg-slate-900/40 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {getTabIcon(tab.type)}
              <span className="truncate max-w-[140px] text-xs">{tab.title}</span>

              {/* CLOSE TAB BUTTON */}
              {openTabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 p-0.5 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* NEW TAB BUTTON */}
      <button
        onClick={onNewTabClick}
        className="p-1.5 ml-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
        title="Open Global Search / Command Palette (Ctrl + K)"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
