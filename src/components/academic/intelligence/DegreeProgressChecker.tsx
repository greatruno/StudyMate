import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  GraduationCap,
  BookOpen,
  Layers,
  Award,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { DegreeProgressBreakdown, GraduationEligibilityResult } from "../../../types";

interface DegreeProgressCheckerProps {
  progress: DegreeProgressBreakdown;
  eligibility: GraduationEligibilityResult;
  cgpa: number;
}

export const DegreeProgressChecker: React.FC<DegreeProgressCheckerProps> = ({
  progress,
  eligibility,
  cgpa,
}) => {
  const getStatusBadge = (status: GraduationEligibilityResult["status"]) => {
    if (status === "Eligible") {
      return (
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Fully Eligible for Graduation
        </span>
      );
    }
    if (status === "Almost Eligible") {
      return (
        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 border border-amber-300 dark:border-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Almost Eligible (Final Units Pending)
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 border border-rose-300 dark:border-rose-800">
        <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Requirements Pending
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Degree Progress & Graduation Audit Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated verification of core credits, elective requirements, GST compliance, and minimum CGPA benchmarks.
          </p>
        </div>

        <div>{getStatusBadge(eligibility.status)}</div>
      </div>

      {/* OVERALL DEGREE BAR */}
      <div className="my-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Overall Degree Completion Progress
          </span>
          <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
            {progress.completedCredits} / {progress.totalRequiredCredits} Units ({progress.completionPercentage}%)
          </span>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.completionPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 h-3 rounded-full"
          />
        </div>
      </div>

      {/* CATEGORY BREAKDOWN BARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Core Courses */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" /> Core Departmental Units
            </span>
            <span className="font-bold text-slate-600 dark:text-slate-400">
              {progress.coreCompleted} / {progress.coreRequired}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{ width: `${Math.min(100, (progress.coreCompleted / progress.coreRequired) * 100)}%` }}
            />
          </div>
        </div>

        {/* Electives */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-500" /> Departmental Electives
            </span>
            <span className="font-bold text-slate-600 dark:text-slate-400">
              {progress.electiveCompleted} / {progress.electiveRequired}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${Math.min(100, (progress.electiveCompleted / progress.electiveRequired) * 100)}%` }}
            />
          </div>
        </div>

        {/* General Studies / GST */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-teal-500" /> General Studies (GST)
            </span>
            <span className="font-bold text-slate-600 dark:text-slate-400">
              {progress.generalCompleted} / {progress.generalRequired}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-teal-600 h-2 rounded-full"
              style={{ width: `${Math.min(100, (progress.generalCompleted / progress.generalRequired) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* REQUIREMENTS CHECKLIST GRID */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/30">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
          Institutional Clearance Audit Checklist
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {eligibility.passedMinCredits ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Minimum Credit Units Benchmark</span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Completed {progress.completedCredits} out of minimum {progress.totalRequiredCredits} required units.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {eligibility.passedCoreCredits ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Departmental Core Requirement</span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Earned {progress.coreCompleted} core course units (minimum required: {progress.coreRequired}).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {eligibility.passedMinCGPA ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Minimum Cumulative CGPA Benchmark</span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Current CGPA is {cgpa.toFixed(2)} (Minimum passing CGPA: 1.00).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {!eligibility.hasOutstandingFailedCourses ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Unpassed / Failed Course Audit</span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {!eligibility.hasOutstandingFailedCourses
                  ? "Zero active carry-overs or failed core courses."
                  : "Has active carry-over courses requiring clearance."}
              </p>
            </div>
          </div>
        </div>

        {/* REASONS & RECOMMENDATIONS */}
        {eligibility.reasons.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
            <span className="font-bold flex items-center gap-1 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" /> Clearance Recommendations & Action Plan:
            </span>
            <ul className="list-disc pl-5 space-y-1">
              {eligibility.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
