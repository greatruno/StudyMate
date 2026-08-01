import React, { useState } from "react";
import {
  Brain,
  Sparkles,
  Send,
  FileText,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { StudyGroup, SharedDocument, GroupCollaborativeNote, GroupChatMessage, UserAccount } from "../../types";

interface GroupAITutorPanelProps {
  group: StudyGroup;
  sharedDocs: SharedDocument[];
  notes: GroupCollaborativeNote[];
  recentMessages: GroupChatMessage[];
  currentUser: UserAccount;
}

export const GroupAITutorPanel: React.FC<GroupAITutorPanelProps> = ({
  group,
  sharedDocs,
  notes,
  recentMessages,
  currentUser
}) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [groundedSources, setGroundedSources] = useState<string[]>([]);

  // Discussion Summary State
  const [discussionSummary, setDiscussionSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handleAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch("/api/v1/collaboration/group-ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName: group.name,
          query: query.trim(),
          sharedDocuments: sharedDocs,
          notes,
          recentChat: recentMessages
        })
      });

      const data = await res.json();
      if (data.success) {
        setAiResponse(data.answer);
        setGroundedSources(data.groundedSources || []);
      } else {
        setAiResponse("Sorry, I encountered an issue querying the group materials.");
      }
    } catch (err) {
      console.error(err);
      setAiResponse("Error contacting Group AI Tutor endpoint.");
    } finally {
      setLoading(false);
    }
  };

  const handleSummarizeDiscussion = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/v1/collaboration/group-ai/summarize-discussion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName: group.name,
          messages: recentMessages
        })
      });

      const data = await res.json();
      if (data.success) {
        setDiscussionSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-6 lg:p-8 rounded-3xl text-white shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-indigo-200 border border-white/10">
          <Brain className="w-3.5 h-3.5 text-amber-300" />
          Grounded Group Intelligence
        </div>
        <h2 className="text-2xl font-black text-white">
          AI Tutor for {group.name} 🤖
        </h2>
        <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed">
          Ask questions grounded specifically in your group's uploaded documents ({sharedDocs.length}), collaborative notes ({notes.length}), and active chat discussions.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleSummarizeDiscussion}
            disabled={loadingSummary}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-2xs transition-colors"
          >
            {loadingSummary ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4 text-amber-300" />
            )}
            Summarize Group Chat Discussions
          </button>
        </div>
      </div>

      {/* Discussion Summary Result Card */}
      {discussionSummary && (
        <div className="bg-amber-50 dark:bg-amber-950/40 p-5 rounded-3xl border border-amber-200 dark:border-amber-900/60 space-y-3">
          <div className="flex items-center gap-2 font-bold text-xs text-amber-900 dark:text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-600" />
            AI Group Discussion Takeaways
          </div>
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {discussionSummary}
          </div>
        </div>
      )}

      {/* Query Input Box */}
      <form onSubmit={handleAskTutor} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Ask Group AI Tutor
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            required
            placeholder={`e.g. Compare Nephrotic vs Nephritic syndrome based on our uploaded notes...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-colors shadow-2xs"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Ask AI
          </button>
        </div>
      </form>

      {/* Response Box */}
      {aiResponse && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-bold text-xs text-indigo-600">
              <Sparkles className="w-4 h-4" /> Grounded AI Answer
            </div>
            {groundedSources.length > 0 && (
              <span className="text-[10px] font-bold text-slate-400">
                Sources: {groundedSources.join(", ")}
              </span>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
            {aiResponse}
          </div>
        </div>
      )}
    </div>
  );
};
