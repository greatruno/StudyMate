import React, { useState, useEffect } from "react";
import {
  Target,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileText,
  Brain,
  ShieldCheck,
} from "lucide-react";
import { DocumentItem, QuizQuestion } from "../types";

interface PracticeExamsViewProps {
  documents: DocumentItem[];
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  onExamCompleted?: (score: number, total: number) => void;
}

export const PracticeExamsView: React.FC<PracticeExamsViewProps> = ({
  documents,
  selectedDocId,
  setSelectedDocId,
  onExamCompleted,
}) => {
  const activeDoc = documents.find((d) => d.id === selectedDocId) || documents[0] || null;

  const [examDurationMinutes, setExamDurationMinutes] = useState(30);
  const [examQuestionsCount, setExamQuestionsCount] = useState(10);
  const [isExamActive, setIsExamActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30 * 60);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState(0);

  // Generate sample practice exam questions from doc or default
  const examQuestions: QuizQuestion[] = activeDoc?.quiz && activeDoc.quiz.length >= 5
    ? activeDoc.quiz.slice(0, examQuestionsCount)
    : [
        {
          question: "Which layer in OSI model is responsible for end-to-end reliable transmission and flow control?",
          options: ["Network Layer", "Transport Layer", "Data Link Layer", "Session Layer"],
          correctOptionIndex: 1,
          explanation: "The Transport Layer (TCP) provides end-to-end communication control, error recovery, and flow control.",
          type: "mcq",
        },
        {
          question: "True or False: In a B-Tree index of order m, every internal node except the root has at least Math.ceil(m/2) children.",
          options: ["True", "False"],
          correctOptionIndex: 0,
          explanation: "B-Tree balance invariants guarantee that all internal nodes maintain at least half-full occupancy.",
          type: "true_false",
        },
        {
          question: "What is the worst-case time complexity of QuickSort when bad pivot choices are made sequentially?",
          options: ["O(N log N)", "O(N)", "O(N^2)", "O(log N)"],
          correctOptionIndex: 2,
          explanation: "Worst-case QuickSort degrades to O(N^2) when input is sorted and the pivot is consistently extreme.",
          type: "mcq",
        },
        {
          question: "In relational database normalization, a relation is in 3NF if it is in 2NF and every non-prime attribute is non-transitively dependent on every candidate key.",
          options: ["True", "False"],
          correctOptionIndex: 0,
          explanation: "3NF eliminates transitive functional dependencies on candidate keys.",
          type: "true_false",
        },
        {
          question: "Which scheduling algorithm minimizes average waiting time for a given set of processes?",
          options: ["First-Come First-Served (FCFS)", "Round Robin (RR)", "Shortest Job First (SJF)", "Priority Scheduling"],
          correctOptionIndex: 2,
          explanation: "SJF is provably optimal for minimizing average waiting time.",
          type: "mcq",
        },
      ];

  // Timer countdown effect
  useEffect(() => {
    let timer: any = null;
    if (isExamActive && !isExamSubmitted && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isExamActive, isExamSubmitted, secondsRemaining]);

  const handleStartExam = () => {
    setIsExamActive(true);
    setIsExamSubmitted(false);
    setSecondsRemaining(examDurationMinutes * 60);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setFlaggedQuestions({});
  };

  const handleOptionSelect = (qIdx: number, optionIdx: number) => {
    if (isExamSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qIdx]: optionIdx }));
  };

  const toggleFlagQuestion = (qIdx: number) => {
    setFlaggedQuestions((prev) => ({ ...prev, [qIdx]: !prev[qIdx] }));
  };

  const handleSubmitExam = () => {
    let correct = 0;
    examQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctOptionIndex) {
        correct++;
      }
    });
    setExamScore(correct);
    setIsExamSubmitted(true);
    setIsExamActive(false);
    if (onExamCompleted) {
      onExamCompleted(correct, examQuestions.length);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 lg:p-8">
      {/* HEADER BANNER */}
      <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-rose-500" /> Exam Readiness & Timed Mock Assessments
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Timed Practice Exams Simulator 🎯
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          Simulate strict university examination conditions with timed countdowns, flagged question review, and comprehensive weakness diagnostics.
        </p>
      </div>

      {!isExamActive && !isExamSubmitted && (
        <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6 max-w-2xl mx-auto">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" /> Configure Practice Exam Session
          </h2>

          <div className="space-y-4 text-xs font-medium text-slate-700 dark:text-slate-300">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Target Course / Document
              </label>
              <select
                value={selectedDocId || ""}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.subject || "General"})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Exam Duration
                </label>
                <select
                  value={examDurationMinutes}
                  onChange={(e) => setExamDurationMinutes(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                >
                  <option value={15}>15 Minutes (Express)</option>
                  <option value={30}>30 Minutes (Standard)</option>
                  <option value={60}>60 Minutes (Full Length)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Total Questions
                </label>
                <select
                  value={examQuestionsCount}
                  onChange={(e) => setExamQuestionsCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartExam}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Clock className="w-4 h-4" /> Begin Timed Examination
          </button>
        </div>
      )}

      {/* ACTIVE EXAM RUNNER */}
      {isExamActive && (
        <div className="space-y-6">
          {/* TIMED EXAM NAVBAR */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white font-black text-[10px] uppercase">
                EXAM IN PROGRESS
              </span>
              <h3 className="font-bold text-xs text-slate-200 hidden sm:inline">
                {activeDoc?.title}
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-mono font-black text-sm text-amber-400 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <Clock className="w-4 h-4 animate-pulse text-amber-400" />
                {formatTime(secondsRemaining)}
              </div>

              <button
                onClick={handleSubmitExam}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition-colors shadow-sm"
              >
                Submit Exam Now
              </button>
            </div>
          </div>

          {/* QUESTION PALETTE GRID */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            {examQuestions.map((_, idx) => {
              const isAnswered = userAnswers[idx] !== undefined;
              const isFlagged = flaggedQuestions[idx];
              const isCurrent = currentQuestionIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={`w-9 h-9 rounded-xl font-bold text-xs shrink-0 transition-all flex items-center justify-center relative ${
                    isCurrent
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-400"
                      : isAnswered
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* QUESTION CONTAINER */}
          {examQuestions[currentQuestionIdx] && (
            <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">
                  Question {currentQuestionIdx + 1} of {examQuestions.length}
                </span>

                <button
                  onClick={() => toggleFlagQuestion(currentQuestionIdx)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                    flaggedQuestions[currentQuestionIdx]
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {flaggedQuestions[currentQuestionIdx] ? "🚩 Flagged for Review" : "🏳 Flag Question"}
                </button>
              </div>

              <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-relaxed">
                {examQuestions[currentQuestionIdx].question}
              </h2>

              <div className="space-y-3">
                {examQuestions[currentQuestionIdx].options?.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentQuestionIdx] === optIdx;
                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleOptionSelect(currentQuestionIdx, optIdx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer font-medium text-xs flex items-center gap-3 ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-600 dark:border-indigo-400 text-indigo-900 dark:text-indigo-100 font-bold shadow-2xs"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg font-mono font-bold flex items-center justify-center text-[11px] ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx((p) => p - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Previous
                </button>

                <button
                  onClick={() => {
                    if (currentQuestionIdx < examQuestions.length - 1) {
                      setCurrentQuestionIdx((p) => p + 1);
                    } else {
                      handleSubmitExam();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  {currentQuestionIdx < examQuestions.length - 1 ? "Next Question →" : "Finish Exam"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RESULT DIAGNOSTIC */}
      {isExamSubmitted && (
        <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white space-y-3 text-center">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
              EXAM COMPLETED
            </span>
            <h2 className="text-2xl font-black">
              Your Exam Score: {examScore} / {examQuestions.length} ({Math.round((examScore / examQuestions.length) * 100)}%)
            </h2>
            <p className="text-xs text-slate-300">
              {examScore / examQuestions.length >= 0.7
                ? "🎉 First Class Performance! Excellent mastery of course objectives."
                : "💡 Review key concepts and retake this practice exam to build retention."}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400">Detailed Answer Key & Explanations</h3>
            {examQuestions.map((q, idx) => {
              const uAns = userAnswers[idx];
              const isCorrect = uAns === q.correctOptionIndex;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border space-y-2 ${
                    isCorrect
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                      : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Q{idx + 1}: {q.question}
                    </span>
                    {isCorrect ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">✓ Correct</span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-bold text-xs">✗ Incorrect</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => {
              setIsExamSubmitted(false);
              setIsExamActive(false);
            }}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
          >
            Take Another Practice Exam
          </button>
        </div>
      )}
    </div>
  );
};
