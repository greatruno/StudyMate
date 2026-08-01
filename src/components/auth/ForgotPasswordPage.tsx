import React, { useState } from "react";
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../../context/AuthContext";

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
}

export default function ForgotPasswordPage({ onNavigateToLogin }: ForgotPasswordPageProps) {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError("");

    if (!email.trim()) {
      setLocalError("Please enter your email address.");
      return;
    }

    const success = await forgotPassword(email.trim());
    if (success) {
      setSubmitted(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-md mx-auto bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-900/5"
    >
      <button
        type="button"
        onClick={onNavigateToLogin}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Login</span>
      </button>

      {!submitted ? (
        <>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-3">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Reset your password</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {(error || localError) && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error || localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 mb-4 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Check your inbox</h3>
          <p className="text-xs text-slate-600 mt-2 max-w-xs mx-auto leading-relaxed">
            We have sent password reset instructions to <span className="font-semibold text-slate-900">{email}</span>. Please check your inbox and spam folder.
          </p>

          <button
            type="button"
            onClick={onNavigateToLogin}
            className="mt-6 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm rounded-xl transition-all cursor-pointer"
          >
            Return to Login
          </button>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Supabase Secure Password Recovery System</span>
      </div>
    </motion.div>
  );
}
