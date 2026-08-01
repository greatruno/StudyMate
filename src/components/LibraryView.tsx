import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Award, 
  Brain, 
  MessageSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { DocumentItem } from "../types";

interface LibraryViewProps {
  documents: DocumentItem[];
  setDocuments: (docs: DocumentItem[]) => void;
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
}

export default function LibraryView({
  documents,
  setDocuments,
  selectedDocId,
  setSelectedDocId,
  setActiveTab
}: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter documents
  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (docId: string) => {
    const updatedDocs = documents.filter((doc) => doc.id !== docId);
    setDocuments(updatedDocs);
    
    // If we deleted the active document, auto-select another one or null
    if (selectedDocId === docId) {
      if (updatedDocs.length > 0) {
        setSelectedDocId(updatedDocs[0].id);
      } else {
        setSelectedDocId(null);
      }
    }
    setDeleteConfirmId(null);
  };

  const handleReopen = (docId: string, tab: string = "home") => {
    setSelectedDocId(docId);
    setActiveTab(tab);
  };

  const totalWords = documents.reduce((sum, d) => sum + d.wordCount, 0);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in space-y-8" id="library-view">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900 leading-none">My Study Library</h2>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 block">
            Manage your personal library and resume AI learning sessions
          </span>
        </div>
        <button
          onClick={() => setActiveTab("upload")}
          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-center"
          id="lib-add-new-btn"
        >
          <Plus className="h-4 w-4" />
          Compile New Notes
        </button>
      </div>

      {/* Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="lib-quick-stats">
        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-3xs flex items-center gap-3.5">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Documents</p>
            <p className="text-lg font-black text-gray-900">{documents.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-3xs flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Compiled Materials</p>
            <p className="text-lg font-black text-gray-900">
              {documents.filter(d => d.summary).length} / {documents.length}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-3xs flex items-center gap-3.5">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Words Processed</p>
            <p className="text-lg font-black text-gray-900">{totalWords.toLocaleString()} words</p>
          </div>
        </div>
      </div>

      {/* Filter and search utilities */}
      <div className="flex flex-col sm:flex-row items-center gap-3.5" id="lib-filters">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 focus:border-indigo-500 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
          />
        </div>
      </div>

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200 shadow-3xs max-w-2xl mx-auto p-6 space-y-4">
          <FileText className="h-12 w-12 text-gray-300 mx-auto" />
          <div className="space-y-1">
            <p className="text-base font-bold text-gray-900">No study materials found</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              {searchQuery 
                ? "No items match your search query. Try typing another keyword." 
                : "Your personal study library is currently empty. Upload your syllabus or copy-paste lecture notes to start!"}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={() => setActiveTab("upload")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 hover:bg-indigo-500 transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Upload Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="lib-grid">
          {filteredDocs.map((doc) => {
            const hasAI = !!doc.summary;
            const isSelected = selectedDocId === doc.id;

            return (
              <div 
                key={doc.id} 
                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between gap-5 shadow-3xs relative group ${
                  isSelected 
                    ? "border-indigo-500 ring-2 ring-indigo-500/10" 
                    : "border-gray-200 hover:border-gray-300 hover:shadow-2xs"
                }`}
                id={`lib-card-${doc.id}`}
              >
                
                {/* Upper row: Icon, Details, and Delete action */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`p-3 rounded-xl border shrink-0 ${
                      isSelected 
                        ? "bg-indigo-50 border-indigo-100 text-indigo-600" 
                        : "bg-slate-50 border-gray-150 text-indigo-600 group-hover:bg-indigo-50/50 group-hover:border-indigo-100/40"
                    }`}>
                      <FileText className="h-5.5 w-5.5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-black text-gray-900 leading-snug truncate pr-1" title={doc.title}>
                          {doc.title}
                        </h4>
                        {isSelected && (
                          <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded-md">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-gray-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-300" />
                          {new Date(doc.uploadedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                        <span>•</span>
                        <span>{doc.wordCount} words</span>
                      </div>
                    </div>
                  </div>

                  {/* Deletion confirmation button */}
                  <div className="shrink-0 relative">
                    {deleteConfirmId === doc.id ? (
                      <div className="absolute right-0 top-0 bg-white border border-rose-150 p-2.5 rounded-xl shadow-lg flex items-center gap-2 z-20 min-w-[140px] animate-fade-in">
                        <p className="text-[10px] text-rose-700 font-bold uppercase shrink-0">Confirm Delete?</p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="bg-rose-600 text-white px-2 py-1 rounded text-[9px] font-bold hover:bg-rose-500"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="bg-gray-150 text-gray-700 px-2 py-1 rounded text-[9px] font-bold hover:bg-gray-200"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(doc.id)}
                        className="p-1.5 text-gray-300 hover:text-rose-600 hover:bg-rose-50/50 rounded-lg transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* AI status summary */}
                <div className="bg-[#F8F9FF] border border-indigo-50/60 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-950">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                      StudyMate Status:
                    </span>
                    <span className={hasAI ? "text-green-600" : "text-amber-600 flex items-center gap-1"}>
                      {hasAI ? "Fully Compiled" : "Requires Analysis"}
                    </span>
                  </div>
                  {hasAI && doc.summary ? (
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {doc.summary.summaryText}
                    </p>
                  ) : (
                    <p className="text-[11px] text-amber-600 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Trigger document compilation to unlock smart study modules.
                    </p>
                  )}
                </div>

                {/* Study Shortcuts and Navigation Buttons */}
                <div className="flex items-center justify-between gap-2.5 pt-1 border-t border-gray-100 flex-wrap sm:flex-nowrap">
                  {hasAI ? (
                    <>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Summary shortcut */}
                        <button
                          onClick={() => handleReopen(doc.id, "home")}
                          className="px-2.5 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 transition-colors flex items-center gap-1"
                          title="Open Summary"
                        >
                          <BookOpen className="h-3 w-3 text-gray-400" />
                          Outline
                        </button>
                        {/* Chat shortcut */}
                        <button
                          onClick={() => handleReopen(doc.id, "chat")}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                          title="Chat with Tutor"
                        >
                          <MessageSquare className="h-3 w-3" />
                          Chat
                        </button>
                        {/* Quiz shortcut */}
                        <button
                          onClick={() => handleReopen(doc.id, "quiz")}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                          title="Take smart quiz"
                        >
                          <Award className="h-3 w-3" />
                          Quiz
                        </button>
                        {/* Flashcards shortcut */}
                        <button
                          onClick={() => handleReopen(doc.id, "flashcards")}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                          title="Practice flashcards"
                        >
                          <Brain className="h-3 w-3" />
                          Cards
                        </button>
                      </div>

                      {/* Main resume button */}
                      <button
                        onClick={() => handleReopen(doc.id, "home")}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-all shrink-0 ml-auto flex items-center gap-1 shadow-3xs"
                      >
                        Resume
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleReopen(doc.id, "upload")}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Run Compilation Now
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
