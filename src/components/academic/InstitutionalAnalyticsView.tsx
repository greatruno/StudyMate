import React, { useState, useEffect } from "react";
import {
  BarChart2,
  TrendingUp,
  PieChart,
  Users,
  CheckCircle2,
  AlertCircle,
  Download,
  BookOpen,
  Award,
  Calendar,
  Layers
} from "lucide-react";
import { InstitutionalMetrics } from "../../types";

export default function InstitutionalAnalyticsView() {
  const [metrics, setMetrics] = useState<InstitutionalMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/academic/analytics").then(r => r.json());
      if (res.success) setMetrics(res.data);
    } catch (err: any) {
      console.error("Error fetching institutional analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportSummary = () => {
    if (!metrics) return;
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(metrics, null, 2))}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", "Institutional_Academic_Analytics_Report.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading || !metrics) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-gray-600">Loading Institutional Analytics...</p>
      </div>
    );
  }

  const totalGrades = metrics.gradeDistributionCurve.gradeA + metrics.gradeDistributionCurve.gradeB + metrics.gradeDistributionCurve.gradeC + metrics.gradeDistributionCurve.gradeD + metrics.gradeDistributionCurve.gradeF;

  return (
    <div className="space-y-6" id="institutional-analytics-view">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-bold text-indigo-300 uppercase tracking-widest">
              <BarChart2 className="w-3.5 h-3.5" /> Institution Analytics & Performance Engine
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight">
              Academic Intelligence & Grade Curves
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl font-medium">
              High-level institutional statistics on enrollment, grade distribution, attendance rates, assignment completion, and departmental performance.
            </p>
          </div>

          <button
            onClick={handleExportSummary}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start md:self-auto"
          >
            <Download className="w-4 h-4" /> Export Analytics JSON
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Enrolled Students</span>
          <p className="text-2xl font-black text-indigo-600">{metrics.totalEnrolledStudents}</p>
          <p className="text-[11px] text-gray-500">Across {metrics.totalFaculties} Faculties & {metrics.totalDepartments} Departments</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Active Faculty Lecturers</span>
          <p className="text-2xl font-black text-emerald-600">{metrics.totalActiveLecturers}</p>
          <p className="text-[11px] text-gray-500">Professors, TAs & Instructors</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Avg Class Attendance Rate</span>
          <p className="text-2xl font-black text-amber-600">{metrics.averageClassAttendanceRate}%</p>
          <p className="text-[11px] text-emerald-600 font-bold">+2.4% vs prior semester</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Assignment Completion</span>
          <p className="text-2xl font-black text-teal-600">{metrics.averageAssignmentCompletionRate}%</p>
          <p className="text-[11px] text-gray-500">Rubric-graded assignments</p>
        </div>
      </div>

      {/* Grade Distribution Curve */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" /> Grade Distribution Bell Curve
          </h3>
          <span className="text-xs text-gray-500 font-semibold">Total Evaluated Grades: {totalGrades}%</span>
        </div>

        <div className="grid grid-cols-5 gap-3 pt-2 text-center">
          {[
            { grade: "A (4.0)", pct: metrics.gradeDistributionCurve.gradeA, color: "bg-emerald-500", text: "text-emerald-700" },
            { grade: "B (3.0)", pct: metrics.gradeDistributionCurve.gradeB, color: "bg-indigo-500", text: "text-indigo-700" },
            { grade: "C (2.0)", pct: metrics.gradeDistributionCurve.gradeC, color: "bg-amber-500", text: "text-amber-700" },
            { grade: "D (1.0)", pct: metrics.gradeDistributionCurve.gradeD, color: "bg-orange-500", text: "text-orange-700" },
            { grade: "F (0.0)", pct: metrics.gradeDistributionCurve.gradeF, color: "bg-rose-500", text: "text-rose-700" },
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-gray-150 space-y-2">
              <span className={`text-xs font-black ${item.text}`}>{item.grade}</span>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
              </div>
              <p className="text-sm font-black text-gray-900">{item.pct}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Departmental Performance */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" /> Departmental Average GPA Performance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.departmentPerformance.map((dept, idx) => (
            <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-gray-150 flex items-center justify-between">
              <div className="space-y-1">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[10px] font-extrabold">
                  {dept.departmentCode}
                </span>
                <h4 className="text-sm font-bold text-gray-900">{dept.departmentName}</h4>
                <p className="text-xs text-gray-500">{dept.studentsCount} Active Enrolled Students</p>
              </div>

              <div className="text-right">
                <p className="text-xl font-black text-indigo-600">{dept.avgGpa}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Avg CGPA</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
