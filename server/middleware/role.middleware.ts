import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware.js";

/**
 * Role-Based Access Control (RBAC) Middleware
 * Ensures the authenticated user possesses at least one allowed role.
 */
export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required before checking role permissions.",
        code: "UNAUTHENTICATED"
      });
    }

    const userRoles = req.user.roles || [req.user.role || "student"];
    const hasPermission = allowedRoles.some(allowed => userRoles.includes(allowed));

    if (!hasPermission) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Access denied. Required role: [${allowedRoles.join(", ")}]. Current role: [${userRoles.join(", ")}].`,
        code: "INSUFFICIENT_PERMISSIONS"
      });
    }

    next();
  };
}

/**
 * Admin-Only Guard Middleware Shortcut
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return requireRole(["admin", "institution_admin"])(req, res, next);
}

/**
 * Educator or Admin Guard Middleware Shortcut
 */
export function requireEducatorOrAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return requireRole(["educator", "expert", "institution_admin", "admin"])(req, res, next);
}
