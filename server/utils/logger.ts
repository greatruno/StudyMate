/**
 * StudyMate Production Logger & Telemetry Engine
 * Standardized JSON & Console Structured Logger with Correlation IDs,
 * Multi-Level Severity (INFO, WARN, ERROR, AUDIT, METRIC),
 * and Sensitive Field Masking.
 */

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "AUDIT" | "METRIC";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  requestId?: string;
  userId?: string;
  module: string;
  message: string;
  details?: any;
  durationMs?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private environment: string;
  private sensitiveKeys: Set<string>;

  constructor() {
    this.environment = process.env.NODE_ENV || "development";
    this.sensitiveKeys = new Set([
      "password",
      "passwordHash",
      "token",
      "accessToken",
      "refreshToken",
      "apiKey",
      "secret",
      "authorization",
      "cookie"
    ]);
  }

  private sanitize(obj: any): any {
    if (!obj || typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitize(item));
    }

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (this.sensitiveKeys.has(key.toLowerCase())) {
        sanitized[key] = "[REDACTED_SENSITIVE_DATA]";
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private formatEntry(entry: LogEntry): string {
    const sanitizedDetails = entry.details ? this.sanitize(entry.details) : undefined;
    const logObject = {
      ...entry,
      details: sanitizedDetails,
      environment: this.environment
    };

    if (this.environment === "production") {
      return JSON.stringify(logObject);
    }

    // Readable format for development
    const reqTag = entry.requestId ? ` [ReqID: ${entry.requestId}]` : "";
    const userTag = entry.userId ? ` [User: ${entry.userId}]` : "";
    const durTag = entry.durationMs !== undefined ? ` (${entry.durationMs}ms)` : "";
    const detailsStr = sanitizedDetails ? ` | ${JSON.stringify(sanitizedDetails)}` : "";
    const errStr = entry.error ? ` | ERROR: ${entry.error.message}` : "";

    return `[${entry.timestamp}] [${entry.level}] [${entry.module}]${reqTag}${userTag}: ${entry.message}${durTag}${detailsStr}${errStr}`;
  }

  public log(level: LogLevel, module: string, message: string, details?: any, meta?: { requestId?: string; userId?: string; durationMs?: number; error?: Error }) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      details,
      requestId: meta?.requestId,
      userId: meta?.userId,
      durationMs: meta?.durationMs
    };

    if (meta?.error) {
      entry.error = {
        name: meta.error.name,
        message: meta.error.message,
        stack: meta.error.stack
      };
    }

    const formatted = this.formatEntry(entry);

    switch (level) {
      case "ERROR":
        console.error(formatted);
        break;
      case "WARN":
        console.warn(formatted);
        break;
      case "AUDIT":
        console.info(`🔒 ${formatted}`);
        break;
      case "METRIC":
        console.info(`📊 ${formatted}`);
        break;
      default:
        console.log(formatted);
    }
  }

  public info(module: string, message: string, details?: any, meta?: { requestId?: string; userId?: string; durationMs?: number }) {
    this.log("INFO", module, message, details, meta);
  }

  public warn(module: string, message: string, details?: any, meta?: { requestId?: string; userId?: string; durationMs?: number }) {
    this.log("WARN", module, message, details, meta);
  }

  public error(module: string, message: string, err?: Error | any, meta?: { requestId?: string; userId?: string; durationMs?: number }) {
    const errorObj = err instanceof Error ? err : (err ? new Error(String(err)) : undefined);
    this.log("ERROR", module, message, undefined, { ...meta, error: errorObj });
  }

  public audit(module: string, action: string, details?: any, meta?: { requestId?: string; userId?: string }) {
    this.log("AUDIT", module, action, details, meta);
  }

  public metric(module: string, metricName: string, value: number, unit = "ms", details?: any) {
    this.log("METRIC", module, `${metricName}: ${value}${unit}`, details, { durationMs: value });
  }
}

export const logger = new Logger();
