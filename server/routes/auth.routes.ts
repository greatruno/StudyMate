import { Router, Response } from "express";
import { getSupabaseClient, getSupabaseAdmin } from "../config/supabase.js";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.middleware.js";
import pkg from "pg";
const { Client } = pkg;

const router = Router();

function getDbClient() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL is not configured.");
  return new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
}

/**
 * Fetch full aggregated user profile from PostgreSQL tables
 */
async function fetchFullUserProfile(userId: string) {
  const client = getDbClient();
  await client.connect();
  try {
    const userRes = await client.query(`SELECT * FROM public.users WHERE id = $1`, [userId]);
    if (userRes.rows.length === 0) return null;

    const user = userRes.rows[0];

    const [rolesRes, academicRes, prefRes, settingsRes, statsRes, subRes] = await Promise.all([
      client.query(`
        SELECT r.name 
        FROM public.user_roles ur 
        JOIN public.roles r ON ur.role_id = r.id 
        WHERE ur.user_id = $1`, [userId]),
      client.query(`SELECT * FROM public.academic_profiles WHERE user_id = $1`, [userId]),
      client.query(`SELECT * FROM public.learning_preferences WHERE user_id = $1`, [userId]),
      client.query(`SELECT * FROM public.user_settings WHERE user_id = $1`, [userId]),
      client.query(`SELECT * FROM public.user_stats WHERE user_id = $1`, [userId]),
      client.query(`
        SELECT us.*, sp.name as plan_name, sp.code as plan_code 
        FROM public.user_subscriptions us 
        JOIN public.subscription_plans sp ON us.plan_id = sp.id 
        WHERE us.user_id = $1`, [userId])
    ]);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.display_name,
      avatarEmoji: user.avatar_emoji,
      avatarUrl: user.avatar_url,
      roles: rolesRes.rows.map(r => r.name),
      primaryRole: rolesRes.rows[0]?.name || "student",
      academicProfile: academicRes.rows[0] || null,
      learningPreferences: prefRes.rows[0] || null,
      settings: settingsRes.rows[0] || null,
      stats: statsRes.rows[0] || null,
      subscription: subRes.rows[0] || null,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  } finally {
    await client.end();
  }
}

/**
 * POST /api/v1/auth/register
 * Registers a new user via Supabase Auth and triggers automatic profile provisioning.
 */
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      password,
      username,
      displayName,
      avatarEmoji = "🎓",
      role = "student",
      academicCategory,
      primaryField,
      experienceLevel,
      preferredLearningStyle,
      targetGrade = "A+",
      studyGoalHours = 5
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Bad Request", message: "Email and password are required fields." });
    }

    const cleanUsername = username || email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
    const cleanDisplayName = displayName || cleanUsername;

    // Use admin client if available to allow seamless sign up
    let supabase = getSupabaseAdmin();
    try {
      supabase.auth;
    } catch {
      supabase = getSupabaseClient();
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: cleanUsername,
          display_name: cleanDisplayName,
          avatar_emoji: avatarEmoji,
          role
        }
      }
    });

    if (authError || !authData.user) {
      return res.status(400).json({
        error: "Registration Failed",
        message: authError?.message || "Failed to create user account in authentication service.",
        details: authError
      });
    }

    const userId = authData.user.id;

    // Optional: update additional academic onboarding metadata in DB if user is active
    try {
      const client = getDbClient();
      await client.connect();
      try {
        await client.query(`
          UPDATE public.academic_profiles 
          SET degree_program = $1, target_grade = $2, updated_at = NOW()
          WHERE user_id = $3
        `, [primaryField || academicCategory || "General Studies", targetGrade, userId]);

        await client.query(`
          UPDATE public.learning_preferences 
          SET preferred_style = $1, study_goal_hours_per_week = $2, updated_at = NOW()
          WHERE user_id = $3
        `, [preferredLearningStyle || "visual", studyGoalHours, userId]);
      } finally {
        await client.end();
      }
    } catch (e) {
      console.warn("⚠️ Warning: Could not execute post-registration DB update (trigger will have created default profiles):", e);
    }

    const profile = await fetchFullUserProfile(userId).catch(() => null);

    return res.status(201).json({
      message: "User registered successfully.",
      user: authData.user,
      session: authData.session,
      profile,
      requiresEmailVerification: !authData.session
    });
  } catch (err: any) {
    console.error("❌ Register Error:", err);
    return res.status(500).json({ error: "Server Error", message: err?.message || "An error occurred during registration." });
  }
});

/**
 * POST /api/v1/auth/login
 * Authenticates user credentials and returns active session + full DB profile.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Bad Request", message: "Email and password are required fields." });
    }

    const supabase = getSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.session || !authData.user) {
      return res.status(401).json({
        error: "Invalid Credentials",
        message: authError?.message || "Incorrect email or password.",
        details: authError
      });
    }

    const userId = authData.user.id;
    let profile = null;

    try {
      profile = await fetchFullUserProfile(userId);
    } catch (dbErr) {
      console.warn("⚠️ Warning: Could not fetch DB profile during login:", dbErr);
    }

    return res.json({
      message: "Login successful.",
      user: authData.user,
      session: authData.session,
      profile: profile || {
        id: userId,
        email: authData.user.email,
        username: authData.user.user_metadata?.username || email.split("@")[0],
        displayName: authData.user.user_metadata?.display_name || email.split("@")[0],
        avatarEmoji: authData.user.user_metadata?.avatar_emoji || "🎓",
        primaryRole: authData.user.user_metadata?.role || "student",
        roles: [authData.user.user_metadata?.role || "student"]
      }
    });
  } catch (err: any) {
    console.error("❌ Login Error:", err);
    return res.status(500).json({ error: "Server Error", message: err?.message || "An error occurred during login." });
  }
});

/**
 * GET /api/v1/auth/me
 * Protected endpoint returning current user session & profile.
 */
router.get("/me", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = await fetchFullUserProfile(userId);

    return res.json({
      authenticated: true,
      user: req.user,
      profile: profile || req.user
    });
  } catch (err: any) {
    console.error("❌ Auth /me Error:", err);
    return res.status(500).json({ error: "Server Error", message: err?.message || "Failed to retrieve user profile." });
  }
});

/**
 * POST /api/v1/auth/logout
 * Signs out current session.
 */
router.post("/logout", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut().catch(() => {});
    return res.json({ message: "Successfully logged out." });
  } catch (err: any) {
    return res.json({ message: "Logged out session locally." });
  }
});

/**
 * PATCH /api/v1/auth/profile
 * Updates basic user profile info.
 */
router.patch("/profile", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { displayName, avatarEmoji, avatarUrl } = req.body;

    const client = getDbClient();
    await client.connect();
    try {
      await client.query(`
        UPDATE public.users 
        SET 
          display_name = COALESCE($1, display_name),
          avatar_emoji = COALESCE($2, avatar_emoji),
          avatar_url = COALESCE($3, avatar_url),
          updated_at = NOW()
        WHERE id = $4
      `, [displayName, avatarEmoji, avatarUrl, userId]);
    } finally {
      await client.end();
    }

    const updatedProfile = await fetchFullUserProfile(userId);
    return res.json({ message: "Profile updated successfully.", profile: updatedProfile });
  } catch (err: any) {
    console.error("❌ Profile Update Error:", err);
    return res.status(500).json({ error: "Server Error", message: err?.message || "Failed to update user profile." });
  }
});

/**
 * PATCH /api/v1/auth/academic-profile
 * Updates user academic profile and learning preferences.
 */
router.patch("/academic-profile", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      degreeProgram,
      currentLevel,
      targetGpa,
      targetGrade,
      preferredStyle,
      studyGoalHoursPerWeek
    } = req.body;

    const client = getDbClient();
    await client.connect();
    try {
      await client.query(`
        UPDATE public.academic_profiles
        SET
          degree_program = COALESCE($1, degree_program),
          current_level = COALESCE($2, current_level),
          target_gpa = COALESCE($3, target_gpa),
          target_grade = COALESCE($4, target_grade),
          updated_at = NOW()
        WHERE user_id = $5
      `, [degreeProgram, currentLevel, targetGpa, targetGrade, userId]);

      await client.query(`
        UPDATE public.learning_preferences
        SET
          preferred_style = COALESCE($1, preferred_style),
          study_goal_hours_per_week = COALESCE($2, study_goal_hours_per_week),
          updated_at = NOW()
        WHERE user_id = $3
      `, [preferredStyle, studyGoalHoursPerWeek, userId]);
    } finally {
      await client.end();
    }

    const updatedProfile = await fetchFullUserProfile(userId);
    return res.json({ message: "Academic profile updated successfully.", profile: updatedProfile });
  } catch (err: any) {
    console.error("❌ Academic Profile Update Error:", err);
    return res.status(500).json({ error: "Server Error", message: err?.message || "Failed to update academic profile." });
  }
});

/**
 * POST /api/v1/auth/forgot-password
 * Triggers password reset email via Supabase Auth.
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Bad Request", message: "Email is required." });
    }

    const supabase = getSupabaseClient();
    const origin = req.get("origin") || process.env.APP_URL || "http://localhost:3000";
    const redirectTo = `${origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      return res.status(400).json({ error: "Password Reset Error", message: error.message });
    }

    return res.json({ message: "Password reset link sent to your email address." });
  } catch (err: any) {
    console.error("❌ Forgot Password Error:", err);
    return res.status(500).json({ error: "Server Error", message: err?.message || "Failed to process forgot password request." });
  }
});

/**
 * POST /api/v1/auth/reset-password
 * Updates password using access token / authenticated session.
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { newPassword, accessToken } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: "Bad Request", message: "New password is required." });
    }

    const supabase = getSupabaseClient();

    if (accessToken) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return res.status(400).json({ error: "Reset Error", message: error.message });
      }
    } else {
      // If reset was triggered via current session
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return res.status(400).json({ error: "Reset Error", message: error.message });
      }
    }

    return res.json({ message: "Your password has been successfully updated." });
  } catch (err: any) {
    console.error("❌ Reset Password Error:", err);
    return res.status(500).json({ error: "Server Error", message: err?.message || "Failed to reset password." });
  }
});

/**
 * POST /api/v1/auth/resend-verification
 * Resends email verification confirmation link.
 */
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Bad Request", message: "Email is required." });
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email
    });

    if (error) {
      return res.status(400).json({ error: "Resend Error", message: error.message });
    }

    return res.json({ message: "Verification email re-sent successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: "Server Error", message: err?.message || "Failed to resend verification email." });
  }
});

export default router;
