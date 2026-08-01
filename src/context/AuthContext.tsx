import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserAccount, AcademicProfile } from "../types";
import { getSupabase, validateFrontendConfig } from "../config/supabase";

export interface RegisterFormData {
  email: string;
  password: string;
  username: string;
  displayName: string;
  avatarEmoji?: string;
  role?: "student" | "teacher" | "admin";
  academicCategory?: string;
  primaryField?: string;
  experienceLevel?: "Beginner" | "Intermediate" | "Advanced";
  preferredLearningStyle?: "Visual" | "Reading/Writing" | "Practical" | "Mixed";
  targetGrade?: string;
  studyGoalHours?: number;
}

export interface AuthContextType {
  user: UserAccount | null;
  session: any | null;
  profile: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsOnboarding: boolean;
  needsEmailVerification: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterFormData) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (newPassword: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
  updateProfile: (data: Partial<UserAccount>) => Promise<boolean>;
  updateAcademicProfile: (data: Partial<AcademicProfile>) => Promise<boolean>;
  completeOnboarding: (data: Partial<AcademicProfile>) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);
  const [needsEmailVerification, setNeedsEmailVerification] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to load current user profile from backend or localStorage
  const loadProfile = async (accessToken: string) => {
    try {
      const res = await fetch("/api/v1/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);

          const formattedUser: UserAccount = {
            id: data.profile.id,
            username: data.profile.username || data.profile.email?.split("@")[0],
            email: data.profile.email,
            passwordHash: "PROT_SUPABASE",
            displayName: data.profile.displayName || data.profile.username,
            avatarEmoji: data.profile.avatarEmoji || "🎓",
            targetGrade: data.profile.academicProfile?.targetGrade || "A+",
            studyGoalHours: data.profile.learningPreferences?.studyGoalHoursPerWeek || 5,
            documents: [],
            stats: {
              documentsCount: data.profile.stats?.documents_uploaded_count || 0,
              quizzesTakenCount: data.profile.stats?.quizzes_completed_count || 0,
              averageQuizScore: Number(data.profile.stats?.average_quiz_score) || 0,
              flashcardsMasteredCount: data.profile.stats?.flashcards_mastered_count || 0,
              studyTimeMinutes: data.profile.stats?.total_study_time_minutes || 0,
              dailyStreak: data.profile.stats?.daily_streak_count || 1,
              weeklyProgress: [
                { day: "Mon", minutes: 30 },
                { day: "Tue", minutes: 45 },
                { day: "Wed", minutes: 60 },
                { day: "Thu", minutes: 40 },
                { day: "Fri", minutes: 90 },
                { day: "Sat", minutes: 120 },
                { day: "Sun", minutes: 75 }
              ],
              achievements: []
            },
            chatHistories: {},
            role: (data.profile.primaryRole as "student" | "teacher" | "admin") || "student",
            subscription: data.profile.subscription?.plan_code === "premium" ? "premium" : "free",
            academicProfile: data.profile.academicProfile ? {
              role: data.profile.primaryRole || "student",
              academicCategory: data.profile.academicProfile.degree_program || "General Academics",
              primaryField: data.profile.academicProfile.degree_program || "Computer Science",
              learningGoals: "Master key concepts through Socratic AI tutoring and active recall",
              experienceLevel: "Intermediate",
              preferredLearningStyle: data.profile.learningPreferences?.preferred_style || "Mixed"
            } : undefined
          };

          setUser(formattedUser);
          localStorage.setItem("studymate_active_user_v1", JSON.stringify(formattedUser));

          // Check if onboarding is needed (if academic profile degree_program is default)
          if (!data.profile.academicProfile || !data.profile.academicProfile.degree_program) {
            setNeedsOnboarding(true);
          } else {
            setNeedsOnboarding(false);
          }
        }
      }
    } catch (err) {
      console.warn("⚠️ Could not fetch /api/v1/auth/me during session load:", err);
    }
  };

  // Initialize session listening and token persistence
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { isValid } = validateFrontendConfig();
        if (isValid) {
          const supabase = getSupabase();

          // Get current session
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession && isMounted) {
            setSession(currentSession);
            setIsAuthenticated(true);
            await loadProfile(currentSession.access_token);
          } else {
            // Check localStorage fallback for smooth dev session recovery
            const saved = localStorage.getItem("studymate_active_user_v1");
            if (saved && isMounted) {
              const parsedUser = JSON.parse(saved);
              setUser(parsedUser);
              setIsAuthenticated(true);
            }
          }

          // Subscribe to auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (!isMounted) return;

            if (newSession) {
              setSession(newSession);
              setIsAuthenticated(true);
              setNeedsEmailVerification(!newSession.user.email_confirmed_at);
              await loadProfile(newSession.access_token);
            } else if (event === "SIGNED_OUT") {
              setSession(null);
              setUser(null);
              setProfile(null);
              setIsAuthenticated(false);
              localStorage.removeItem("studymate_active_user_v1");
            }
          });

          return () => {
            subscription.unsubscribe();
          };
        } else {
          // If Supabase keys are absent, fallback to local session if present
          const saved = localStorage.getItem("studymate_active_user_v1");
          if (saved && isMounted) {
            setUser(JSON.parse(saved));
            setIsAuthenticated(true);
          }
        }
      } catch (e) {
        console.warn("Auth initialization error:", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to log in.");
        setIsLoading(false);
        return false;
      }

      setSession(data.session);
      setIsAuthenticated(true);

      if (data.profile) {
        setProfile(data.profile);
      }

      // Try fetching full profile details
      if (data.session?.access_token) {
        await loadProfile(data.session.access_token);
      }

      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during login.");
      setIsLoading(false);
      return false;
    }
  };

  const register = async (formData: RegisterFormData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed.");
        setIsLoading(false);
        return false;
      }

      if (data.requiresEmailVerification && !data.session) {
        setNeedsEmailVerification(true);
      }

      if (data.session) {
        setSession(data.session);
        setIsAuthenticated(true);
        if (data.session.access_token) {
          await loadProfile(data.session.access_token);
        }
      }

      // Flag for onboarding if needed
      setNeedsOnboarding(true);

      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during registration.");
      setIsLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (session?.access_token) {
        await fetch("/api/v1/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` }
        }).catch(() => {});
      }

      const { isValid } = validateFrontendConfig();
      if (isValid) {
        const supabase = getSupabase();
        await supabase.auth.signOut().catch(() => {});
      }
    } catch (e) {
      console.warn("Logout error:", e);
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      setNeedsOnboarding(false);
      setNeedsEmailVerification(false);
      localStorage.removeItem("studymate_active_user_v1");
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to process forgot password request.");
        setIsLoading(false);
        return false;
      }

      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err?.message || "Error requesting password reset.");
      setIsLoading(false);
      return false;
    }
  };

  const resetPassword = async (newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ newPassword, accessToken: session?.access_token })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to update password.");
        setIsLoading(false);
        return false;
      }

      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err?.message || "Error resetting password.");
      setIsLoading(false);
      return false;
    }
  };

  const resendVerification = async (email: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch("/api/v1/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to resend verification email.");
        return false;
      }
      return true;
    } catch (err: any) {
      setError(err?.message || "Error resending verification email.");
      return false;
    }
  };

  const updateProfile = async (data: Partial<UserAccount>): Promise<boolean> => {
    if (!session?.access_token) return false;

    try {
      const res = await fetch("/api/v1/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        await loadProfile(session.access_token);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const updateAcademicProfile = async (data: Partial<AcademicProfile>): Promise<boolean> => {
    if (!session?.access_token) return false;

    try {
      const res = await fetch("/api/v1/auth/academic-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        await loadProfile(session.access_token);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const completeOnboarding = async (data: Partial<AcademicProfile>): Promise<boolean> => {
    const success = await updateAcademicProfile(data);
    if (success) {
      setNeedsOnboarding(false);
    }
    return success;
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAuthenticated,
        isLoading,
        needsOnboarding,
        needsEmailVerification,
        error,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        resendVerification,
        updateProfile,
        updateAcademicProfile,
        completeOnboarding,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
