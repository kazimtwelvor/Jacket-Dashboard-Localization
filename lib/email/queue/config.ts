import type { ConnectionOptions } from "bullmq"

// Redis connection configuration for BullMQ
export const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number.parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  // Use TLS if REDIS_TLS is set to 'true'
  tls: process.env.REDIS_TLS === "true" ? {} : undefined,
}

// Queue names
export const QUEUE_NAMES = {
  EMAIL: "email-queue",
}

// Default job options
export const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000, // 5 seconds
  },
  removeOnComplete: true,
  removeOnFail: false,
}
