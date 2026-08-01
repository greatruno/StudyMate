import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Laptop,
  Eye,
  Type,
  Zap,
  CheckCircle2,
  Database,
  Crown,
  Lock,
  User,
  Sliders,
  Sparkles,
} from "lucide-react";
import { ThemeSettings, UserAccount } from "../../types";

interface SettingsViewProps {
  currentUser: UserAccount | null;
  syncStatus: "synced" | "syncing" | "offline";
  onUpdateProfile: (updates: Partial<UserAccount>) => void;
  onOpenUpgradeModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  syncStatus,
  onUpdateProfile,
  onOpenUpgradeModal,
}) => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    try {
      const saved = localStorage.getItem("studymate_theme_settings_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load theme settings:", e);
    }
    return {
      mode: "light",
      highContrast: false,
      reducedMotion: false,
      largeFontMode: false,
    };
  });

  useEffect(() => {
    localStorage.setItem("studymate_theme_settings_v1", JSON.stringify(themeSettings));

    const root = document.documentElement;

    // Handle dark / light / system
    if (
      themeSettings.mode === "dark" ||
      (themeSettings.mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Handle high contrast
    if (themeSettings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Handle reduced motion
    if (themeSettings.reducedMotion) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }

    // Handle large font
    if (themeSettings.largeFontMode) {
      root.classList.add("large-font");
    } else {
      root.classList.remove("large-font");
    }
  }, [themeSettings]);

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setThemeSettings((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 lg:p-8">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider">
            Workspace Configuration
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          System & Accessibility Settings ⚙️
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          Customize themes, high-contrast visual display modes, font scaling, and cloud sync settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* THEME SELECTOR */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" /> Color Mode & Theme Preference
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "light", label: "Light Theme", icon: Sun },
              { id: "dark", label: "Dark Mode", icon: Moon },
              { id: "system", label: "System Default", icon: Laptop },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = themeSettings.mode === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => updateTheme({ mode: t.id as any })}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-600 dark:border-indigo-400 text-indigo-900 dark:text-indigo-100 font-extrabold shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-5 h-5 text-indigo-500" />
                  <span className="text-xs">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACCESSIBILITY MODES */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-500" /> Accessibility & High Contrast
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  High Contrast Mode
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enhanced text and border contrast for visual clarity
                </span>
              </div>
              <button
                onClick={() => updateTheme({ highContrast: !themeSettings.highContrast })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  themeSettings.highContrast ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    themeSettings.highContrast ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  Reduced Motion
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Disable UI animations and smooth transitions
                </span>
              </div>
              <button
                onClick={() => updateTheme({ reducedMotion: !themeSettings.reducedMotion })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  themeSettings.reducedMotion ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    themeSettings.reducedMotion ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  Large Font Mode
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Increase typography scaling for readability
                </span>
              </div>
              <button
                onClick={() => updateTheme({ largeFontMode: !themeSettings.largeFontMode })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  themeSettings.largeFontMode ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    themeSettings.largeFontMode ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* DATABASE SYNC & STATUS */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" /> Cloud Sync & Storage Engine
          </h3>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Synchronization Status
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  syncStatus === "synced"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : syncStatus === "syncing"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {syncStatus === "synced" ? "🟢 Fully Synced" : syncStatus === "syncing" ? "🟡 Syncing..." : "🔴 Offline Mode"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              All documents, flashcards, academic records and quiz attempts are saved locally and synchronized with server storage.
            </p>
          </div>
        </div>

        {/* SUBSCRIPTION & PLAN */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" /> Membership Tier
          </h3>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Current Plan
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                {currentUser?.subscription === "premium" ? "Pro Elite Member" : "Free Plan"}
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              {currentUser?.subscription === "premium"
                ? "You have unlocked unrestricted syllabus uploads, AI tutor sessions, voice summaries, and transcript auditing."
                : "Free Plan includes up to 5 uploaded study documents and standard AI chat assistance."}
            </p>

            {currentUser?.subscription !== "premium" && (
              <button
                onClick={onOpenUpgradeModal}
                className="w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition-colors"
              >
                Upgrade to Pro Elite ($14.99/mo)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
