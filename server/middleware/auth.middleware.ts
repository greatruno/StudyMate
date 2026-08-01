import { Request, Response, NextFunction } from "express";
import { getSupabaseClient, getSupabaseAdmin } from "../config/supabase.js";
import pkg from "pg";
const { Client } = pkg;

export interface AuthenticatedUser {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatarEmoji?: string;
  role?: string;
  roles?: string[];
  metadata?: Record<string, any>;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  token?: string;
}

/**
 * Authentication Middleware
 * Validates JWT access tokens passed via Authorization Bearer header or cookies.
 * Attaches decoded user metadata and DB synced profile to req.user.
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.headers["x-access-token"]) {
      token = req.headers["x-access-token"] as string;
    }

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "No authentication token provided in request header.",
        code: "NO_TOKEN"
      });
    }

    // Verify token with Supabase Auth
    const supabase = getSupabaseClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      return res.status(401).json({
        error: "Unauthorized",
        message: authError?.message || "Invalid or expired session token.",
        code: "INVALID_TOKEN"
      });
    }

    // Fetch user roles and public profile from database if available
    let roles: string[] = ["student"];
    let username = authUser.user_metadata?.username || authUser.email?.split("@")[0];
    let displayName = authUser.user_metadata?.display_name || username;
    let avatarEmoji = authUser.user_metadata?.avatar_emoji || "🎓";

    try {
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl) {
        const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
        await client.connect();
        try {
          const userRes = await client.query(
            `SELECT u.username, u.display_name, u.avatar_emoji, r.name as role_name
             FROM public.users u
             LEFT JOIN public.user_roles ur ON u.id = ur.user_id
             LEFT JOIN public.roles r ON ur.role_id = r.id
             WHERE u.id = $1`,
            [authUser.id]
          );

          if (userRes.rows.length > 0) {
            username = userRes.rows[0].username || username;
            displayName = userRes.rows[0].display_name || displayName;
            avatarEmoji = userRes.rows[0].avatar_emoji || avatarEmoji;
            
            const fetchedRoles = userRes.rows.map(r => r.role_name).filter(Boolean);
            if (fetchedRoles.length > 0) {
              roles = fetchedRoles;
            }
          }
        } finally {
          await client.end();
        }
      }
    } catch (dbErr) {
      console.warn("⚠️ Warning: Could not query user_roles during auth middleware check, falling back to metadata roles:", dbErr);
    }

    req.token = token;
    req.user = {
      id: authUser.id,
      email: authUser.email || "",
      username,
      displayName,
      avatarEmoji,
      role: roles[0] || "student",
      roles,
      metadata: authUser.user_metadata || {}
    };

    next();
  } catch (err: any) {
    console.error("❌ Auth Middleware Error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to authenticate request session.",
      details: err?.message
    });
  }
}

/**
 * Optional Auth Middleware
 * Attaches user to req if valid token is provided, but does not block unauthenticated requests.
 */
export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const supabase = getSupabaseClient();
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      if (authUser) {
        req.token = token;
        req.user = {
          id: authUser.id,
          email: authUser.email || "",
          username: authUser.user_metadata?.username || authUser.email?.split("@")[0],
          displayName: authUser.user_metadata?.display_name,
          avatarEmoji: authUser.user_metadata?.avatar_emoji || "🎓",
          role: authUser.user_metadata?.role || "student",
          roles: [authUser.user_metadata?.role || "student"],
          metadata: authUser.user_metadata || {}
        };
      }
    }
  } catch (e) {
    // Ignore error for optional auth
  }
  next();
}
