import React from "react";
import { useAuth } from "../../context/AuthContext";
import LoginPage from "./LoginPage";
import VerifyEmailPage from "./VerifyEmailPage";
import AcademicOnboardingPage from "./AcademicOnboardingPage";
import { ShieldAlert, GraduationCap } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "student" | "teacher" | "admin";
  onNavigateToRegister?: () => void;
  onNavigateToForgotPassword?: () => void;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  onNavigateToRegister,
  onNavigateToForgotPassword
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isLoading,
    user,
    needsEmailVerification,
    needsOnboarding
  } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-400 font-medium tracking-wide">Authenticating StudyMate session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <LoginPage
          onNavigateToRegister={onNavigateToRegister || (() => {})}
          onNavigateToForgotPassword={onNavigateToForgotPassword || (() => {})}
        />
      </div>
    );
  }

  if (needsEmailVerification) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <VerifyEmailPage onContinue={() => window.location.reload()} />
      </div>
    );
  }

  if (needsOnboarding) {
    return <AcademicOnboardingPage onComplete={() => window.location.reload()} />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-slate-100">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Restricted</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            This module requires <span className="font-semibold text-rose-400 uppercase">{requiredRole}</span> role access. Your current account role is <span className="font-semibold text-indigo-400 uppercase">{user?.role || "student"}</span>.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
