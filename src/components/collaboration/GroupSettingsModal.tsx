import React, { useState } from "react";
import {
  Shield,
  UserCheck,
  UserPlus,
  Lock,
  Globe,
  X,
  UserX,
  Crown,
  Check,
  Smile
} from "lucide-react";
import { StudyGroup, GroupJoinRequest, UserAccount } from "../../types";

interface GroupSettingsModalProps {
  group: StudyGroup;
  currentUser: UserAccount;
  onClose: () => void;
  onUpdateGroup: (updated: StudyGroup) => void;
  onInviteUser: (groupId: string, username: string) => void;
  onApproveJoinRequest: (groupId: string, reqId: string) => void;
  onDeclineJoinRequest: (groupId: string, reqId: string) => void;
}

export const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
  group,
  currentUser,
  onClose,
  onUpdateGroup,
  onInviteUser,
  onApproveJoinRequest,
  onDeclineJoinRequest
}) => {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [subject, setSubject] = useState(group.subject);
  const [avatarEmoji, setAvatarEmoji] = useState(group.avatarEmoji || "📚");
  const [visibility, setVisibility] = useState<"public" | "private">(group.visibility || "public");

  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  const isOwner = group.creatorUsername === currentUser.username || group.ownerUsername === currentUser.username;
  const isMod = isOwner || (group.moderatorUsernames || []).includes(currentUser.username);

  const EMOJI_OPTIONS = ["📚", "🩺", "💻", "🧪", "⚖️", "🎨", "📐", "🔬", "🚀", "🧠"];

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGroup({
      ...group,
      name,
      description,
      subject,
      avatarEmoji,
      visibility
    });
    onClose();
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUsername.trim()) return;
    onInviteUser(group.id, inviteUsername.trim());
    setInviteUsername("");
    setInviteMessage("Invitation sent successfully!");
    setTimeout(() => setInviteMessage(""), 3000);
  };

  const handlePromoteMember = (username: string) => {
    const updatedMods = Array.from(new Set([...(group.moderatorUsernames || []), username]));
    const updatedRoles = { ...(group.memberRoles || {}), [username]: "moderator" as const };
    onUpdateGroup({ ...group, moderatorUsernames: updatedMods, memberRoles: updatedRoles });
  };

  const handleKickMember = (username: string) => {
    if (username === group.creatorUsername) return;
    const updatedMembers = group.memberUsernames.filter((u) => u !== username);
    onUpdateGroup({ ...group, memberUsernames: updatedMembers });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 max-w-2xl w-full space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-xl">
              ⚙️
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-slate-100">Study Group Settings</h3>
              <span className="text-xs text-slate-500">Manage visibility, member roles, and invites.</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* General Settings Form */}
        {isMod && (
          <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs font-medium border-b border-slate-100 dark:border-slate-800 pb-6">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">Group Profile</h4>

            {/* Avatar Selector */}
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1.5">Group Icon Emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    type="button"
                    key={e}
                    onClick={() => setAvatarEmoji(e)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform ${
                      avatarEmoji === e
                        ? "bg-indigo-600 text-white scale-110 shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Group Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  <option value="public">🌐 Public (Anyone can join)</option>
                  <option value="private">🔒 Private (Invite / Request required)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-xs">
              Save Profile Changes
            </button>
          </form>
        )}

        {/* Invite User Section */}
        <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-6">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-600" /> Invite Student to Group
          </h4>
          <form onSubmit={handleSendInvite} className="flex gap-2 text-xs">
            <input
              type="text"
              placeholder="Enter username (e.g. sarah_j)..."
              value={inviteUsername}
              onChange={(e) => setInviteUsername(e.target.value)}
              className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
            <button type="submit" className="px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-xs">
              Send Invite
            </button>
          </form>
          {inviteMessage && <p className="text-[11px] font-bold text-emerald-600">{inviteMessage}</p>}
        </div>

        {/* Join Requests (for Private Groups) */}
        {group.visibility === "private" && (group.joinRequests || []).length > 0 && (
          <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-6">
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-600">
              Pending Join Requests ({(group.joinRequests || []).length})
            </h4>
            <div className="space-y-2">
              {(group.joinRequests || []).map((req) => (
                <div key={req.id} className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-200">@{req.username}</span>
                    <span className="text-[10px] text-slate-500">{req.message || "Wants to join group"}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onApproveJoinRequest(group.id, req.id)}
                      className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px]"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onDeclineJoinRequest(group.id, req.id)}
                      className="px-2.5 py-1 bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px]"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Member Management & Roles */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Group Members ({group.memberUsernames.length})
          </h4>

          <div className="space-y-2">
            {group.memberUsernames.map((username) => {
              const isGroupOwner = username === group.creatorUsername || username === group.ownerUsername;
              const isGroupMod = (group.moderatorUsernames || []).includes(username);

              return (
                <div
                  key={username}
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {username[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">@{username}</span>
                      {isGroupOwner ? (
                        <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-full text-[9px] inline-flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-600" /> Owner
                        </span>
                      ) : isGroupMod ? (
                        <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded-full text-[9px]">
                          Moderator
                        </span>
                      ) : (
                        <span className="ml-2 text-[10px] text-slate-400">Member</span>
                      )}
                    </div>
                  </div>

                  {isOwner && !isGroupOwner && (
                    <div className="flex items-center gap-2">
                      {!isGroupMod && (
                        <button
                          onClick={() => handlePromoteMember(username)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-lg text-[10px]"
                        >
                          Promote Mod
                        </button>
                      )}
                      <button
                        onClick={() => handleKickMember(username)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="Remove member"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
