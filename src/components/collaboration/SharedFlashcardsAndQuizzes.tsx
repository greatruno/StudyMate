import React, { useState } from "react";
import {
  Brain,
  Award,
  Plus,
  ThumbsUp,
  History,
  CheckCircle2,
  XCircle,
  Share2,
  BookOpen,
  Sparkles,
  ArrowRight,
  User,
  HelpCircle
} from "lucide-react";
import {
  GroupFlashcardDeck,
  GroupQuiz,
  Flashcard,
  QuizQuestion,
  UserAccount
} from "../../types";

interface SharedFlashcardsAndQuizzesProps {
  groupId: string;
  currentUser: UserAccount;
  decks: GroupFlashcardDeck[];
  quizzes: GroupQuiz[];
  onCreateDeck: (title: string, subject: string, flashcards: Flashcard[]) => void;
  onCreateQuiz: (title: string, subject: string, questions: QuizQuestion[]) => void;
  onVoteDeck: (deckId: string) => void;
  onVoteQuiz: (quizId: string) => void;
  onImportDeckToLibrary: (deck: GroupFlashcardDeck) => void;
  onImportQuizToLibrary: (quiz: GroupQuiz) => void;
}

export const SharedFlashcardsAndQuizzes: React.FC<SharedFlashcardsAndQuizzesProps> = ({
  groupId,
  currentUser,
  decks,
  quizzes,
  onCreateDeck,
  onCreateQuiz,
  onVoteDeck,
  onVoteQuiz,
  onImportDeckToLibrary,
  onImportQuizToLibrary
}) => {
  const [activeTab, setActiveTab] = useState<"decks" | "quizzes">("decks");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("General");
  const [cardFront, setCardFront] = useState("");
  const [cardBack, setCardBack] = useState("");
  const [cardConcept, setCardConcept] = useState("");
  const [cardsList, setCardsList] = useState<Flashcard[]>([]);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim()) return;

    setCardsList([
      ...cardsList,
      { front: cardFront.trim(), back: cardBack.trim(), concept: cardConcept.trim() || "General Concept" }
    ]);
    setCardFront("");
    setCardBack("");
    setCardConcept("");
  };

  const handleSaveDeck = () => {
    if (!newTitle.trim() || cardsList.length === 0) return;
    onCreateDeck(newTitle.trim(), newSubject, cardsList);
    setNewTitle("");
    setCardsList([]);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sub-navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab("decks")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "decks"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Brain className="w-4 h-4" /> Shared Flashcards ({decks.length})
            </button>
            <button
              onClick={() => setActiveTab("quizzes")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "quizzes"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Award className="w-4 h-4" /> Group Quizzes ({quizzes.length})
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-2xs"
        >
          <Plus className="w-4 h-4" /> Create Collaborative Deck
        </button>
      </div>

      {/* Main Content Display */}
      {activeTab === "decks" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {decks.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <Brain className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">No collaborative flashcard decks yet.</p>
            </div>
          ) : (
            decks.map((deck) => (
              <div
                key={deck.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full">
                      {deck.subject}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {deck.flashcards.length} cards
                    </span>
                  </div>

                  <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{deck.title}</h3>
                  <span className="text-[11px] text-slate-500 block">Created by @{deck.creatorUsername}</span>
                </div>

                {/* Card preview */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/60 text-xs italic text-slate-600 dark:text-slate-300 line-clamp-2">
                  Q: {deck.flashcards[0]?.front || "Sample Question"}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onVoteDeck(deck.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                  >
                    <ThumbsUp className="w-4 h-4 text-indigo-500" />
                    <span>{deck.votes || 0}</span>
                  </button>

                  <button
                    onClick={() => onImportDeckToLibrary(deck)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs"
                  >
                    Import Deck
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <Award className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">No collaborative quizzes created yet.</p>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full">
                    {quiz.subject}
                  </span>
                  <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">{quiz.title}</h3>
                  <span className="text-[11px] text-slate-500 block">By @{quiz.creatorUsername} • {quiz.questions.length} Questions</span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onVoteQuiz(quiz.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-amber-600"
                  >
                    <ThumbsUp className="w-4 h-4 text-amber-500" />
                    <span>{quiz.votes || 0}</span>
                  </button>

                  <button
                    onClick={() => onImportQuizToLibrary(quiz)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-2xs"
                  >
                    Take Quiz
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Deck Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full space-y-5 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="font-black text-base text-slate-900 dark:text-slate-100">Create Collaborative Flashcard Deck</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Deck Title</label>
                <input
                  type="text"
                  placeholder="e.g. USMLE Step 1 - Cranial Nerves Exits"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              {/* Add Cards inline */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                <span className="font-bold block text-slate-600">Add Cards ({cardsList.length})</span>
                <form onSubmit={handleAddCard} className="space-y-2">
                  <input
                    type="text"
                    placeholder="Front (Question / Term)"
                    value={cardFront}
                    onChange={(e) => setCardFront(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="Back (Answer / Definition)"
                    value={cardBack}
                    onChange={(e) => setCardBack(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                  <button type="submit" className="w-full py-1.5 bg-indigo-600 text-white font-bold rounded-xl text-[11px]">
                    + Add Card to Deck
                  </button>
                </form>
              </div>

              {/* Cards List Preview */}
              {cardsList.length > 0 && (
                <div className="max-h-36 overflow-y-auto space-y-1 pt-2">
                  {cardsList.map((c, i) => (
                    <div key={i} className="bg-slate-50 p-2 rounded-lg text-[11px] font-medium flex justify-between">
                      <span className="font-bold text-indigo-600">{c.front}</span>
                      <span className="text-slate-500 truncate max-w-xs">{c.back}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <button
                  onClick={handleSaveDeck}
                  disabled={cardsList.length === 0 || !newTitle.trim()}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-xl shadow-sm"
                >
                  Save & Publish Deck
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
