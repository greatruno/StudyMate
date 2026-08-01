import React, { useState } from "react";
import {
  FileText,
  Plus,
  CheckSquare,
  Code,
  Sigma,
  MessageSquare,
  Pin,
  AtSign,
  Check,
  Trash2,
  Edit,
  Save,
  Copy,
  Sparkles,
  User
} from "lucide-react";
import {
  GroupCollaborativeNote,
  NoteChecklistItem,
  NoteCodeBlock,
  NoteEquation,
  NoteComment,
  UserAccount
} from "../../types";

interface CollaborativeNotesEditorProps {
  groupId: string;
  currentUser: UserAccount;
  notes: GroupCollaborativeNote[];
  onCreateNote: (title: string, content: string) => void;
  onUpdateNote: (note: GroupCollaborativeNote) => void;
  onDeleteNote: (noteId: string) => void;
}

export const CollaborativeNotesEditor: React.FC<CollaborativeNotesEditorProps> = ({
  groupId,
  currentUser,
  notes,
  onCreateNote,
  onUpdateNote,
  onDeleteNote
}) => {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);

  // New Note State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  // Sub-item additions
  const [newChecklistText, setNewChecklistText] = useState("");
  const [newCodeLang, setNewCodeLang] = useState("typescript");
  const [newCodeText, setNewCodeText] = useState("");
  const [newEqLatex, setNewEqLatex] = useState("");
  const [newEqExp, setNewEqExp] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0] || null;

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateNote(newTitle.trim(), newContent.trim() || "# Collaborative Notes");
    setNewTitle("");
    setNewContent("");
    setShowCreateModal(false);
  };

  const handleToggleChecklist = (itemId: string) => {
    if (!activeNote) return;
    const updatedChecklists = (activeNote.checklists || []).map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onUpdateNote({
      ...activeNote,
      checklists: updatedChecklists,
      lastEditedByUsername: currentUser.username,
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNote || !newChecklistText.trim()) return;

    const newItem: NoteChecklistItem = {
      id: `chk-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false
    };

    onUpdateNote({
      ...activeNote,
      checklists: [...(activeNote.checklists || []), newItem],
      lastEditedByUsername: currentUser.username,
      updatedAt: new Date().toISOString()
    });
    setNewChecklistText("");
  };

  const handleAddCodeBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNote || !newCodeText.trim()) return;

    const newCode: NoteCodeBlock = {
      id: `code-${Date.now()}`,
      language: newCodeLang,
      code: newCodeText.trim()
    };

    onUpdateNote({
      ...activeNote,
      codeBlocks: [...(activeNote.codeBlocks || []), newCode],
      lastEditedByUsername: currentUser.username,
      updatedAt: new Date().toISOString()
    });
    setNewCodeText("");
  };

  const handleAddEquation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNote || !newEqLatex.trim()) return;

    const newEq: NoteEquation = {
      id: `eq-${Date.now()}`,
      latex: newEqLatex.trim(),
      explanation: newEqExp.trim()
    };

    onUpdateNote({
      ...activeNote,
      equations: [...(activeNote.equations || []), newEq],
      lastEditedByUsername: currentUser.username,
      updatedAt: new Date().toISOString()
    });
    setNewEqLatex("");
    setNewEqExp("");
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNote || !newCommentText.trim()) return;

    const newComment: NoteComment = {
      id: `comm-${Date.now()}`,
      authorUsername: currentUser.username,
      authorDisplayName: currentUser.displayName,
      authorAvatarEmoji: currentUser.avatarEmoji || "🎓",
      text: newCommentText.trim(),
      createdAt: new Date().toISOString(),
      resolved: false
    };

    onUpdateNote({
      ...activeNote,
      comments: [...(activeNote.comments || []), newComment],
      lastEditedByUsername: currentUser.username,
      updatedAt: new Date().toISOString()
    });
    setNewCommentText("");
  };

  const handleResolveComment = (commId: string) => {
    if (!activeNote) return;
    const updatedComments = (activeNote.comments || []).map((c) =>
      c.id === commId ? { ...c, resolved: !c.resolved } : c
    );
    onUpdateNote({
      ...activeNote,
      comments: updatedComments
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & New Note Button */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Group Collaborative Notes ({notes.length})
          </h2>
          <p className="text-xs text-slate-500">Live multi-editor workspace with checklists, equations, and code blocks.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-2xs"
        >
          <Plus className="w-4 h-4" /> New Group Note
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: Notes Selector */}
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
            Note Documents
          </span>
          {notes.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No notes created yet.</p>
          ) : (
            notes.map((note) => {
              const isSelected = activeNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-xs line-clamp-1">{note.title}</h4>
                    {note.isPinned && <Pin className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                  </div>
                  <span className={`text-[10px] block ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>
                    Last edit by @{note.lastEditedByUsername}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Center/Right: Collaborative Editor & Tooling */}
        {activeNote ? (
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{activeNote.title}</h2>
                  <span className="text-xs text-slate-500">
                    Created by @{activeNote.creatorUsername} • Last updated {new Date(activeNote.updatedAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDeleteNote(activeNote.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl text-xs font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editable Text Content */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2">Rich Markdown Note Body</label>
                <textarea
                  rows={8}
                  value={activeNote.content}
                  onChange={(e) =>
                    onUpdateNote({
                      ...activeNote,
                      content: e.target.value,
                      lastEditedByUsername: currentUser.username,
                      updatedAt: new Date().toISOString()
                    })
                  }
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Group Study Checklists */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600" /> Group Action Checklist
                </h4>

                <div className="space-y-2">
                  {(activeNote.checklists || []).map((chk) => (
                    <div
                      key={chk.id}
                      onClick={() => handleToggleChecklist(chk.id)}
                      className={`p-3 rounded-xl border transition-colors flex items-center gap-3 cursor-pointer text-xs font-medium ${
                        chk.completed
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 line-through"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <input type="checkbox" checked={chk.completed} readOnly className="rounded text-emerald-600" />
                      <span>{chk.text}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddChecklist} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add action item (e.g. Review CN VII Bell's Palsy)..."
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                  />
                  <button type="submit" className="px-3 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl">
                    + Add Item
                  </button>
                </form>
              </div>

              {/* Equations & Code Blocks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* LaTeX Equations Block */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Sigma className="w-4 h-4 text-indigo-600" /> Math & Science Formulas
                  </h4>

                  {(activeNote.equations || []).map((eq) => (
                    <div key={eq.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-150 text-xs space-y-1 font-mono">
                      <span className="font-bold text-indigo-600 block">{eq.latex}</span>
                      <p className="text-[11px] text-slate-500 font-sans">{eq.explanation}</p>
                    </div>
                  ))}

                  <form onSubmit={handleAddEquation} className="space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="LaTeX formula (e.g. GFR = (U * V) / P)"
                      value={newEqLatex}
                      onChange={(e) => setNewEqLatex(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Explanation"
                      value={newEqExp}
                      onChange={(e) => setNewEqExp(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border rounded-xl"
                    />
                    <button type="submit" className="w-full py-1.5 bg-indigo-600 text-white font-bold rounded-xl text-[11px]">
                      + Add Formula
                    </button>
                  </form>
                </div>

                {/* Inline Comment Threads */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-500" /> Note Comments & @Mentions
                  </h4>

                  {(activeNote.comments || []).map((comm) => (
                    <div
                      key={comm.id}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        comm.resolved
                          ? "bg-slate-100 dark:bg-slate-900 border-slate-200 opacity-60"
                          : "bg-white dark:bg-slate-900 border-amber-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">@{comm.authorUsername}</span>
                        <button
                          onClick={() => handleResolveComment(comm.id)}
                          className="text-[10px] font-bold text-indigo-600 hover:underline"
                        >
                          {comm.resolved ? "Unresolve" : "Resolve"}
                        </button>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">{comm.text}</p>
                    </div>
                  ))}

                  <form onSubmit={handleAddComment} className="space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="Leave comment or @mention peer..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border rounded-xl"
                    />
                    <button type="submit" className="w-full py-1.5 bg-amber-500 text-white font-bold rounded-xl text-[11px]">
                      Post Comment
                    </button>
                  </form>
                </div>

              </div>

            </div>
          </div>
        ) : (
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-400">Select or create a note to begin editing.</p>
          </div>
        )}

      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="font-black text-base text-slate-900 dark:text-slate-100">Create Collaborative Group Note</h3>
            <form onSubmit={handleCreateNote} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold mb-1">Note Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raft Consensus Protocol Notes"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl">
                  Create Note
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
