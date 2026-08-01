import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  Sparkles,
  Award,
  Zap,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  BookOpen,
  Target,
  Clock,
  ChevronRight,
  Sliders,
  Layers,
  BarChart3,
  Lightbulb,
  GraduationCap
} from "lucide-react";

interface AIMemoryDashboardProps {
  token?: string;
  session?: any;
}

export default function AIMemoryDashboard({ token, session }: AIMemoryDashboardProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // New Fact Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFactTopic, setNewFactTopic] = useState("");
  const [newFactContent, setNewFactContent] = useState("");
  const [newFactType, setNewFactType] = useState<string>("weakness");
  const [savingFact, setSavingFact] = useState(false);

  const activeToken = token || session?.access_token;

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const headers: Record<string, string> = {};
      if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

      const res = await fetch("/api/v1/memory/dashboard", { headers });
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data.dashboard);
        setRecommendations(data.dashboard?.recommendations || []);
      } else {
        setError("Failed to load memory profile dashboard.");
      }

      // Fetch full profile
      const resProf = await fetch("/api/v1/memory/profile", { headers });
      if (resProf.ok) {
        const dataProf = await resProf.json();
        setProfile(dataProf.profile);
      }
    } catch (err: any) {
      console.error("Error fetching AI memory dashboard:", err);
      setError(err?.message || "Error connecting to AI memory service.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const headers: Record<string, string> = {};
      if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

      const res = await fetch("/api/v1/memory/refresh", { method: "POST", headers });
      if (res.ok) {
        await fetchDashboard();
      }
    } catch (err) {
      console.error("Error refreshing memory:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddFact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactContent.trim()) return;

    try {
      setSavingFact(true);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

      const res = await fetch("/api/v1/memory/facts", {
        method: "POST",
        headers,
        body: JSON.stringify({
          memoryType: newFactType,
          topic: newFactTopic.trim() || "General",
          content: newFactContent.trim(),
        }),
      });

      if (res.ok) {
        setNewFactContent("");
        setNewFactTopic("");
        setShowAddModal(false);
        await fetchDashboard();
      }
    } catch (err) {
      console.error("Error adding memory fact:", err);
    } finally {
      setSavingFact(false);
    }
  };

  const handleDeleteFact = async (factId: string) => {
    try {
      const headers: Record<string, string> = {};
      if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

      const res = await fetch(`/api/v1/memory/facts/${factId}`, { method: "DELETE", headers });
      if (res.ok) {
        await fetchDashboard();
      }
    } catch (err) {
      console.error("Error deleting memory fact:", err);
    }
  };

  const handleDismissRec = async (recId: string) => {
    try {
      const headers: Record<string, string> = {};
      if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

      await fetch(`/api/v1/memory/recommendations/${recId}/dismiss`, { method: "POST", headers });
      setRecommendations((prev) => prev.filter((r) => r.id !== recId));
    } catch (err) {
      console.error("Error dismissing recommendation:", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [activeToken]);

  if (loading) {
    return (
      <div className="p-8 text-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Syncing Learner Memory Engine...</p>
      </div>
    );
  }

  const memories = profile?.persistentMemories || [];
  const analytics = dashboardData?.analytics || {};
  const graphNodes = dashboardData?.topicMasteryNodes || [];

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl shadow-indigo-900/10 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Brain className="w-48 h-48" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/30 border border-indigo-400/30 text-indigo-200">
                AI Memory & Personalization Engine
              </span>
              <span className="text-xs text-indigo-300 font-medium">• {profile?.academicField || "Computer Science"}</span>
            </div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Personal Learning Profile
            </h2>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 border border-indigo-400/30 self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Re-evaluate Memory</span>
          </button>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 relative z-10 border-t border-indigo-700/50">
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Study Streak</p>
            <p className="text-lg font-black text-amber-300 flex items-center gap-1 mt-0.5">
              🔥 {dashboardData?.studyStreakDays || 7} Days
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Weekly Activity</p>
            <p className="text-lg font-black text-white mt-0.5">
              {dashboardData?.weeklyStudyTimeHours || 5.5} hrs / week
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Avg Quiz Score</p>
            <p className="text-lg font-black text-emerald-300 mt-0.5">
              {dashboardData?.learningProgressScore || 82}% Accuracy
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Active Facts</p>
            <p className="text-lg font-black text-sky-300 mt-0.5">
              {memories.length} Learner Facts
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Persistent Facts & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Automated Recommendations Section */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Personalized Learning Recommendations ({recommendations.length})
              </h3>
            </div>

            <div className="space-y-3">
              {recommendations.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No active study alerts. You are fully caught up!</p>
              ) : (
                recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2 relative transition-all hover:border-indigo-300"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            rec.priority === "high"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {rec.priority} Priority
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rec.title}</h4>
                      </div>

                      <button
                        onClick={() => handleDismissRec(rec.id)}
                        className="text-slate-400 hover:text-slate-600 text-[11px] font-bold cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rec.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Persistent Learner Facts Memory Bank */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-600" />
                  Learner Memory Fact Bank
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Long-term knowledge StudyMate remembers about your strengths, weaknesses, and preferred explanations.
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Fact</span>
              </button>
            </div>

            {/* Fact Item Cards */}
            <div className="grid grid-cols-1 gap-3">
              {memories.map((mem: any) => (
                <div
                  key={mem.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          mem.memoryType === "weakness"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300"
                            : mem.memoryType === "strength"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300"
                            : mem.memoryType === "preference"
                            ? "bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300"
                        }`}
                      >
                        {mem.memoryType}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{mem.topic}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">{mem.content}</p>

                    <p className="text-[10px] text-slate-400 font-mono">
                      Source: {mem.source || "interaction"} • Confidence: {Math.round((mem.confidenceScore || 0.9) * 100)}%
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteFact(mem.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Delete Memory Fact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Topic Mastery & Knowledge Graph */}
        <div className="space-y-6">
          {/* Topic Mastery Progress Cards */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              Topic Mastery & Knowledge Tree
            </h3>

            <div className="space-y-3">
              {graphNodes.map((node: any) => (
                <div key={node.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900 dark:text-white">{node.label}</span>
                    <span
                      className={`text-[11px] ${
                        node.masteryScore >= 80
                          ? "text-emerald-600 dark:text-emerald-400"
                          : node.masteryScore < 55
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {node.masteryScore}% Mastery
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        node.masteryScore >= 80
                          ? "bg-emerald-500"
                          : node.masteryScore < 55
                          ? "bg-rose-500"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${node.masteryScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation Style Preference Controls */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              Preferred Explanation Style
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Active Style: <strong className="text-slate-900 dark:text-white">{profile?.preferredExplanationStyle || "Step-by-step with practical examples"}</strong>
            </p>

            <div className="space-y-2 pt-1">
              {[
                "Step-by-step with practical examples",
                "Concise bullet points & executive summaries",
                "Visual diagrams & analogies",
                "Deep academic & mathematical rigour"
              ].map((style, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    fetch("/api/v1/memory/facts", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        memoryType: "preference",
                        topic: "Explanation Format",
                        content: style,
                      }),
                    }).then(() => fetchDashboard());
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    profile?.preferredExplanationStyle === style
                      ? "bg-indigo-50 border-indigo-500 text-indigo-900 dark:bg-indigo-950/60 dark:border-indigo-400 dark:text-indigo-200 font-bold"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for adding custom memory fact */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-600" />
                Add Custom Memory Fact
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddFact} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Fact Type
                </label>
                <select
                  value={newFactType}
                  onChange={(e) => setNewFactType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="weakness">Weakness (Topic struggling with)</option>
                  <option value="strength">Strength (Topic mastered)</option>
                  <option value="preference">Preference (Explanation style)</option>
                  <option value="goal">Goal (Academic target)</option>
                  <option value="fact">Fact (General learner info)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Topic / Subject
                </label>
                <input
                  type="text"
                  value={newFactTopic}
                  onChange={(e) => setNewFactTopic(e.target.value)}
                  placeholder="e.g. Subnetting, CYB 203, Calc III"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Fact Details
                </label>
                <textarea
                  rows={3}
                  value={newFactContent}
                  onChange={(e) => setNewFactContent(e.target.value)}
                  placeholder="e.g. Needs step-by-step math breakdowns when solving subnet wildcard bits..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={savingFact || !newFactContent.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                {savingFact ? "Saving Fact..." : "Save Memory Fact"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
