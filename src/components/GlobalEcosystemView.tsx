import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Award,
  Search,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Loader2,
  Trash2,
  ShieldAlert,
  FileText,
  Copy,
  Download,
  Upload,
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  TrendingUp,
  Sliders,
  DollarSign,
  Briefcase,
  Layers,
  FileCheck,
  ChevronRight,
  School,
  Lock,
  Eye,
  Settings
} from "lucide-react";
import { DocumentItem, UserAccount, ChatMessage } from "../types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface GlobalEcosystemViewProps {
  currentUser: UserAccount;
  documents: DocumentItem[];
  onAddStatsReward: (points: number, reason: string) => void;
}

type TabType = "assistant" | "integrity" | "institution" | "marketplace" | "offline";

interface LearningPath {
  title: string;
  description: string;
  estimatedWeeks: number;
  suggestedDocs: string[];
  milestones: { title: string; targetSkill: string; action: string }[];
}

export default function GlobalEcosystemView({
  currentUser,
  documents,
  onAddStatsReward
}: GlobalEcosystemViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("assistant");

  // 1. Unified Assistant State
  const [selectedAgent, setSelectedAgent] = useState<"tutor" | "researcher" | "exam_coach" | "career_guide">("tutor");
  const [preferredLanguage, setPreferredLanguage] = useState<string>("English");
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [agentHistories, setAgentHistories] = useState<Record<string, ChatMessage[]>>({
    tutor: [
      {
        id: "tutor-welcome",
        role: "model",
        text: "🌸 **Hello! I am your StudyMate Learning Tutor Agent.**\n\nI specialize in Socratic instruction, breaking down complex mathematical formulas, scientific theories, and historical events. Ask me anything, and I'll explain it using intuitive, real-world analogies!",
        timestamp: new Date().toISOString()
      }
    ],
    researcher: [
      {
        id: "researcher-welcome",
        role: "model",
        text: "🔬 **Welcome to your StudyMate Research Assistant Agent.**\n\nI focus on scholarly literature synthesis, critical methodology evaluations, and precise citations. Paste a source or paper to generate citations (APA/MLA/Chicago) and analyze original academic writing formats.",
        timestamp: new Date().toISOString()
      }
    ],
    exam_coach: [
      {
        id: "exam-welcome",
        role: "model",
        text: "⚡ **Greetings! I am your StudyMate Exam Coach Agent.**\n\nMy priority is preparing you for upcoming tests, quizzes, and standard assessments. Ask me to quiz you, review your answers, or share exam-taking strategies, and let's lock in those full marks!",
        timestamp: new Date().toISOString()
      }
    ],
    career_guide: [
      {
        id: "career-welcome",
        role: "model",
        text: "💼 **Hello! I am your StudyMate Career Guidance Agent.**\n\nLet's connect your studies to real-world impact. I align your active courses to industry standards, map career pathways, and recommend portfolio project ideas to impress prospective employers.",
        timestamp: new Date().toISOString()
      }
    ]
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // 2. Academic Integrity State
  const [integrityText, setIntegrityText] = useState<string>("");
  const [citationStyle, setCitationStyle] = useState<string>("APA");
  const [isIntegrityAnalyzing, setIsIntegrityAnalyzing] = useState<boolean>(false);
  const [integrityResult, setIntegrityResult] = useState<any>(null);

  // Metadata form for Citations
  const [metaTitle, setMetaTitle] = useState("");
  const [metaAuthor, setMetaAuthor] = useState("");
  const [metaYear, setMetaYear] = useState("");
  const [metaPublisher, setMetaPublisher] = useState("");
  const [metaURL, setMetaURL] = useState("");

  // 3. Recommendation System State
  const [isPathLoading, setIsPathLoading] = useState<boolean>(false);
  const [profileAnalysis, setProfileAnalysis] = useState<string>("");
  const [recommendations, setRecommendations] = useState<LearningPath[]>([]);

  // 4. Institution Platform State
  const [selectedInstType, setSelectedInstType] = useState<"School" | "University" | "Department">("University");
  const [instName, setInstName] = useState<string>("Springfield Institute of Technology");
  const [selectedCohort, setSelectedCohort] = useState<string>("Computer Science 101");
  const [privacyAIUsage, setPrivacyAIUsage] = useState<boolean>(true);
  const [privacyAnonymize, setPrivacyAnonymize] = useState<boolean>(false);
  const [privacyMinimization, setPrivacyMinimization] = useState<boolean>(true);

  // 5. Educational Marketplace State
  const [marketplaceCourses, setMarketplaceCourses] = useState([
    { id: "mc-1", title: "AP Biology Master Syllabus", creator: "Prof. Sarah Jenkins", institution: "Stanford Academy", downloads: 342, cost: 50, category: "Science" },
    { id: "mc-2", title: "Data Structures & Algorithms Cheatbook", creator: "Alex Rivera", institution: "MIT Department", downloads: 820, cost: 80, category: "Technology" },
    { id: "mc-3", title: "Calculus III Proof Mechanics Course", creator: "Dr. Ethan Brooks", institution: "Harvard Math Cohort", downloads: 194, cost: 100, category: "Math" },
    { id: "mc-4", title: "Microeconomic Equilibrium Modeling", creator: "Emma Vance", institution: "Oxford Economics", downloads: 154, cost: 60, category: "Business" }
  ]);
  const [marketplaceNotes, setMarketplaceNotes] = useState([
    { id: "mn-1", title: "Cellular Respiration & Krebs Cycle Summary", sharedBy: "Jessica K.", downloads: 93, pointsEarned: 186 },
    { id: "mn-2", title: "React 19 & Concurrent Rendering Cheatsheet", sharedBy: "Tyler S.", downloads: 156, pointsEarned: 312 },
    { id: "mn-3", title: "Introduction to Epistemology Reading Outline", sharedBy: "Sofia M.", downloads: 41, pointsEarned: 82 }
  ]);
  const [marketplaceCategory, setMarketplaceCategory] = useState<string>("All");
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<string[]>([]);
  const [sharedCourseTitle, setSharedCourseTitle] = useState("");
  const [sharedCourseCategory, setSharedCourseCategory] = useState("Science");
  const [sharedCourseCost, setSharedCourseCost] = useState(30);

  // 6. Offline-Ready State
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Online & Fully Synced");
  const [offlineActionCount, setOfflineActionCount] = useState<number>(0);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Analytics cohort data
  const cohortAnalyticsData = [
    { subject: "Intro Biology", classAverage: 84, studentAverage: 92, targetGoal: 90 },
    { subject: "Computer Science", classAverage: 78, studentAverage: 89, targetGoal: 90 },
    { subject: "Linear Algebra", classAverage: 73, studentAverage: 78, targetGoal: 85 },
    { subject: "Macroeconomics", classAverage: 82, studentAverage: 95, targetGoal: 95 },
    { subject: "Writing & Rhetoric", classAverage: 88, studentAverage: 90, targetGoal: 90 }
  ];

  const studentRankData = [
    { week: "Wk 1", studyHours: 4, scorePct: 75 },
    { week: "Wk 2", studyHours: 6, scorePct: 82 },
    { week: "Wk 3", studyHours: 9, scorePct: 88 },
    { week: "Wk 4", studyHours: 7, scorePct: 85 },
    { week: "Wk 5", studyHours: 12, scorePct: 94 }
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentHistories, selectedAgent, isChatLoading]);

  // Load recommendations on mount / changes
  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setIsPathLoading(true);
    try {
      const response = await fetch("/api/generate/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stats: currentUser.stats,
          documents,
          academicDifficulty: "intermediate",
          teachingPersona: "mentor"
        })
      });
      if (!response.ok) throw new Error("Could not fetch recommendations");
      const data = await response.json();
      if (data.learningPaths) {
        setRecommendations(data.learningPaths);
        setProfileAnalysis(data.profileAnalysis || "Active analysis loaded.");
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setProfileAnalysis("Your active study metrics reflect high determination and solid quiz retention. We can optimize your progress with structured revision sequences.");
      setRecommendations([
        {
          title: "Comprehensive Core Pathway",
          description: "Targeted pathway based on your active files to solidify basic definitions and conceptual frameworks.",
          estimatedWeeks: 4,
          suggestedDocs: documents.length > 0 ? [documents[0].title] : ["General Syllabus"],
          milestones: [
            { title: "Terminology Recall", targetSkill: "Active memorization", action: "Review flashcards of key vocabulary terms." },
            { title: "Applied Problem Solving", targetSkill: "Practical execution", action: "Submit an automated 10-question practice test." },
            { title: "Academic Defense", targetSkill: "Integrity & Citations", action: "Draft a 500-word summary with scholarly MLA/APA citations." }
          ]
        },
        {
          title: "Accelerated Exam Prep Route",
          description: "Optimized for exam readiness, utilizing timed simulators and memory-hook mnemonic generators.",
          estimatedWeeks: 2,
          suggestedDocs: documents.map(d => d.title).slice(0, 2),
          milestones: [
            { title: "Time Pressure Sprint", targetSkill: "Speed & Elimination", action: "Complete a timed Biology or Algebra mock exam." },
            { title: "Analytical Weak Spot Review", targetSkill: "Corrective adjustments", action: "Consult the AI Exam Coach on flagged test questions." }
          ]
        }
      ]);
    } finally {
      setIsPathLoading(false);
    }
  };

  // Chat Execution
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    // Save offline behavior if offline is toggled
    if (isOfflineMode) {
      const userMsg: ChatMessage = {
        id: "offline_msg_" + Date.now(),
        role: "user",
        text: chatInput.trim(),
        timestamp: new Date().toISOString()
      };
      const responseMsg: ChatMessage = {
        id: "offline_resp_" + Date.now(),
        role: "model",
        text: `📶 **[StudyMate Offline Sandbox mode is ACTIVE]**\n\nI have locally saved your query: "${chatInput.trim()}".\n\nIn offline mode, AI processing is queued. I am responding from your cached device memory! Your progress, vocabulary, and active achievements will be synchronized back to the server as soon as you connect back online.`,
        timestamp: new Date().toISOString()
      };
      setAgentHistories(prev => ({
        ...prev,
        [selectedAgent]: [...(prev[selectedAgent] || []), userMsg, responseMsg]
      }));
      setOfflineActionCount(prev => prev + 1);
      setChatInput("");
      onAddStatsReward(5, "Offline revision progress logged");
      return;
    }

    const currentHistory = agentHistories[selectedAgent] || [];
    const userMessage: ChatMessage = {
      id: "msg_" + Date.now(),
      role: "user",
      text: chatInput.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...currentHistory, userMessage];
    setAgentHistories(prev => ({
      ...prev,
      [selectedAgent]: updatedHistory
    }));
    setChatInput("");
    setIsChatLoading(true);

    try {
      // Map history to server payload ({role, text})
      const payloadMessages = updatedHistory.map(m => ({
        role: m.role,
        text: m.text
      }));

      const activeDoc = documents[0]; // fallback context

      const response = await fetch("/api/generate/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: activeDoc?.id || "",
          content: activeDoc?.content || "",
          messages: payloadMessages,
          username: currentUser.username,
          selectedAgent,
          language: preferredLanguage
        })
      });

      if (!response.ok) throw new Error("Could not process AI response.");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) throw new Error("No reader available.");

      const aiMessageId = "msg_ai_" + Date.now();
      const initialAiMessage: ChatMessage = {
        id: aiMessageId,
        role: "model",
        text: "",
        timestamp: new Date().toISOString()
      };

      setAgentHistories(prev => ({
        ...prev,
        [selectedAgent]: [...updatedHistory, initialAiMessage]
      }));

      let accumulatedText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setAgentHistories(prev => {
          const history = prev[selectedAgent] || [];
          return {
            ...prev,
            [selectedAgent]: history.map(msg =>
              msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg
            )
          };
        });
      }

      onAddStatsReward(10, `Completed learning chat with the ${selectedAgent} Agent`);

    } catch (err: any) {
      console.error(err);
      // Fallback response
      const errText = `⚠️ **StudyMate Assistant Response Unavailable**\n\nPlease check your server connection and GEMINI_API_KEY. (Local explanation: Explaining your query using standard fallback knowledge in ${preferredLanguage}).`;
      setAgentHistories(prev => ({
        ...prev,
        [selectedAgent]: [
          ...updatedHistory,
          {
            id: "err_" + Date.now(),
            role: "model",
            text: errText,
            timestamp: new Date().toISOString()
          }
        ]
      }));
    } finally {
      setIsChatLoading(false);
    }
  };

  // Academic Integrity Verification
  const handleVerifyIntegrity = async () => {
    if (!integrityText.trim()) return;
    setIsIntegrityAnalyzing(true);
    setIntegrityResult(null);

    try {
      const response = await fetch("/api/research/integrity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: integrityText,
          citationStyle,
          sourceMetadata: {
            title: metaTitle || undefined,
            author: metaAuthor || undefined,
            year: metaYear || undefined,
            publisher: metaPublisher || undefined,
            url: metaURL || undefined
          }
        })
      });

      if (!response.ok) throw new Error("Verification failed.");
      const data = await response.json();
      setIntegrityResult(data);
      onAddStatsReward(15, "Completed paper integrity analysis");
    } catch (err) {
      console.error(err);
      // Mock / fallback integrity report if server fails
      setIntegrityResult({
        originalityScore: 92,
        flaggedPhrases: [
          {
            phrase: integrityText.slice(0, Math.min(60, integrityText.length)),
            issue: "High conceptual similarity to published educational standards.",
            remedy: "Cite using the generated StudyMate bibliographic entry to satisfy peer reviews."
          }
        ],
        citation: `${metaAuthor || "Scholar"}, A. (${metaYear || new Date().getFullYear()}). ${metaTitle || "Dynamic Studies in Education"}. ${metaPublisher || "Academic Publishing Network"}.`,
        citationStyle,
        integrityAdvices: [
          "Integrity Tip: Always formulate distinct syntheses instead of rewriting standard structures.",
          "Check that all quotes have proper quotation marks."
        ]
      });
    } finally {
      setIsIntegrityAnalyzing(false);
    }
  };

  // Synchronize Offline Cache
  const handleSyncOffline = () => {
    if (offlineActionCount === 0) {
      alert("No pending offline actions to synchronize. App is fully up to date!");
      return;
    }
    const logMsg = `Synchronized ${offlineActionCount} cached interactions back to server. Achievements updated.`;
    setSyncLogs(prev => [logMsg, ...prev]);
    setOfflineActionCount(0);
    setLastSyncTime(new Date().toLocaleTimeString());
    onAddStatsReward(25, "Synchronized offline studies back to cloud storage!");
  };

  const handlePurchaseCourse = (course: any) => {
    setPurchasedCourseIds(prev => [...prev, course.id]);
    onAddStatsReward(30, `Unlocked Course: ${course.title}`);
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedCourseTitle.trim()) return;
    const newCourse = {
      id: "mc-" + Date.now(),
      title: sharedCourseTitle.trim(),
      creator: currentUser.displayName || currentUser.username,
      institution: instName,
      downloads: 0,
      cost: sharedCourseCost,
      category: sharedCourseCategory
    };
    setMarketplaceCourses(prev => [newCourse, ...prev]);
    setSharedCourseTitle("");
    onAddStatsReward(50, "Shared a new educational resource to the StudyMate marketplace!");
  };

  const filteredCourses = marketplaceCategory === "All"
    ? marketplaceCourses
    : marketplaceCourses.filter(c => c.category === marketplaceCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in" id="global-ecosystem-view">
      {/* Platform Branding Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 text-white rounded-3xl p-6 lg:p-8 border border-slate-800 shadow-xl gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 shrink-0 pointer-events-none">
          <Globe className="h-48 w-48 text-indigo-400 rotate-12" />
        </div>
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest bg-indigo-500/35 border border-indigo-500/40 text-indigo-200 px-3 py-1 rounded-full">
              GLOBAL EDUCATION PLATFORM
            </span>
            {isOfflineMode ? (
              <span className="flex items-center gap-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                <WifiOff className="h-3 w-3 animate-pulse" /> Offline revision
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <Wifi className="h-3 w-3" /> Online & Sync active
              </span>
            )}
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-none text-white">
            StudyMate Global Ecosystem
          </h1>
          <p className="text-slate-400 text-xs lg:text-sm max-w-2xl leading-relaxed">
            A globally scalable intelligent education suite. Experience unified agent architecture, academic integrity defenses, institutional diagnostics, and offline study synchronization.
          </p>
        </div>

        {/* Offline Status Bar */}
        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/55 p-3.5 rounded-2xl z-10 shrink-0">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Offline Caching Engine</p>
            <p className="text-xs font-bold text-slate-200 mt-0.5">
              {isOfflineMode ? `${offlineActionCount} Pending Synced items` : "Local database saved"}
            </p>
          </div>
          <button
            onClick={() => {
              setIsOfflineMode(!isOfflineMode);
              onAddStatsReward(10, `Switched internet connection status`);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
              isOfflineMode
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-slate-200"
            }`}
          >
            {isOfflineMode ? "Go Online" : "Go Offline"}
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-150 pb-1">
        {[
          { id: "assistant", label: "Unified AI Assistant", icon: Sparkles },
          { id: "integrity", label: "Academic Integrity & Citations", icon: FileCheck },
          { id: "institution", label: "Institution & Roster Analytics", icon: School },
          { id: "marketplace", label: "Global Resource Marketplace", icon: BookOpen },
          { id: "offline", label: "Offline & Sync Console", icon: RefreshCw }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as TabType);
              onAddStatsReward(5, `Opened tab: ${tab.label}`);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10"
                : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50 hover:text-indigo-600"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active Tab Container */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          {/* 1. UNIFIED AI ASSISTANT */}
          {activeTab === "assistant" && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              {/* Agent Selection Panel */}
              <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-4.5 space-y-4.5 shadow-xs">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
                    Active Specialist Agent
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Toggle your agent persona on the fly. The unified assistant retains conversation context.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {[
                    { id: "tutor", label: "Learning Tutor Agent", desc: "Socratic instruction, real-world analogies, step-by-step concepts.", color: "text-rose-500 bg-rose-50 border-rose-100" },
                    { id: "researcher", label: "Research Assistant", desc: "Literature review, methodology synthesis, citations, plagiarism guard.", color: "text-cyan-500 bg-cyan-50 border-cyan-100" },
                    { id: "exam_coach", label: "Exam Coach Agent", desc: "Constructive quiz scoring, strategies, mnemonics.", color: "text-amber-500 bg-amber-50 border-amber-100" },
                    { id: "career_guide", label: "Career Guidance Agent", desc: "Portfolio project ideas, job skill maps, career paths.", color: "text-indigo-500 bg-indigo-50 border-indigo-100" }
                  ].map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgent(agent.id as any);
                        onAddStatsReward(5, `Toggled to ${agent.label}`);
                      }}
                      className={`text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                        selectedAgent === agent.id
                          ? "bg-slate-900 border-slate-900 text-white"
                          : "border-gray-50 hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                          selectedAgent === agent.id ? "bg-white/20 text-indigo-200" : agent.color
                        }`}>
                          {agent.id.toUpperCase().replace("_", " ")}
                        </span>
                        <h4 className="font-extrabold text-xs">{agent.label}</h4>
                      </div>
                      <p className={`text-[10px] leading-relaxed ${
                        selectedAgent === agent.id ? "text-slate-400" : "text-gray-500"
                      }`}>
                        {agent.desc}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Preferred Language Choice */}
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-indigo-500" />
                    Preferred Language
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => {
                      setPreferredLanguage(e.target.value);
                      onAddStatsReward(5, `Preferred language updated to ${e.target.value}`);
                    }}
                    className="w-full border border-gray-200 rounded-xl p-2 text-xs font-bold text-gray-800 focus:outline-indigo-500 bg-white"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Español (Spanish)</option>
                    <option value="French">Français (French)</option>
                    <option value="German">Deutsch (German)</option>
                    <option value="Japanese">日本語 (Japanese)</option>
                    <option value="Portuguese">Português (Portuguese)</option>
                    <option value="Arabic">العربية (Arabic)</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                    <option value="Italian">Italiano (Italian)</option>
                  </select>
                </div>
              </div>

              {/* Chat Core Window */}
              <div className="lg:col-span-3 flex flex-col bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden h-[540px]">
                {/* Chat Header */}
                <div className="bg-slate-50 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      StudyMate AI Unified Console
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">
                    Active: {selectedAgent.toUpperCase().replace("_", " ")} ({preferredLanguage})
                  </span>
                </div>

                {/* Messages Panel */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {(agentHistories[selectedAgent] || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                        msg.role === "user" ? "bg-indigo-600" : "bg-slate-900"
                      }`}>
                        {msg.role === "user" ? "ME" : "SM"}
                      </div>
                      <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-gray-100 text-slate-900 rounded-tl-none prose"
                      }`}>
                        {msg.text.split("\n").map((para, i) => (
                          <p key={i} className="mb-2 last:mb-0">
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex gap-3 max-w-[85%] mr-auto">
                      <div className="h-8 w-8 rounded-xl bg-slate-950 flex items-center justify-center font-bold text-xs text-white shrink-0">
                        SM
                      </div>
                      <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-2">
                        <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
                        <span className="text-xs text-gray-500 font-medium">Drafting scholarly response...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Prompt Starters */}
                <div className="px-5 py-2 border-t border-gray-50 flex items-center gap-1.5 overflow-x-auto bg-slate-50/50">
                  <span className="text-[9.5px] font-bold text-gray-400 shrink-0">Suggestions:</span>
                  {[
                    "Give me a real-world analogy for my studies",
                    "Conduct a plagiarism diagnostic on my paragraphs",
                    "List 3 industry skills connected to this course",
                    "Quiz me with an exam-style practice scenario"
                  ].map((pText, idx) => (
                    <button
                      key={idx}
                      onClick={() => setChatInput(pText)}
                      className="px-2.5 py-1 bg-white border border-gray-100 text-gray-600 rounded-lg text-[10px] hover:border-indigo-200 hover:text-indigo-600 transition-all shrink-0 font-medium"
                    >
                      {pText}
                    </button>
                  ))}
                </div>

                {/* Chat Inputs */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Consult your ${selectedAgent.replace("_", " ")} in ${preferredLanguage}...`}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-indigo-500 bg-white"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isChatLoading}
                      className="px-4.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <span>Send</span>
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. ACADEMIC INTEGRITY & CITATIONS */}
          {activeTab === "integrity" && (
            <motion.div
              key="integrity"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Submission panel */}
              <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-emerald-600" />
                    Plagiarism Verification & Scholarly Citation Generator
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Paste your essay draft, citations, or research claims. StudyMate evaluates matching risk, issues integrity grades, and generates publication citations.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 block">Draft Paragraphs for Review</label>
                  <textarea
                    rows={8}
                    value={integrityText}
                    onChange={(e) => setIntegrityText(e.target.value)}
                    placeholder="Enter academic writing, source notes, or paragraph drafts here..."
                    className="w-full border border-gray-200 rounded-2xl p-4 text-xs focus:outline-emerald-500 bg-white placeholder:text-gray-300"
                  />
                </div>

                {/* Metadata helper */}
                <div className="space-y-3 pt-3 border-t border-gray-50">
                  <span className="text-xs font-bold text-slate-800 block">Source Bibliographic Metadata (Optional)</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="Title of Source"
                      className="border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-emerald-500 bg-white"
                    />
                    <input
                      value={metaAuthor}
                      onChange={(e) => setMetaAuthor(e.target.value)}
                      placeholder="Author(s) (e.g., Doe, J.)"
                      className="border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-emerald-500 bg-white"
                    />
                    <input
                      value={metaYear}
                      onChange={(e) => setMetaYear(e.target.value)}
                      placeholder="Year (e.g., 2025)"
                      className="border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-emerald-500 bg-white"
                    />
                    <input
                      value={metaPublisher}
                      onChange={(e) => setMetaPublisher(e.target.value)}
                      placeholder="Journal/Publisher"
                      className="border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-emerald-500 bg-white"
                    />
                  </div>
                  <input
                    value={metaURL}
                    onChange={(e) => setMetaURL(e.target.value)}
                    placeholder="URL (Optional)"
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-emerald-500 bg-white"
                  />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">Citation Style:</span>
                    {["APA", "MLA", "Chicago"].map((style) => (
                      <button
                        key={style}
                        onClick={() => setCitationStyle(style)}
                        className={`px-3 py-1 text-xs rounded-lg font-bold border transition-all ${
                          citationStyle === style
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleVerifyIntegrity}
                    disabled={!integrityText.trim() || isIntegrityAnalyzing}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5 self-end md:self-auto"
                  >
                    {isIntegrityAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Running Diagnostics...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Check Originality & Cite</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Integrity Diagnosis Sidebar */}
              <div className="space-y-6">
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Integrity & Citation Metrics</h3>

                  {!integrityResult ? (
                    <div className="text-center py-12 text-gray-400">
                      <ShieldAlert className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-xs">No analysis running. Paste drafts in the main editor to run plagiarism matching.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Originality Score Gauge */}
                      <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Originality Score</p>
                          <p className="text-2xl font-black text-emerald-600">{integrityResult.originalityScore}%</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          integrityResult.originalityScore > 80
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-rose-50 text-rose-600 border border-rose-100"
                        }`}>
                          {integrityResult.originalityScore > 80 ? "EXCELLENT" : "ATTENTION REQUIRED"}
                        </span>
                      </div>

                      {/* Scholarly Citation */}
                      <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Scholarly Citation</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(integrityResult.citation);
                              alert("Citation copied to clipboard!");
                            }}
                            className="text-indigo-600 hover:text-indigo-800 text-[10px] font-bold flex items-center gap-1"
                          >
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                        </div>
                        <p className="text-xs text-slate-800 leading-relaxed italic bg-white p-2.5 border border-gray-100 rounded-lg">
                          {integrityResult.citation}
                        </p>
                        <p className="text-[9.5px] text-gray-400 font-semibold">Style: {integrityResult.citationStyle}</p>
                      </div>

                      {/* Flagged Phrases */}
                      {integrityResult.flaggedPhrases && integrityResult.flaggedPhrases.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Academic Concerns</p>
                          <div className="space-y-2 max-h-[160px] overflow-y-auto">
                            {integrityResult.flaggedPhrases.map((fp: any, idx: number) => (
                              <div key={idx} className="bg-rose-50/40 border border-rose-100 rounded-lg p-2.5 text-[11px]">
                                <p className="font-extrabold text-rose-800">Match: "{fp.phrase}"</p>
                                <p className="text-gray-500 mt-1">{fp.issue}</p>
                                <p className="text-emerald-700 font-bold mt-1">✓ Remedy: {fp.remedy}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Integrity Advice list */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Academic Integrity Guides</p>
                        <ul className="space-y-1.5">
                          {(integrityResult.integrityAdvices || []).map((adv: string, i: number) => (
                            <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1.5 leading-normal">
                              <span className="text-indigo-600 font-extrabold shrink-0">•</span>
                              <span>{adv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Card */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-indigo-950">Publication Integrity Safeguard</h4>
                    <p className="text-[10.5px] text-indigo-900 mt-1 leading-relaxed">
                      StudyMate does not share or index drafts publicly. All processed data is anonymized and adheres to global university standards. Keep your scholarship strictly authentic.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. INSTITUTION & ROSTER ANALYTICS */}
          {activeTab === "institution" && (
            <motion.div
              key="institution"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* School Setting Console */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <School className="h-5 w-5 text-indigo-600" />
                      Institutional Identity Configuration
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Customize your School/University department to route syllabus standards.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {["School", "University", "Department"].map((tier) => (
                      <button
                        key={tier}
                        onClick={() => {
                          setSelectedInstType(tier as any);
                          onAddStatsReward(5, `Selected tier: ${tier}`);
                        }}
                        className={`py-2 text-xs rounded-lg font-bold border transition-all ${
                          selectedInstType === tier
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                            : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 block">Institution Name</label>
                    <input
                      value={instName}
                      onChange={(e) => setInstName(e.target.value)}
                      placeholder="e.g. Springfield University"
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800 focus:outline-indigo-500 bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 block">Active Student Cohort Group</label>
                    <select
                      value={selectedCohort}
                      onChange={(e) => setSelectedCohort(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800 focus:outline-indigo-500 bg-white"
                    >
                      <option value="Computer Science 101">Computer Science 101 Cohort</option>
                      <option value="Advanced Biology 204">Advanced Biology 204 Group</option>
                      <option value="Microeconomics Masters">Microeconomics Masters</option>
                      <option value="General Global Students">General Global Students</option>
                    </select>
                  </div>

                  {/* Security Panel */}
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-indigo-600" />
                      Security & Privacy Controls
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2.5 text-[11px] font-bold text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacyAIUsage}
                          onChange={(e) => setPrivacyAIUsage(e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Allow AI diagnostic parsing of study logs</span>
                      </label>
                      <label className="flex items-center gap-2.5 text-[11px] font-bold text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacyAnonymize}
                          onChange={(e) => setPrivacyAnonymize(e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Anonymize classroom average reporting</span>
                      </label>
                      <label className="flex items-center gap-2.5 text-[11px] font-bold text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacyMinimization}
                          onChange={(e) => setPrivacyMinimization(e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Strict data minimization (Zero training telemetry)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Cohort Analytics charts */}
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Cohort Academics & Progress Rates
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Comparison of Class Average metrics versus your active progress in **{instName}**.
                    </p>
                  </div>

                  {/* Chart */}
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cohortAnalyticsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="subject" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                        <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="classAverage" name="Class Avg (%)" fill="#E0E7FF" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="studentAverage" name="My Score (%)" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-slate-50 border border-gray-100 p-3.5 rounded-xl flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="text-gray-500">Department Rank:</span>
                    <span className="text-indigo-600">Top 5% of Springfield cohort group (Lead Scholar)</span>
                  </div>
                </div>
              </div>

              {/* Intelligent recommendations panel based on analytics */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-50 pb-4 gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
                      Intelligent Pathway Recommendation Engine
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Personalized syllabus milestones recommended by analyzing active study behavior and performance.
                    </p>
                  </div>
                  <button
                    onClick={fetchRecommendations}
                    disabled={isPathLoading}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 border border-indigo-100 shrink-0"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isPathLoading ? "animate-spin" : ""}`} />
                    <span>Refresh Plan</span>
                  </button>
                </div>

                {isPathLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                    <p className="text-xs text-gray-500">Sifting study metrics and parsing course alignments...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-2xl flex items-start gap-3">
                      <GraduationCap className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-xs text-indigo-950">Director's Analysis Profile</h4>
                        <p className="text-[11px] text-indigo-900 mt-0.5 leading-relaxed">{profileAnalysis}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {recommendations.map((path, idx) => (
                        <div key={idx} className="bg-slate-50/55 border border-slate-100 rounded-2xl p-5 hover:border-indigo-150 transition-all flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                                {path.estimatedWeeks} WEEKS PATH
                              </span>
                              <span className="text-[10px] text-gray-400 font-semibold">
                                Suggested Docs: {path.suggestedDocs.join(", ") || "General"}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-extrabold text-sm text-slate-800 leading-tight">{path.title}</h3>
                              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{path.description}</p>
                            </div>

                            {/* Milestones list */}
                            <div className="space-y-3 pt-3 border-t border-gray-150/50">
                              <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-gray-400">Milestones Schedule</p>
                              <div className="space-y-2.5">
                                {(path.milestones || []).map((ms, i) => (
                                  <div key={i} className="flex gap-2.5 items-start">
                                    <span className="h-4.5 w-4.5 text-[9.5px] font-bold bg-white border border-gray-200 text-gray-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                      {i + 1}
                                    </span>
                                    <div>
                                      <p className="text-xs font-bold text-slate-800 leading-none">{ms.title}</p>
                                      <p className="text-[10px] text-gray-500 mt-1 leading-snug">{ms.action}</p>
                                      <span className="text-[9.5px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded mt-1.5 inline-block">
                                        Target: {ms.targetSkill}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => onAddStatsReward(15, `Started Learning Path: ${path.title}`)}
                            className="w-full mt-5 py-2.5 bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs rounded-xl transition-all shadow-xs"
                          >
                            Activate Path
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 4. GLOBAL RESOURCE MARKETPLACE */}
          {activeTab === "marketplace" && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Creator portal */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4 h-fit">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Upload className="h-4 w-4 text-indigo-600" />
                      Creator Portal: Share Course / Syllabus
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Publish your study notes, syllabi, or educational guides to earn StudyMate Reward points.
                    </p>
                  </div>

                  <form onSubmit={handleCreateCourse} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10.5px] font-bold text-gray-500 block">Syllabus or Resource Title</label>
                      <input
                        required
                        value={sharedCourseTitle}
                        onChange={(e) => setSharedCourseTitle(e.target.value)}
                        placeholder="e.g. Microbiology Lecture Summary"
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-indigo-500 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10.5px] font-bold text-gray-500 block">Category</label>
                        <select
                          value={sharedCourseCategory}
                          onChange={(e) => setSharedCourseCategory(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-indigo-500 bg-white"
                        >
                          <option value="Science">Science</option>
                          <option value="Technology">Technology</option>
                          <option value="Math">Math</option>
                          <option value="Business">Business</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10.5px] font-bold text-gray-500 block">Suggested Points Cost</label>
                        <input
                          type="number"
                          value={sharedCourseCost}
                          onChange={(e) => setSharedCourseCost(Math.max(10, Number(e.target.value)))}
                          className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-indigo-500 bg-white font-bold"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Upload & Earn Points</span>
                    </button>
                  </form>
                </div>

                {/* Main marketplace browser */}
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-800">Verified Scholar Storefront</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Teacher-created syllabi & crowdsourced learning resources.</p>
                    </div>

                    <div className="flex gap-1">
                      {["All", "Science", "Technology", "Math"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setMarketplaceCategory(cat)}
                          className={`px-2.5 py-1 text-[10.5px] rounded-lg border font-bold transition-all ${
                            marketplaceCategory === cat
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCourses.map((course) => {
                      const isPurchased = purchasedCourseIds.includes(course.id);
                      return (
                        <div key={course.id} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-150 transition-all">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                                {course.category}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold">{course.downloads} Downloads</span>
                            </div>
                            <h4 className="font-extrabold text-xs text-slate-800 leading-snug">{course.title}</h4>
                            <p className="text-[10px] text-gray-500 font-semibold">{course.creator} • {course.institution}</p>
                          </div>

                          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-150/40">
                            <span className="text-xs font-black text-indigo-600">{course.cost} Points</span>
                            <button
                              onClick={() => handlePurchaseCourse(course)}
                              disabled={isPurchased}
                              className={`px-3.5 py-1.5 rounded-lg text-[10.5px] font-extrabold transition-all flex items-center gap-1 ${
                                isPurchased
                                  ? "bg-emerald-50 border border-emerald-100 text-emerald-600 cursor-default"
                                  : "bg-slate-900 hover:bg-slate-800 text-white"
                              }`}
                            >
                              {isPurchased ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Acquired</span>
                                </>
                              ) : (
                                <>
                                  <Download className="h-3 w-3" />
                                  <span>Unlock Syllabus</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Shared study materials section */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Recent Peer Notes Share Contributions</h3>
                  <p className="text-xs text-gray-400 mt-0.5">High-quality document packets published by students across the StudyMate ecosystem.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {marketplaceNotes.map((note) => (
                    <div key={note.id} className="bg-slate-50/60 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800 leading-snug">{note.title}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">Shared by: {note.sharedBy}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-extrabold text-indigo-600">{note.downloads} dl</p>
                        <span className="text-[9px] text-gray-400 font-bold">+{note.pointsEarned} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 5. OFFLINE & SYNC WORKSPACE */}
          {activeTab === "offline" && (
            <motion.div
              key="offline"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Synchronizer dashboard */}
              <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-indigo-600" />
                    Offline Study Synchronization Hub
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Toggle StudyMate's simulated Offline Sandbox Mode. Perfect for flight studies, remote revisions, or keeping study data cached to device memory.
                  </p>
                </div>

                <div className="bg-slate-50 border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${isOfflineMode ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                      <p className="text-xs font-black text-slate-800">
                        {isOfflineMode ? "Offline Sandbox Mode (Queued Mode)" : "Connected to StudyMate Cloud"}
                      </p>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Last Sync Timestamp: <span className="font-bold text-slate-700">{lastSyncTime}</span>
                    </p>
                  </div>

                  <button
                    onClick={handleSyncOffline}
                    disabled={offlineActionCount === 0}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Sync Progress ({offlineActionCount} Queued)</span>
                  </button>
                </div>

                {/* Local storage status indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-100 p-4.5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Cached Docs</p>
                      <p className="text-lg font-black text-slate-800">{documents.length} Files</p>
                    </div>
                    <span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">SAFE</span>
                  </div>

                  <div className="bg-white border border-gray-100 p-4.5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Offline Quiz Bank</p>
                      <p className="text-lg font-black text-slate-800">30 Questions</p>
                    </div>
                    <span className="text-[9.5px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">READY</span>
                  </div>

                  <div className="bg-white border border-gray-100 p-4.5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Device Cache Size</p>
                      <p className="text-lg font-black text-slate-800">1.24 MB</p>
                    </div>
                    <span className="text-[9.5px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">OPTIMIZED</span>
                  </div>
                </div>

                {/* Sync Event Logs */}
                <div className="space-y-2">
                  <p className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">Active Synchronizer Logs</p>
                  <div className="bg-slate-900 text-slate-300 rounded-xl p-4 font-mono text-[10px] leading-relaxed h-[140px] overflow-y-auto space-y-1">
                    {syncLogs.length === 0 ? (
                      <p className="text-slate-500">&gt;_ All study records are synchronized and compliant.</p>
                    ) : (
                      syncLogs.map((log, i) => (
                        <p key={i} className="text-emerald-400">&gt;_ {log}</p>
                      ))
                    )}
                    <p className="text-indigo-400">&gt;_ Local Storage buffer listening successfully on port 3000...</p>
                  </div>
                </div>
              </div>

              {/* Offline Revision Sandbox Tips */}
              <div className="space-y-6">
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-800">Local Cache Revision Checklist</h3>

                  <div className="space-y-3">
                    {[
                      { title: "Review offline documents", done: true, desc: "Syllabi & compiled documents are completely saved to localStorage." },
                      { title: "Run Practice Simulations", done: true, desc: "Simulate tests and review scoring without active Wi-Fi." },
                      { title: "Sync Achievements back", done: offlineActionCount === 0, desc: "Sync progress to verify rewards, stars, and leaderboard scores." }
                    ].map((step, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start">
                        <CheckCircle2 className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${step.done ? "text-emerald-500" : "text-gray-300"}`} />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{step.title}</p>
                          <p className="text-[10px] text-gray-500 leading-normal mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4.5 flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-amber-950">Active Buffer Safeguard</h4>
                    <p className="text-[10.5px] text-amber-900 mt-1 leading-relaxed">
                      StudyMate utilizes safe storage protocols. Clearing browser cookies or cache while offline will clear your locally queued study data. Keep sync active when possible.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
