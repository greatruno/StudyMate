import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  BookOpen,
  Info,
} from "lucide-react";
import { GradingScale } from "../../../types";

interface CourseRowInput {
  id: string;
  courseCode: string;
  courseTitle: string;
  creditUnit: number;
  score: number;
  category: "Core" | "Elective" | "Required" | "General";
}

interface SemesterGPACalculatorProps {
  gradingScale?: GradingScale;
  onSaveSemesterResult: (payload: {
    sessionId: string;
    semesterId: string;
    level: string;
    courses: Array<{
      courseCode: string;
      courseTitle: string;
      creditUnit: number;
      score: number;
      category: "Core" | "Elective" | "Required" | "General";
    }>;
  }) => Promise<void>;
}

export const SemesterGPACalculator: React.FC<SemesterGPACalculatorProps> = ({
  gradingScale,
  onSaveSemesterResult,
}) => {
  const [sessionId, setSessionId] = useState("2023/2024");
  const [semesterId, setSemesterId] = useState("2nd Semester");
  const [level, setLevel] = useState("200 Level");

  const [courses, setCourses] = useState<CourseRowInput[]>([
    { id: "1", courseCode: "CSC 202", courseTitle: "Database Management Systems", creditUnit: 3, score: 78, category: "Core" },
    { id: "2", courseCode: "CSC 204", courseTitle: "Computer Architecture & Organization", creditUnit: 3, score: 72, category: "Core" },
    { id: "3", courseCode: "MTH 202", courseTitle: "Numerical Analysis I", creditUnit: 3, score: 65, category: "Core" },
    { id: "4", courseCode: "GST 202", courseTitle: "Entrepreneurship & Innovation", creditUnit: 2, score: 81, category: "General" },
    { id: "5", courseCode: "CSC 206", courseTitle: "Software Engineering Principles", creditUnit: 3, score: 85, category: "Elective" },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const resolveGradePoint = (score: number) => {
    if (score >= 70) return { letter: "A", point: 5.0, remark: "Excellent" };
    if (score >= 60) return { letter: "B", point: 4.0, remark: "Very Good" };
    if (score >= 50) return { letter: "C", point: 3.0, remark: "Good" };
    if (score >= 45) return { letter: "D", point: 2.0, remark: "Fair" };
    if (score >= 40) return { letter: "E", point: 1.0, remark: "Pass" };
    return { letter: "F", point: 0.0, remark: "Fail" };
  };

  const addCourseRow = () => {
    const newId = String(Date.now());
    setCourses((prev) => [
      ...prev,
      {
        id: newId,
        courseCode: `CSC ${200 + prev.length + 1}`,
        courseTitle: "New Academic Course",
        creditUnit: 3,
        score: 70,
        category: "Core",
      },
    ]);
  };

  const removeCourseRow = (id: string) => {
    if (courses.length <= 1) return;
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCourseRow = (id: string, field: keyof CourseRowInput, value: any) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // On-the-fly math calculation
  let totalUnits = 0;
  let totalQualityPoints = 0;
  let passedUnits = 0;
  let failedUnits = 0;

  const calculatedRows = courses.map((course) => {
    const grade = resolveGradePoint(course.score);
    const qp = course.creditUnit * grade.point;
    totalUnits += course.creditUnit;
    totalQualityPoints += qp;
    if (grade.point > 0) passedUnits += course.creditUnit;
    else failedUnits += course.creditUnit;

    return {
      ...course,
      letterGrade: grade.letter,
      gradePoint: grade.point,
      qualityPoints: qp,
      remark: grade.remark,
    };
  });

  const calculatedGPA = totalUnits > 0 ? totalQualityPoints / totalUnits : 0;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSemesterResult({
        sessionId,
        semesterId,
        level,
        courses: courses.map((c) => ({
          courseCode: c.courseCode,
          courseTitle: c.courseTitle,
          creditUnit: c.creditUnit,
          score: c.score,
          category: c.category,
        })),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save semester result:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Semester Result Manager & GPA Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Input course scores and credit units for instant GPA, Quality Point, and pass/fail calculations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={addCourseRow}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-indigo-500" /> Add Course
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveSuccess ? "Record Saved!" : "Save to Academic History"}
          </button>
        </div>
      </div>

      {/* METADATA BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Academic Session
          </label>
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Semester
          </label>
          <select
            value={semesterId}
            onChange={(e) => setSemesterId(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
          >
            <option value="1st Semester">1st Semester</option>
            <option value="2nd Semester">2nd Semester</option>
            <option value="Summer Semester">Summer Semester</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Level
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
          >
            <option value="100 Level">100 Level</option>
            <option value="200 Level">200 Level</option>
            <option value="300 Level">300 Level</option>
            <option value="400 Level">400 Level</option>
            <option value="500 Level">500 Level</option>
          </select>
        </div>
      </div>

      {/* COURSES TABLE */}
      <div className="overflow-x-auto my-4 border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Course Code</th>
              <th className="py-2.5 px-3">Course Title</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3 text-center">Units</th>
              <th className="py-2.5 px-3 text-center">Score (0-100)</th>
              <th className="py-2.5 px-3 text-center">Grade</th>
              <th className="py-2.5 px-3 text-center">Grade Point</th>
              <th className="py-2.5 px-3 text-center">Quality Points</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {calculatedRows.map((course) => (
              <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-2 px-3">
                  <input
                    type="text"
                    value={course.courseCode}
                    onChange={(e) => updateCourseRow(course.id, "courseCode", e.target.value)}
                    className="w-24 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-semibold"
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="text"
                    value={course.courseTitle}
                    onChange={(e) => updateCourseRow(course.id, "courseTitle", e.target.value)}
                    className="w-full min-w-[180px] px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </td>
                <td className="py-2 px-3">
                  <select
                    value={course.category}
                    onChange={(e) => updateCourseRow(course.id, "category", e.target.value as any)}
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
                    onChange={(e) => updateCourseRow(course.id, "creditUnit", parseInt(e.target.value) || 1)}
                    className="w-14 px-2 py-1 text-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  />
                </td>
                <td className="py-2 px-3 text-center">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={course.score}
                    onChange={(e) => updateCourseRow(course.id, "score", parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  />
                </td>
                <td className="py-2 px-3 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded font-extrabold text-xs ${
                      course.gradePoint >= 4.0
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : course.gradePoint >= 2.0
                        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    }`}
                  >
                    {course.letterGrade}
                  </span>
                </td>
                <td className="py-2 px-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                  {course.gradePoint.toFixed(1)}
                </td>
                <td className="py-2 px-3 text-center font-bold text-amber-600 dark:text-amber-400">
                  {course.qualityPoints.toFixed(1)}
                </td>
                <td className="py-2 px-3 text-center">
                  <button
                    onClick={() => removeCourseRow(course.id)}
                    disabled={courses.length <= 1}
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1 disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SUMMARY RESULTS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-indigo-900 shadow-md">
        <div>
          <span className="text-[11px] text-slate-400 block uppercase font-medium">Registered Units</span>
          <span className="text-xl font-extrabold text-white">{totalUnits} Units</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block uppercase font-medium">Total Quality Points</span>
          <span className="text-xl font-extrabold text-amber-400">{totalQualityPoints.toFixed(1)} pts</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block uppercase font-medium">Passed / Failed</span>
          <span className="text-xl font-extrabold text-emerald-400">
            {passedUnits} <span className="text-xs text-slate-400 font-normal">passed</span> /{" "}
            <span className="text-rose-400">{failedUnits}</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-indigo-300 block uppercase font-bold">Calculated Term GPA</span>
          <span className="text-2xl font-black text-amber-300 tracking-tight">{calculatedGPA.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
