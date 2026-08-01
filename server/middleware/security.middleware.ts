/**
 * StudyMate Production Security & Monitoring Middleware Suite
 * Provides:
 * 1. Security Headers (Helmet equivalent - HSTS, CSP, X-Frame-Options, XSS, Nosniff)
 * 2. Sliding-Window In-Memory Rate Limiting
 * 3. Request Tracing & Correlation IDs (X-Request-ID)
 * 4. Input Sanitization & XSS Defense
 * 5. JWT / Role Authorization Validation Stubs
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

// Extend Express Request interface for correlation IDs & telemetry
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
      user?: {
        id: string;
        email: string;
        username?: string;
        role?: string;
      };
    }
  }
}

/**
 * 1. Request Tracing & Correlation ID Middleware
 */
export function requestTracingMiddleware(req: Request, res: Response, next: NextFunction) {
  req.startTime = Date.now();
  const incomingId = req.header("X-Request-ID");
  req.requestId = incomingId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  res.setHeader("X-Request-ID", req.requestId);

  res.on("finish", () => {
    const durationMs = Date.now() - (req.startTime || Date.now());
    logger.info("HTTP", `${req.method} ${req.originalUrl} - ${res.statusCode}`, undefined, {
      requestId: req.requestId,
      userId: req.user?.id,
      durationMs
    });
  });

  next();
}

/**
 * 2. Security Headers Middleware (Production Hardening)
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent Clickjacking (frame embedding)
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // XSS Filter Protection for legacy browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Strict Transport Security (HSTS) - enforce HTTPS in production
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");

  // Content Security Policy (CSP)
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  );

  next();
}

/**
 * 3. Sliding Window Rate Limiter
 */
interface RateLimitBucket {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

export function createRateLimiter(options: { windowMs: number; maxRequests: number; message?: string }) {
  const { windowMs, maxRequests, message = "Too many requests, please try again later." } = options;

  // Periodic cleanup of expired entries
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of rateLimitStore.entries()) {
      if (now > bucket.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, windowMs);

  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.header("x-forwarded-for") || "global_client";
    const key = `${req.path}:${clientIp}`;
    const now = Date.now();

    let bucket = rateLimitStore.get(key);

    if (!bucket || now > bucket.resetTime) {
      bucket = { count: 1, resetTime: now + windowMs };
      rateLimitStore.set(key, bucket);
    } else {
      bucket.count += 1;
    }

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - bucket.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(bucket.resetTime / 1000));

    if (bucket.count > maxRequests) {
      logger.warn("RATE_LIMIT", `Rate limit exceeded for IP ${clientIp} on ${req.path}`, undefined, {
        requestId: req.requestId
      });
      return res.status(429).json({
        error: message,
        retryAfterSeconds: Math.ceil((bucket.resetTime - now) / 1000)
      });
    }

    next();
  };
}

// Global API Rate Limiter: 100 requests per minute
export const globalApiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 120,
  message: "API rate limit exceeded. Maximum 120 requests per minute allowed."
});

// Strict AI Generation Rate Limiter: 30 requests per minute
export const aiGenerationRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: "AI Generation endpoint rate limit exceeded. Maximum 30 AI generations per minute allowed."
});

/**
 * 4. Input Sanitization & Safety Validator
 */
export function sanitizeInputMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
}

function sanitizeObject(obj: any): any {
  if (typeof obj === "string") {
    // Strip malicious script tags while retaining safe content
    return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").trim();
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj !== null && typeof obj === "object") {
    const sanitized: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      sanitized[k] = sanitizeObject(v);
    }
    return sanitized;
  }
  return obj;
}

/**
 * 5. Request Body Size & File Upload Guard
 */
export function validateFileUploadSize(maxSizeBytes: number = 15 * 1024 * 1024) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && req.body.base64) {
      const approxBytes = Math.ceil((req.body.base64.length * 3) / 4);
      if (approxBytes > maxSizeBytes) {
        logger.warn("SECURITY", `File upload payload size (${approxBytes} bytes) exceeds limit (${maxSizeBytes} bytes)`, undefined, {
          requestId: req.requestId
        });
        return res.status(400).json({
          error: `File payload size exceeds maximum permitted limit of ${maxSizeBytes / (1024 * 1024)}MB.`
        });
      }
    }
    next();
  };
}
