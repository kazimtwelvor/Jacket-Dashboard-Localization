// Email logging utility for tracking email events

type LogLevel = "info" | "warn" | "error" | "debug"

interface EmailLogData {
  event: string
  emailId?: string
  recipient?: string
  subject?: string
  template?: string
  error?: any
  metadata?: Record<string, any>
}

export function logEmailEvent(level: LogLevel, data: EmailLogData) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level,
    ...data,
  }

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console[level](`[EMAIL] ${timestamp} - ${data.event}`, logEntry)
  }

  // In production, you might want to log to a service like Datadog, Sentry, etc.
  // or store logs in your database for auditing purposes

  // Example: if (process.env.NODE_ENV === 'production') { sendToLoggingService(logEntry); }

  return logEntry
}

// Helper functions for different log levels
export const emailLogger = {
  info: (data: EmailLogData) => logEmailEvent("info", data),
  warn: (data: EmailLogData) => logEmailEvent("warn", data),
  error: (data: EmailLogData) => logEmailEvent("error", data),
  debug: (data: EmailLogData) => logEmailEvent("debug", data),
}
