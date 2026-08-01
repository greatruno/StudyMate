import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  FileText,
  HelpCircle,
  AlertTriangle,
  Send,
  Copy,
  Check,
  BookOpen,
  BrainCircuit,
  Sliders,
  ShieldAlert,
  ListChecks
} from "lucide-react";
import { AtRiskStudentAlert } from "../../types";

export default function AILecturerAssistantView() {
  const [taskType, setTaskType] = useState<"lecture_notes" | "slide_outline" | "rubric" | "exam_questions" | "at_risk_diagnostic">("lecture_notes");
  const [courseCode, setCourseCode] = useState("CSC 101");
  const [topic, setTopic] = useState("Data Structures & Algorithm Complexity");
  const [loading, setLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // At-Risk Students State
  const [atRiskAlerts, setAtRiskAlerts] = useState<AtRiskStudentAlert[]>([]);

  useEffect(() => {
    fetchAtRiskAlerts();
  }, []);

  const fetchAtRiskAlerts = async () => {
    try {
      const res = await fetch("/api/v1/academic/at-risk-students").then(r => r.json());
      if (res.success) setAtRiskAlerts(res.data);
    } catch (err: any) {
      console.error("Failed to fetch at-risk student alerts:", err);
    }
  };

  const handleGenerateAIContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setAiOutput(null);

    try {
      const res = await fetch("/api/v1/academic/ai-lecturer-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType,
          courseCode,
          topic
        })
      }).then(r => r.json());

      if (res.success && res.data?.result) {
        setAiOutput(res.data.result);
      } else {
        setAiOutput("Failed to generate AI content. Ensure GEMINI_API_KEY is configured.");
      }
    } catch (err: any) {
      setAiOutput("Error contacting AI Lecturer Assistant backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOutput = () => {
    if (!aiOutput) return;
    navigator.clipboard.writeText(aiOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="ai-lecturer-assistant">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white border border-purple-800/80 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs font-bold text-purple-300 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" /> AI Lecturer Assistant & Student Diagnostic
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight">
              Intelligent Academic Content Generator
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl font-medium">
              Generate structured lecture notes, slide outlines, assignment rubrics, exam question banks, and analyze student risk factors with Gemini AI.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Generator Controls */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-600" /> AI Lecturer Assistant Generator
          </h3>

          <form onSubmit={handleGenerateAIContent} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-gray-700 mb-1">Task Type</label>
              <select
                value={taskType}
                onChange={e => setTaskType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="lecture_notes">Generate Detailed Lecture Notes</option>
                <option value="slide_outline">Generate 10-Slide Deck Outline</option>
                <option value="rubric">Generate Grading Rubric Criteria</option>
                <option value="exam_questions">Generate Question Bank Items</option>
                <option value="at_risk_diagnostic">At-Risk Student Diagnostic</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Course Code</label>
              <input
                type="text"
                value={courseCode}
                onChange={e => setCourseCode(e.target.value)}
                placeholder="e.g. CSC 101"
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Lecture / Exam Topic</label>
              <textarea
                rows={3}
                required
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. CPU Architecture, ALU operations, and von Neumann bottleneck..."
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating AI Content...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Material
                </>
              )}
            </button>
          </form>

          {/* At-Risk Alerts Mini Widget */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" /> Student Risk Factors Alert ({atRiskAlerts.length})
            </h4>

            {atRiskAlerts.map(alert => (
              <div key={alert.id} className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-900">{alert.studentDisplayName} ({alert.courseCode})</span>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full text-[10px] font-extrabold uppercase">
                    {alert.riskLevel} Risk
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">Attendance: {alert.attendancePercentage}% | Quiz Avg: {alert.averageQuizScore}%</p>
                <p className="text-[11px] text-amber-900 font-semibold italic">Recommendation: {alert.recommendedIntervention}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Generated Output Display */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-600" /> AI Generated Academic Material
              </h3>

              {aiOutput && (
                <button
                  onClick={handleCopyOutput}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Text"}</span>
                </button>
              )}
            </div>

            {aiOutput ? (
              <div className="p-5 bg-slate-50 rounded-2xl border border-gray-200 text-xs leading-relaxed text-gray-800 whitespace-pre-wrap font-mono max-h-[500px] overflow-y-auto">
                {aiOutput}
              </div>
            ) : (
              <div className="p-12 text-center bg-purple-50/40 rounded-2xl border border-dashed border-purple-200 space-y-3">
                <Bot className="w-10 h-10 text-purple-400 mx-auto" />
                <h4 className="text-sm font-bold text-gray-800">Ready to Generate Material</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Select a task type on the left, enter a topic, and click 'Generate Material'. The AI Assistant will compile comprehensive structured academic content.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
