import React, { useState } from "react";
import {
  Clock,
  Star,
  Bookmark,
  FileText,
  Sparkles,
  Zap,
  Award,
  ChevronRight,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { DocumentItem } from "../../types";

interface ProductivityToolbarProps {
  documents: DocumentItem[];
  activeDoc: DocumentItem | null;
  onSelectDoc: (docId: string, tab?: string) => void;
  onNavigateTab: (tab: string, docId?: string) => void;
}

export const ProductivityToolbar: React.FC<ProductivityToolbarProps> = ({
  documents,
  activeDoc,
  onSelectDoc,
  onNavigateTab,
}) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("studymate_favorite_doc_ids");
      return saved ? JSON.parse(saved) : documents.slice(0, 2).map((d) => d.id);
    } catch {
      return [];
    }
  });

  const toggleFavorite = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (favorites.includes(docId)) {
      updated = favorites.filter((id) => id !== docId);
    } else {
      updated = [...favorites, docId];
    }
    setFavorites(updated);
    try {
      localStorage.setItem("studymate_favorite_doc_ids", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const favoriteDocs = documents.filter((d) => favorites.includes(d.id));
  const recentDocs = documents.slice(0, 4);

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3.5 px-4 lg:px-8 space-y-3">
      {/* CONTINUE READING BANNER */}
      {activeDoc && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-600/80 text-white shrink-0">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase text-indigo-300">Continue Reading</span>
              <h4 className="font-extrabold text-white text-xs truncate max-w-sm">{activeDoc.title}</h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectDoc(activeDoc.id, "home")}
              className="px-3 py-1.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-xs transition-colors shadow-2xs cursor-pointer"
            >
              Resume Workspace →
            </button>
          </div>
        </div>
      )}

      {/* QUICK ACCESS CHIPS & FAVORITES */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-none text-xs font-semibold">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Pinned Courses:
          </span>
          {favoriteDocs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onSelectDoc(doc.id, "home")}
              className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1.5 text-xs truncate max-w-[150px]"
            >
              <FileText className="w-3 h-3 text-amber-600" />
              <span className="truncate">{doc.title}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0 text-slate-500 text-[11px]">
          <span className="font-extrabold uppercase text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Recent Materials:
          </span>
          {recentDocs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onSelectDoc(doc.id, "home")}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 truncate max-w-[120px] transition-colors cursor-pointer"
            >
              {doc.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
