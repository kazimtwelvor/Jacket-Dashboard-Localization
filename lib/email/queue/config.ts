import type { ConnectionOptions } from "bullmq"

export const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number.parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === "true" ? {} : undefined,
}

export const QUEUE_NAMES = {
  EMAIL: "email-queue",
}

export const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000, // 5 seconds
  },
  removeOnComplete: true,
  removeOnFail: false,
}
