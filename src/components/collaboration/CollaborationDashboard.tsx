import React from "react";
import {
  Users,
  Calendar,
  FileText,
  Activity,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  Plus,
  CheckCircle2,
  Bell,
  MessageSquare,
  Lock,
  Globe,
  Brain
} from "lucide-react";
import {
  StudyGroup,
  GroupStudySession,
  SharedDocument,
  GroupInvitation,
  UserAccount
} from "../../types";

interface CollaborationDashboardProps {
  currentUser: UserAccount;
  groups: StudyGroup[];
  sessions: GroupStudySession[];
  sharedDocs: SharedDocument[];
  invitations: GroupInvitation[];
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: () => void;
  onAcceptInvitation: (invite: GroupInvitation) => void;
  onDeclineInvitation: (invite: GroupInvitation) => void;
  onJoinSession: (session: GroupStudySession) => void;
}

export const CollaborationDashboard: React.FC<CollaborationDashboardProps> = ({
  currentUser,
  groups,
  sessions,
  sharedDocs,
  invitations,
  onSelectGroup,
  onCreateGroup,
  onAcceptInvitation,
  onDeclineInvitation,
  onJoinSession
}) => {
  const myGroups = groups.filter((g) => g.memberUsernames.includes(currentUser.username));
  const publicGroups = groups.filter(
    (g) => g.visibility === "public" && !g.memberUsernames.includes(currentUser.username)
  );

  const upcomingSessions = sessions.filter((s) => s.status === "scheduled");

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Phase 4.1 Real-Time Collaborative Workspace
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              Study Together, Succeed Together 👥
            </h1>
            <p className="text-sm text-indigo-200 leading-relaxed">
              Connect with peers, share knowledge, run live Pomodoro study sessions, and solve complex academic problems with your Group AI Tutor.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onCreateGroup}
              className="px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Study Group
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">My Groups</span>
            <span className="text-xl font-black text-white">{myGroups.length}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Upcoming Sessions</span>
            <span className="text-xl font-black text-amber-300">{upcomingSessions.length}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Shared Documents</span>
            <span className="text-xl font-black text-emerald-300">{sharedDocs.length}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Group Invites</span>
            <span className="text-xl font-black text-indigo-200">{invitations.length}</span>
          </div>
        </div>
      </div>

      {/* Pending Invitations Alert Banner */}
      {invitations.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-900 dark:text-amber-200">
            <Bell className="w-4 h-4 text-amber-600" />
            Pending Group Invitations ({invitations.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">{inv.groupName}</span>
                  <span className="text-[11px] text-slate-500">Invited by @{inv.invitedBy}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onAcceptInvitation(inv)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px]"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onDeclineInvitation(inv)}
                    className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-[10px]"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main 2-Column Dashboard Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: My Active Study Groups */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> My Study Groups ({myGroups.length})
            </h2>
            <button
              onClick={onCreateGroup}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Group
            </button>
          </div>

          {myGroups.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center mx-auto text-indigo-600 text-xl font-bold">
                👥
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No Study Groups Joined Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create a study group for your current courses or join one of the public groups below to collaborate with peers!
              </p>
              <button
                onClick={onCreateGroup}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Create First Group
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myGroups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => onSelectGroup(group.id)}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all cursor-pointer shadow-2xs hover:shadow-md space-y-4 group relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-150 text-indigo-600 flex items-center justify-center text-xl font-bold">
                        {group.avatarEmoji || "📚"}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                          {group.subject}
                        </span>
                        <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors line-clamp-1 mt-1">
                          {group.name}
                        </h3>
                      </div>
                    </div>

                    {group.visibility === "private" ? (
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1" title="Private Group">
                        <Lock className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1" title="Public Group">
                        <Globe className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {group.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{group.memberUsernames.length} members</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                      Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommended Public Groups */}
          {publicGroups.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" /> Public Study Groups to Join
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {publicGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 text-lg flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        {group.avatarEmoji || "🌐"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{group.name}</h4>
                        <span className="text-[10px] text-slate-500">{group.subject} • {group.memberUsernames.length} members</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectGroup(group.id)}
                      className="w-full py-1.5 bg-white dark:bg-slate-900 hover:bg-indigo-50 border border-slate-200 dark:border-slate-700 text-indigo-600 font-bold text-xs rounded-xl"
                    >
                      View & Join Group
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Sessions & Activity Feed */}
        <div className="space-y-6">
          
          {/* Upcoming Study Sessions Widget */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" /> Upcoming Sessions
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600">
                {upcomingSessions.length} Scheduled
              </span>
            </div>

            {upcomingSessions.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center italic">
                No study sessions scheduled right now.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-snug">
                        {session.title}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 shrink-0">
                        {session.durationMinutes}m
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{new Date(session.scheduledStartTime).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-medium">
                        👥 {session.attendees.length} attending
                      </span>
                      <button
                        onClick={() => onJoinSession(session)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg shadow-2xs"
                      >
                        Join Room
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Group AI Recommendations */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-slate-900 p-5 rounded-3xl border border-indigo-150 dark:border-indigo-900/60 space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs text-indigo-900 dark:text-indigo-200">
              <Brain className="w-4 h-4 text-indigo-600" />
              AI Recommendation
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Based on your registered courses, you can boost retention by schedule-syncing daily 25-min Pomodoro recall sessions with members in <strong>USMLE Step 1 - Anatomy & Renal Pathology</strong>.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
