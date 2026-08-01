import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  MessageSquare,
  Calendar,
  TrendingUp,
  Brain,
  Sparkles,
  FileText,
  GraduationCap,
  Pin,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  MoveUp,
  MoveDown,
  RotateCcw,
  SlidersHorizontal,
  Play,
  Pause,
  RotateCcw as ResetIcon,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Award,
} from "lucide-react";
import { WorkspaceWidget, DocumentItem, UserAccount, StudyStats } from "../../types";

interface WorkspaceWidgetGridProps {
  documents: DocumentItem[];
  currentUser: UserAccount | null;
  stats: StudyStats;
  onNavigateTab: (tab: string, docId?: string) => void;
  onToggleCompletedTopic: (topic: string) => void;
}

const DEFAULT_WIDGETS: WorkspaceWidget[] = [
  { id: "timer", type: "timer", title: "Pomodoro Study Timer", isVisible: true, isPinned: true, gridSpan: "third", order: 1 },
  { id: "cgpa", type: "cgpa", title: "Current Academic Standing", isVisible: true, isPinned: true, gridSpan: "third", order: 2 },
  { id: "flashcards", type: "flashcards", title: "Flashcards Due Today", isVisible: true, isPinned: false, gridSpan: "third", order: 3 },
  { id: "planner", type: "planner", title: "Today's Study Plan & Tasks", isVisible: true, isPinned: true, gridSpan: "half", order: 4 },
  { id: "velocity", type: "velocity", title: "Learning Velocity & Study Time", isVisible: true, isPinned: false, gridSpan: "half", order: 5 },
  { id: "suggestions", type: "suggestions", title: "AI Recommendations & Topic Diagnostics", isVisible: true, isPinned: false, gridSpan: "half", order: 6 },
  { id: "uploads", type: "uploads", title: "Recent Notes & Material Uploads", isVisible: true, isPinned: false, gridSpan: "half", order: 7 },
  { id: "chats", type: "chats", title: "Recent AI Tutor Interactions", isVisible: true, isPinned: false, gridSpan: "half", order: 8 },
  { id: "calendar", type: "calendar", title: "Upcoming Revision & Exam Schedule", isVisible: true, isPinned: false, gridSpan: "half", order: 9 },
];

export const WorkspaceWidgetGrid: React.FC<WorkspaceWidgetGridProps> = ({
  documents,
  currentUser,
  stats,
  onNavigateTab,
  onToggleCompletedTopic,
}) => {
  const [widgets, setWidgets] = useState<WorkspaceWidget[]>(() => {
    try {
      const saved = localStorage.getItem("studymate_workspace_widgets_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load workspace widgets:", e);
    }
    return DEFAULT_WIDGETS;
  });

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Timer Widget State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"focus" | "break">("focus");

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      if (timerMode === "focus") {
        alert("🎉 Focus session completed! Take a 5-minute break.");
        setTimerMode("break");
        setTimerSeconds(5 * 60);
      } else {
        alert("🔔 Break over! Ready to focus again?");
        setTimerMode("focus");
        setTimerSeconds(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, timerMode]);

  // Persist widgets layout
  useEffect(() => {
    localStorage.setItem("studymate_workspace_widgets_v1", JSON.stringify(widgets));
  }, [widgets]);

  const toggleVisibility = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isVisible: !w.isVisible } : w))
    );
  };

  const togglePin = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isPinned: !w.isPinned } : w))
    );
  };

  const cycleSpan = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const nextSpan: Record<string, "third" | "half" | "full"> = {
          third: "half",
          half: "full",
          full: "third",
        };
        return { ...w, gridSpan: nextSpan[w.gridSpan] };
      })
    );
  };

  const moveOrder = (id: string, direction: "up" | "down") => {
    const idx = widgets.findIndex((w) => w.id === id);
    if (idx === -1) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= widgets.length) return;

    const copy = [...widgets];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setWidgets(copy);
  };

  const resetWidgets = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  const sortedWidgets = [...widgets].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return a.order - b.order;
  });

  const activeDoc = documents[0] || null;

  return (
    <div className="space-y-4">
      {/* TOOLBAR FOR CUSTOMIZING DASHBOARD WIDGETS */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Workspace Widgets Grid
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
            {widgets.filter((w) => w.isVisible).length} / {widgets.length} active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
            className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
            {isCustomizeOpen ? "Close Customizer" : "Customize Dashboard"}
          </button>
          {isCustomizeOpen && (
            <button
              onClick={resetWidgets}
              className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1 hover:bg-rose-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Default
            </button>
          )}
        </div>
      </div>

      {/* CUSTOMIZE DRAWER */}
      <AnimatePresence>
        {isCustomizeOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 overflow-hidden text-xs"
          >
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Toggle, Resize & Reorder Dashboard Widgets
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {widgets.map((w) => (
                <div
                  key={w.id}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <button
                      onClick={() => toggleVisibility(w.id)}
                      className={`p-1 rounded ${
                        w.isVisible ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                      }`}
                    >
                      {w.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <span
                      className={`font-bold truncate ${
                        w.isVisible ? "text-slate-900 dark:text-white" : "text-slate-400 line-through"
                      }`}
                    >
                      {w.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => togglePin(w.id)}
                      className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
                        w.isPinned ? "text-amber-500" : "text-slate-400"
                      }`}
                      title={w.isPinned ? "Unpin widget" : "Pin widget to top"}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => cycleSpan(w.id)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      title="Cycle widget width"
                    >
                      {w.gridSpan}
                    </button>

                    <button
                      onClick={() => moveOrder(w.id, "up")}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveOrder(w.id, "down")}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WIDGETS GRID CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedWidgets
          .filter((w) => w.isVisible)
          .map((widget) => {
            const spanClass =
              widget.gridSpan === "full"
                ? "md:col-span-2 lg:col-span-3"
                : widget.gridSpan === "half"
                ? "md:col-span-2 lg:col-span-2"
                : "col-span-1";

            return (
              <div
                key={widget.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs transition-all relative group ${spanClass}`}
              >
                {/* WIDGET HEADER */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    {widget.type === "timer" && <Timer className="w-4 h-4 text-indigo-500" />}
                    {widget.type === "cgpa" && <GraduationCap className="w-4 h-4 text-emerald-500" />}
                    {widget.type === "flashcards" && <Brain className="w-4 h-4 text-teal-500" />}
                    {widget.type === "planner" && <Calendar className="w-4 h-4 text-amber-500" />}
                    {widget.type === "velocity" && <TrendingUp className="w-4 h-4 text-blue-500" />}
                    {widget.type === "suggestions" && <Sparkles className="w-4 h-4 text-purple-500" />}
                    {widget.type === "uploads" && <FileText className="w-4 h-4 text-rose-500" />}
                    {widget.type === "chats" && <MessageSquare className="w-4 h-4 text-indigo-500" />}
                    {widget.type === "calendar" && <Calendar className="w-4 h-4 text-teal-500" />}
                    {widget.title}
                  </h3>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {widget.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    <button
                      onClick={() => toggleVisibility(widget.id)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      title="Hide widget"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* WIDGET SPECIFIC CONTENT RENDERING */}

                {/* 1. TIMER WIDGET */}
                {widget.type === "timer" && (
                  <div className="flex flex-col items-center justify-center p-2 text-center">
                    <span className="text-3xl font-mono font-black text-slate-900 dark:text-white tracking-widest">
                      {Math.floor(timerSeconds / 60)
                        .toString()
                        .padStart(2, "0")}
                      :
                      {(timerSeconds % 60).toString().padStart(2, "0")}
                    </span>

                    <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 mt-1">
                      {timerMode === "focus" ? "🎯 Active Focus Interval" : "☕ Short Rest Break"}
                    </span>

                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {isTimerRunning ? "Pause" : "Start"}
                      </button>

                      <button
                        onClick={() => {
                          setIsTimerRunning(false);
                          setTimerSeconds(25 * 60);
                          setTimerMode("focus");
                        }}
                        className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-500"
                        title="Reset timer"
                      >
                        <ResetIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. CGPA CARD WIDGET */}
                {widget.type === "cgpa" && (
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        4.38 <span className="text-xs text-slate-400 font-normal">/ 5.00</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                        1st Class
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Earned 68 Units • Running CGPA Standing
                    </p>
                    <button
                      onClick={() => onNavigateTab("academic-intelligence")}
                      className="w-full py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      Open Intelligence Engine <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 3. FLASHCARDS DUE WIDGET */}
                {widget.type === "flashcards" && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60">
                      <span className="font-extrabold text-sm text-teal-900 dark:text-teal-200 block">
                        12 Cards Pending Review
                      </span>
                      <p className="text-[11px] text-teal-700 dark:text-teal-400 mt-0.5">
                        Spaced repetition algorithm scheduled cards for Database Systems.
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigateTab("flashcards")}
                      className="w-full py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs"
                    >
                      Practice Flashcards Now <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 4. PLANNER & TASKS WIDGET */}
                {widget.type === "planner" && (
                  <div className="space-y-2 text-xs">
                    {[
                      { topic: "Database Normalization (3NF & BCNF)", dur: "45 mins", comp: true },
                      { topic: "Computer Architecture Pipelining Hazards", dur: "30 mins", comp: false },
                      { topic: "Software Testing & JUnit Practice", dur: "60 mins", comp: false },
                    ].map((t, idx) => (
                      <div
                        key={idx}
                        onClick={() => onToggleCompletedTopic(t.topic)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          t.comp
                            ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60"
                            : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            className={`w-4 h-4 ${t.comp ? "text-emerald-500" : "text-slate-300"}`}
                          />
                          <span className={t.comp ? "line-through text-slate-500" : "font-bold text-slate-800 dark:text-slate-200"}>
                            {t.topic}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">{t.dur}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. VELOCITY & STUDY TIME WIDGET */}
                {widget.type === "velocity" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Weekly Target Progress</span>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                        {Math.round(stats.studyTimeMinutes / 60)} / 15 Hours (78%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${Math.min(100, (stats.studyTimeMinutes / (15 * 60)) * 100)}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      🔥 Active streak: <strong className="text-amber-500">{stats.dailyStreak} days</strong> in a row!
                    </p>
                  </div>
                )}

                {/* 6. AI SUGGESTIONS WIDGET */}
                {widget.type === "suggestions" && (
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
                      <span className="font-bold text-purple-900 dark:text-purple-200 block mb-1">
                        💡 Weak Topic Diagnostic: Numerical Analysis I
                      </span>
                      <p className="text-[11px] text-purple-700 dark:text-purple-300 leading-relaxed">
                        Quiz score was 65%. Recommended action: Generate 5 extra practice questions on Newton-Raphson method.
                      </p>
                    </div>
                  </div>
                )}

                {/* 7. RECENT UPLOADS WIDGET */}
                {widget.type === "uploads" && (
                  <div className="space-y-2 text-xs">
                    {documents.slice(0, 3).map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => onNavigateTab("home", doc.id)}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            {doc.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {doc.wordCount} words
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 8. RECENT CHATS WIDGET */}
                {widget.type === "chats" && (
                  <div className="space-y-3 text-xs">
                    <p className="text-slate-600 dark:text-slate-400">
                      Resume active AI Tutor session on <strong>Database Management Systems</strong>.
                    </p>
                    <button
                      onClick={() => onNavigateTab("chat")}
                      className="w-full py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      Resume Study Chatbot <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 9. CALENDAR & EXAMS WIDGET */}
                {widget.type === "calendar" && (
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-rose-900 dark:text-rose-200 block">
                          CSC 202 Mid-Semester Exam
                        </span>
                        <span className="text-[10px] text-rose-700 dark:text-rose-400">In 5 Days • Lecture Hall 1</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-extrabold text-[10px]">
                        Priority
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
