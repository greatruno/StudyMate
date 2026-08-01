import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, GraduationCap, AlertCircle, ShieldCheck, Check, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useAuth, RegisterFormData } from "../../context/AuthContext";

interface RegisterPageProps {
  onNavigateToLogin: () => void;
  onSuccess?: () => void;
}

const AVATAR_OPTIONS = ["🎓", "🧠", "🔬", "🔭", "🎨", "✍️", "💻", "🧬", "📚", "🦁", "🦊", "🦉"];
const ROLE_OPTIONS = [
  { value: "student", label: "Student Learner", desc: "Access AI tutors, flashcard decks, quizzes, and study planners." },
  { value: "teacher", label: "Educator / Lecturer", desc: "Create classrooms, upload study materials, track student analytics." },
  { value: "admin", label: "School Administrator", desc: "Manage campus compliance, institutional roles, and safety policies." }
];

export default function RegisterPage({ onNavigateToLogin, onSuccess }: RegisterPageProps) {
  const { register, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("🎓");
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | "admin">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passStrength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError("");

    if (!email.trim() || !password) {
      setLocalError("Please fill out all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match. Please verify your password entry.");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters in length.");
      return;
    }

    const payload: RegisterFormData = {
      email: email.trim(),
      password,
      username: username.trim() || email.split("@")[0],
      displayName: displayName.trim() || username.trim() || email.split("@")[0],
      avatarEmoji,
      role: selectedRole
    };

    const success = await register(payload);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-lg mx-auto bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-900/5"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-3 shadow-sm">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h2>
        <p className="text-sm text-slate-500 mt-1">
          Join StudyMate to unlock AI tutoring, smart quizzes & active recall
        </p>
      </div>

      {/* Error Alert */}
      {(error || localError) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Registration Issue</span>
            <p className="text-xs text-rose-600 mt-0.5">{error || localError}</p>
          </div>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email & Username */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.edu"
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alex_scholar"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Display Name & Avatar Emoji */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Full Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Avatar Icon
            </label>
            <select
              value={avatarEmoji}
              onChange={(e) => setAvatarEmoji(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
            >
              {AVATAR_OPTIONS.map((emoji) => (
                <option key={emoji} value={emoji}>
                  {emoji} Icon
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password && (
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1 flex-1 rounded-full ${
                      passStrength >= step
                        ? passStrength > 2
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                        : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Confirm Password *
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Select Your Primary Academic Role
          </label>
          <div className="grid grid-cols-1 gap-2">
            {ROLE_OPTIONS.map((r) => {
              const isSelected = selectedRole === r.value;
              return (
                <div
                  key={r.value}
                  onClick={() => setSelectedRole(r.value as any)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? "bg-indigo-50/70 border-indigo-500 text-indigo-900 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/60"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900">{r.label}</div>
                    <div className="text-[11px] text-slate-500 leading-normal mt-0.5">{r.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Create Account & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer Switch */}
      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
          >
            Log In Here
          </button>
        </p>
      </div>
    </motion.div>
  );
}
