import React from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { CourseRetakeSummary } from "../../../types";

interface CourseRetakeAnalyzerProps {
  retakeData: CourseRetakeSummary;
}

export const CourseRetakeAnalyzer: React.FC<CourseRetakeAnalyzerProps> = ({ retakeData }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Course Retake & Carry-Over Analyzer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tracks repeated course attempts, carry-over resolution, and Quality Point recovery metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            +{retakeData.qualityPointsRecovered.toFixed(1)} Quality Points Recovered
          </span>
        </div>
      </div>

      {/* METRIC BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-400 block text-[11px] font-semibold uppercase">Retaken Courses</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {retakeData.retakenCoursesCount} Courses
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-400 block text-[11px] font-semibold uppercase">Pending Carry-Overs</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
            {retakeData.activeCarryOversCount} Pending
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-400 block text-[11px] font-semibold uppercase">Net Point Delta</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            +{retakeData.qualityPointsRecovered.toFixed(1)} QP
          </span>
        </div>
      </div>

      {/* RETAKE DETAILS LIST */}
      {retakeData.retakeDetails.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs">
          <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="font-semibold text-slate-800 dark:text-slate-200">Pristine Academic Record</p>
          <p className="text-slate-400 mt-1">Zero failed or retaken courses recorded in your history!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {retakeData.retakeDetails.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {item.courseCode}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {item.courseTitle}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">({item.creditUnit} Units)</span>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    item.status === "Cleared"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
                      : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              {/* ATTEMPTS TIMELINE */}
              <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold text-[11px] uppercase">Attempt History:</span>
                {item.attempts.map((att, aIdx) => (
                  <React.Fragment key={aIdx}>
                    {aIdx > 0 && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 font-medium text-[11px]">{att.semesterId}:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{att.score}%</span>
                      <span
                        className={`font-black px-1.5 py-0.5 rounded text-[10px] ${
                          att.passed
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300"
                        }`}
                      >
                        {att.letterGrade} ({att.gradePoint.toFixed(1)})
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
