import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Plus,
  Trash2,
  TrendingUp,
  Award,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { WhatIfSimulationResult } from "../../../types";

interface WhatIfSimulatorProps {
  onRunSimulation: (
    courses: Array<{
      courseCode: string;
      courseTitle: string;
      creditUnit: number;
      score: number;
      category: "Core" | "Elective" | "Required" | "General";
    }>
  ) => Promise<WhatIfSimulationResult>;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ onRunSimulation }) => {
  const [hypotheticalCourses, setHypotheticalCourses] = useState([
    { id: "1", courseCode: "CSC 401", courseTitle: "Artificial Intelligence & Expert Systems", creditUnit: 3, score: 85, category: "Core" as const },
    { id: "2", courseCode: "CSC 403", courseTitle: "Distributed Systems & Cloud Computing", creditUnit: 3, score: 80, category: "Core" as const },
    { id: "3", courseCode: "CSC 405", courseTitle: "Final Year Thesis Project Phase I", creditUnit: 4, score: 88, category: "Core" as const },
    { id: "4", courseCode: "CSC 407", courseTitle: "Compiler Construction", creditUnit: 3, score: 75, category: "Elective" as const },
  ]);

  const [simulationResult, setSimulationResult] = useState<WhatIfSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const addHypotheticalCourse = () => {
    setHypotheticalCourses((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        courseCode: `SIM ${300 + prev.length + 1}`,
        courseTitle: "Hypothetical Course",
        creditUnit: 3,
        score: 80,
        category: "Core",
      },
    ]);
  };

  const removeHypotheticalCourse = (id: string) => {
    if (hypotheticalCourses.length <= 1) return;
    setHypotheticalCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const updateHypotheticalCourse = (id: string, field: string, value: any) => {
    setHypotheticalCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await onRunSimulation(
        hypotheticalCourses.map((c) => ({
          courseCode: c.courseCode,
          courseTitle: c.courseTitle,
          creditUnit: c.creditUnit,
          score: c.score,
          category: c.category,
        }))
      );
      setSimulationResult(res);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> What-If CGPA Simulator & Sandbox
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate future term scores or retakes to project CGPA deltas and degree classification impact without affecting actual records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={addHypotheticalCourse}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 hover:bg-slate-100 transition-colors"
          >
            <Plus className="w-4 h-4 text-amber-500" /> Add Course
          </button>
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            {isSimulating ? "Simulating..." : "Run Simulation"}
          </button>
        </div>
      </div>

      {/* HYPOTHETICAL COURSES TABLE */}
      <div className="overflow-x-auto my-4 border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase text-[11px]">
            <tr>
              <th className="py-2.5 px-3">Simulated Code</th>
              <th className="py-2.5 px-3">Course Title</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3 text-center">Credit Units</th>
              <th className="py-2.5 px-3 text-center">Hypothetical Score</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {hypotheticalCourses.map((course) => (
              <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-2 px-3">
                  <input
                    type="text"
                    value={course.courseCode}
                    onChange={(e) => updateHypotheticalCourse(course.id, "courseCode", e.target.value)}
                    className="w-24 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-semibold"
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="text"
                    value={course.courseTitle}
                    onChange={(e) => updateHypotheticalCourse(course.id, "courseTitle", e.target.value)}
                    className="w-full min-w-[180px] px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </td>
                <td className="py-2 px-3">
                  <select
                    value={course.category}
                    onChange={(e) => updateHypotheticalCourse(course.id, "category", e.target.value)}
                    className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Core">Core</option>
                    <option value="Elective">Elective</option>
                    <option value="Required">Required</option>
                    <option value="General">General</option>
                  </select>
                </td>
                <td className="py-2 px-3 text-center">
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={course.creditUnit}
                    onChange={(e) => updateHypotheticalCourse(course.id, "creditUnit", parseInt(e.target.value) || 1)}
                    className="w-14 px-2 py-1 text-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  />
                </td>
                <td className="py-2 px-3 text-center">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={course.score}
                    onChange={(e) => updateHypotheticalCourse(course.id, "score", parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-amber-600 dark:text-amber-400"
                  />
                </td>
                <td className="py-2 px-3 text-center">
                  <button
                    onClick={() => removeHypotheticalCourse(course.id)}
                    disabled={hypotheticalCourses.length <= 1}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1 disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SIMULATION RESULTS CARD */}
      {simulationResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-5 rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border border-indigo-800 shadow-md"
        >
          <div className="flex items-center justify-between pb-3 border-b border-indigo-800/60 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Simulation Forecast Output
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-900 text-indigo-200 font-medium">
              Simulated Term GPA: <strong className="text-white">{simulationResult.simulatedSemesterGPA.toFixed(2)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <span className="text-[11px] text-slate-400 block uppercase">Current CGPA</span>
              <span className="text-2xl font-black text-slate-200">{simulationResult.currentCGPA.toFixed(2)}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block uppercase">Projected CGPA</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-300">{simulationResult.projectedCGPA.toFixed(2)}</span>
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    simulationResult.cgpaDelta >= 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {simulationResult.cgpaDelta >= 0 ? `+${simulationResult.cgpaDelta}` : `${simulationResult.cgpaDelta}`}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block uppercase">Projected Class</span>
              <span className="text-lg font-bold text-emerald-300 block leading-snug">
                {simulationResult.projectedGraduationClass}
              </span>
            </div>
          </div>

          {/* RECOMMENDATIONS */}
          <div className="p-3 rounded-lg bg-indigo-900/40 border border-indigo-800 text-xs text-indigo-200">
            <span className="font-bold flex items-center gap-1.5 mb-1 text-amber-300">
              <Lightbulb className="w-4 h-4 text-amber-400" /> Academic Strategy Recommendation:
            </span>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              {simulationResult.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
};
