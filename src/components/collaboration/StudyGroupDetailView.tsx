import React, { useState } from "react";
import {
  ArrowLeft,
  MessageSquare,
  FileText,
  Brain,
  Calendar,
  Sparkles,
  Settings,
  Users,
  Globe,
  Lock,
  Activity,
  Plus,
  Share2
} from "lucide-react";
import {
  StudyGroup,
  GroupChatMessage,
  SharedDocument,
  GroupCollaborativeNote,
  GroupFlashcardDeck,
  GroupQuiz,
  GroupStudySession,
  ChatAttachment,
  Flashcard,
  QuizQuestion,
  UserAccount
} from "../../types";

import { RealTimeGroupChat } from "./RealTimeGroupChat";
import { SharedDocumentLibrary } from "./SharedDocumentLibrary";
import { CollaborativeNotesEditor } from "./CollaborativeNotesEditor";
import { SharedFlashcardsAndQuizzes } from "./SharedFlashcardsAndQuizzes";
import { GroupAITutorPanel } from "./GroupAITutorPanel";
import { GroupStudySessionView } from "./GroupStudySessionView";
import { GroupSettingsModal } from "./GroupSettingsModal";

interface StudyGroupDetailViewProps {
  group: StudyGroup;
  currentUser: UserAccount;
  sharedDocs: SharedDocument[];
  messages: GroupChatMessage[];
  notes: GroupCollaborativeNote[];
  decks: GroupFlashcardDeck[];
  quizzes: GroupQuiz[];
  sessions: GroupStudySession[];
  onBack: () => void;
  onSendMessage: (text: string, attachment?: ChatAttachment, replyTo?: GroupChatMessage) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onPinMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onEditMessage: (messageId: string, newText: string) => void;
  onUploadSharedDocument: (title: string, content: string, subject: string, courseTopic?: string) => void;
  onImportDocumentToPersonal: (doc: SharedDocument) => void;
  onAddAnnotation: (docId: string, text: string, comment: string) => void;
  onUploadNewVersion: (docId: string, title: string, content: string, changesSummary: string) => void;
  onCreateNote: (title: string, content: string) => void;
  onUpdateNote: (note: GroupCollaborativeNote) => void;
  onDeleteNote: (noteId: string) => void;
  onCreateDeck: (title: string, subject: string, flashcards: Flashcard[]) => void;
  onCreateQuiz: (title: string, subject: string, questions: QuizQuestion[]) => void;
  onVoteDeck: (deckId: string) => void;
  onVoteQuiz: (quizId: string) => void;
  onImportDeckToPersonal: (deck: GroupFlashcardDeck) => void;
  onImportQuizToPersonal: (quiz: GroupQuiz) => void;
  onScheduleSession: (title: string, durationMinutes: number, scheduledTime: string) => void;
  onUpdateSession: (session: GroupStudySession) => void;
  onUpdateGroup: (group: StudyGroup) => void;
  onInviteUser: (groupId: string, username: string) => void;
  onApproveJoinRequest: (groupId: string, reqId: string) => void;
  onDeclineJoinRequest: (groupId: string, reqId: string) => void;
}

export const StudyGroupDetailView: React.FC<StudyGroupDetailViewProps> = ({
  group,
  currentUser,
  sharedDocs,
  messages,
  notes,
  decks,
  quizzes,
  sessions,
  onBack,
  onSendMessage,
  onAddReaction,
  onPinMessage,
  onDeleteMessage,
  onEditMessage,
  onUploadSharedDocument,
  onImportDocumentToPersonal,
  onAddAnnotation,
  onUploadNewVersion,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  onCreateDeck,
  onCreateQuiz,
  onVoteDeck,
  onVoteQuiz,
  onImportDeckToPersonal,
  onImportQuizToPersonal,
  onScheduleSession,
  onUpdateSession,
  onUpdateGroup,
  onInviteUser,
  onApproveJoinRequest,
  onDeclineJoinRequest
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "chat" | "documents" | "notes" | "flashcards" | "ai-tutor" | "sessions"
  >("chat");

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Group Navigation Bar & Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        
        {/* Top bar with back button & group title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-150 text-indigo-600 flex items-center justify-center text-2xl font-bold shadow-2xs">
                {group.avatarEmoji || "📚"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">{group.name}</h1>
                  {group.visibility === "private" ? (
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
                      <Lock className="w-3 h-3" /> Private
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Globe className="w-3 h-3" /> Public
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{group.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Settings className="w-4 h-4" /> Group Settings
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Overview & Feed
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "chat"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Live Group Chat ({messages.length})
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "documents"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Shared Materials ({sharedDocs.length})
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "notes"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Collaborative Notes ({notes.length})
          </button>

          <button
            onClick={() => setActiveTab("flashcards")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "flashcards"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Brain className="w-3.5 h-3.5" /> Decks & Quizzes ({decks.length + quizzes.length})
          </button>

          <button
            onClick={() => setActiveTab("ai-tutor")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "ai-tutor"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Group AI Tutor
          </button>

          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "sessions"
                ? "bg-amber-500 text-white shadow-2xs"
                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Study Sessions ({sessions.length})
          </button>
        </div>
      </div>

      {/* Dynamic Tab Body Render */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" /> Real-Time Group Activity Feed
            </h3>
            {(!group.activityFeed || group.activityFeed.length === 0) ? (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                No recent activity logged.
              </div>
            ) : (
              <div className="space-y-3">
                {group.activityFeed.map((act) => (
                  <div key={act.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 text-xs flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      ⚡
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">@{act.actorUsername}</span>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">{act.text}</p>
                      <span className="text-[10px] text-slate-400">{new Date(act.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" /> Group Members ({group.memberUsernames.length})
            </h3>
            <div className="space-y-2">
              {group.memberUsernames.map((u) => (
                <div key={u} className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span>🎓</span> @{u}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "chat" && (
        <RealTimeGroupChat
          groupId={group.id}
          groupName={group.name}
          currentUser={currentUser}
          messages={messages}
          onSendMessage={onSendMessage}
          onAddReaction={onAddReaction}
          onPinMessage={onPinMessage}
          onDeleteMessage={onDeleteMessage}
          onEditMessage={onEditMessage}
        />
      )}

      {activeTab === "documents" && (
        <SharedDocumentLibrary
          groupId={group.id}
          currentUser={currentUser}
          sharedDocs={sharedDocs}
          onUploadSharedDocument={onUploadSharedDocument}
          onImportToPersonalLibrary={onImportDocumentToPersonal}
          onAddAnnotation={onAddAnnotation}
          onUploadNewVersion={onUploadNewVersion}
        />
      )}

      {activeTab === "notes" && (
        <CollaborativeNotesEditor
          groupId={group.id}
          currentUser={currentUser}
          notes={notes}
          onCreateNote={onCreateNote}
          onUpdateNote={onUpdateNote}
          onDeleteNote={onDeleteNote}
        />
      )}

      {activeTab === "flashcards" && (
        <SharedFlashcardsAndQuizzes
          groupId={group.id}
          currentUser={currentUser}
          decks={decks}
          quizzes={quizzes}
          onCreateDeck={onCreateDeck}
          onCreateQuiz={onCreateQuiz}
          onVoteDeck={onVoteDeck}
          onVoteQuiz={onVoteQuiz}
          onImportDeckToLibrary={onImportDeckToPersonal}
          onImportQuizToLibrary={onImportQuizToPersonal}
        />
      )}

      {activeTab === "ai-tutor" && (
        <GroupAITutorPanel
          group={group}
          sharedDocs={sharedDocs}
          notes={notes}
          recentMessages={messages}
          currentUser={currentUser}
        />
      )}

      {activeTab === "sessions" && (
        <GroupStudySessionView
          groupId={group.id}
          currentUser={currentUser}
          sessions={sessions}
          onScheduleSession={onScheduleSession}
          onUpdateSession={onUpdateSession}
        />
      )}

      {/* Group Settings Modal */}
      {showSettingsModal && (
        <GroupSettingsModal
          group={group}
          currentUser={currentUser}
          onClose={() => setShowSettingsModal(false)}
          onUpdateGroup={onUpdateGroup}
          onInviteUser={onInviteUser}
          onApproveJoinRequest={onApproveJoinRequest}
          onDeclineJoinRequest={onDeclineJoinRequest}
        />
      )}
    </div>
  );
};
