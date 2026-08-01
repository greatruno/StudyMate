import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  Search,
  BookOpen,
  Filter,
  Lightbulb,
  ArrowRight,
  Download,
  Share2,
  CheckCircle2,
  ListFilter,
  Brain,
  Award,
  Zap,
} from "lucide-react";
import { DocumentItem } from "../types";

interface SummariesViewProps {
  documents: DocumentItem[];
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
}

export const SummariesView: React.FC<SummariesViewProps> = ({
  documents,
  selectedDocId,
  setSelectedDocId,
  setActiveTab,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const docsWithSummary = documents.filter((d) => Boolean(d.summary));

  const subjects = Array.from(
    new Set(docsWithSummary.map((d) => d.subject || "General"))
  );

  const filteredDocs = docsWithSummary.filter((doc) => {
    const matchesSubject =
      subjectFilter === "all" || (doc.subject || "General") === subjectFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      doc.title.toLowerCase().includes(q) ||
      doc.summary?.summaryText.toLowerCase().includes(q) ||
      doc.summary?.keyConcepts.some((c) =>
        c.title.toLowerCase().includes(q) || c.explanation.toLowerCase().includes(q)
      );
    return matchesSubject && matchesQuery;
  });

  const activeDoc =
    documents.find((d) => d.id === selectedDocId) || filteredDocs[0] || null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 lg:p-8">
      {/* HEADER BANNER */}
      <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            AI Executive Summaries & Outlines
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Cognitive Summaries & Memory Outlines 📚
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          High-yield AI summary briefs, essential takeaways, key terminology cards, and cognitive memory hooks compiled from your notes.
        </p>
      </div>

      {/* CONTROLS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search key concepts, topics, terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Subject:
          </span>
          <button
            onClick={() => setSubjectFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              subjectFilter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            All Subjects ({docsWithSummary.length})
          </button>
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => setSubjectFilter(subj)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                subjectFilter === subj
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN TWO COLUMN VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Summary Documents Selector */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
            Compiled Summaries ({filteredDocs.length})
          </h3>

          {filteredDocs.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p className="font-bold text-slate-700 dark:text-slate-300">No summaries found</p>
              <p className="mt-1 text-[11px]">Compile notes in Upload tab to generate AI summaries.</p>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isSelected = activeDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 shadow-xs"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                      {doc.subject || "General"}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {doc.wordCount} words
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2 truncate">
                    {doc.title}
                  </h4>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {doc.summary?.summaryText}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: Detailed Summary Display */}
        <div className="lg:col-span-2 space-y-6">
          {activeDoc && activeDoc.summary ? (
            <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                    {activeDoc.subject || "General"}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                    {activeDoc.summary.title || activeDoc.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedDocId(activeDoc.id);
                      setActiveTab("quiz");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <Award className="w-3.5 h-3.5" /> Practice Quiz
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDocId(activeDoc.id);
                      setActiveTab("flashcards");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <Zap className="w-3.5 h-3.5" /> Flashcards
                  </button>
                </div>
              </div>

              {/* Summary Brief */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Executive Brief
                </h3>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {activeDoc.summary.summaryText}
                </p>
              </div>

              {/* Key Concepts Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Key Concepts & Terminology ({activeDoc.summary.keyConcepts.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeDoc.summary.keyConcepts.map((kc, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors space-y-1"
                    >
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">
                        {kc.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {kc.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Essential Takeaways & Study Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                    Essential Takeaways
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {activeDoc.summary.bulletPoints.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" /> Memory Hooks & Tips
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {activeDoc.summary.studyTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold shrink-0">#{idx + 1}</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
              <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">Select a Document</h3>
              <p className="text-xs mt-1">Choose a study material from the left panel to inspect its AI summary.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
