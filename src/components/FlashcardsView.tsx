import React, { useState, useEffect } from "react";
import { 
  Brain, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { DocumentItem, Flashcard } from "../types";

interface FlashcardsViewProps {
  documents: DocumentItem[];
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  onCardMastered: () => void;
  onUpdateDocumentFlashcards?: (docId: string, flashcards: Flashcard[]) => void;
}

export default function FlashcardsView({
  documents,
  selectedDocId,
  setSelectedDocId,
  onCardMastered,
  onUpdateDocumentFlashcards
}: FlashcardsViewProps) {
  const activeDoc = documents.find((doc) => doc.id === selectedDocId) || null;

  // Local Deck State
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  
  // Concept tags filtering
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Scoring state tracker
  const [masteredIds, setMasteredIds] = useState<number[]>([]);
  const [needsReviewIds, setNeedsReviewIds] = useState<number[]>([]);

  // Sync cards when document context changes
  useEffect(() => {
    if (activeDoc && activeDoc.flashcards) {
      setCards(activeDoc.flashcards);
    } else {
      setCards([]);
    }
    setCurrentIdx(0);
    setIsFlipped(false);
    setSelectedTag(null);
    setMasteredIds([]);
    setNeedsReviewIds([]);
  }, [selectedDocId, activeDoc]);

  // Extract unique concept tags
  const conceptTags = Array.from(new Set(cards.map((c) => c.concept).filter(Boolean)));

  // Filtered Cards list
  const filteredCards = selectedTag 
    ? cards.filter((c) => c.concept === selectedTag)
    : cards;

  const currentCard = filteredCards[currentIdx] || null;

  const handleNext = () => {
    if (currentIdx + 1 < filteredCards.length) {
      setCurrentIdx((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  // Active recall responses
  const handleMarkMastered = () => {
    if (!masteredIds.includes(currentIdx)) {
      setMasteredIds([...masteredIds, currentIdx]);
      // Remove from needs review if it was there
      setNeedsReviewIds(needsReviewIds.filter((id) => id !== currentIdx));
      onCardMastered();
    }
    // Auto advance after short delay
    setTimeout(() => {
      if (currentIdx + 1 < filteredCards.length) {
        handleNext();
      }
    }, 400);
  };

  const handleMarkNeedsReview = () => {
    if (!needsReviewIds.includes(currentIdx)) {
      setNeedsReviewIds([...needsReviewIds, currentIdx]);
      // Remove from mastered if it was there
      setMasteredIds(masteredIds.filter((id) => id !== currentIdx));
    }
    setTimeout(() => {
      if (currentIdx + 1 < filteredCards.length) {
        handleNext();
      }
    }, 400);
  };

  const handleResetSession = () => {
    setCurrentIdx(0);
    setIsFlipped(false);
    setMasteredIds([]);
    setNeedsReviewIds([]);
  };

  // 1. Empty Upload State
  if (documents.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-6 bg-white border border-gray-200 rounded-3xl shadow-sm" id="flash-empty-docs">
        <Brain className="h-14 w-14 text-indigo-400 mx-auto mb-4" />
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">No Flashcards Available</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          You need study materials first! Navigate to the Upload tab to paste or upload notes, and we'll instantly generate physical revision cards.
        </p>
      </div>
    );
  }

  // 2. Select document state
  if (!activeDoc) {
    return (
      <div className="max-w-3xl mx-auto p-6 lg:p-8 space-y-6" id="flash-select-doc">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Active Recall Flashcards</h2>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 block">
            Select a textbook or lecture set to practice flashcard memory recall
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className="p-5 bg-white hover:bg-slate-50 border border-gray-200 hover:border-indigo-500/50 rounded-2xl text-left transition-all flex flex-col justify-between group h-44"
            >
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-1">
                  Revision Deck
                </span>
                <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {doc.title}
                </p>
              </div>
              <div className="flex items-center justify-between w-full border-t border-gray-100 pt-3 text-[11px] text-gray-400 font-semibold">
                <span>{doc.flashcards ? doc.flashcards.length : 0} Cards</span>
                <span className="text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Study Deck <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Generate flashcards with AI on demand
  const handleGenerateFlashcards = async () => {
    if (!activeDoc) return;
    setIsGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: activeDoc.id,
          content: activeDoc.content,
        })
      });

      if (!res.ok) {
        throw new Error(await res.text() || "Failed to generate flashcards.");
      }

      const data = await res.json();
      if (!data.flashcards || data.flashcards.length === 0) {
        throw new Error("No flashcards were returned by the AI engine.");
      }

      setCards(data.flashcards);
      if (onUpdateDocumentFlashcards) {
        onUpdateDocumentFlashcards(activeDoc.id, data.flashcards);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during compilation.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Document has no cards generated yet
  if (cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-6 bg-white border border-gray-200 rounded-3xl shadow-sm" id="flash-no-cards">
        <Brain className="h-12 w-12 text-indigo-500 mx-auto mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-gray-900">Flashcards Pending</h3>
        <p className="text-sm text-gray-500 mt-2">
          Your document "{activeDoc.title}" does not have active recall cards compiled.
        </p>
        
        {error && (
          <p className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-semibold mt-4 max-w-md mx-auto">
            ⚠️ {error}
          </p>
        )}

        <div className="mt-6">
          <button
            onClick={handleGenerateFlashcards}
            disabled={isGenerating}
            className={`px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto transition-all shadow-md shadow-indigo-600/15 ${
              isGenerating ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Compiling Active Recall Cards...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Compile Flashcard Deck
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-8 space-y-6" id="flashcards-view">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
            ACTIVE RECALL PRACTICE
          </span>
          <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none mt-1">
            {activeDoc.title.length > 50 ? activeDoc.title.substring(0, 50) + "..." : activeDoc.title}
          </h3>
        </div>

        {/* Current Deck Scores */}
        <div className="flex gap-4 self-start sm:self-auto">
          <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-xl border border-green-100 text-[11px] font-bold">
            Mastered: {masteredIds.length}
          </div>
          <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-100 text-[11px] font-bold">
            Review: {needsReviewIds.length}
          </div>
        </div>
      </div>

      {/* Category Concept Filters */}
      {conceptTags.length > 1 && (
        <div className="flex flex-wrap gap-2 items-center" id="tag-filters">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">
            Tags:
          </span>
          <button
            onClick={() => { setSelectedTag(null); setCurrentIdx(0); setIsFlipped(false); }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              selectedTag === null 
                ? "bg-indigo-600 text-white" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            All ({cards.length})
          </button>
          {conceptTags.map((tag) => {
            const count = cards.filter((c) => c.concept === tag).length;
            return (
              <button
                key={tag}
                onClick={() => { setSelectedTag(tag); setCurrentIdx(0); setIsFlipped(false); }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedTag === tag 
                    ? "bg-indigo-600 text-white" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                {tag} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Interactive Card Stage */}
      {currentCard ? (
        <div className="space-y-6">
          
          {/* Main Flipping Card Frame */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className={`min-h-80 w-full relative bg-white border-2 border-gray-200 rounded-3xl p-8 flex flex-col justify-between items-center text-center cursor-pointer select-none transition-all duration-300 transform shadow-xs hover:border-indigo-400/80 active:scale-98 ${
              isFlipped ? "ring-2 ring-indigo-50 bg-indigo-50/15" : ""
            }`}
            id="flashcard-interactive-canvas"
          >
            {/* Top Row: Info */}
            <div className="w-full flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100 font-bold">
                {currentCard.concept || "Concept"}
              </span>
              <span>
                Card {currentIdx + 1} of {filteredCards.length}
              </span>
            </div>

            {/* Central content */}
            <div className="my-6 max-w-md">
              {!isFlipped ? (
                <div className="space-y-2 animate-fade-in">
                  <p className="text-xs text-indigo-500 uppercase font-black tracking-widest">Question</p>
                  <h4 className="text-xl md:text-2xl font-black text-gray-900 leading-snug">
                    {currentCard.front}
                  </h4>
                </div>
              ) : (
                <div className="space-y-2 animate-fade-in text-indigo-950">
                  <p className="text-xs text-green-600 uppercase font-black tracking-widest">Answer & Concept</p>
                  <p className="text-lg md:text-xl font-bold leading-relaxed text-indigo-900">
                    {currentCard.back}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Tag */}
            <div className="text-[10px] font-bold uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3 animate-spin-slow text-indigo-500" />
              {isFlipped ? "Click anywhere to see Question" : "Click anywhere to Flip Answer"}
            </div>
          </div>

          {/* Active Recall Buttons */}
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-300">
              Be honest with yourself: How well did you recall?
            </span>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleMarkNeedsReview}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-1.5"
                id="btn-mark-needs-review"
              >
                <XCircle className="h-4 w-4" />
                Need Review
              </button>
              <button
                onClick={handleMarkMastered}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/15"
                id="btn-mark-mastered"
              >
                <CheckCircle className="h-4 w-4" />
                Got it right!
              </button>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <button
              disabled={currentIdx === 0}
              onClick={handlePrev}
              className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all ${
                currentIdx === 0 
                  ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed" 
                  : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
              }`}
              id="deck-prev-btn"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            <button
              onClick={handleResetSession}
              className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors"
            >
              Reset Session Stats
            </button>

            <button
              disabled={currentIdx + 1 === filteredCards.length}
              onClick={handleNext}
              className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all ${
                currentIdx + 1 === filteredCards.length 
                  ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed" 
                  : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
              }`}
              id="deck-next-btn"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm font-bold text-gray-500">No cards matched the selected tag filter.</p>
          <button
            onClick={() => setSelectedTag(null)}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      )}

    </div>
  );
}
