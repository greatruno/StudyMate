import React, { useState } from "react";
import { 
  Database, 
  Search, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  BookOpen, 
  MessageSquare, 
  Award, 
  Brain, 
  FolderOpen, 
  Send,
  HelpCircle,
  BookMarked,
  Tags,
  Compass,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { DocumentItem, UserAccount } from "../types";

interface KnowledgeBaseViewProps {
  documents: DocumentItem[];
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
  currentUser: UserAccount | null;
}

export default function KnowledgeBaseView({
  documents,
  selectedDocId,
  setSelectedDocId,
  setActiveTab,
  currentUser
}: KnowledgeBaseViewProps) {
  const [kbQuery, setKbQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    answer: string;
    sources: string[];
  } | null>(null);
  
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  // Active or most recently uploaded/accessed document
  const activeDoc = documents.find(d => d.id === selectedDocId) || documents[0] || null;

  const handleKbSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbQuery.trim() || isSearching) return;

    setIsSearching(true);
    setSearchResult(null);

    try {
      const response = await fetch("/api/generate/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDocId || "all",
          messages: [{ role: "user", text: kbQuery }],
          username: currentUser?.username || "global"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to query Knowledge Base");
      }

      // Read response stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let text = "";

      if (reader) {
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            text += decoder.decode(value, { stream: !done });
            setSearchResult({
              answer: text,
              sources: [] // We will dynamically extract source tags if present in the text
            });
          }
        }
      }

      // Try to parse matched sources from the answer text
      const sourceMatches: string[] = [];
      const sourceRegex = /\[Source Document \d+:\s*"([^"]+)"\]/gi;
      let match;
      while ((match = sourceRegex.exec(text)) !== null) {
        if (!sourceMatches.includes(match[1])) {
          sourceMatches.push(match[1]);
        }
      }
      
      // If no explicit sources matches found, list the active doc or "All Materials"
      if (sourceMatches.length === 0) {
        if (selectedDocId) {
          const doc = documents.find(d => d.id === selectedDocId);
          if (doc) sourceMatches.push(doc.title);
        } else {
          sourceMatches.push("Personal Study Library");
        }
      }

      setSearchResult({
        answer: text,
        sources: sourceMatches
      });

    } catch (error) {
      console.error("Error asking Knowledge Base:", error);
      setSearchResult({
        answer: "Sorry, I encountered an error while searching your knowledge base. Please make sure your study documents are compiled and try again.",
        sources: []
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleContinueStudying = () => {
    if (activeDoc) {
      setSelectedDocId(activeDoc.id);
      setActiveTab("home");
    } else {
      setActiveTab("upload");
    }
  };

  const handleOpenMaterial = (docId: string, tab: string = "home") => {
    setSelectedDocId(docId);
    setActiveTab(tab);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in space-y-8" id="kb-view">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900 leading-none flex items-center gap-2">
            <Database className="h-8 w-8 text-indigo-600" />
            My Knowledge Base
          </h2>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 block">
            Centralized repository of your intelligence files, parsed concepts, and RAG retrieval
          </span>
        </div>

        {/* Continue Studying Button */}
        {activeDoc ? (
          <button
            onClick={handleContinueStudying}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-lg shadow-gray-900/10 transition-all self-start md:self-center group"
            id="kb-continue-study-btn"
          >
            <span>Continue Studying: <strong className="text-indigo-400">{activeDoc.title.length > 24 ? activeDoc.title.substring(0, 24) + "..." : activeDoc.title}</strong></span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        ) : (
          <button
            onClick={() => setActiveTab("upload")}
            className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all self-start md:self-center"
            id="kb-upload-first-btn"
          >
            Compile Notes to Start
          </button>
        )}
      </div>

      {/* RAG Search Engine block */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-3xs space-y-5" id="kb-search-container">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900">Query All Uploaded Materials</h3>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              StudyMate will search across all saved notes and synthesize a direct answer
            </p>
          </div>
        </div>

        <form onSubmit={handleKbSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. What is the difference between prokaryotes and eukaryotes? or What are the main key concepts of Chapter 2?"
              value={kbQuery}
              onChange={(e) => setKbQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-indigo-500 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-400 text-gray-900"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !kbQuery.trim()}
            className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-200 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/15 transition-all flex items-center gap-2 shrink-0"
          >
            {isSearching ? "Searching..." : <><Send className="h-4 w-4" /> Ask KB</>}
          </button>
        </form>

        {/* Search results */}
        {(isSearching || searchResult) && (
          <div className="p-5 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-3.5 animate-fade-in" id="kb-search-result-block">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md">
                <Compass className="h-3.5 w-3.5 animate-spin" />
                Knowledge Retrieval Synthesizer
              </span>
              {searchResult?.sources && searchResult.sources.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Sources:</span>
                  {searchResult.sources.map((src, i) => (
                    <span key={i} className="text-[9px] bg-white border border-gray-200 text-gray-600 font-bold px-2 py-0.5 rounded-md shadow-3xs max-w-[150px] truncate" title={src}>
                      {src}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="text-xs text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
              {isSearching && !searchResult ? (
                <div className="flex items-center gap-2 text-indigo-600 font-bold">
                  <span className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce"></span>
                  Searching your study files...
                </div>
              ) : (
                searchResult?.answer
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Saved Materials vs Recent Learning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 cols: Saved Materials (with Chapter divisions and Material intelligence) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-gray-500" />
              <h3 className="text-base font-black text-gray-900">Saved Study Materials</h3>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.8 rounded-md font-bold uppercase">
              {documents.length} Files Saved
            </span>
          </div>

          {documents.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200 p-6 space-y-3">
              <FileText className="h-10 w-10 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-500">No knowledge base items yet.</p>
              <button
                onClick={() => setActiveTab("upload")}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                Compile your first study notes &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-4" id="kb-materials-list">
              {documents.map((doc) => {
                const isExpanded = expandedDocId === doc.id;
                const hasAI = !!doc.summary;
                const summary = doc.summary;

                return (
                  <div 
                    key={doc.id}
                    className="bg-white border border-gray-150 rounded-2xl shadow-3xs overflow-hidden transition-all hover:border-gray-300"
                    id={`kb-material-item-${doc.id}`}
                  >
                    {/* Item Header */}
                    <div 
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                      onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-gray-900 truncate leading-snug">
                            {doc.title}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                            {doc.wordCount} words • {hasAI ? "Processed & Compiled" : "Awaiting compilation"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          hasAI ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {hasAI ? "Ready" : "Incomplete"}
                        </span>
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                      </div>
                    </div>

                    {/* Expandable Material Intelligence Section */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-[#FAF9FF]/40 p-5 space-y-6 animate-slide-down">
                        {hasAI && summary ? (
                          <>
                            {/* Summary Block */}
                            <div className="space-y-2">
                              <h5 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                                <BookOpen className="h-3.5 w-3.5" /> High-Level Summary
                              </h5>
                              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                {summary.summaryText}
                              </p>
                            </div>

                            {/* Chapters / Sections breakdown */}
                            {summary.chapters && summary.chapters.length > 0 && (
                              <div className="space-y-2.5">
                                <h5 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                                  <BookMarked className="h-3.5 w-3.5" /> Identified Sections / Chapters
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {summary.chapters.map((chap, cIdx) => (
                                    <div key={cIdx} className="bg-white p-3 rounded-xl border border-gray-150 space-y-1">
                                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-900">
                                        <span>{chap.title}</span>
                                        <span className="text-[9px] text-gray-400">{chap.range}</span>
                                      </div>
                                      <p className="text-[11px] text-gray-500 leading-relaxed">
                                        {chap.summary}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Topics & Keywords */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {summary.topics && summary.topics.length > 0 && (
                                <div className="space-y-2">
                                  <h5 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                                    <Compass className="h-3.5 w-3.5" /> Primary Topics
                                  </h5>
                                  <div className="flex flex-wrap gap-1.5">
                                    {summary.topics.map((t, tIdx) => (
                                      <span key={tIdx} className="text-[10px] bg-white border border-gray-200 text-gray-700 font-bold px-2 py-1 rounded-lg">
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {summary.keywords && summary.keywords.length > 0 && (
                                <div className="space-y-2">
                                  <h5 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                                    <Tags className="h-3.5 w-3.5" /> Tagged Keywords
                                  </h5>
                                  <div className="flex flex-wrap gap-1">
                                    {summary.keywords.map((k, kIdx) => (
                                      <span key={kIdx} className="text-[9px] bg-indigo-50/60 border border-indigo-100/50 text-indigo-700 font-bold px-2 py-0.5 rounded-md">
                                        #{k}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Essential Terms dictionary */}
                            {summary.importantTerms && summary.importantTerms.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                                  <HelpCircle className="h-3.5 w-3.5" /> Core Terms & Definitions
                                </h5>
                                <div className="bg-white rounded-xl border border-gray-150 divide-y divide-gray-100">
                                  {summary.importantTerms.map((term, tIdx) => (
                                    <div key={tIdx} className="p-3 text-xs flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                                      <strong className="text-gray-900 font-bold uppercase tracking-wider sm:w-1/3 shrink-0">{term.term}</strong>
                                      <span className="text-gray-600 font-medium sm:w-2/3">{term.definition}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Learning Suggestions */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-gray-100">
                              {summary.quizTopics && summary.quizTopics.length > 0 && (
                                <div className="space-y-1.5">
                                  <h5 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1">
                                    <Award className="h-3.5 w-3.5" /> High-Yield Quiz Topics
                                  </h5>
                                  <ul className="space-y-1 pl-1">
                                    {summary.quizTopics.map((qt, idx) => (
                                      <li key={idx} className="text-[11px] text-gray-600 font-medium flex items-center gap-1.5">
                                        <span className="h-1.5 w-1.5 bg-amber-500 rounded-full" />
                                        {qt}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {summary.flashcardSuggestions && summary.flashcardSuggestions.length > 0 && (
                                <div className="space-y-1.5">
                                  <h5 className="text-[10px] font-bold text-rose-600 uppercase tracking-widest flex items-center gap-1">
                                    <Brain className="h-3.5 w-3.5" /> Recommended Flashcards
                                  </h5>
                                  <ul className="space-y-1 pl-1">
                                    {summary.flashcardSuggestions.map((fs, idx) => (
                                      <li key={idx} className="text-[11px] text-gray-600 font-medium flex items-center gap-1.5">
                                        <span className="h-1.5 w-1.5 bg-rose-500 rounded-full" />
                                        {fs}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* Quick Study Navigation */}
                            <div className="flex items-center justify-between gap-2.5 pt-4 border-t border-gray-100 flex-wrap">
                              <span className="text-[10px] text-gray-400 font-bold uppercase">Launch Workspace Module:</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenMaterial(doc.id, "home")}
                                  className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-[10px] font-bold shadow-3xs"
                                >
                                  Outline
                                </button>
                                <button
                                  onClick={() => handleOpenMaterial(doc.id, "chat")}
                                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold"
                                >
                                  Chat Tutor
                                </button>
                                <button
                                  onClick={() => handleOpenMaterial(doc.id, "quiz")}
                                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold"
                                >
                                  Start Quiz
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-4 space-y-3">
                            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
                            <div>
                              <p className="text-xs font-bold text-gray-800">Requires AI Compilation</p>
                              <p className="text-[11px] text-gray-400">Unlock automatic summaries, chapters, definitions, quiz topics and active-recall cards.</p>
                            </div>
                            <button
                              onClick={() => handleOpenMaterial(doc.id, "upload")}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold shadow-sm"
                            >
                              Run Compilation
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right col: Recent Learning & Platform Stats */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <h3 className="text-base font-black text-gray-900">Recent Learning</h3>
          </div>

          <div className="bg-white border border-gray-150 rounded-2xl p-5 space-y-5 shadow-3xs" id="kb-recent-learning-box">
            
            {/* Quick Stats list */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Learning Session</p>
                  <p className="text-xs font-bold text-gray-800 mt-0.5">
                    {activeDoc ? activeDoc.title : "No material selected"}
                  </p>
                  {activeDoc && (
                    <button
                      onClick={handleContinueStudying}
                      className="text-[10px] text-indigo-600 font-bold mt-1 block hover:underline"
                    >
                      Resume Study Outlines &rarr;
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                  <BookMarked className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Stored Pages</p>
                  <p className="text-xs font-bold text-gray-800 mt-0.5">
                    {documents.length > 0 ? `${(documents.reduce((sum, d) => sum + d.wordCount, 0) / 400).toFixed(0)} estimated pages` : "0 pages"}
                  </p>
                  <p className="text-[10px] text-gray-400">Calculated across your knowledge files</p>
                </div>
              </div>
            </div>

            {/* Recent documents shortcut list */}
            {documents.length > 0 && (
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Quick Re-open Shortcuts</p>
                <div className="space-y-2">
                  {documents.slice(0, 3).map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleOpenMaterial(doc.id, "home")}
                      className="w-full text-left p-2.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-200/60 flex items-center justify-between text-xs font-medium text-gray-700 transition-all"
                    >
                      <span className="truncate pr-2 max-w-[160px]">{doc.title}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick tips card */}
            <div className="bg-slate-900 p-4 rounded-xl text-white space-y-1.5 shadow-3xs">
              <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">Active Recall Strategy</span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                To maximize your score retention, use StudyMate's <strong>Smart Quiz</strong> and <strong>Flashcards</strong> modules sequentially after reviewing your summary outlines.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
