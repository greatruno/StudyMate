import React, { useState, useEffect } from "react";
import {
  Layers,
  Cpu,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Tag,
  BookOpen,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronRight,
  Terminal,
  Activity,
  Zap,
  Code2,
  ListFilter,
  BarChart2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";

interface PipelineInspectorProps {
  documentId: string;
  documentTitle?: string;
  onClose?: () => void;
  className?: string;
}

export default function PipelineInspector({
  documentId,
  documentTitle,
  onClose,
  className = ""
}: PipelineInspectorProps) {
  const { session, token } = useAuth();
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [chunks, setChunks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reprocessing, setReprocessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "metadata" | "chunks" | "vector" | "logs">("overview");
  const [expandedChunkId, setExpandedChunkId] = useState<string | null>(null);

  // Vector Search Tester State
  const [testSearchQuery, setTestSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [embeddingStatus, setEmbeddingStatus] = useState<any>(null);

  const activeToken = token || session?.access_token;

  const fetchPipelineInfo = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = {};
      if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

      // Fetch status
      const resStatus = await fetch(`/api/v1/documents/${documentId}/pipeline-status`, { headers });
      if (resStatus.ok) {
        const data = await resStatus.json();
        setPipelineData(data.pipeline);
      }

      // Fetch chunks
      const resChunks = await fetch(`/api/v1/documents/${documentId}/chunks`, { headers });
      if (resChunks.ok) {
        const dataChunks = await resChunks.json();
        setChunks(dataChunks.chunks || []);
      }

      // Fetch embedding status
      const resEmbed = await fetch(`/api/v1/documents/${documentId}/embedding-status`, { headers });
      if (resEmbed.ok) {
        const dataEmbed = await resEmbed.json();
        setEmbeddingStatus(dataEmbed.status);
      }
    } catch (err) {
      console.error("Error fetching pipeline info:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunVectorSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testSearchQuery.trim()) return;

    try {
      setSearching(true);
      const headers: Record<string, string> = {};
      if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

      const res = await fetch(`/api/v1/documents/${documentId}/search?q=${encodeURIComponent(testSearchQuery.trim())}&topK=5`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error("Error executing test vector search:", err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchPipelineInfo();

    // Poll if pipeline is currently running
    const interval = setInterval(() => {
      if (
        pipelineData?.status === "extracting" ||
        pipelineData?.status === "cleaning" ||
        pipelineData?.status === "analyzing" ||
        pipelineData?.status === "chunking" ||
        pipelineData?.status === "embedding"
      ) {
        fetchPipelineInfo();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [documentId]);

  const handleTriggerReProcess = async () => {
    try {
      setReprocessing(true);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;

      const response = await fetch(`/api/v1/documents/${documentId}/process`, {
        method: "POST",
        headers
      });

      if (response.ok) {
        setTimeout(fetchPipelineInfo, 1000);
      }
    } catch (e) {
      console.error("Failed to re-process document:", e);
    } finally {
      setReprocessing(false);
    }
  };

  const steps = [
    { id: "uploaded", label: "Upload", icon: CheckCircle2 },
    { id: "extracting", label: "Extraction", icon: Cpu },
    { id: "cleaning", label: "Cleaning", icon: Sparkles },
    { id: "analyzing", label: "Metadata", icon: Activity },
    { id: "chunking", label: "Chunking", icon: Layers },
    { id: "embedding", label: "Embeddings", icon: Code2 },
    { id: "ready", label: "RAG Indexed", icon: CheckCircle2 }
  ];

  const getStepState = (stepId: string) => {
    const statusOrder = ["uploaded", "extracting", "cleaning", "analyzing", "chunking", "embedding", "indexed", "ready", "completed"];
    const currentStatus = pipelineData?.status || "uploaded";

    if (currentStatus === "failed") return "failed";
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepId);

    if (stepIndex < currentIndex || currentStatus === "completed" || currentStatus === "ready") return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  const metadata = pipelineData?.metadata;

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 rounded-md">
                Phase 2.2 Pipeline
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {documentId}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {documentTitle || metadata?.title || "Document Knowledge Processing Pipeline"}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTriggerReProcess}
            disabled={reprocessing}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {reprocessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
            <span>Re-Run Pipeline</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 text-xs font-bold rounded-xl"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: "overview", label: "Pipeline Flow", icon: Zap },
          { id: "metadata", label: `Metadata (${metadata ? "Extracted" : "Pending"})`, icon: Tag },
          { id: "chunks", label: `Semantic Chunks (${chunks.length})`, icon: Layers },
          { id: "vector", label: `Vector RAG & Embeddings`, icon: Code2 },
          { id: "logs", label: "Execution Logs", icon: Terminal }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview Flow */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Step Stepper Visualizer */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {steps.map((step, idx) => {
              const state = getStepState(step.id);
              const StepIcon = step.icon;

              return (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                    state === "completed"
                      ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200"
                      : state === "current"
                      ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20"
                      : state === "failed"
                      ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                      Step {idx + 1}
                    </span>
                    {state === "current" && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />}
                    {state === "completed" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {state === "failed" && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                  </div>
                  <div>
                    <StepIcon className="w-5 h-5 mb-1" />
                    <p className="text-xs font-bold leading-tight">{step.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pipeline Status</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white capitalize flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    pipelineData?.status === "completed"
                      ? "bg-emerald-500"
                      : pipelineData?.status === "failed"
                      ? "bg-rose-500"
                      : "bg-indigo-500 animate-pulse"
                  }`}
                />
                {pipelineData?.status || "Processing"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Processing Time</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {pipelineData?.processingTimeMs ? `${pipelineData.processingTimeMs} ms` : "In Progress..."}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chunks Created</p>
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
                <Layers className="w-3.5 h-3.5" />
                {chunks.length} Semantic Chunks
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academic Domain</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                {metadata?.academicField || "Analyzing..."}
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {pipelineData?.processingError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Pipeline Error Diagnostic</h4>
                <p className="text-xs font-mono mt-1">{pipelineData.processingError}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Metadata */}
      {activeTab === "metadata" && (
        <div className="space-y-4">
          {!metadata ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
              Metadata extraction in progress...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document Overview Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  Classification & Metrics
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">Academic Field:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{metadata.academicField}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">Subject Area:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{metadata.subject}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">Estimated Difficulty:</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                      {metadata.estimatedDifficulty}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">Est. Reading Time:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{metadata.estimatedReadingTimeMinutes} mins</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">Primary Language:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{metadata.language}</span>
                  </div>
                </div>
              </div>

              {/* Structural Analysis Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-emerald-500" />
                  Structural Components
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Word Count</p>
                    <p className="text-base font-bold text-slate-900 dark:text-white">{metadata.wordCount}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Character Count</p>
                    <p className="text-base font-bold text-slate-900 dark:text-white">{metadata.characterCount}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Headings / Sections</p>
                    <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">{metadata.sectionCount}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Tables Detected</p>
                    <p className="text-base font-bold text-slate-900 dark:text-white">{metadata.tableCount}</p>
                  </div>
                </div>

                {/* Keywords */}
                {metadata.keywords && metadata.keywords.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Key Domain Concepts</p>
                    <div className="flex flex-wrap gap-1">
                      {metadata.keywords.map((kw: string) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Semantic Chunks */}
      {activeTab === "chunks" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span>Displaying {chunks.length} semantically partitioned document chunks</span>
            <span>Logical Boundaries: Headings, Concepts, Exercises, Math, Code</span>
          </div>

          {chunks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No semantic chunks available. Trigger pipeline run above.
            </div>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {chunks.map((chk, idx) => {
                const isExpanded = expandedChunkId === chk.id || expandedChunkId === chk.chunk_id;
                return (
                  <div
                    key={chk.id || chk.chunk_id || idx}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 transition-all"
                  >
                    <div
                      onClick={() => setExpandedChunkId(isExpanded ? null : (chk.id || chk.chunk_id))}
                      className="flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md text-[10px] font-bold shrink-0">
                          Chunk #{chk.chunk_number || idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {chk.heading || "Section Chunk"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-mono font-semibold uppercase">
                          {chk.chunk_type || "explanation"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {chk.token_count || Math.ceil((chk.content?.length || 0) / 4)} tokens
                        </span>
                      </div>
                    </div>

                    {/* Preview / Full Content */}
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 whitespace-pre-wrap">
                      {isExpanded ? chk.content : chk.content?.substring(0, 160) + (chk.content?.length > 160 ? "..." : "")}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Vector RAG & Embeddings Inspector */}
      {activeTab === "vector" && (
        <div className="space-y-5">
          {/* Embedding Status Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Embedding Model</p>
              <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-0.5">{embeddingStatus?.model || "text-embedding-004"}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Embedded Chunks</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                {embeddingStatus?.embeddedChunks || chunks.length} / {embeddingStatus?.totalChunks || chunks.length} Chunks
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Failed Embeddings</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                {embeddingStatus?.failedChunks || 0} Failed
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Vector Dimension</p>
              <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-0.5">768 Dim Vector</p>
            </div>
          </div>

          {/* Interactive Vector Similarity Search Tester */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-500" />
              Interactive Cosine Similarity Search Tester
            </h4>

            <form onSubmit={handleRunVectorSearch} className="flex gap-2">
              <input
                type="text"
                value={testSearchQuery}
                onChange={(e) => setTestSearchQuery(e.target.value)}
                placeholder="Type a query to search document vector index (e.g. 'What is TCP congestion control?')..."
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={searching || !testSearchQuery.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Vector Search</span>
              </button>
            </form>

            {/* Results Display */}
            {searchResults && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-1">
                  <span>Found {searchResults.results?.length || 0} top matching chunks</span>
                  <span className="font-mono text-[10px]">Search Latency: {searchResults.latencyMs} ms</span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {searchResults.results?.map((res: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          Match #{idx + 1} | Chunk #{res.chunkNumber} ({res.heading || "Section"})
                        </span>
                        <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px]">
                          Similarity Score: {Math.round((res.similarityScore || 0) * 100)}%
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
                        {res.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Execution Logs */}
      {activeTab === "logs" && (
        <div className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs space-y-1.5 max-h-[320px] overflow-y-auto">
          {pipelineData?.logs && pipelineData.logs.length > 0 ? (
            pipelineData.logs.map((log: string, idx: number) => (
              <div key={idx} className="leading-relaxed border-b border-slate-900 pb-1">
                {log}
              </div>
            ))
          ) : (
            <div className="text-slate-500 italic">No execution logs recorded yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
