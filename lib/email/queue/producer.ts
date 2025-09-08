import { Queue } from "bullmq"
import { redisConnection, QUEUE_NAMES, defaultJobOptions } from "./config"
import { emailLogger } from "../logger"

export type EmailJobType =
  | "order-confirmation"
  | "password-reset"
  | "welcome"
  | "shipping-update"
  | "abandoned-cart"
  | "low-stock-alert"
  | "new-order-notification"
  | "review-request"
  | "account-verification"

export interface EmailJobData {
  type: EmailJobType
  payload: Record<string, any>
  metadata?: {
    userId?: string
    orderId?: string
    storeId?: string
    [key: string]: any
  }
}

const emailQueue = new Queue<EmailJobData>(QUEUE_NAMES.EMAIL, {
  connection: redisConnection,
  defaultJobOptions,
})


export async function queueEmail(
  jobData: EmailJobData,
  options?: {
    priority?: number
    delay?: number
    jobId?: string
  },
) {
  try {
    const jobId = options?.jobId || `email-${jobData.type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    const job = await emailQueue.add(jobData.type, jobData, {
      priority: options?.priority,
      delay: options?.delay,
      jobId,
    })

    emailLogger.info({
      event: "email_queued",
      template: jobData.type,
      metadata: {
        jobId: job.id,
        ...jobData.metadata,
      },
    })

    return { success: true, jobId: job.id }
  } catch (error) {
    emailLogger.error({
      event: "email_queue_error",
      template: jobData.type,
      error,
      metadata: jobData.metadata,
    })

    return { success: false, error }
  }
}

export { emailQueue }
