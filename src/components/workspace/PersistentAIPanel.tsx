import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  MessageSquare,
  BarChart2,
  ChevronRight,
  ChevronLeft,
  Send,
  BookOpen,
  Brain,
  Award,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Copy,
  Plus,
  RefreshCw,
  X,
  FileText,
  Bookmark,
  Layers,
  ArrowRight,
} from "lucide-react";
import { DocumentItem, UserAccount, ChatMessage } from "../../types";

interface PersistentAIPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeDoc: DocumentItem | null;
  documents: DocumentItem[];
  currentUser: UserAccount | null;
  highlightedText?: string;
  activeTabName?: string;
  onNavigateTab: (tab: string, docId?: string) => void;
  onShowToast: (title: string, message?: string, type?: "success" | "info" | "warning") => void;
}

export const PersistentAIPanel: React.FC<PersistentAIPanelProps> = ({
  isCollapsed,
  onToggleCollapse,
  activeDoc,
  documents,
  currentUser,
  highlightedText = "",
  activeTabName = "home",
  onNavigateTab,
  onShowToast,
}) => {
  const [panelTab, setPanelTab] = useState<"chat" | "metrics">("chat");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "model",
      text: "Hello! I am your persistent AI Tutor. I am actively monitoring your current study materials, active quiz scores, and academic goals. Highlight any text or ask me anything!",
      timestamp: "Just now",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [readingProgress, setReadingProgress] = useState(42);
  const [sessionMinutes, setSessionMinutes] = useState(18);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Session timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionMinutes((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // When text is highlighted, auto-populate input or notify user
  useEffect(() => {
    if (highlightedText && highlightedText.trim().length > 0) {
      setPanelTab("chat");
      onShowToast("Context Captured 🎯", `AI Tutor focused on: "${highlightedText.substring(0, 30)}..."`, "info");
    }
  }, [highlightedText]);

  const handleSendMessage = (customPrompt?: string) => {
    const query = customPrompt || inputMessage;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputMessage("");
    setIsTyping(true);

    // Simulate grounded RAG AI Response
    setTimeout(() => {
      let aiText = "";
      const lower = query.toLowerCase();

      if (highlightedText && lower.includes("highlight")) {
        aiText = `Here is a breakdown of the selected text ("${highlightedText.substring(0, 40)}..."): \n\n1. **Core Insight**: This section describes fundamental operational principles in ${activeDoc?.subject || "this topic"}.\n2. **Simplified Definition**: In simple terms, it establishes how components communicate reliably.\n3. **Exam Tip**: Expect short-answer questions comparing this to alternative methods!`;
      } else if (lower.includes("gpa") || lower.includes("cgpa")) {
        aiText = `Based on your Academic Profile, your current projected CGPA is **3.82 / 4.00** (First Class Track). To maintain First Class honors, aim for 85%+ in your upcoming quizzes in ${activeDoc?.title || "Computer Science"}.`;
      } else if (lower.includes("flashcard") || lower.includes("card")) {
        aiText = `I've prepared 5 active recall flashcards based on ${activeDoc?.title || "your active notes"}:\n\n• **Front**: What is the primary purpose of this mechanism?\n• **Back**: Ensures transaction atomicity and prevents concurrency deadlock.`;
      } else if (lower.includes("quiz") || lower.includes("test")) {
        aiText = `Generating practice questions for **${activeDoc?.title || "Current Syllabus"}**...\n\nQ1: Which of the following best satisfies functional independence?\nA) High Cohesion & Low Coupling (Correct)\nB) Low Cohesion & High Coupling`;
      } else {
        aiText = `Regarding your query about **${activeDoc?.title || "your study workspace"}**: \n\nThis relates directly to ${activeDoc?.subject || "your active syllabus"}. Key points to remember:\n• Point 1: Always verify functional dependencies first.\n• Point 2: Review key terminology in your AI summary sheet.`;
      }

      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "model",
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiReply]);
      setIsTyping(false);
    }, 1000);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 space-y-4 shrink-0 transition-all z-20">
        <button
          onClick={onToggleCollapse}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
          title="Expand AI Tutor Panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            onToggleCollapse();
            setPanelTab("chat");
          }}
          className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors cursor-pointer relative"
          title="Persistent AI Tutor"
        >
          <Brain className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-1 animate-pulse" />
        </button>

        <button
          onClick={() => {
            onToggleCollapse();
            setPanelTab("metrics");
          }}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
          title="Smart Context Metrics"
        >
          <BarChart2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-80 lg:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0 shadow-xs z-20 transition-all">
      {/* PANEL HEADER */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold w-full">
          <button
            onClick={() => setPanelTab("chat")}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              panelTab === "chat"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-black"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Brain className="w-3.5 h-3.5" /> AI Tutor
          </button>
          <button
            onClick={() => setPanelTab("metrics")}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              panelTab === "metrics"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-black"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> Smart Context
          </button>
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Collapse Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ACTIVE CONTEXT BADGE */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="truncate">
            Context: {activeDoc ? activeDoc.title : "Workspace Dashboard"}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
          RAG Active
        </span>
      </div>

      {/* TAB 1: AI TUTOR CHAT */}
      {panelTab === "chat" && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* HIGHLIGHTED TEXT INJECTION BANNER */}
          {highlightedText && (
            <div className="p-3 m-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Selected Text Focused
                </span>
                <button
                  onClick={() => handleSendMessage(`Explain this highlighted text: "${highlightedText}"`)}
                  className="hover:underline cursor-pointer"
                >
                  Explain
                </button>
              </div>
              <p className="text-[11px] text-slate-800 dark:text-slate-200 italic line-clamp-2">
                "{highlightedText}"
              </p>
            </div>
          )}

          {/* CHAT MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl space-y-1 ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {msg.role === "model" && (
                    <div className="pt-2 flex items-center gap-2 text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-700 mt-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(msg.text);
                          onShowToast("Copied to Clipboard 📋");
                        }}
                        className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => {
                          onShowToast("Saved to Notes 📝", "Explanation added to draft notes.");
                        }}
                        className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Bookmark className="w-3 h-3" /> Save to Note
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-bold text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-indigo-500 font-bold p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl w-fit animate-pulse">
                <Brain className="w-4 h-4 animate-spin" /> AI Tutor is synthesizing response...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* QUICK PROMPT PILLS */}
          <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px] font-bold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => handleSendMessage("Summarize the key concepts of this document.")}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-950 shrink-0 transition-colors cursor-pointer"
            >
              💡 Key Concepts
            </button>
            <button
              onClick={() => handleSendMessage("Generate 5 practice flashcards from my notes.")}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-950 shrink-0 transition-colors cursor-pointer"
            >
              ⚡ Flashcards
            </button>
            <button
              onClick={() => handleSendMessage("Quiz me on my weak topics.")}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-950 shrink-0 transition-colors cursor-pointer"
            >
              🎯 Quick Quiz
            </button>
          </div>

          {/* CHAT INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask AI Tutor anything..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: SMART CONTEXT METRICS */}
      {panelTab === "metrics" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
          {/* COURSE & TOPIC CARD */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                Active Context
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Intermediate
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                {activeDoc ? activeDoc.title : "General Workspace"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Subject: {activeDoc?.subject || "Computer Science & Engineering"}
              </p>
            </div>

            {/* READING PROGRESS BAR */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>Reading Progress</span>
                <span>{readingProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${readingProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* LIVE STUDY SESSION METRICS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-500" /> Study Time
              </span>
              <p className="text-base font-black text-slate-900 dark:text-white">
                {sessionMinutes} mins
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-500" /> Projected GPA
              </span>
              <p className="text-base font-black text-slate-900 dark:text-white">
                3.82 / 4.0
              </p>
            </div>
          </div>

          {/* WEAK TOPIC DIAGNOSTIC */}
          <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
            <h4 className="text-[11px] font-black uppercase text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-rose-500" /> Weak Topic Diagnostic
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Lower accuracy detected in <strong>Numerical Integration Methods</strong>.
            </p>
            <button
              onClick={() => onNavigateTab("quiz", activeDoc?.id)}
              className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] transition-colors"
            >
              Take Target Practice Quiz
            </button>
          </div>

          {/* RELATED FLASHCARDS & DOCUMENTS */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Related Flashcards & Materials
            </h4>
            {documents.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                onClick={() => onNavigateTab("library", doc.id)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="truncate pr-2">
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{doc.title}</p>
                  <span className="text-[10px] text-slate-400">{doc.subject || "General"}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>

          {/* AI LEARNING INSIGHT */}
          <div className="p-4 rounded-2xl bg-indigo-900 text-white space-y-2">
            <h4 className="text-[11px] font-black uppercase text-amber-400 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> AI Memory Recommendation
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              Reviewing 10 flashcards every 24 hours increases long-term retention by 74%.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
