type LogLevel = "debug" | "info" | "warn" | "error" | "audit";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  action: string;
  userId?: string;
  eventId?: string;
  data?: unknown;
}

function redactSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) return data;

  if (typeof data === "object") {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (key === "token" || key === "password" || key === "access_token" || key === "refresh_token") {
        redacted[key] = "[REDACTED]";
      } else if (typeof value === "object") {
        redacted[key] = redactSensitiveData(value);
      } else {
        redacted[key] = value;
      }
    }
    return redacted;
  }

  return data;
}

export function auditLog(
  level: LogLevel,
  service: string,
  action: string,
  data?: Record<string, unknown>
): void {
  const safeData = data ? redactSensitiveData(data) : undefined;

  // Extract userId and eventId from original data before redaction
  const userId = data?.userId as string | undefined;
  const eventId = data?.eventId as string | undefined;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    service,
    action,
    userId,
    eventId,
    data: safeData,
  };

  if (process.env.NODE_ENV === "production") {
    // Structured JSON for log aggregators (CloudWatch, Datadog, Loki, etc.)
    console.log(JSON.stringify(entry));
  } else {
    // Pretty-print for development
    const colors: Record<LogLevel, string> = {
      debug: "\x1b[90m", // gray
      info: "\x1b[34m", // blue
      warn: "\x1b[33m", // yellow
      error: "\x1b[31m", // red
      audit: "\x1b[35m", // magenta
    };
    const reset = "\x1b[0m";
    const color = colors[level] ?? reset;
    console.group(`${color}[EVORA:${service}] ${action}${reset}`);
    if (safeData !== undefined) console.log("Data:", safeData);
    console.groupEnd();
  }
}
