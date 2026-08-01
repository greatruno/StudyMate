import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  GraduationCap,
  Building,
  Award,
  Crown,
  BookOpen,
  Sparkles,
  CheckCircle2,
  X,
  Edit,
  Save,
  Clock,
  Target,
  Flame,
} from "lucide-react";
import { UserAccount, StudentAcademicProfile } from "../../types";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  academicProfile?: StudentAcademicProfile | null;
  onUpdateProfile: (updates: Partial<UserAccount>) => void;
  onOpenUpgradeModal: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  academicProfile,
  onUpdateProfile,
  onOpenUpgradeModal,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [targetGrade, setTargetGrade] = useState(currentUser?.targetGrade || "First Class (4.50+)");
  const [studyGoalHours, setStudyGoalHours] = useState(currentUser?.studyGoalHours || 15);

  if (!isOpen || !currentUser) return null;

  const handleSave = () => {
    onUpdateProfile({
      displayName,
      targetGrade,
      studyGoalHours,
    });
    setIsEditing(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
        >
          {/* BANNER HEADER */}
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 border-2 border-indigo-400 flex items-center justify-center text-3xl shadow-lg shrink-0">
                {currentUser.avatarEmoji || "🎓"}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">{currentUser.displayName}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      currentUser.subscription === "premium"
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-700 text-slate-200"
                    }`}
                  >
                    {currentUser.subscription === "premium" ? "Elite Pro Member" : "Free Plan"}
                  </span>
                </div>

                <p className="text-xs text-indigo-200 font-medium mt-0.5">{currentUser.email}</p>
                <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-2">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" /> {currentUser.stats.dailyStreak} Day Streak
                  </span>
                  •
                  <span className="font-bold text-emerald-300">
                    {currentUser.stats.experiencePoints || 1250} XP (Level {currentUser.stats.level || 4})
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* MAIN BODY */}
          <div className="p-6 overflow-y-auto space-y-6 text-xs">
            {/* QUICK STATS CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Grade</span>
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block">
                  {currentUser.targetGrade}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Weekly Goal</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 block">
                  {currentUser.studyGoalHours} Hours / wk
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Study Time</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {Math.round(currentUser.stats.studyTimeMinutes / 60)} Hours Total
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Quizzes Taken</span>
                <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 mt-1 block">
                  {currentUser.stats.quizzesTakenCount} Passed
                </span>
              </div>
            </div>

            {/* ACADEMIC INSTITUTION & MATRICULATION DETAILS */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-500" /> Academic Enrollment Info
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px]">Institution</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {academicProfile?.institutionName || "Federal University of Technology, Akure"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Faculty / School</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {academicProfile?.facultyName || "School of Computing (SOC)"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Department</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {academicProfile?.departmentName || "Computer Science"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Programme & Degree</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {academicProfile?.programmeName || "B.Tech. Computer Science"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Matriculation No</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {academicProfile?.matricNumber || "CSC/2021/4092"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Current Academic Standing</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {academicProfile?.currentLevel || 200} Level • 1st Class Honours Standing
                  </span>
                </div>
              </div>
            </div>

            {/* EDITABLE GOALS & PREFERENCES */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-500" /> Academic Goals & Target Settings
                </h3>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Target Grade</label>
                      <input
                        type="text"
                        value={targetGrade}
                        onChange={(e) => setTargetGrade(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Weekly Goal (Hours)</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={studyGoalHours}
                        onChange={(e) => setStudyGoalHours(parseInt(e.target.value) || 10)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Preferred Learning Style</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {currentUser.academicProfile?.preferredLearningStyle || "Visual & Practical"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Primary Field</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {currentUser.academicProfile?.primaryField || "Computer Science & Artificial Intelligence"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* UPGRADE PROMOTION */}
            {currentUser.subscription !== "premium" && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-300/40 dark:border-amber-700/40 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-500 fill-amber-500" /> Unlock StudyMate Pro Elite
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Get unlimited AI tutor chats, voice summaries, custom study plans & priority PDF exports.
                  </p>
                </div>

                <button
                  onClick={onOpenUpgradeModal}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shrink-0 shadow-sm transition-colors"
                >
                  Upgrade $14.99/mo
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
