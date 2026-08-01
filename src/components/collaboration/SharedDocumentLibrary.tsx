import React, { useState } from "react";
import {
  FileText,
  Upload,
  Search,
  Download,
  Star,
  Eye,
  History,
  MessageSquare,
  Lock,
  Plus,
  Sparkles,
  ChevronRight,
  User,
  CheckCircle2,
  X
} from "lucide-react";
import { SharedDocument, DocumentVersion, SharedAnnotation, UserAccount } from "../../types";

interface SharedDocumentLibraryProps {
  groupId: string;
  currentUser: UserAccount;
  sharedDocs: SharedDocument[];
  onUploadSharedDocument: (title: string, content: string, subject: string, courseTopic?: string) => void;
  onImportToPersonalLibrary: (doc: SharedDocument) => void;
  onAddAnnotation: (docId: string, text: string, comment: string) => void;
  onUploadNewVersion: (docId: string, title: string, content: string, changesSummary: string) => void;
}

export const SharedDocumentLibrary: React.FC<SharedDocumentLibraryProps> = ({
  groupId,
  currentUser,
  sharedDocs,
  onUploadSharedDocument,
  onImportToPersonalLibrary,
  onAddAnnotation,
  onUploadNewVersion
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [activeDoc, setActiveDoc] = useState<SharedDocument | null>(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newSubject, setNewSubject] = useState("General");
  const [newTopic, setNewTopic] = useState("");

  // Version Upload State
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionChanges, setVersionChanges] = useState("");
  const [versionContent, setVersionContent] = useState("");

  // Annotation State
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [annotationSelectedText, setAnnotationSelectedText] = useState("");
  const [annotationComment, setAnnotationComment] = useState("");

  const filteredDocs = sharedDocs.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic === "all" || doc.courseTopic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  const topics = Array.from(new Set(sharedDocs.map((d) => d.courseTopic).filter(Boolean))) as string[];

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onUploadSharedDocument(newTitle.trim(), newContent.trim(), newSubject, newTopic || undefined);
    setNewTitle("");
    setNewContent("");
    setShowUploadModal(false);
  };

  const handleSaveVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoc || !versionContent.trim() || !versionChanges.trim()) return;

    onUploadNewVersion(activeDoc.id, activeDoc.title, versionContent.trim(), versionChanges.trim());
    setShowVersionModal(false);
    setVersionChanges("");
    setVersionContent("");
  };

  const handleSaveAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoc || !annotationSelectedText.trim() || !annotationComment.trim()) return;

    onAddAnnotation(activeDoc.id, annotationSelectedText.trim(), annotationComment.trim());
    setShowAnnotationModal(false);
    setAnnotationSelectedText("");
    setAnnotationComment("");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="AI Semantic Search in group materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          {topics.length > 0 && (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            >
              <option value="all">All Topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-2xs transition-colors shrink-0"
        >
          <Upload className="w-4 h-4" /> Upload Shared Material
        </button>
      </div>

      {/* Main Grid: Document List vs Active Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Document Cards List */}
        <div className={`space-y-4 ${activeDoc ? "lg:col-span-1" : "lg:col-span-3"}`}>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" /> Shared Group Repository ({filteredDocs.length})
          </h3>

          {filteredDocs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-500">No documents found matching criteria.</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${activeDoc ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
              {filteredDocs.map((doc) => {
                const isSelected = activeDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setActiveDoc(doc)}
                    className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? "border-indigo-600 ring-2 ring-indigo-500/20 shadow-md"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                        {doc.subject || "General"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{doc.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{doc.content}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="font-medium">Uploaded by @{doc.ownerUsername}</span>
                      <div className="flex items-center gap-2 font-bold text-indigo-600">
                        <span>{doc.downloadsCount || 0} downloads</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Document Workspace View */}
        {activeDoc && (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  {activeDoc.subject} • {activeDoc.courseTopic || "General Topic"}
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{activeDoc.title}</h2>
                <span className="text-xs text-slate-500">By @{activeDoc.ownerUsername} • {activeDoc.wordCount} words</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onImportToPersonalLibrary(activeDoc)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" /> Import to Library
                </button>
                <button
                  onClick={() => setActiveDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Text Body */}
            <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 font-mono whitespace-pre-wrap max-h-80 overflow-y-auto">
              {activeDoc.content}
            </div>

            {/* Version History & Annotations Sub-sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Version History List */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-indigo-600" /> Version History
                  </h4>
                  <button
                    onClick={() => {
                      setVersionContent(activeDoc.content);
                      setShowVersionModal(true);
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:underline"
                  >
                    + New Version
                  </button>
                </div>

                {(!activeDoc.versionHistory || activeDoc.versionHistory.length === 0) ? (
                  <p className="text-[11px] text-slate-400 italic">No previous versions logged.</p>
                ) : (
                  <div className="space-y-2">
                    {activeDoc.versionHistory.map((ver) => (
                      <div key={ver.version} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-600">v{ver.version}</span>
                          <span className="text-[10px] text-slate-400">{new Date(ver.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">{ver.changesSummary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shared Annotations List */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-amber-500" /> Shared Annotations
                  </h4>
                  <button
                    onClick={() => setShowAnnotationModal(true)}
                    className="text-[10px] font-bold text-amber-600 hover:underline"
                  >
                    + Add Annotation
                  </button>
                </div>

                {(!activeDoc.sharedAnnotations || activeDoc.sharedAnnotations.length === 0) ? (
                  <p className="text-[11px] text-slate-400 italic">No annotations added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {activeDoc.sharedAnnotations.map((ann) => (
                      <div key={ann.id} className="bg-amber-50/60 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200/60 text-xs space-y-1">
                        <span className="font-bold text-amber-800 dark:text-amber-300 block text-[10px]">
                          @{ann.authorUsername} on "{ann.selectedText}":
                        </span>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300">{ann.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full space-y-5 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900 dark:text-slate-100">Upload Shared Group Material</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Renal Pathology High-Yield Notes"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Course Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. Glomerular Diseases"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Content / Text</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Paste study material text here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-sm"
                >
                  Upload Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Version Modal */}
      {showVersionModal && activeDoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="font-black text-base text-slate-900 dark:text-slate-100">Upload New Version for {activeDoc.title}</h3>

            <form onSubmit={handleSaveVersion} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Changes Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Added section on FSGS pathology and treatment"
                  value={versionChanges}
                  onChange={(e) => setVersionChanges(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Updated Content</label>
                <textarea
                  rows={5}
                  required
                  value={versionContent}
                  onChange={(e) => setVersionContent(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl">
                  Save Version
                </button>
                <button type="button" onClick={() => setShowVersionModal(false)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Annotation Modal */}
      {showAnnotationModal && activeDoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="font-black text-base text-slate-900 dark:text-slate-100">Add Margin Annotation</h3>
            <form onSubmit={handleSaveAnnotation} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Selected Text / Quote</label>
                <input
                  type="text"
                  required
                  placeholder="Quote from document"
                  value={annotationSelectedText}
                  onChange={(e) => setAnnotationSelectedText(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Annotation Comment</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Add your note or explanation..."
                  value={annotationComment}
                  onChange={(e) => setAnnotationComment(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl">
                  Post Annotation
                </button>
                <button type="button" onClick={() => setShowAnnotationModal(false)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl">
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
