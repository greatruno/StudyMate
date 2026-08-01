import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  BookOpen,
  Brain,
  Award,
  MessageSquare,
  Calendar,
  GraduationCap,
  Calculator,
  FileUp,
  Settings,
  Sparkles,
  Zap,
  ArrowRight,
  X,
  Clock,
  Database,
  Trophy,
  Filter,
} from "lucide-react";
import { DocumentItem, GlobalSearchResultItem, UserAccount } from "../../types";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  currentUser: UserAccount | null;
  onSelectAction: (targetTab: string, docId?: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  documents,
  currentUser,
  onSelectAction,
}) => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle Ctrl+K globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open palette
          // Note: App parent should listen or toggle
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Static Action Commands
  const actionCommands: GlobalSearchResultItem[] = [
    { id: "cmd-upload", title: "Upload & Compile New Notes", snippet: "Import PDF, DOCX, or text notes into AI Study Pipeline", category: "action", tabTarget: "upload" },
    { id: "cmd-chat", title: "Ask AI Tutor (Study Chatbot)", snippet: "Start interactive question-answering session", category: "action", tabTarget: "chat" },
    { id: "cmd-summary", title: "View AI Summary & Outlines", snippet: "Explore key concepts and memory hooks for active document", category: "action", tabTarget: "home" },
    { id: "cmd-flashcards", title: "Practice Flashcards", snippet: "Review spaced-repetition active recall cards", category: "action", tabTarget: "flashcards" },
    { id: "cmd-quiz", title: "Take Practice Quiz", snippet: "Test mastery with auto-graded multiple choice & short answers", category: "action", tabTarget: "quiz" },
    { id: "cmd-academic", title: "Academic Intelligence Engine", snippet: "Calculators, Transcript, Degree Audit & What-if Simulator", category: "action", tabTarget: "academic-intelligence" },
    { id: "cmd-cgpa", title: "Open CGPA & Term Calculator", snippet: "Calculate term GPA, cumulative CGPA & quality points", category: "action", tabTarget: "academic-intelligence" },
    { id: "cmd-transcript", title: "View Academic Transcript", snippet: "Official sealed electronic transcript record", category: "action", tabTarget: "academic-intelligence" },
    { id: "cmd-planner", title: "AI Study Planner & Exam Countdown", snippet: "Syllabus-backed weekly timetable generator", category: "action", tabTarget: "planner" },
    { id: "cmd-knowledge", title: "My Memory Knowledge Base", snippet: "Semantic indexing and long-term memory facts", category: "action", tabTarget: "knowledge-base" },
    { id: "cmd-settings", title: "Workspace & Theme Settings", snippet: "Dark/Light themes, Accessibility & High-Contrast options", category: "action", tabTarget: "settings" },
  ];

  // Dynamic Search Index Construction
  const documentResults: GlobalSearchResultItem[] = documents.flatMap((doc) => {
    const items: GlobalSearchResultItem[] = [
      {
        id: `doc-${doc.id}`,
        title: doc.title,
        snippet: `Uploaded material (${doc.wordCount} words) • ${doc.subject || "General"}`,
        category: "document",
        tabTarget: "library",
        meta: doc.id,
      },
    ];

    if (doc.summary) {
      items.push({
        id: `sum-${doc.id}`,
        title: `Summary: ${doc.summary.title}`,
        snippet: doc.summary.summaryText.substring(0, 90) + "...",
        category: "summary",
        tabTarget: "home",
        meta: doc.id,
      });

      doc.summary.keyConcepts.forEach((kc, idx) => {
        items.push({
          id: `kc-${doc.id}-${idx}`,
          title: `Concept: ${kc.title}`,
          snippet: kc.explanation,
          category: "memory",
          tabTarget: "home",
          meta: doc.id,
        });
      });
    }

    if (doc.flashcards && doc.flashcards.length > 0) {
      items.push({
        id: `fc-${doc.id}`,
        title: `Flashcard Deck: ${doc.title}`,
        snippet: `${doc.flashcards.length} spaced-repetition cards available`,
        category: "flashcard",
        tabTarget: "flashcards",
        meta: doc.id,
      });
    }

    if (doc.quiz && doc.quiz.length > 0) {
      items.push({
        id: `qz-${doc.id}`,
        title: `Quiz: ${doc.title}`,
        snippet: `${doc.quiz.length} practice questions generated`,
        category: "quiz",
        tabTarget: "quiz",
        meta: doc.id,
      });
    }

    return items;
  });

  const allSearchResults = [...actionCommands, ...documentResults];

  // Filter Logic
  const filteredResults = allSearchResults.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const q = query.toLowerCase().trim();
    if (!q) return matchesCategory;
    const matchesTitle = item.title.toLowerCase().includes(q);
    const matchesSnippet = item.snippet.toLowerCase().includes(q);
    return matchesCategory && (matchesTitle || matchesSnippet);
  });

  // Keyboard navigation inside list
  const handleKeyDownInList = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        const item = filteredResults[selectedIndex];
        onSelectAction(item.tabTarget, item.meta);
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "action":
        return <Zap className="w-4 h-4 text-amber-500" />;
      case "document":
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case "summary":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "flashcard":
        return <Brain className="w-4 h-4 text-teal-500" />;
      case "quiz":
        return <Award className="w-4 h-4 text-rose-500" />;
      case "memory":
        return <Database className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-slate-950/70 backdrop-blur-xs">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* SEARCH INPUT BAR */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/80">
            <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search documents, AI summaries, quizzes, flashcards, or type a command..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDownInList}
              className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
              ESC
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* CATEGORY FILTER PILLS */}
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
            <span className="text-[10px] font-bold uppercase text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {[
              { id: "all", label: "All Items" },
              { id: "action", label: "Quick Actions" },
              { id: "document", label: "Documents" },
              { id: "summary", label: "Summaries" },
              { id: "flashcard", label: "Flashcards" },
              { id: "quiz", label: "Quizzes" },
              { id: "memory", label: "Memory Facts" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedIndex(0);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* RESULTS LIST */}
          <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/50">
            {filteredResults.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Search className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">No matching items found</p>
                <p className="text-[11px] mt-1">Try refining your search keyword or switching filters.</p>
              </div>
            ) : (
              filteredResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectAction(item.tabTarget, item.meta);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 shadow-2xs"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-3 overflow-hidden">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.snippet}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      {isSelected && <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* PALETTE FOOTER HINTS */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <div className="flex items-center gap-3">
              <span><kbd className="font-bold text-slate-600 dark:text-slate-300">↑↓</kbd> Navigate</span>
              <span><kbd className="font-bold text-slate-600 dark:text-slate-300">↵</kbd> Select</span>
              <span><kbd className="font-bold text-slate-600 dark:text-slate-300">ESC</kbd> Close</span>
            </div>
            <span>StudyMate Command Engine v0.5.0</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
