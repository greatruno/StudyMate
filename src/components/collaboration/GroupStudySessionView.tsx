import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Play,
  Square,
  Users,
  CheckSquare,
  Sparkles,
  Plus,
  RefreshCw,
  FileText,
  User,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { GroupStudySession, SessionAgendaItem, SessionAttendee, UserAccount } from "../../types";

interface GroupStudySessionViewProps {
  groupId: string;
  currentUser: UserAccount;
  sessions: GroupStudySession[];
  onScheduleSession: (title: string, durationMinutes: number, scheduledTime: string) => void;
  onUpdateSession: (session: GroupStudySession) => void;
}

export const GroupStudySessionView: React.FC<GroupStudySessionViewProps> = ({
  groupId,
  currentUser,
  sessions,
  onScheduleSession,
  onUpdateSession
}) => {
  const [activeSession, setActiveSession] = useState<GroupStudySession | null>(sessions[0] || null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState(45);
  const [newTime, setNewTime] = useState("");

  // Pomodoro Live Runner state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(25 * 60);
  const [pomodoroMode, setPomodoroMode] = useState<"work" | "break">("work");

  // Live session notes
  const [sessionNotesText, setSessionNotesText] = useState(activeSession?.sessionNotes || "");

  // AI Recap Loading
  const [recapLoading, setRecapLoading] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      if (pomodoroMode === "work") {
        setPomodoroMode("break");
        setTimerSecondsLeft(5 * 60);
      } else {
        setPomodoroMode("work");
        setTimerSecondsLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft, pomodoroMode]);

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onScheduleSession(
      newTitle.trim(),
      newDuration,
      newTime ? new Date(newTime).toISOString() : new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString()
    );
    setNewTitle("");
    setShowScheduleModal(false);
  };

  const handleToggleAgenda = (agendaId: string) => {
    if (!activeSession) return;
    const updatedAgenda = activeSession.agenda.map((ag) =>
      ag.id === agendaId ? { ...ag, completed: !ag.completed } : ag
    );
    const updated = { ...activeSession, agenda: updatedAgenda };
    setActiveSession(updated);
    onUpdateSession(updated);
  };

  const handleGenerateAIRecap = async () => {
    if (!activeSession) return;
    setRecapLoading(true);

    try {
      const res = await fetch("/api/v1/collaboration/group-ai/recap-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionTitle: activeSession.title,
          sessionNotes: sessionNotesText,
          agenda: activeSession.agenda,
          attendees: activeSession.attendees
        })
      });

      const data = await res.json();
      if (data.success) {
        const updated = {
          ...activeSession,
          status: "completed" as const,
          sessionNotes: sessionNotesText,
          aiRecap: data.recap
        };
        setActiveSession(updated);
        onUpdateSession(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecapLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" /> Group Study Sessions & Pomodoro
          </h2>
          <p className="text-xs text-slate-500">Coordinate scheduled study sprints with shared timers and AI recaps.</p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-2xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Schedule Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sessions List Column */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Scheduled Sessions ({sessions.length})
          </h3>

          {sessions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-400">No scheduled sessions.</p>
            </div>
          ) : (
            sessions.map((sess) => {
              const isSelected = activeSession?.id === sess.id;
              return (
                <div
                  key={sess.id}
                  onClick={() => {
                    setActiveSession(sess);
                    setSessionNotesText(sess.sessionNotes || "");
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-xs line-clamp-1">{sess.title}</h4>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        sess.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {sess.status}
                    </span>
                  </div>

                  <div className={`flex items-center gap-2 text-[11px] ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(sess.scheduledStartTime).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Active Session Runner Workspace */}
        {activeSession ? (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            
            {/* Header & Status */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                  {activeSession.durationMinutes} Minutes Session
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{activeSession.title}</h2>
                <span className="text-xs text-slate-500">Scheduled by @{activeSession.createdByUsername}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateAIRecap}
                  disabled={recapLoading}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs"
                >
                  {recapLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Generate AI Session Recap
                </button>
              </div>
            </div>

            {/* Shared Synced Pomodoro Clock Display */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-3xl text-white text-center space-y-3 shadow-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                {pomodoroMode === "work" ? "🎯 Focus Sprint (25m)" : "☕ Short Break (5m)"}
              </span>

              <div className="text-4xl font-black font-mono tracking-tight">
                {formatTime(timerSecondsLeft)}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-5 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {isTimerRunning ? <Square className="w-4 h-4 fill-slate-900" /> : <Play className="w-4 h-4 fill-slate-900" />}
                  {isTimerRunning ? "Pause Timer" : "Start Sprint"}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSecondsLeft(25 * 60);
                    setPomodoroMode("work");
                  }}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 font-bold text-xs rounded-xl"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Agenda & Attendees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Agenda Checklist */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-amber-500" /> Session Agenda
                </h4>

                <div className="space-y-2">
                  {activeSession.agenda.map((ag) => (
                    <div
                      key={ag.id}
                      onClick={() => handleToggleAgenda(ag.id)}
                      className={`p-2.5 rounded-xl border text-xs font-medium cursor-pointer flex items-center gap-2.5 ${
                        ag.completed
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 line-through"
                          : "bg-white dark:bg-slate-900 border-slate-200 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <input type="checkbox" checked={ag.completed} readOnly />
                      <span>{ag.itemText}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendance Tracker */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" /> Attendees ({activeSession.attendees.length})
                </h4>

                <div className="space-y-2">
                  {activeSession.attendees.map((att, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{att.avatarEmoji || "🎓"}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{att.displayName}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {att.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* AI Session Recap Result Card */}
            {activeSession.aiRecap && (
              <div className="bg-indigo-50 dark:bg-indigo-950/40 p-5 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 font-bold text-xs text-indigo-900 dark:text-indigo-200">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> AI Executive Session Recap
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {activeSession.aiRecap.summary}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <span className="font-bold text-indigo-600 block mb-1">Topics Covered:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                      {activeSession.aiRecap.topicsCovered.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-indigo-600 block mb-1">Action Items:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                      {activeSession.aiRecap.actionItems.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-400">Select or schedule a session to run.</p>
          </div>
        )}

      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="font-black text-base text-slate-900 dark:text-slate-100">Schedule Live Group Study Session</h3>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Glomerular Pathology Review"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl">
                  Schedule Session
                </button>
                <button type="button" onClick={() => setShowScheduleModal(false)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl">
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
