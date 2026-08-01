import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ChevronRight, 
  BookMarked,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { DocumentItem, UserAccount } from "../types";

interface StudyPlannerViewProps {
  documents: DocumentItem[];
  currentUser: UserAccount | null;
  onUpdateProfile: (updated: Partial<UserAccount>) => void;
  setActiveTab: (tab: string) => void;
}

export default function StudyPlannerView({
  documents,
  currentUser,
  onUpdateProfile,
  setActiveTab
}: StudyPlannerViewProps) {
  const [examDate, setExamDate] = useState("");
  const [dailyHours, setDailyHours] = useState(2);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [customSubject, setCustomSubject] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(() => {
    // Default to unique subject names in the documents if available
    const docSubjects = documents.map(d => d.subject || d.summary?.subject).filter((s): s is string => !!s);
    return Array.from(new Set(docSubjects)).slice(0, 3);
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const activePlan = currentUser?.studyPlan || null;

  // Toggle subject selection
  const handleToggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== sub));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  // Add custom subject
  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSubject.trim() && !selectedSubjects.includes(customSubject.trim())) {
      setSelectedSubjects([...selectedSubjects, customSubject.trim()]);
      setCustomSubject("");
    }
  };

  // Trigger study plan generation via AI endpoint
  const handleGeneratePlan = async () => {
    if (!examDate) {
      setError("Please select a target exam date.");
      return;
    }
    if (selectedSubjects.length === 0) {
      setError("Please select or add at least one study subject.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/generate/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examDate,
          dailyHours,
          subjects: selectedSubjects,
          difficulty
        })
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Failed to generate study plan.");
      }

      const generatedPlan = await response.json();
      
      // Save to user profile persistently
      onUpdateProfile({
        studyPlan: generatedPlan
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while compiling your study plan. Please check your network connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle completion of a specific day's tasks
  const handleToggleDayCompleted = (weekIndex: number, dayIndex: number) => {
    if (!activePlan) return;

    const updatedWeeks = activePlan.weeks.map((week, wIdx) => {
      if (wIdx !== weekIndex) return week;
      
      return {
        ...week,
        days: week.days.map((day, dIdx) => {
          if (dIdx !== dayIndex) return day;
          return { ...day, completed: !day.completed };
        })
      };
    });

    onUpdateProfile({
      studyPlan: {
        ...activePlan,
        weeks: updatedWeeks
      }
    });
  };

  // Delete current active study plan
  const handleDeletePlan = () => {
    if (confirm("Are you sure you want to reset your current study schedule?")) {
      onUpdateProfile({
        studyPlan: undefined
      });
    }
  };

  // Unique document subjects
  const availableDocSubjects = Array.from(
    new Set(documents.map(d => d.subject || d.summary?.subject).filter((s): s is string => !!s))
  );

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6" id="planner-view">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">
            Adaptive Mentorship
          </span>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mt-1">
            AI Study Planner
          </h2>
          <p className="text-xs text-gray-400 font-semibold mt-2">
            Build custom study schedules leading to your exams, with daily actionable tasks and micro-targets.
          </p>
        </div>

        {activePlan && (
          <button
            onClick={handleDeletePlan}
            className="self-start sm:self-auto px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
            id="planner-reset-btn"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Reset Schedule
          </button>
        )}
      </div>

      {activePlan ? (
        /* 📅 ACTIVE PLAN DISPLAY VIEW */
        <div className="space-y-6" id="planner-active-display">
          
          {/* Plan Meta Card */}
          <div className="bg-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">
                Study Plan Overview
              </span>
              <h3 className="text-xl font-black tracking-tight leading-none">
                Exam target date: {new Date(activePlan.examDate).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </h3>
              <div className="flex flex-wrap gap-2 text-xs text-slate-400 font-medium pt-1">
                <span>• {activePlan.dailyHours} hrs/day</span>
                <span>• {activePlan.difficulty.toUpperCase()} level</span>
                <span>• {activePlan.subjects.join(", ")}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
              <div className="text-center md:text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Completed Tasks
                </span>
                <span className="text-3xl font-black text-indigo-400">
                  {activePlan.weeks.reduce((acc, w) => acc + w.days.filter(d => d.completed).length, 0)}
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  {" "}/ {activePlan.weeks.reduce((acc, w) => acc + w.days.length, 0)} days
                </span>
              </div>
            </div>
          </div>

          {/* Schedule Weeks Breakdown */}
          <div className="space-y-6">
            {activePlan.weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
                
                {/* Week Header */}
                <div className="bg-slate-50 border-b border-gray-150 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white text-xs font-black flex items-center justify-center select-none">
                      W{week.weekNumber}
                    </div>
                    <h4 className="font-bold text-gray-900 tracking-tight text-sm">
                      Week {week.weekNumber}: <span className="text-indigo-600">{week.focus}</span>
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {week.days.filter(d => d.completed).length} / {week.days.length} Completed
                  </span>
                </div>

                {/* Week Days Table/Grid */}
                <div className="divide-y divide-gray-100">
                  {week.days.map((day, dayIdx) => (
                    <div 
                      key={dayIdx} 
                      className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                        day.completed ? "bg-slate-50/50 text-gray-400" : "bg-white hover:bg-slate-50/30 text-gray-800"
                      }`}
                    >
                      {/* Left Block: Day Name & Topics */}
                      <div className="flex items-start gap-4 min-w-0">
                        <button
                          onClick={() => handleToggleDayCompleted(weekIdx, dayIdx)}
                          className={`mt-0.5 rounded-full p-0.5 border-2 shrink-0 transition-all ${
                            day.completed 
                              ? "bg-green-500 border-green-500 text-white" 
                              : "border-gray-300 hover:border-indigo-500 text-transparent"
                          }`}
                          id={`complete-day-${weekIdx}-${dayIdx}`}
                        >
                          <CheckCircle2 className="h-4.5 w-4.5" />
                        </button>

                        <div className="min-w-0 space-y-1">
                          <p className={`text-sm font-bold ${day.completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                            {day.dayName} • <span className="text-xs text-gray-500 font-semibold">{day.durationMinutes} mins</span>
                          </p>
                          <ul className="flex flex-wrap gap-1.5 pt-1">
                            {day.topics.map((t, idx) => (
                              <li 
                                key={idx} 
                                className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                                  day.completed 
                                    ? "bg-gray-100 text-gray-400" 
                                    : "bg-indigo-50 text-indigo-800 border border-indigo-100/30"
                                }`}
                              >
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Right Block: Action Recommendation Pill */}
                      <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                        <div className={`text-xs px-3 py-2 rounded-xl border flex items-center gap-1.5 font-bold ${
                          day.completed 
                            ? "bg-gray-50 border-gray-200 text-gray-400" 
                            : "bg-amber-50/70 border-amber-100 text-amber-800"
                        }`}>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>AI Mentor Rec: {day.recommendation}</span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>

        </div>
      ) : (
        /* 📝 CREATE PLAN FORM VIEW */
        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6" id="planner-form">
          <div className="space-y-1 border-b border-gray-150 pb-4">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Configure Your Prep Schedule</h3>
            <p className="text-xs text-gray-500">Provide exam targets and StudyMate will compile a customized learning calendar.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Exam Date Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-indigo-600" />
                When is your exam?
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 transition-all"
                id="planner-exam-date"
              />
            </div>

            {/* Daily study time */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-indigo-600" />
                Available Study Time Daily
              </label>
              <select
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 transition-all"
                id="planner-daily-hours"
              >
                <option value={1}>1 hour per day</option>
                <option value={2}>2 hours per day (Recommended)</option>
                <option value={3}>3 hours per day</option>
                <option value={4}>4 hours per day</option>
                <option value={6}>6 hours per day (Intensive)</option>
              </select>
            </div>

            {/* Adaptability/Difficulty level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                Academic Intensity Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 transition-all"
                id="planner-difficulty"
              >
                <option value="beginner">Beginner (Slow-paced, terminologies first)</option>
                <option value="intermediate">Intermediate (Standard conceptual balance)</option>
                <option value="advanced">Advanced (Fast-paced, high application drills)</option>
                <option value="elite">Elite (Intense research, challenging proof drills)</option>
              </select>
            </div>

            {/* Custom subjects adder */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                Custom Subjects List
              </label>
              <form onSubmit={handleAddCustomSubject} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Organic Chemistry"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-indigo-500 transition-all"
                  id="planner-custom-subject-input"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
                  id="planner-add-subject-btn"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </form>
            </div>

          </div>

          {/* Core Subjects Multi-Selector */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
              Choose Target Subjects for This Schedule:
            </span>
            
            {/* Display list of document subjects and any custom subjects */}
            <div className="flex flex-wrap gap-2">
              {/* Document subjects */}
              {availableDocSubjects.map((sub) => {
                const isSelected = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    onClick={() => handleToggleSubject(sub)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isSelected 
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-xs" 
                        : "bg-slate-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    📚 {sub}
                  </button>
                );
              })}
              {/* Other subjects that were manually added and are not in documents */}
              {selectedSubjects
                .filter(s => !availableDocSubjects.includes(s))
                .map((sub) => (
                  <button
                    key={sub}
                    onClick={() => handleToggleSubject(sub)}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all border bg-indigo-600 border-indigo-600 text-white shadow-xs flex items-center gap-1.5"
                  >
                    📝 {sub}
                    <span className="text-[10px] opacity-75">✕</span>
                  </button>
                ))
              }
            </div>

            {selectedSubjects.length === 0 && (
              <p className="text-xs text-amber-600 font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                Please choose or add at least one subject to generate your study plan.
              </p>
            )}
          </div>

          {/* Action trigger button */}
          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating || selectedSubjects.length === 0 || !examDate}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                isGenerating || selectedSubjects.length === 0 || !examDate
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 cursor-pointer"
              }`}
              id="planner-generate-btn"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing calendars & generating tailored schedules with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4.5 w-4.5" />
                  Generate Custom AI Study Plan
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
