import React from "react";
import { motion } from "framer-motion";
import {
  Award,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Sparkles,
  Zap,
} from "lucide-react";
import { AcademicIntelligenceDashboardData } from "../../../types";

interface GPAOverviewCardsProps {
  data: AcademicIntelligenceDashboardData;
  onOpenSimulator: () => void;
  onOpenTranscript: () => void;
}

export const GPAOverviewCards: React.FC<GPAOverviewCardsProps> = ({
  data,
  onOpenSimulator,
  onOpenTranscript,
}) => {
  const getCGPAColor = (cgpa: number, max: number) => {
    const ratio = cgpa / max;
    if (ratio >= 0.9) return "from-emerald-500 to-teal-600 text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400";
    if (ratio >= 0.7) return "from-indigo-500 to-blue-600 text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-400";
    if (ratio >= 0.5) return "from-amber-500 to-orange-600 text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400";
    return "from-rose-500 to-red-600 text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. CURRENT CGPA HIGHLIGHT CARD */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-indigo-100 dark:border-indigo-900 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white p-5 shadow-lg shadow-indigo-950/20"
      >
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-28 h-28 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" /> Cumulative CGPA
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-800/60 text-indigo-200 font-medium border border-indigo-700/50">
            {data.gradingScaleName}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-extrabold tracking-tight text-white">
            {data.currentCGPA.toFixed(2)}
          </span>
          <span className="text-sm font-medium text-indigo-300">
            / {data.maxGradePoint.toFixed(1)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-indigo-800/50">
          <span className="text-indigo-200 font-medium">Quality Points:</span>
          <span className="font-bold text-amber-300">{data.totalQualityPoints.toFixed(1)} pts</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            onClick={onOpenSimulator}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium transition-all flex items-center justify-center gap-1 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> What-If Simulator
          </button>
        </div>
      </motion.div>

      {/* 2. LATEST SEMESTER GPA CARD */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Latest Term GPA
          </span>
          {data.latestSemester && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              {data.latestSemester.semesterId}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {data.currentGPA.toFixed(2)}
          </span>
          <span className="text-sm font-medium text-slate-400">
            / {data.maxGradePoint.toFixed(1)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
          <span>Level / Session:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {data.latestSemester ? `${data.latestSemester.level} (${data.latestSemester.sessionId})` : "N/A"}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Semesters Recorded:</span>
          <span className="font-bold text-slate-900 dark:text-white">{data.totalSemestersRecorded}</span>
        </div>
      </motion.div>

      {/* 3. PREDICTED GRADUATION CLASS */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-500" /> Degree Projection
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-medium">
              Active
            </span>
          </div>

          <div className="mt-1 mb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {data.predictedGraduationClass}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Standing: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{data.academicStanding}</span>
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onOpenTranscript}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" /> Official Transcript
          </button>
        </div>
      </motion.div>

      {/* 4. DEGREE PROGRESS & UNITS */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-500" /> Degree Progress
          </span>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {data.degreeCompletionPercentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mb-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.degreeCompletionPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-slate-400 block">Earned Credits:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{data.earnedCredits} units</span>
          </div>
          <div>
            <span className="text-slate-400 block">Remaining:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{data.creditsRemaining} units</span>
          </div>
        </div>

        {data.failedCoursesCount > 0 ? (
          <div className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{data.failedCoursesCount} Carry-over course(s) pending</span>
          </div>
        ) : (
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Zero pending carry-overs</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
