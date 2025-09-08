
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

  if (process.env.NODE_ENV === "development") {
    console[level](`[EMAIL] ${timestamp} - ${data.event}`, logEntry)
  }



  return logEntry
}

export const emailLogger = {
  info: (data: EmailLogData) => logEmailEvent("info", data),
  warn: (data: EmailLogData) => logEmailEvent("warn", data),
  error: (data: EmailLogData) => logEmailEvent("error", data),
  debug: (data: EmailLogData) => logEmailEvent("debug", data),
}
