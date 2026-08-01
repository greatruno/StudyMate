import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  MessageSquare,
  Plus,
  Search,
  Share2,
  FileText,
  Globe,
  Lock,
  ArrowRight,
  Send,
  Sparkles,
  Loader2,
  Trash2,
  ThumbsUp,
  Award,
  Bell,
  CheckCircle,
  X
} from "lucide-react";
import {
  UserAccount,
  StudyGroup,
  SharedDocument,
  DiscussionThread,
  DiscussionReply,
  DocumentItem,
  GroupChatMessage,
  GroupCollaborativeNote,
  GroupFlashcardDeck,
  GroupQuiz,
  GroupStudySession,
  GroupInvitation,
  ChatAttachment,
  Flashcard,
  QuizQuestion
} from "../types";

import { CollaborationRepository } from "../services/collaborationService";
import { CollaborationDashboard } from "./collaboration/CollaborationDashboard";
import { StudyGroupDetailView } from "./collaboration/StudyGroupDetailView";

interface CollaborationHubViewProps {
  currentUser: UserAccount;
  documents: DocumentItem[];
  onImportDocument: (title: string, content: string, subject: string) => void;
  onAddStatsReward: (points: number, contributionReward: string) => void;
}

export default function CollaborationHubView({
  currentUser,
  documents,
  onImportDocument,
  onAddStatsReward
}: CollaborationHubViewProps) {
  // Navigation level: "dashboard" | "group_detail" | "discussions" | "library"
  const [activeTab, setActiveTab] = useState<"dashboard" | "group_detail" | "discussions" | "library">("dashboard");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Phase 4.1 Real-Time Collaboration State
  const [groups, setGroups] = useState<StudyGroup[]>(() => CollaborationRepository.getGroups());
  const [sharedDocs, setSharedDocs] = useState<SharedDocument[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionThread[]>([]);
  const [invitations, setInvitations] = useState<GroupInvitation[]>(() =>
    CollaborationRepository.getUserInvitations(currentUser.username)
  );

  // Active Group Detailed Sub-states
  const [groupMessages, setGroupMessages] = useState<GroupChatMessage[]>([]);
  const [groupNotes, setGroupNotes] = useState<GroupCollaborativeNote[]>([]);
  const [groupDecks, setGroupDecks] = useState<GroupFlashcardDeck[]>([]);
  const [groupQuizzes, setGroupQuizzes] = useState<GroupQuiz[]>([]);
  const [groupSessions, setGroupSessions] = useState<GroupStudySession[]>([]);

  // Create Group Modal State
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupSubject, setNewGroupSubject] = useState("General");
  const [newGroupEmoji, setNewGroupEmoji] = useState("📚");
  const [newGroupVisibility, setNewGroupVisibility] = useState<"public" | "private">("public");

  // Discussions & Library filter state
  const [discussionSearch, setDiscussionSearch] = useState("");
  const [selectedThread, setSelectedThread] = useState<DiscussionThread | null>(null);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadText, setNewThreadText] = useState("");
  const [newThreadSubject, setNewThreadSubject] = useState("General");
  const [showCreateThreadModal, setShowCreateThreadModal] = useState(false);
  const [replyInputText, setReplyInputText] = useState("");

  // Sync state whenever selectedGroupId changes
  useEffect(() => {
    if (selectedGroupId) {
      setGroupMessages(CollaborationRepository.getChatMessages(selectedGroupId));
      setGroupNotes(CollaborationRepository.getGroupNotes(selectedGroupId));
      setGroupDecks(CollaborationRepository.getGroupDecks(selectedGroupId));
      setGroupQuizzes(CollaborationRepository.getGroupQuizzes(selectedGroupId));
      setGroupSessions(CollaborationRepository.getGroupSessions(selectedGroupId));
    }
  }, [selectedGroupId]);

  // Persist groups
  useEffect(() => {
    CollaborationRepository.saveGroups(groups);
  }, [groups]);

  // Group Handlers
  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setActiveTab("group_detail");
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: StudyGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || "Collaborative Study Group",
      subject: newGroupSubject || "General",
      avatarEmoji: newGroupEmoji,
      visibility: newGroupVisibility,
      creatorUsername: currentUser.username,
      ownerUsername: currentUser.username,
      moderatorUsernames: [currentUser.username],
      memberUsernames: [currentUser.username],
      memberRoles: { [currentUser.username]: "owner" },
      sharedDocumentIds: [],
      discussionsCount: 0,
      createdAt: new Date().toISOString(),
      activityFeed: [
        {
          id: `act-${Date.now()}`,
          groupId: `group-${Date.now()}`,
          actorUsername: currentUser.username,
          actorDisplayName: currentUser.displayName,
          type: "member_joined",
          text: `Created study group "${newGroupName.trim()}"`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    const updated = [newGroup, ...groups];
    setGroups(updated);
    onAddStatsReward(50, "Study Group Leader");
    setShowCreateGroupModal(false);
    setNewGroupName("");
    setNewGroupDesc("");
    handleSelectGroup(newGroup.id);
  };

  // Group Chat Message Handler
  const handleSendMessage = (text: string, attachment?: ChatAttachment, replyTo?: GroupChatMessage) => {
    if (!selectedGroupId) return;

    const newMsg: GroupChatMessage = {
      id: `msg-${Date.now()}`,
      groupId: selectedGroupId,
      senderUsername: currentUser.username,
      senderDisplayName: currentUser.displayName,
      senderAvatarEmoji: currentUser.avatarEmoji || "🎓",
      text,
      timestamp: new Date().toISOString(),
      attachments: attachment ? [attachment] : undefined,
      replyToId: replyTo?.id,
      replyToText: replyTo?.text,
      replyToSender: replyTo?.senderDisplayName
    };

    const updated = [...groupMessages, newMsg];
    setGroupMessages(updated);
    CollaborationRepository.saveChatMessages(selectedGroupId, updated);
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    if (!selectedGroupId) return;
    const updated = groupMessages.map((m) => {
      if (m.id !== messageId) return m;
      const reactions = m.reactions || [];
      const existingIndex = reactions.findIndex((r) => r.emoji === emoji);

      if (existingIndex >= 0) {
        const hasVoted = reactions[existingIndex].usernames.includes(currentUser.username);
        const newUsers = hasVoted
          ? reactions[existingIndex].usernames.filter((u) => u !== currentUser.username)
          : [...reactions[existingIndex].usernames, currentUser.username];

        reactions[existingIndex] = { emoji, usernames: newUsers };
      } else {
        reactions.push({ emoji, usernames: [currentUser.username] });
      }

      return { ...m, reactions };
    });

    setGroupMessages(updated);
    CollaborationRepository.saveChatMessages(selectedGroupId, updated);
  };

  const handlePinMessage = (messageId: string) => {
    if (!selectedGroupId) return;
    const updated = groupMessages.map((m) => (m.id === messageId ? { ...m, isPinned: !m.isPinned } : m));
    setGroupMessages(updated);
    CollaborationRepository.saveChatMessages(selectedGroupId, updated);
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!selectedGroupId) return;
    const updated = groupMessages.filter((m) => m.id !== messageId);
    setGroupMessages(updated);
    CollaborationRepository.saveChatMessages(selectedGroupId, updated);
  };

  const handleEditMessage = (messageId: string, newText: string) => {
    if (!selectedGroupId) return;
    const updated = groupMessages.map((m) =>
      m.id === messageId ? { ...m, text: newText, isEdited: true } : m
    );
    setGroupMessages(updated);
    CollaborationRepository.saveChatMessages(selectedGroupId, updated);
  };

  // Shared Document Handlers
  const handleUploadSharedDocument = (title: string, content: string, subject: string, courseTopic?: string) => {
    if (!selectedGroupId) return;

    const newDoc: SharedDocument = {
      id: `shared-doc-${Date.now()}`,
      originalDocId: `orig-${Date.now()}`,
      title,
      content,
      subject,
      courseTopic,
      ownerUsername: currentUser.username,
      privacy: "group",
      groupIds: [selectedGroupId],
      uploadedAt: new Date().toISOString(),
      wordCount: content.split(/\s+/).length,
      downloadsCount: 0,
      starsCount: 0,
      starredByUsernames: []
    };

    setSharedDocs((prev) => [newDoc, ...prev]);
    onAddStatsReward(30, "Document Publisher");
  };

  const handleImportDocumentToPersonal = (doc: SharedDocument) => {
    onImportDocument(doc.title, doc.content, doc.subject);
    onAddStatsReward(15, "Knowledge Harvester");
  };

  const handleAddAnnotation = (docId: string, text: string, comment: string) => {
    const updated = sharedDocs.map((d) => {
      if (d.id !== docId) return d;
      const newAnn = {
        id: `ann-${Date.now()}`,
        docId,
        authorUsername: currentUser.username,
        authorDisplayName: currentUser.displayName,
        selectedText: text,
        comment,
        createdAt: new Date().toISOString()
      };
      return { ...d, sharedAnnotations: [...(d.sharedAnnotations || []), newAnn] };
    });
    setSharedDocs(updated);
  };

  const handleUploadNewVersion = (docId: string, title: string, content: string, changesSummary: string) => {
    const updated = sharedDocs.map((d) => {
      if (d.id !== docId) return d;
      const versions = d.versionHistory || [];
      const newVer = {
        version: versions.length + 2,
        title,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.username,
        changesSummary,
        content
      };
      return { ...d, content, versionHistory: [...versions, newVer] };
    });
    setSharedDocs(updated);
  };

  // Collaborative Note Handlers
  const handleCreateNote = (title: string, content: string) => {
    if (!selectedGroupId) return;

    const newNote: GroupCollaborativeNote = {
      id: `note-${Date.now()}`,
      groupId: selectedGroupId,
      title,
      content,
      creatorUsername: currentUser.username,
      lastEditedByUsername: currentUser.username,
      updatedAt: new Date().toISOString()
    };

    const updated = [...groupNotes, newNote];
    setGroupNotes(updated);
    CollaborationRepository.saveGroupNotes(selectedGroupId, updated);
  };

  const handleUpdateNote = (note: GroupCollaborativeNote) => {
    if (!selectedGroupId) return;
    const updated = groupNotes.map((n) => (n.id === note.id ? note : n));
    setGroupNotes(updated);
    CollaborationRepository.saveGroupNotes(selectedGroupId, updated);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!selectedGroupId) return;
    const updated = groupNotes.filter((n) => n.id !== noteId);
    setGroupNotes(updated);
    CollaborationRepository.saveGroupNotes(selectedGroupId, updated);
  };

  // Shared Decks & Quizzes Handlers
  const handleCreateDeck = (title: string, subject: string, flashcards: Flashcard[]) => {
    if (!selectedGroupId) return;
    const newDeck: GroupFlashcardDeck = {
      id: `deck-${Date.now()}`,
      groupId: selectedGroupId,
      title,
      subject,
      creatorUsername: currentUser.username,
      flashcards,
      votes: 1,
      votedUsernames: [currentUser.username],
      createdAt: new Date().toISOString()
    };

    const updated = [...groupDecks, newDeck];
    setGroupDecks(updated);
    CollaborationRepository.saveGroupDecks(selectedGroupId, updated);
  };

  const handleCreateQuiz = (title: string, subject: string, questions: QuizQuestion[]) => {
    if (!selectedGroupId) return;
    const newQuiz: GroupQuiz = {
      id: `quiz-${Date.now()}`,
      groupId: selectedGroupId,
      title,
      subject,
      creatorUsername: currentUser.username,
      questions,
      votes: 1,
      votedUsernames: [currentUser.username],
      createdAt: new Date().toISOString()
    };

    const updated = [...groupQuizzes, newQuiz];
    setGroupQuizzes(updated);
    CollaborationRepository.saveGroupQuizzes(selectedGroupId, updated);
  };

  const handleVoteDeck = (deckId: string) => {
    if (!selectedGroupId) return;
    const updated = groupDecks.map((d) => {
      if (d.id !== deckId) return d;
      const hasVoted = d.votedUsernames.includes(currentUser.username);
      const newUsers = hasVoted
        ? d.votedUsernames.filter((u) => u !== currentUser.username)
        : [...d.votedUsernames, currentUser.username];
      return { ...d, votes: newUsers.length, votedUsernames: newUsers };
    });
    setGroupDecks(updated);
    CollaborationRepository.saveGroupDecks(selectedGroupId, updated);
  };

  const handleVoteQuiz = (quizId: string) => {
    if (!selectedGroupId) return;
    const updated = groupQuizzes.map((q) => {
      if (q.id !== quizId) return q;
      const hasVoted = q.votedUsernames.includes(currentUser.username);
      const newUsers = hasVoted
        ? q.votedUsernames.filter((u) => u !== currentUser.username)
        : [...q.votedUsernames, currentUser.username];
      return { ...q, votes: newUsers.length, votedUsernames: newUsers };
    });
    setGroupQuizzes(updated);
    CollaborationRepository.saveGroupQuizzes(selectedGroupId, updated);
  };

  // Study Sessions Handlers
  const handleScheduleSession = (title: string, durationMinutes: number, scheduledTime: string) => {
    if (!selectedGroupId) return;
    const activeGroup = groups.find((g) => g.id === selectedGroupId);

    const newSession: GroupStudySession = {
      id: `session-${Date.now()}`,
      groupId: selectedGroupId,
      groupName: activeGroup?.name,
      title,
      scheduledStartTime: scheduledTime,
      durationMinutes,
      status: "scheduled",
      createdByUsername: currentUser.username,
      createdAt: new Date().toISOString(),
      attendees: [
        {
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatarEmoji: currentUser.avatarEmoji || "🎓",
          status: "attending"
        }
      ],
      agenda: [
        { id: "ag-1", itemText: "Intro & Goal Setting", completed: false },
        { id: "ag-2", itemText: "25-min Pomodoro Study Sprint", completed: false },
        { id: "ag-3", itemText: "Q&A & AI Session Recap", completed: false }
      ]
    };

    const updated = [...groupSessions, newSession];
    setGroupSessions(updated);
    CollaborationRepository.saveGroupSessions(selectedGroupId, updated);
  };

  const handleUpdateSession = (session: GroupStudySession) => {
    if (!selectedGroupId) return;
    const updated = groupSessions.map((s) => (s.id === session.id ? session : s));
    setGroupSessions(updated);
    CollaborationRepository.saveGroupSessions(selectedGroupId, updated);
  };

  // Invitations
  const handleAcceptInvitation = (invite: GroupInvitation) => {
    const updatedGroups = groups.map((g) =>
      g.id === invite.groupId ? { ...g, memberUsernames: [...g.memberUsernames, currentUser.username] } : g
    );
    setGroups(updatedGroups);

    const updatedInvites = invitations.filter((inv) => inv.id !== invite.id);
    setInvitations(updatedInvites);
    CollaborationRepository.saveUserInvitations(currentUser.username, updatedInvites);
  };

  const handleDeclineInvitation = (invite: GroupInvitation) => {
    const updatedInvites = invitations.filter((inv) => inv.id !== invite.id);
    setInvitations(updatedInvites);
    CollaborationRepository.saveUserInvitations(currentUser.username, updatedInvites);
  };

  const activeGroup = groups.find((g) => g.id === selectedGroupId) || null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans" id="collaboration-hub">
      
      {/* Top Navigation Tabs */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "dashboard" || activeTab === "group_detail"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" /> Study Groups Hub
          </button>
        </div>

        {activeTab === "group_detail" && activeGroup && (
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full">
            Active: {activeGroup.name}
          </span>
        )}
      </div>

      {/* Main Container View Rendering */}
      {activeTab === "dashboard" && (
        <CollaborationDashboard
          currentUser={currentUser}
          groups={groups}
          sessions={groupSessions}
          sharedDocs={sharedDocs}
          invitations={invitations}
          onSelectGroup={handleSelectGroup}
          onCreateGroup={() => setShowCreateGroupModal(true)}
          onAcceptInvitation={handleAcceptInvitation}
          onDeclineInvitation={handleDeclineInvitation}
          onJoinSession={(sess) => {
            handleSelectGroup(sess.groupId);
          }}
        />
      )}

      {activeTab === "group_detail" && activeGroup && (
        <StudyGroupDetailView
          group={activeGroup}
          currentUser={currentUser}
          sharedDocs={sharedDocs}
          messages={groupMessages}
          notes={groupNotes}
          decks={groupDecks}
          quizzes={groupQuizzes}
          sessions={groupSessions}
          onBack={() => setActiveTab("dashboard")}
          onSendMessage={handleSendMessage}
          onAddReaction={handleAddReaction}
          onPinMessage={handlePinMessage}
          onDeleteMessage={handleDeleteMessage}
          onEditMessage={handleEditMessage}
          onUploadSharedDocument={handleUploadSharedDocument}
          onImportDocumentToPersonal={handleImportDocumentToPersonal}
          onAddAnnotation={handleAddAnnotation}
          onUploadNewVersion={handleUploadNewVersion}
          onCreateNote={handleCreateNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onCreateDeck={handleCreateDeck}
          onCreateQuiz={handleCreateQuiz}
          onVoteDeck={handleVoteDeck}
          onVoteQuiz={handleVoteQuiz}
          onImportDeckToPersonal={(deck) => {
            onAddStatsReward(20, "Deck Master");
          }}
          onImportQuizToPersonal={(quiz) => {
            onAddStatsReward(20, "Quiz Challenger");
          }}
          onScheduleSession={handleScheduleSession}
          onUpdateSession={handleUpdateSession}
          onUpdateGroup={(updated) => {
            setGroups(groups.map((g) => (g.id === updated.id ? updated : g)));
          }}
          onInviteUser={(gId, username) => {
            const newInvite: GroupInvitation = {
              id: `inv-${Date.now()}`,
              groupId: gId,
              groupName: activeGroup.name,
              invitedUsername: username,
              invitedBy: currentUser.username,
              status: "pending",
              timestamp: new Date().toISOString()
            };
            const existing = CollaborationRepository.getUserInvitations(username);
            CollaborationRepository.saveUserInvitations(username, [...existing, newInvite]);
          }}
          onApproveJoinRequest={(gId, reqId) => {
            const requests = activeGroup.joinRequests || [];
            const req = requests.find((r) => r.id === reqId);
            if (!req) return;

            const updatedGroup = {
              ...activeGroup,
              memberUsernames: Array.from(new Set([...activeGroup.memberUsernames, req.username])),
              joinRequests: requests.filter((r) => r.id !== reqId)
            };
            setGroups(groups.map((g) => (g.id === gId ? updatedGroup : g)));
          }}
          onDeclineJoinRequest={(gId, reqId) => {
            const updatedGroup = {
              ...activeGroup,
              joinRequests: (activeGroup.joinRequests || []).filter((r) => r.id !== reqId)
            };
            setGroups(groups.map((g) => (g.id === gId ? updatedGroup : g)));
          }}
        />
      )}

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full space-y-5 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900 dark:text-slate-100">Create New Study Group</h3>
              <button onClick={() => setShowCreateGroupModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems & Raft Protocol"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="What will this group focus on?"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Subject</label>
                  <input
                    type="text"
                    value={newGroupSubject}
                    onChange={(e) => setNewGroupSubject(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Visibility</label>
                  <select
                    value={newGroupVisibility}
                    onChange={(e) => setNewGroupVisibility(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-sm">
                  Create Study Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
