import React, { useState } from "react";
import {
  FileCheck2,
  BookOpen,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
  ListCheck,
  Search,
  Filter,
  Layers,
  FileText,
} from "lucide-react";
import { DocumentItem } from "../types";

interface RevisionPacksViewProps {
  documents: DocumentItem[];
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
}

export const RevisionPacksView: React.FC<RevisionPacksViewProps> = ({
  documents,
  selectedDocId,
  setSelectedDocId,
}) => {
  const activeDoc = documents.find((d) => d.id === selectedDocId) || documents[0] || null;

  const [activeTab, setActiveTab] = useState<"cheatsheet" | "formulas" | "checklist" | "theorems">("cheatsheet");

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 lg:p-8">
      {/* HEADER BANNER */}
      <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck2 className="w-3.5 h-3.5 text-teal-500" /> Exam Revision Kits & Cheatsheets
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Exam Revision Packs & Cheatsheets 📖
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          High-density single-page syllabus revision kits, formula sheets, key definitions, and last-minute exam checklists generated from your compiled materials.
        </p>
      </div>

      {/* DOCUMENT SELECTOR & REVISION KIT CONTROLS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase">Target Course:</span>
          <select
            value={activeDoc?.id || ""}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.subject || "General"})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("📄 Revision Kit exported to PDF (Simulated).")}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4" /> Export PDF Revision Kit
          </button>
        </div>
      </div>

      {/* REVISION SUB TABS */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab("cheatsheet")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "cheatsheet"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          📄 1-Page Cheatsheet
        </button>

        <button
          onClick={() => setActiveTab("formulas")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "formulas"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          🧮 Formulas & Equations
        </button>

        <button
          onClick={() => setActiveTab("checklist")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "checklist"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          ☑️ Exam Preparedness Checklist
        </button>

        <button
          onClick={() => setActiveTab("theorems")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "theorems"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          💡 Key Definitions & Theorems
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
        {activeDoc ? (
          <>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Course Syllabus Pack</span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{activeDoc.title}</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] uppercase">
                Ready for High-Yield Review
              </span>
            </div>

            {activeTab === "cheatsheet" && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h3 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">Core Summary</h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {activeDoc.summary?.summaryText || "Full syllabus key takeaways compiled into high-density reference points."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeDoc.summary?.keyConcepts.map((kc, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase">{kc.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{kc.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "formulas" && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-400">Key Formulas & Notation Reference</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 font-mono text-xs">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Bayes Theorem Formula</span>
                    <code>P(A|B) = [P(B|A) * P(A)] / P(B)</code>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 font-mono text-xs">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Time Complexity Relation</span>
                    <code>O(1) &lt; O(log N) &lt; O(N) &lt; O(N log N) &lt; O(N^2)</code>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "checklist" && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-400">Exam Night Final Mastery Checklist</h3>
                <div className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Mastered all key definitions and terminology cards</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Scored 80%+ on Timed Practice Exam simulator</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Reviewed flashcard active recall deck for weak topics</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "theorems" && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-400">Core Theorems & Proofs Summary</h3>
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs leading-relaxed space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Central Limit Theorem</h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    The distribution of sample means approaches a normal distribution as sample size increases, regardless of the population distribution shape.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-bold">Select a course to view its revision kit.</p>
          </div>
        )}
      </div>
    </div>
  );
};
