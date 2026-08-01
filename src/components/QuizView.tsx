import React, { useState, useEffect } from "react";
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight, 
  HelpCircle,
  FileText,
  Clock,
  Sparkles,
  Loader2,
  ListFilter,
  Flame,
  UserCheck
} from "lucide-react";
import { DocumentItem, QuizQuestion } from "../types";

interface QuizViewProps {
  documents: DocumentItem[];
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  onQuizCompleted: (score: number, total: number) => void;
  onUpdateDocumentQuiz?: (docId: string, quiz: QuizQuestion[]) => void; // Optional callback to persist quiz
}

export default function QuizView({
  documents,
  selectedDocId,
  setSelectedDocId,
  onQuizCompleted,
  onUpdateDocumentQuiz
}: QuizViewProps) {
  // Current active study material
  const activeDoc = documents.find((doc) => doc.id === selectedDocId) || null;

  // Local state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  
  // Customization Form states
  const [difficulty, setDifficulty] = useState("intermediate");
  const [numQuestions, setNumQuestions] = useState(5);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["mcq", "true_false", "scenario"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  // Sync questions with selected doc
  useEffect(() => {
    if (activeDoc && activeDoc.quiz && activeDoc.quiz.length > 0) {
      setQuizQuestions(activeDoc.quiz);
    } else {
      setQuizQuestions([]);
    }
    // Reset active quiz progression
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setTypedAnswer("");
    setHasSubmitted(false);
    setCorrectCount(0);
    setIsCompleted(false);
  }, [selectedDocId, activeDoc]);

  // Handle option selection for MCQ/TF
  const handleOptionClick = (index: number) => {
    if (hasSubmitted) return;
    setSelectedOption(index);
  };

  // Submit Answer
  const handleSubmitAnswer = () => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const qType = currentQuestion.type || "mcq";

    if (qType === "short_answer") {
      if (!typedAnswer.trim() || hasSubmitted) return;
      setHasSubmitted(true);
      // For short answer, student self-grades *after* reviewing the explanation.
    } else {
      if (selectedOption === null || hasSubmitted) return;
      setHasSubmitted(true);
      if (selectedOption === currentQuestion.correctOptionIndex) {
        setCorrectCount((prev) => prev + 1);
      }
    }
  };

  // Student self-grading for short answer
  const handleSelfGrade = (isRight: boolean) => {
    if (isRight) {
      setCorrectCount((prev) => prev + 1);
    }
    handleNext();
  };

  // Move to next question or complete
  const handleNext = () => {
    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTypedAnswer("");
      setHasSubmitted(false);
    } else {
      setIsCompleted(true);
      onQuizCompleted(correctCount, quizQuestions.length);
    }
  };

  // Restart active questions
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setTypedAnswer("");
    setHasSubmitted(false);
    setCorrectCount(0);
    setIsCompleted(false);
  };

  // Generate Custom Adaptive Quiz from server
  const handleGenerateCustomQuiz = async () => {
    if (!activeDoc) return;
    if (selectedTypes.length === 0) {
      setError("Please select at least one question type.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: activeDoc.id,
          content: activeDoc.content,
          difficulty,
          questionTypes: selectedTypes,
          numQuestions
        })
      });

      if (!res.ok) {
        throw new Error(await res.text() || "Failed to generate customized quiz.");
      }

      const data = await res.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions were returned from the mentor engine.");
      }

      setQuizQuestions(data.questions);
      
      // Save quiz to doc if callback is provided
      if (onUpdateDocumentQuiz) {
        onUpdateDocumentQuiz(activeDoc.id, data.questions);
      }
      
      // Reset state for new quiz
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setTypedAnswer("");
      setHasSubmitted(false);
      setCorrectCount(0);
      setIsCompleted(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not generate questions. Please check server logs.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  // Empty State - No documents loaded
  if (documents.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-6 bg-white border border-gray-200 rounded-3xl shadow-sm animate-fade-in" id="quiz-empty-docs">
        <HelpCircle className="h-14 w-14 text-indigo-400 mx-auto mb-4" />
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">No Study Materials Found</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          We need context to generate quizzes! Please compile lecture notes or upload PDFs to start practicing self-testing.
        </p>
      </div>
    );
  }

  // Active document selection state (No active doc chosen)
  if (!activeDoc) {
    return (
      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6" id="quiz-select-doc">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">
            Self-Testing Mastery
          </span>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mt-1">Smart Quiz Generator</h2>
          <p className="text-xs text-gray-400 font-semibold mt-2">
            Practice active recall and spatial rehearsal using AI-generated multiple choice, true/false, scenarios, and short answer drills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className="p-5 bg-white hover:bg-slate-50 border border-gray-200 hover:border-indigo-500/50 rounded-2xl text-left transition-all flex flex-col justify-between group h-44 shadow-3xs"
            >
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-1">
                  Ready to practice
                </span>
                <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 text-sm leading-snug">
                  {doc.title}
                </p>
              </div>
              <div className="flex items-center justify-between w-full border-t border-gray-100 pt-3 text-[11px] text-gray-400 font-semibold">
                <span>{doc.quiz ? doc.quiz.length : 0} Pre-compiled Questions</span>
                <span className="text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Configure & Start <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Quiz Form Configuration View (shown if doc has 0 questions or if we want custom setup)
  if (quizQuestions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-4 lg:p-8 space-y-6" id="quiz-config-view">
        <div className="flex items-center justify-between border-b border-gray-150 pb-4">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">
              Quiz Setup
            </span>
            <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none mt-1">
              Configure Quiz for: {activeDoc.title.length > 40 ? activeDoc.title.substring(0, 40) + "..." : activeDoc.title}
            </h3>
          </div>
          <button
            onClick={() => setSelectedDocId(null)}
            className="text-xs text-indigo-600 font-bold px-3 py-1.5 bg-indigo-50 rounded-xl"
          >
            Switch Topic
          </button>
        </div>

        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          {/* Difficulty options */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
              Adaptive Difficulty Level
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {["beginner", "intermediate", "advanced", "elite"].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-2.5 rounded-xl text-xs font-bold capitalize border transition-all ${
                    difficulty === level 
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-xs" 
                      : "bg-slate-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Number of questions */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
              Question Quantity
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {[5, 10, 15].map((num) => (
                <button
                  key={num}
                  onClick={() => setNumQuestions(num)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    numQuestions === num 
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-xs" 
                      : "bg-slate-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {num} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Question types selection */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
              Question Modalities
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "mcq", title: "Multiple Choice (MCQ)", desc: "Standard challenging 4-option question" },
                { id: "true_false", title: "True or False", desc: "Straightforward factual confirmation" },
                { id: "short_answer", title: "Short Answer Q&A", desc: "Type your answer, then self-evaluate details" },
                { id: "scenario", title: "Scenario-based Problem", desc: "Analyze a short realistic case study" }
              ].map((t) => {
                const isChecked = selectedTypes.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => handleToggleType(t.id)}
                    className={`p-4 text-left rounded-2xl border transition-all flex flex-col justify-between ${
                      isChecked 
                        ? "bg-indigo-50 border-indigo-500/80 text-indigo-900" 
                        : "bg-slate-50 border-gray-200 hover:bg-slate-100 text-gray-700"
                    }`}
                  >
                    <span className="text-xs font-bold block">{t.title}</span>
                    <span className="text-[10px] text-gray-400 font-semibold mt-1">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Action generate button */}
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={handleGenerateCustomQuiz}
              disabled={isGenerating || selectedTypes.length === 0}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                isGenerating 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating challenge questions with StudyMate AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4.5 w-4.5" />
                  Compile Customized Quiz
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const totalQuestions = quizQuestions.length;
  const qType = currentQuestion.type || "mcq";

  return (
    <div className="max-w-3xl mx-auto p-4 lg:p-8 space-y-6" id="quiz-active-view">
      
      {/* Quiz Progress header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
            ACTIVE EXAM PRACTICE
          </span>
          <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none">
            {activeDoc.title.length > 50 ? activeDoc.title.substring(0, 50) + "..." : activeDoc.title}
          </h3>
        </div>
        <div className="flex items-center gap-4 text-right">
          <button
            onClick={() => setQuizQuestions([])}
            className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all"
          >
            New Quiz Setup
          </button>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
              PROGRESS
            </span>
            <span className="text-sm font-black text-indigo-600">
              {isCompleted ? totalQuestions : currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {isCompleted ? (
        /* 🏆 Quiz Completed Screen */
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-center space-y-6 animate-fade-in" id="quiz-completion-screen">
          <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Award className="h-12 w-12 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h4 className="text-2xl font-black text-gray-900 tracking-tight">Quiz Session Finished!</h4>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Active testing trains memory retention. Here are your final grading results:
            </p>
          </div>

          {/* Performance Circle */}
          <div className="py-4 flex justify-center">
            <div className="relative h-32 w-32 rounded-full border-4 border-indigo-50 bg-[#F8F9FF] flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-indigo-600">
                {Math.round((correctCount / totalQuestions) * 100)}%
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                {correctCount} / {totalQuestions} right
              </span>
            </div>
          </div>

          {/* Evaluation message */}
          <div className="max-w-md mx-auto p-4 bg-slate-50 border border-gray-150 rounded-2xl text-xs text-gray-600 leading-relaxed">
            {correctCount === totalQuestions ? (
              <span className="text-indigo-600 font-bold block mb-1">👑 PERFECT 100%! (Master Badge Unlocked)</span>
            ) : correctCount >= totalQuestions * 0.8 ? (
              <span className="text-emerald-600 font-bold block mb-1">🌟 EXCELLENT COMPREHENSION!</span>
            ) : (
              <span className="text-amber-600 font-bold block mb-1">📚 GOOD ATTEMPT!</span>
            )}
            Reviewing your weak concepts using the Study Chatbot will accelerate long-term retention.
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
              id="quiz-retake-btn"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retake Quiz
            </button>
            <button
              onClick={() => setSelectedDocId(null)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/10 transition-all"
              id="quiz-choose-other-btn"
            >
              Choose Another Paper
            </button>
          </div>
        </div>
      ) : (
        /* 📝 Active Question Card */
        <div className="space-y-6" id="active-question-card">
          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300" 
              style={{ width: `${((currentQuestionIndex + (hasSubmitted ? 1 : 0)) / totalQuestions) * 100}%` }}
            />
          </div>

          <div className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            
            {/* Question Header Badge */}
            <div className="flex items-center gap-2 select-none">
              <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">
                Type: {qType.replace("_", " ")}
              </span>
            </div>

            {/* Question Text */}
            <h4 className="text-xl font-black text-gray-900 tracking-tight leading-snug">
              {currentQuestion.question}
            </h4>

            {/* Render based on Question Type */}
            {qType === "short_answer" ? (
              /* 📝 Text area for Short Answer */
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
                  Write your response below:
                </label>
                <textarea
                  disabled={hasSubmitted}
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="Draft your explanation or list keywords..."
                  rows={4}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 transition-all"
                />
              </div>
            ) : (
              /* 🔘 Options List (MCQ, True/False, Scenario-based MCQ) */
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctOptionIndex;
                  
                  // Color formatting classes
                  let optionStyle = "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800";
                  
                  if (hasSubmitted) {
                    if (isCorrect) {
                      optionStyle = "bg-green-50 border-green-200 text-green-900 font-bold ring-2 ring-green-100";
                    } else if (isSelected) {
                      optionStyle = "bg-red-50 border-red-200 text-red-900 font-bold ring-2 ring-red-100";
                    } else {
                      optionStyle = "bg-gray-50/50 border-gray-100 text-gray-400";
                    }
                  } else if (isSelected) {
                    optionStyle = "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold ring-2 ring-indigo-100";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={hasSubmitted}
                      onClick={() => handleOptionClick(idx)}
                      className={`w-full p-4 border rounded-2xl text-left text-sm font-medium transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                      id={`quiz-option-${idx}`}
                    >
                      <span>{option}</span>
                      {hasSubmitted && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />}
                      {hasSubmitted && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Answer Feedback Description Panel */}
            {hasSubmitted && (
              <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-xs text-indigo-950 leading-relaxed space-y-2 animate-fade-in">
                {qType === "short_answer" && currentQuestion.correctShortAnswer && (
                  <div className="space-y-1">
                    <p className="font-bold uppercase tracking-wider text-green-700 flex items-center gap-1.5 text-[10px]">
                      <UserCheck className="h-3.5 w-3.5" />
                      Expected Answer Guidelines & Keywords:
                    </p>
                    <p className="font-semibold text-green-900 italic bg-green-50/40 p-3 rounded-xl border border-green-100/50">
                      "{currentQuestion.correctShortAnswer}"
                    </p>
                  </div>
                )}
                
                <div className="space-y-1">
                  <p className="font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5 text-[10px]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Mentor Explanation:
                  </p>
                  <p className="font-medium text-indigo-900">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-5">
              <span className="text-[11px] text-gray-400 font-medium">
                {hasSubmitted 
                  ? (qType === "short_answer" ? "Assess your response above" : "Explanation revealed above") 
                  : (qType === "short_answer" ? "Type your explanation then submit" : "Choose your response then submit")}
              </span>
              
              {!hasSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={qType === "short_answer" ? !typedAnswer.trim() : selectedOption === null}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    (qType === "short_answer" ? typedAnswer.trim() : selectedOption !== null) 
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10 cursor-pointer" 
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  id="submit-answer-btn"
                >
                  Submit Response
                </button>
              ) : qType === "short_answer" ? (
                /* 🙋 Self-Grading buttons for short answer */
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelfGrade(false)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-100 transition-all flex items-center gap-1.5"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    I missed it
                  </button>
                  <button
                    onClick={() => handleSelfGrade(true)}
                    className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs rounded-xl border border-green-100 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    I got it correct!
                  </button>
                </div>
              ) : (
                /* Standard Next Button for MCQ/TF */
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  id="next-question-btn"
                >
                  {currentQuestionIndex + 1 === totalQuestions ? "Finish Quiz" : "Next Question"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
