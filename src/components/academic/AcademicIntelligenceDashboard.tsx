import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Calculator,
  BookOpen,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  FileText,
  Layers,
  AlertCircle,
} from "lucide-react";

import { GPAOverviewCards } from "./intelligence/GPAOverviewCards";
import { SemesterGPACalculator } from "./intelligence/SemesterGPACalculator";
import { TranscriptViewer } from "./intelligence/TranscriptViewer";
import { DegreeProgressChecker } from "./intelligence/DegreeProgressChecker";
import { CourseRetakeAnalyzer } from "./intelligence/CourseRetakeAnalyzer";
import { WhatIfSimulator } from "./intelligence/WhatIfSimulator";
import { GradingScaleConfigurator } from "./intelligence/GradingScaleConfigurator";

import {
  AcademicIntelligenceDashboardData,
  TranscriptData,
  DegreeProgressBreakdown,
  GraduationEligibilityResult,
  CourseRetakeSummary,
  WhatIfSimulationResult,
} from "../../types";

export const AcademicIntelligenceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "calculator" | "transcript" | "progress" | "simulator" | "retakes" | "settings"
  >("overview");

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<AcademicIntelligenceDashboardData | null>(null);
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);
  const [progressData, setProgressData] = useState<{
    progress: DegreeProgressBreakdown;
    eligibility: GraduationEligibilityResult;
    cgpa: number;
  } | null>(null);
  const [retakeData, setRetakeData] = useState<CourseRetakeSummary | null>(null);

  const fetchAllIntelligenceData = async () => {
    setLoading(true);
    try {
      const [dashRes, transRes, progRes, retakeRes] = await Promise.all([
        fetch("/api/v1/academic-intelligence/dashboard"),
        fetch("/api/v1/academic-intelligence/transcript"),
        fetch("/api/v1/academic-intelligence/degree-progress"),
        fetch("/api/v1/academic-intelligence/retake-analysis"),
      ]);

      if (dashRes.ok) {
        const d = await dashRes.json();
        if (d.success) setDashboardData(d.data);
      }
      if (transRes.ok) {
        const t = await transRes.json();
        if (t.success) setTranscriptData(t.data);
      }
      if (progRes.ok) {
        const p = await progRes.json();
        if (p.success) setProgressData(p.data);
      }
      if (retakeRes.ok) {
        const r = await retakeRes.json();
        if (r.success) setRetakeData(r.data);
      }
    } catch (error) {
      console.error("Failed to load Academic Intelligence metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllIntelligenceData();
  }, []);

  const handleSaveSemesterResult = async (payload: any) => {
    try {
      const res = await fetch("/api/v1/academic-intelligence/semester-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchAllIntelligenceData();
      }
    } catch (err) {
      console.error("Failed to save semester result:", err);
    }
  };

  const handleRunSimulation = async (courses: any[]): Promise<WhatIfSimulationResult> => {
    const res = await fetch("/api/v1/academic-intelligence/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courses }),
    });
    const data = await res.json();
    return data.data;
  };

  const handleUpdateGradingScale = async (scaleType: "5.0" | "4.0" | "custom", customScale?: any) => {
    await fetch("/api/v1/academic-intelligence/grading-scale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scaleType, customScale }),
    });
    await fetchAllIntelligenceData();
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 dark:text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-xs font-semibold">Initializing Academic Intelligence Engine...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* PAGE TITLE BANNER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
              Phase 3.2 Flagship Engine
            </span>
            <span className="text-xs font-medium text-slate-400">StudyMate v0.5.0-B</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Academic Intelligence Platform
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time GPA/CGPA computation, degree progress tracking, transcript generation & what-if scenario forecasting.
          </p>
        </div>

        <button
          onClick={fetchAllIntelligenceData}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start md:self-auto shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-500" /> Refresh Intelligence
        </button>
      </div>

      {/* OVERVIEW METRIC CARDS (Always visible) */}
      {dashboardData && (
        <GPAOverviewCards
          data={dashboardData}
          onOpenSimulator={() => setActiveTab("simulator")}
          onOpenTranscript={() => setActiveTab("transcript")}
        />
      )}

      {/* SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 border-b border-slate-200 dark:border-slate-800 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Performance History
        </button>

        <button
          onClick={() => setActiveTab("calculator")}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === "calculator"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Calculator className="w-4 h-4" /> Term Result Manager
        </button>

        <button
          onClick={() => setActiveTab("transcript")}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === "transcript"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" /> Academic Transcript
        </button>

        <button
          onClick={() => setActiveTab("progress")}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === "progress"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Graduation Audit
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === "simulator"
              ? "bg-amber-500 text-slate-950 font-black shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4 text-slate-900" /> What-If Simulator
        </button>

        <button
          onClick={() => setActiveTab("retakes")}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === "retakes"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <RefreshCw className="w-4 h-4" /> Retake & Carry-Overs
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === "settings"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Settings className="w-4 h-4" /> Grading System
        </button>
      </div>

      {/* TAB CONTENTS */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && dashboardData && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> Academic Progression Curve (Semester CGPA Trend)
            </h3>

            <div className="space-y-3">
              {dashboardData.semesterHistory.map((sem) => (
                <div
                  key={sem.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {sem.level} — {sem.sessionId} ({sem.semesterId})
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Registered Credits: {sem.credits} Units
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold">
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase">Term GPA</span>
                      <span className="text-indigo-600 dark:text-indigo-400 text-sm">{sem.gpa.toFixed(2)}</span>
                    </div>

                    <div className="text-right border-l border-slate-200 dark:border-slate-800 pl-4">
                      <span className="text-slate-400 block text-[10px] uppercase">Running CGPA</span>
                      <span className="text-amber-600 dark:text-amber-400 text-sm">{sem.runningCGPA.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "calculator" && (
          <motion.div
            key="calculator"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <SemesterGPACalculator
              gradingScale={undefined}
              onSaveSemesterResult={handleSaveSemesterResult}
            />
          </motion.div>
        )}

        {activeTab === "transcript" && transcriptData && (
          <motion.div
            key="transcript"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <TranscriptViewer transcript={transcriptData} />
          </motion.div>
        )}

        {activeTab === "progress" && progressData && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <DegreeProgressChecker
              progress={progressData.progress}
              eligibility={progressData.eligibility}
              cgpa={progressData.cgpa}
            />
          </motion.div>
        )}

        {activeTab === "simulator" && (
          <motion.div
            key="simulator"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <WhatIfSimulator onRunSimulation={handleRunSimulation} />
          </motion.div>
        )}

        {activeTab === "retakes" && retakeData && (
          <motion.div
            key="retakes"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <CourseRetakeAnalyzer retakeData={retakeData} />
          </motion.div>
        )}

        {activeTab === "settings" && dashboardData && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <GradingScaleConfigurator
              currentScaleName={dashboardData.gradingScaleName}
              maxPoint={dashboardData.maxGradePoint}
              onUpdateScale={handleUpdateGradingScale}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AcademicIntelligenceDashboard;
