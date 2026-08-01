import React, { useState } from "react";
import { Mail, RefreshCw, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../../context/AuthContext";

interface VerifyEmailPageProps {
  onContinue: () => void;
}

export default function VerifyEmailPage({ onContinue }: VerifyEmailPageProps) {
  const { user, session, resendVerification, error, clearError } = useAuth();
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const email = user?.email || session?.user?.email || "your registered email";

  const handleResend = async () => {
    if (!email) return;
    clearError();
    setIsResending(true);
    setResendStatus(null);

    const success = await resendVerification(email);
    setIsResending(false);
    if (success) {
      setResendStatus("A new verification link has been sent to your email.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-md mx-auto bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 text-center"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-4 shadow-sm">
        <Mail className="w-8 h-8" />
      </div>

      <h2 className="text-xl font-bold text-slate-900">Verify your email address</h2>
      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
        We sent a verification link to <span className="font-semibold text-slate-900">{email}</span>. Please click the link in your email to activate all StudyMate features.
      </p>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resendStatus && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{resendStatus}</span>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={onContinue}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>I've Verified My Email</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isResending ? (
            <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin" />
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resend Verification Email</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
