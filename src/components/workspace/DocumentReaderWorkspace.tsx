import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Sparkles,
  Zap,
  Award,
  FileText,
  FileCheck2,
  Bookmark,
  Copy,
  Plus,
  Search,
  Highlighter,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Share2,
  Globe,
  Brain,
  Edit3,
  Trash2,
  ListCheck,
} from "lucide-react";
import { DocumentItem, Flashcard, QuizQuestion } from "../../types";

interface DocumentReaderWorkspaceProps {
  document: DocumentItem;
  onTextHighlight: (selectedText: string) => void;
  onShowToast: (title: string, message?: string, type?: "success" | "info" | "warning") => void;
  onNavigateTab: (tab: string, docId?: string) => void;
}

export const DocumentReaderWorkspace: React.FC<DocumentReaderWorkspaceProps> = ({
  document,
  onTextHighlight,
  onShowToast,
  onNavigateTab,
}) => {
  const [activeDocSubTab, setActiveDocSubTab] = useState<
    "reader" | "summary" | "flashcards" | "quiz" | "revision" | "notes"
  >("reader");

  const [selectedText, setSelectedText] = useState("");
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number; left: number } | null>(
    null
  );

  const [userNotes, setUserNotes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`studymate_doc_notes_${document.id}`);
      return saved ? JSON.parse(saved) : ["Key equation: P(A|B) = P(B|A)*P(A)/P(B)", "Review Chapter 3 before midterm exam."];
    } catch {
      return [];
    }
  });

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`studymate_doc_bookmarks_${document.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newNoteText, setNewNoteText] = useState("");

  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Save notes to local persistence
  useEffect(() => {
    try {
      localStorage.setItem(`studymate_doc_notes_${document.id}`, JSON.stringify(userNotes));
    } catch (e) {
      console.error(e);
    }
  }, [userNotes, document.id]);

  // Handle Text Selection
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 3) {
      const text = selection.toString().trim();
      setSelectedText(text);
      onTextHighlight(text);

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPosition({
        top: Math.max(10, rect.top - 50),
        left: Math.max(10, rect.left + rect.width / 2 - 180),
      });
    } else {
      setToolbarPosition(null);
    }
  };

  // Toolbar Actions
  const handleToolbarAction = (action: string) => {
    if (!selectedText) return;

    switch (action) {
      case "explain":
        onShowToast("AI Explaining Selected Text 💡", `Sent "${selectedText.substring(0, 25)}..." to AI Tutor`, "info");
        break;
      case "simplify":
        onShowToast("Simplifying Concept 🧩", "Generating ELI5 summary in AI Assistant", "info");
        break;
      case "flashcard":
        onShowToast("Flashcard Created ⚡", `Card added from selection: "${selectedText.substring(0, 30)}..."`, "success");
        break;
      case "quiz":
        onShowToast("Quiz Question Generated 🎯", "Practice question created in Quiz tab", "success");
        break;
      case "note":
        setUserNotes((prev) => [selectedText, ...prev]);
        onShowToast("Saved to Notes 📌", "Highlight added to document notes", "success");
        break;
      case "bookmark":
        if (!bookmarks.includes(selectedText)) {
          setBookmarks((prev) => [selectedText, ...prev]);
        }
        onShowToast("Bookmark Added 🔖", "Highlight added to course bookmarks", "success");
        break;
      case "copy":
        navigator.clipboard.writeText(selectedText);
        onShowToast("Copied to Clipboard 📋");
        break;
      case "memory":
        onShowToast("Saved to Memory Engine 🧠", "Concept indexed in semantic knowledge base", "success");
        break;
      default:
        break;
    }

    setToolbarPosition(null);
  };

  const handleAddCustomNote = () => {
    if (!newNoteText.trim()) return;
    setUserNotes((prev) => [newNoteText, ...prev]);
    setNewNoteText("");
    onShowToast("Note Added 📝", "Custom note saved to document", "success");
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* DOCUMENT HEADER & NAVIGATION SUB-TABS */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {document.subject || "Computer Science"}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {document.wordCount} words • {document.fileType.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {document.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab("chat", document.id)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Brain className="w-4 h-4" /> Ask AI Tutor
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                onShowToast("Share Link Copied 🔗");
              }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              title="Share Document"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* IN-DOCUMENT SUB-TAB NAVIGATION */}
        <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveDocSubTab("reader")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeDocSubTab === "reader"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Reader View
          </button>

          <button
            onClick={() => setActiveDocSubTab("summary")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeDocSubTab === "summary"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Summary
          </button>

          <button
            onClick={() => setActiveDocSubTab("flashcards")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeDocSubTab === "flashcards"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Flashcards ({document.flashcards?.length || 0})
          </button>

          <button
            onClick={() => setActiveDocSubTab("quiz")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeDocSubTab === "quiz"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Quiz ({document.quiz?.length || 0})
          </button>

          <button
            onClick={() => setActiveDocSubTab("revision")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeDocSubTab === "revision"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" /> Revision Pack
          </button>

          <button
            onClick={() => setActiveDocSubTab("notes")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeDocSubTab === "notes"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" /> Notes ({userNotes.length})
          </button>
        </div>
      </div>

      {/* FLOATING TEXT HIGHLIGHT TOOLBAR */}
      {toolbarPosition && (
        <div
          style={{ top: `${toolbarPosition.top}px`, left: `${toolbarPosition.left}px` }}
          className="fixed z-50 bg-slate-900 text-white p-2 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-1 animate-fade-in text-xs"
        >
          <button
            onClick={() => handleToolbarAction("explain")}
            className="p-1.5 hover:bg-slate-800 rounded-lg flex items-center gap-1 text-[11px] font-bold text-indigo-300"
            title="Explain in AI Tutor"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Explain
          </button>
          <button
            onClick={() => handleToolbarAction("simplify")}
            className="p-1.5 hover:bg-slate-800 rounded-lg flex items-center gap-1 text-[11px] font-bold text-teal-300"
            title="Simplify concept"
          >
            <HelpCircle className="w-3.5 h-3.5 text-teal-400" /> Simplify
          </button>
          <button
            onClick={() => handleToolbarAction("flashcard")}
            className="p-1.5 hover:bg-slate-800 rounded-lg flex items-center gap-1 text-[11px] font-bold text-amber-300"
            title="Generate Flashcard"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Flashcard
          </button>
          <button
            onClick={() => handleToolbarAction("quiz")}
            className="p-1.5 hover:bg-slate-800 rounded-lg flex items-center gap-1 text-[11px] font-bold text-rose-300"
            title="Generate Quiz"
          >
            <Award className="w-3.5 h-3.5 text-rose-400" /> Quiz
          </button>
          <button
            onClick={() => handleToolbarAction("note")}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
            title="Add to Notes"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToolbarAction("copy")}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
            title="Copy Text"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToolbarAction("memory")}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-indigo-300"
            title="Save to Memory Engine"
          >
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
          </button>
        </div>
      )}

      {/* SUB-TAB 1: READER VIEW */}
      {activeDocSubTab === "reader" && (
        <div
          ref={readerContainerRef}
          onMouseUp={handleMouseUp}
          className="bg-white dark:bg-slate-900 p-6 lg:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6 text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-serif"
        >
          <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 font-sans text-xs flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
            <Highlighter className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              <strong>Tip:</strong> Highlight any sentence or paragraph to trigger instant AI explanation, flashcard creation, or memory indexing.
            </span>
          </div>

          {/* MAIN DOCUMENT TEXT */}
          <div className="space-y-4">
            <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              1. Introduction & Theoretical Foundations
            </h2>
            <p>
              {document.summary?.summaryText ||
                "This course material establishes key theoretical frameworks, mathematical models, and architectural patterns. Students are expected to understand core concepts thoroughly before proceeding to advanced problem-solving modules."}
            </p>

            <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 pt-4">
              2. Essential Principles & Architectural Invariants
            </h2>
            <p>
              In computer systems and algorithms, efficiency is measured across time and memory complexities. Functional decomposition ensures high cohesion and low coupling across service boundaries.
            </p>

            {document.summary?.keyConcepts && document.summary.keyConcepts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans my-6">
                {document.summary.keyConcepts.map((kc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1"
                  >
                    <h4 className="font-extrabold text-xs uppercase text-indigo-600 dark:text-indigo-400">
                      {kc.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {kc.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AI SUMMARY */}
      {activeDocSubTab === "summary" && (
        <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" /> Executive AI Summary & Key Takeaways
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {document.summary?.summaryText || "No compiled summary available for this document."}
          </p>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Essential Takeaways</h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              {document.summary?.bulletPoints.map((bp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FLASHCARDS */}
      {activeDocSubTab === "flashcards" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Active Recall Flashcards</h2>
            <button
              onClick={() => onNavigateTab("flashcards", document.id)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              Open Full Deck →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {document.flashcards?.map((card, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs"
              >
                <span className="text-[10px] font-extrabold uppercase text-indigo-600">Card #{idx + 1}</span>
                <p className="font-bold text-slate-900 dark:text-white">Q: {card.question}</p>
                <p className="text-slate-600 dark:text-slate-300">A: {card.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: QUIZ */}
      {activeDocSubTab === "quiz" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Document Practice Quiz</h2>
            <button
              onClick={() => onNavigateTab("quiz", document.id)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              Take Practice Quiz →
            </button>
          </div>

          <div className="space-y-3">
            {document.quiz?.slice(0, 3).map((q, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <span className="font-extrabold text-slate-900 dark:text-white">
                  Q{idx + 1}: {q.question}
                </span>
                <p className="text-slate-500">{q.options?.join(" • ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: REVISION PACK */}
      {activeDocSubTab === "revision" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">1-Page Exam Cheatsheet</h2>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 font-mono text-xs space-y-2">
            <p className="font-bold text-indigo-600">Formula & Formula Relations:</p>
            <code>P(A|B) = [P(B|A) * P(A)] / P(B)</code>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: STUDENT NOTES */}
      {activeDocSubTab === "notes" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Personal Notes & Scratchpad</h2>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a new study note or formula..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-medium"
            />
            <button
              onClick={handleAddCustomNote}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
            >
              Add Note
            </button>
          </div>

          <div className="space-y-2">
            {userNotes.map((note, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between"
              >
                <span>{note}</span>
                <button
                  onClick={() => {
                    setUserNotes((prev) => prev.filter((_, i) => i !== idx));
                    onShowToast("Note Removed 🗑️");
                  }}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
