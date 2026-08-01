import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Sparkles,
  Brain,
  Zap,
  HelpCircle,
  Clock,
  BookOpen,
  Layers,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Printer,
  RotateCw,
  Play,
  Award,
  ChevronRight,
  Filter,
  Download,
  Share2,
  Copy,
  ChevronDown,
  RefreshCw,
  MessageSquare,
  Code2,
  ListTodo,
  Compass,
  Lightbulb,
  Cpu,
  Target
} from "lucide-react";
import { DocumentItem } from "../../types.js";

interface UnifiedStudyWorkspaceProps {
  documents?: DocumentItem[];
  token?: string;
  session?: any;
}

type StudyToolTab =
  | "summary"
  | "flashcards"
  | "quiz"
  | "exam"
  | "notes"
  | "concept_map"
  | "revision_pack"
  | "tutor_modes"
  | "guided_session";

export default function UnifiedStudyWorkspace({ documents = [], token, session }: UnifiedStudyWorkspaceProps) {
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<StudyToolTab>("summary");
  const activeToken = token || session?.access_token;

  // Tool 1: Summary State
  const [summaryType, setSummaryType] = useState<string>("executive");
  const [summaryLength, setSummaryLength] = useState<string>("medium");
  const [summaryText, setSummaryText] = useState<string>("");
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // Tool 2: Flashcards State
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [currentFcIndex, setCurrentFcIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);

  // Tool 3: Quiz State
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<string, string>>({});
  const [showQuizExplanations, setShowQuizExplanations] = useState<Record<string, boolean>>({});
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  // Tool 4: Practice Exam State
  const [practiceExam, setPracticeExam] = useState<any>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [examTimeRemaining, setExamTimeRemaining] = useState<number>(0);
  const [examActive, setExamActive] = useState(false);
  const [examReport, setExamReport] = useState<any>(null);
  const [generatingExam, setGeneratingExam] = useState(false);
  const [gradingExam, setGradingExam] = useState(false);

  // Tool 5: Notes State
  const [noteFormat, setNoteFormat] = useState<string>("lecture");
  const [notesMarkdown, setNotesMarkdown] = useState<string>("");
  const [printableHtml, setPrintableHtml] = useState<string>("");
  const [generatingNotes, setGeneratingNotes] = useState(false);

  // Tool 6: Concept Map State
  const [conceptMap, setConceptMap] = useState<any>(null);
  const [generatingConceptMap, setGeneratingConceptMap] = useState(false);

  // Tool 7: Revision Pack State
  const [revisionPack, setRevisionPack] = useState<any>(null);
  const [generatingRevPack, setGeneratingRevPack] = useState(false);

  // Tool 8: AI Tutor Modes State
  const [tutorQuery, setTutorQuery] = useState("");
  const [tutorMode, setTutorMode] = useState<string>("teacher");
  const [tutorAnswer, setTutorAnswer] = useState("");
  const [runningTutor, setRunningTutor] = useState(false);

  // Tool 9: Guided Session State
  const [learningSession, setLearningSession] = useState<any>(null);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [generatingSession, setGeneratingSession] = useState(false);

  // Error Banner
  const [errorMsg, setErrorMsg] = useState("");

  const getHeaders = () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;
    return headers;
  };

  // Timer Countdown for Exam
  useEffect(() => {
    let interval: any = null;
    if (examActive && examTimeRemaining > 0) {
      interval = setInterval(() => {
        setExamTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleGradeExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [examActive, examTimeRemaining]);

  // Handlers for Study Tools

  // 1. Generate Summary
  const handleGenerateSummary = async () => {
    try {
      setGeneratingSummary(true);
      setErrorMsg("");
      const res = await fetch("/api/v1/study-tools/summary", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          documentId: selectedDocId || undefined,
          summaryType,
          length: summaryLength,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSummaryText(data.summaryText);
      } else {
        setErrorMsg(data.error || "Failed to generate summary.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error generating summary.");
    } finally {
      setGeneratingSummary(false);
    }
  };

  // 2. Generate Flashcards
  const handleGenerateFlashcards = async () => {
    try {
      setGeneratingFlashcards(true);
      setErrorMsg("");
      const res = await fetch("/api/v1/study-tools/flashcards", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          documentId: selectedDocId || undefined,
          cardCount: 10,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFlashcards(data.flashcards);
        setCurrentFcIndex(0);
        setIsFlipped(false);
      } else {
        setErrorMsg(data.error || "Failed to generate flashcards.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error generating flashcards.");
    } finally {
      setGeneratingFlashcards(false);
    }
  };

  const handleReviewFlashcard = async (grade: number) => {
    if (!flashcards[currentFcIndex]) return;
    const card = flashcards[currentFcIndex];
    try {
      const res = await fetch("/api/v1/study-tools/flashcards/review", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          currentEF: card.sm2Data.easinessFactor,
          currentInterval: card.sm2Data.intervalDays,
          repetitions: card.sm2Data.repetitions,
          grade,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = [...flashcards];
        updated[currentFcIndex].sm2Data = data.sm2Data;
        setFlashcards(updated);
      }
    } catch (e) {
      console.error("Failed to rate card:", e);
    }

    // Move to next card
    setIsFlipped(false);
    if (currentFcIndex < flashcards.length - 1) {
      setCurrentFcIndex((prev) => prev + 1);
    } else {
      setCurrentFcIndex(0);
    }
  };

  // 3. Generate Quiz
  const handleGenerateQuiz = async () => {
    try {
      setGeneratingQuiz(true);
      setErrorMsg("");
      setUserQuizAnswers({});
      setShowQuizExplanations({});
      const res = await fetch("/api/v1/study-tools/quiz", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          documentId: selectedDocId || undefined,
          questionCount: 6,
          difficulty: "adaptive",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setQuizQuestions(data.quiz);
      } else {
        setErrorMsg(data.error || "Failed to generate quiz.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error generating quiz.");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // 4. Practice Exam
  const handleGenerateExam = async (examType = "1hour") => {
    try {
      setGeneratingExam(true);
      setErrorMsg("");
      setExamReport(null);
      setExamAnswers({});
      const res = await fetch("/api/v1/study-tools/practice-exam", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          documentId: selectedDocId || undefined,
          examType,
          timedMinutes: examType === "30min" ? 30 : 60,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPracticeExam(data.exam);
        setExamTimeRemaining(data.exam.timeLimitMinutes * 60);
        setExamActive(true);
      } else {
        setErrorMsg(data.error || "Failed to generate practice exam.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error generating exam.");
    } finally {
      setGeneratingExam(false);
    }
  };

  const handleGradeExam = async () => {
    if (!practiceExam) return;
    setExamActive(false);
    try {
      setGradingExam(true);
      const allQuestions = practiceExam.sections.flatMap((s: any) => s.questions || []);
      const res = await fetch("/api/v1/study-tools/practice-exam/grade", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          examId: practiceExam.id,
          answers: examAnswers,
          timeSpentSeconds: practiceExam.timeLimitMinutes * 60 - examTimeRemaining,
          questionsList: allQuestions,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setExamReport(data.report);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to grade practice exam.");
    } finally {
      setGradingExam(false);
    }
  };

  // 5. Notes Generator
  const handleGenerateNotes = async () => {
    try {
      setGeneratingNotes(true);
      setErrorMsg("");
      const res = await fetch("/api/v1/study-tools/notes", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          documentId: selectedDocId || undefined,
          noteFormat,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotesMarkdown(data.notesMarkdown);
        setPrintableHtml(data.printableHtml);
      } else {
        setErrorMsg(data.error || "Failed to generate notes.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error generating notes.");
    } finally {
      setGeneratingNotes(false);
    }
  };

  // 6. Concept Map
  const handleGenerateConceptMap = async () => {
    try {
      setGeneratingConceptMap(true);
      setErrorMsg("");
      const res = await fetch("/api/v1/study-tools/concept-map", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          documentId: selectedDocId || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConceptMap(data.conceptMap);
      } else {
        setErrorMsg(data.error || "Failed to generate concept map.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error generating concept map.");
    } finally {
      setGeneratingConceptMap(false);
    }
  };

  // 7. Revision Pack
  const handleGenerateRevisionPack = async () => {
    try {
      setGeneratingRevPack(true);
      setErrorMsg("");
      const res = await fetch("/api/v1/study-tools/revision-pack", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          documentId: selectedDocId || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRevisionPack(data.revisionPack);
      } else {
        setErrorMsg(data.error || "Failed to generate revision pack.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error generating revision pack.");
    } finally {
      setGeneratingRevPack(false);
    }
  };

  // 8. Tutor Mode Query
  const handleRunTutorQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorQuery.trim()) return;

    try {
      setRunningTutor(true);
      setErrorMsg("");
      const res = await fetch("/api/v1/study-tools/tutor-mode", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          documentId: selectedDocId || undefined,
          query: tutorQuery.trim(),
          mode: tutorMode,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTutorAnswer(data.answer);
      } else {
        setErrorMsg(data.error || "Failed to query tutor mode.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error querying tutor mode.");
    } finally {
      setRunningTutor(false);
    }
  };

  // 9. Guided Session
  const handleGenerateLearningSession = async () => {
    try {
      setGeneratingSession(true);
      setErrorMsg("");
      const res = await fetch("/api/v1/study-tools/learning-session", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          documentId: selectedDocId || undefined,
          durationMinutes: 45,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLearningSession(data.session);
        setActivePhaseIndex(0);
      } else {
        setErrorMsg(data.error || "Failed to generate learning session.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error generating learning session.");
    } finally {
      setGeneratingSession(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Workspace Bar: Document Scope & Grounding Context Indicator */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              Intelligent Study Workspace
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Grounded in uploaded study materials + personalized to your learning memory.
            </p>
          </div>
        </div>

        {/* Document Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Document Focus:</span>
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold rounded-2xl px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="">All Uploaded Study Materials ({documents.length})</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tool Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "summary", label: "AI Summary", icon: FileText },
          { id: "flashcards", label: "Smart Flashcards", icon: Zap },
          { id: "quiz", label: "AI Quiz", icon: HelpCircle },
          { id: "exam", label: "Practice Exam", icon: Clock },
          { id: "notes", label: "AI Notes", icon: BookOpen },
          { id: "concept_map", label: "Concept Map", icon: Layers },
          { id: "revision_pack", label: "Revision Pack", icon: Award },
          { id: "tutor_modes", label: "Tutor Modes", icon: Lightbulb },
          { id: "guided_session", label: "Guided Session", icon: Compass },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudyToolTab)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tool Content Views */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[450px]">
        {/* ==================================================== */}
        {/* TAB 1: AI SUMMARY GENERATOR */}
        {/* ==================================================== */}
        {activeTab === "summary" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  AI Summary Generator
                </h3>
                <p className="text-xs text-slate-500">Generate grounded executive summaries, revision sheets, formula lists, or timelines.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={summaryType}
                  onChange={(e) => setSummaryType(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 text-slate-900 dark:text-white"
                >
                  <option value="executive">Executive Summary</option>
                  <option value="chapter">Chapter Summary</option>
                  <option value="revision_sheet">One-page Revision Sheet</option>
                  <option value="key_takeaways">Key Takeaways</option>
                  <option value="definitions">Important Definitions</option>
                  <option value="formula_sheet">Formula Sheet</option>
                  <option value="timeline">Timeline Summary</option>
                </select>

                <select
                  value={summaryLength}
                  onChange={(e) => setSummaryLength(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 text-slate-900 dark:text-white"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="detailed">Detailed</option>
                </select>

                <button
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${generatingSummary ? "animate-spin" : ""}`} />
                  <span>{generatingSummary ? "Generating..." : "Generate Summary"}</span>
                </button>
              </div>
            </div>

            {summaryText ? (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-xs leading-relaxed text-slate-800 dark:text-slate-200 space-y-2 whitespace-pre-wrap font-sans">
                {summaryText}
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Select summary options above and click "Generate Summary".</p>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: SMART FLASHCARDS (with SM-2) */}
        {/* ==================================================== */}
        {activeTab === "flashcards" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Smart Flashcards (SM-2 Spaced Repetition)
                </h3>
                <p className="text-xs text-slate-500">Includes Definition, Concept, Formula, Code, and Scenario Cards.</p>
              </div>

              <button
                onClick={handleGenerateFlashcards}
                disabled={generatingFlashcards}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${generatingFlashcards ? "animate-spin" : ""}`} />
                <span>{generatingFlashcards ? "Building Cards..." : "Generate Flashcards"}</span>
              </button>
            </div>

            {flashcards.length > 0 ? (
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Card {currentFcIndex + 1} of {flashcards.length}</span>
                  <span className="uppercase text-[10px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-indigo-600 font-black">
                    {flashcards[currentFcIndex].cardType}
                  </span>
                </div>

                {/* Flip Card Container */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="min-h-[220px] p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col justify-between cursor-pointer border border-slate-700 relative transition-transform duration-300"
                >
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                      {isFlipped ? "ANSWER / EXPLANATION" : "QUESTION / PROMPT"}
                    </p>
                    <p className="text-base font-bold leading-relaxed">
                      {isFlipped ? flashcards[currentFcIndex].answer : flashcards[currentFcIndex].question}
                    </p>

                    {isFlipped && flashcards[currentFcIndex].explanation && (
                      <p className="text-xs text-slate-300 pt-2 border-t border-slate-800">
                        {flashcards[currentFcIndex].explanation}
                      </p>
                    )}

                    {flashcards[currentFcIndex].codeSnippet && (
                      <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto">
                        {flashcards[currentFcIndex].codeSnippet}
                      </pre>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 text-center pt-4">
                    Click to flip card • Tap review rating below
                  </p>
                </div>

                {/* SM-2 Rating Buttons */}
                {isFlipped && (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <button
                      onClick={() => handleReviewFlashcard(1)}
                      className="py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold cursor-pointer"
                    >
                      Again (1)
                    </button>
                    <button
                      onClick={() => handleReviewFlashcard(3)}
                      className="py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold cursor-pointer"
                    >
                      Hard (3)
                    </button>
                    <button
                      onClick={() => handleReviewFlashcard(4)}
                      className="py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-bold cursor-pointer"
                    >
                      Good (4)
                    </button>
                    <button
                      onClick={() => handleReviewFlashcard(5)}
                      className="py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold cursor-pointer"
                    >
                      Easy (5)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <Zap className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Click "Generate Flashcards" to create grounded study cards.</p>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: AI QUIZ GENERATOR */}
        {/* ==================================================== */}
        {activeTab === "quiz" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  Adaptive AI Quiz Generator
                </h3>
                <p className="text-xs text-slate-500">Multiple choice, True/False, Fill in Blank, Short Answer, with step-by-step explanations.</p>
              </div>

              <button
                onClick={handleGenerateQuiz}
                disabled={generatingQuiz}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${generatingQuiz ? "animate-spin" : ""}`} />
                <span>{generatingQuiz ? "Generating Quiz..." : "Generate Quiz"}</span>
              </button>
            </div>

            {quizQuestions.length > 0 ? (
              <div className="space-y-4">
                {quizQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Question {idx + 1} ({q.type})
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        {q.difficulty}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{q.question}</p>

                    {/* Options if MCQ */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt: string, optIdx: number) => {
                          const isSelected = userQuizAnswers[q.id] === opt;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => {
                                setUserQuizAnswers((prev) => ({ ...prev, [q.id]: opt }));
                                setShowQuizExplanations((prev) => ({ ...prev, [q.id]: true }));
                              }}
                              className={`p-2.5 rounded-xl text-xs text-left font-medium border transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Explanation Feedback */}
                    {showQuizExplanations[q.id] && (
                      <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-xs space-y-1">
                        <p className="font-bold text-indigo-900 dark:text-indigo-200">
                          Correct Answer: <span className="text-emerald-600">{q.correctAnswer}</span>
                        </p>
                        <p className="text-slate-700 dark:text-slate-300">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Click "Generate Quiz" to create adaptive questions.</p>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: PRACTICE EXAM GENERATOR */}
        {/* ==================================================== */}
        {activeTab === "exam" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Practice Examination & Auto-Marker
                </h3>
                <p className="text-xs text-slate-500">Timed 30m / 1h mock examinations with departmental assessment mode.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerateExam("30min")}
                  disabled={generatingExam}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  30-Min Exam
                </button>
                <button
                  onClick={() => handleGenerateExam("1hour")}
                  disabled={generatingExam}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  1-Hour Exam
                </button>
              </div>
            </div>

            {/* Active Exam View */}
            {practiceExam && !examReport && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold">{practiceExam.examTitle}</h4>
                    <p className="text-xs text-slate-400">Total Marks: {practiceExam.totalMarks}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-indigo-300">Time Remaining</p>
                    <p className="text-xl font-black text-amber-400 font-mono">{formatSeconds(examTimeRemaining)}</p>
                  </div>
                </div>

                {practiceExam.sections.map((sec: any, secIdx: number) => (
                  <div key={secIdx} className="space-y-3">
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b pb-1">
                      {sec.sectionTitle}
                    </h5>

                    {sec.questions.map((q: any, qIdx: number) => (
                      <div key={q.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Q{qIdx + 1}. {q.question}
                        </p>
                        {q.options?.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {q.options.map((opt: string, oIdx: number) => (
                              <button
                                key={oIdx}
                                onClick={() => setExamAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                                className={`p-2 rounded-xl text-xs text-left font-medium border cursor-pointer ${
                                  examAnswers[q.id] === opt
                                    ? "bg-indigo-600 text-white font-bold"
                                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            rows={2}
                            value={examAnswers[q.id] || ""}
                            onChange={(e) => setExamAnswers({ ...examAnswers, [q.id]: e.target.value })}
                            placeholder="Type your answer here..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 dark:text-white"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                <button
                  onClick={handleGradeExam}
                  disabled={gradingExam}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  {gradingExam ? "Auto-Marking Exam..." : "Submit Examination for Auto-Marking"}
                </button>
              </div>
            )}

            {/* Performance Report View */}
            {examReport && (
              <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-black uppercase text-amber-400">Examination Performance Report</h4>
                    <p className="text-xs text-slate-400">Grade: {examReport.grade} • Score: {examReport.scorePercentage}%</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${examReport.passed ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                    {examReport.passed ? "PASSED" : "REVISION REQUIRED"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-800 rounded-xl">
                    <p className="font-bold text-emerald-400">Identified Strengths:</p>
                    <p className="text-slate-300 mt-1">{examReport.strengths.join(", ") || "None recorded"}</p>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl">
                    <p className="font-bold text-rose-400">Weak Topics to Revise:</p>
                    <p className="text-slate-300 mt-1">{examReport.weaknesses.join(", ") || "None recorded"}</p>
                  </div>
                </div>
              </div>
            )}

            {!practiceExam && !examReport && (
              <div className="text-center py-16 space-y-3">
                <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Select test duration above to launch a timed practice examination.</p>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: AI NOTES GENERATOR */}
        {/* ==================================================== */}
        {activeTab === "notes" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  AI Notes Generator & Printable PDF
                </h3>
                <p className="text-xs text-slate-500">Lecture, Revision, Condensed, Exam, Bullet, Mind notes.</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={noteFormat}
                  onChange={(e) => setNoteFormat(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 text-slate-900 dark:text-white"
                >
                  <option value="lecture">Lecture Notes</option>
                  <option value="revision">Revision Notes</option>
                  <option value="condensed">Condensed Notes</option>
                  <option value="exam">Exam Notes</option>
                  <option value="bullet">Bullet Notes</option>
                  <option value="mind">Mind Notes</option>
                </select>

                <button
                  onClick={handleGenerateNotes}
                  disabled={generatingNotes}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${generatingNotes ? "animate-spin" : ""}`} />
                  <span>{generatingNotes ? "Generating..." : "Generate Notes"}</span>
                </button>
              </div>
            </div>

            {notesMarkdown ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      const printWindow = window.open("", "_blank");
                      if (printWindow) {
                        printWindow.document.write(printableHtml);
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save as PDF</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-xs leading-relaxed text-slate-800 dark:text-slate-200 space-y-2 whitespace-pre-wrap font-sans">
                  {notesMarkdown}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Select note style and click "Generate Notes".</p>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: CONCEPT MAP GENERATOR */}
        {/* ==================================================== */}
        {activeTab === "concept_map" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  Hierarchical Concept Map
                </h3>
                <p className="text-xs text-slate-500">Main topics, subtopics, relationships, and dependencies graph.</p>
              </div>

              <button
                onClick={handleGenerateConceptMap}
                disabled={generatingConceptMap}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${generatingConceptMap ? "animate-spin" : ""}`} />
                <span>{generatingConceptMap ? "Mapping..." : "Generate Concept Map"}</span>
              </button>
            </div>

            {conceptMap ? (
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{conceptMap.topicTitle}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {conceptMap.nodes?.map((node: any) => (
                    <div key={node.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-900 dark:text-white">{node.label}</span>
                        <span className="text-[10px] uppercase font-bold text-indigo-600">{node.type}</span>
                      </div>
                      <p className="text-xs text-slate-500">{node.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <Layers className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Click "Generate Concept Map" to visualize topic relationships.</p>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 7: REVISION PACK GENERATOR */}
        {/* ==================================================== */}
        {activeTab === "revision_pack" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  1-Click Complete Revision Pack
                </h3>
                <p className="text-xs text-slate-500">Bundles summary, flashcards, quiz, formulas, definitions, common mistakes, and checklist.</p>
              </div>

              <button
                onClick={handleGenerateRevisionPack}
                disabled={generatingRevPack}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${generatingRevPack ? "animate-spin" : ""}`} />
                <span>{generatingRevPack ? "Building Pack..." : "Generate Revision Pack"}</span>
              </button>
            </div>

            {revisionPack ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white space-y-1">
                  <h4 className="text-sm font-black">{revisionPack.title}</h4>
                  <p className="text-xs text-amber-100">
                    Includes {revisionPack.flashcards?.length} flashcards, {revisionPack.quiz?.length} quiz questions, formula sheet, and checklist.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <h5 className="text-xs font-black uppercase text-indigo-600">Formulas & Definitions</h5>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-4">
                      {revisionPack.formulaSheet?.map((f: string, i: number) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <h5 className="text-xs font-black uppercase text-rose-600">Common Exam Mistakes</h5>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-4">
                      {revisionPack.commonMistakes?.map((m: string, i: number) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <Award className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Click "Generate Revision Pack" for a complete study bundle.</p>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 8: AI TUTOR MODES */}
        {/* ==================================================== */}
        {activeTab === "tutor_modes" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  AI Tutor Modes & Personas
                </h3>
                <p className="text-xs text-slate-500">Teacher, Beginner, Expert, Exam Coach, Practical, Step-by-Step, Analogy, ELI5, Socratic, Interview Prep.</p>
              </div>
            </div>

            <form onSubmit={handleRunTutorQuery} className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  "teacher",
                  "beginner",
                  "expert",
                  "exam_coach",
                  "practical",
                  "step_by_step",
                  "analogy",
                  "eli5",
                  "socratic",
                  "interview_prep",
                ].map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => setTutorMode(mode)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      tutorMode === mode
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {mode.replace("_", " ")}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={tutorQuery}
                  onChange={(e) => setTutorQuery(e.target.value)}
                  placeholder="Ask any question in this tutor mode..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={runningTutor || !tutorQuery.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {runningTutor ? "Thinking..." : "Ask Tutor"}
                </button>
              </div>
            </form>

            {tutorAnswer && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-2">
                  Tutor Mode: {tutorMode.replace("_", " ").toUpperCase()}
                </p>
                {tutorAnswer}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 9: GUIDED LEARNING SESSION */}
        {/* ==================================================== */}
        {activeTab === "guided_session" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  Guided Learning Session Generator
                </h3>
                <p className="text-xs text-slate-500">Generates 7-phase study agenda (Warm-up -&gt; Concept -&gt; Example -&gt; Practice -&gt; Quiz -&gt; Reflection).</p>
              </div>

              <button
                onClick={handleGenerateLearningSession}
                disabled={generatingSession}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${generatingSession ? "animate-spin" : ""}`} />
                <span>{generatingSession ? "Generating..." : "Generate Guided Session"}</span>
              </button>
            </div>

            {learningSession ? (
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{learningSession.sessionTitle} ({learningSession.estimatedMinutes} mins)</h4>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {learningSession.phases?.map((ph: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhaseIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                        activePhaseIndex === idx
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Phase {ph.phaseNumber}: {ph.title}
                    </button>
                  ))}
                </div>

                {learningSession.phases?.[activePhaseIndex] && (
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-900 dark:text-white">
                        {learningSession.phases[activePhaseIndex].title} ({learningSession.phases[activePhaseIndex].durationMinutes} mins)
                      </h5>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {learningSession.phases[activePhaseIndex].content}
                    </p>
                    {learningSession.phases[activePhaseIndex].interactivePrompt && (
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-900 dark:text-indigo-200 font-bold">
                        Prompt: {learningSession.phases[activePhaseIndex].interactivePrompt}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <Compass className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Click "Generate Guided Session" to launch an interactive 7-phase study agenda.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
