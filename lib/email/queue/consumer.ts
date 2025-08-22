import { Worker, type Job } from "bullmq"
import { redisConnection, QUEUE_NAMES } from "./config"
import type { EmailJobData } from "./producer"
import { sendEmail } from "../resend"
import { emailLogger } from "../logger"
import { OrderConfirmationEmail } from "../templates/order-confirmation"
import { PasswordResetEmail } from "../templates/password-reset"
import { WelcomeEmail } from "../templates/welcome-email"
import { ShippingUpdateEmail } from "../templates/shipping-update"
import { AbandonedCartEmail } from "../templates/abandoned-cart"
import { LowStockAlertEmail } from "../templates/low-stock-alert"
import { NewOrderNotificationEmail } from "../templates/new-order-notification"
import { ReviewRequestEmail } from "../templates/review-request"
import { AccountVerificationEmail } from "../templates/account-verification"

/**
 * Process email jobs based on their type
 */
async function processEmailJob(job: Job<EmailJobData>) {
  const { type, payload, metadata } = job.data

  emailLogger.info({
    event: "processing_email_job",
    template: type,
    metadata: {
      jobId: job.id,
      ...metadata,
    },
  })

  try {
    let emailResult

    switch (type) {
      case "order-confirmation":
        emailResult = await sendEmail({
          to: payload.customerEmail,
          subject: `Order Confirmation #${payload.orderNumber}`,
          react: OrderConfirmationEmail(payload),
        })
        break

      case "password-reset":
        emailResult = await sendEmail({
          to: payload.email,
          subject: "Reset Your Password",
          react: PasswordResetEmail(payload),
        })
        break

      case "welcome":
        emailResult = await sendEmail({
          to: payload.email,
          subject: `Welcome to ${payload.storeName || "Our Store"}`,
          react: WelcomeEmail(payload),
        })
        break

      case "shipping-update":
        emailResult = await sendEmail({
          to: payload.customerEmail,
          subject: `Your Order #${payload.orderNumber} Has Shipped!`,
          react: ShippingUpdateEmail(payload),
        })
        break

      case "abandoned-cart":
        emailResult = await sendEmail({
          to: payload.customerEmail,
          subject: `Complete Your Purchase at ${payload.storeName}${payload.discountCode ? ` - Save ${payload.discountAmount}!` : ""}`,
          react: AbandonedCartEmail(payload),
        })
        break

      case "low-stock-alert":
        emailResult = await sendEmail({
          to: payload.adminEmail,
          subject: `Low Stock Alert: ${payload.products.length} Products Need Attention`,
          react: LowStockAlertEmail(payload),
        })
        break

      case "new-order-notification":
        emailResult = await sendEmail({
          to: payload.adminEmail,
          subject: `New Order #${payload.orderNumber} Received`,
          react: NewOrderNotificationEmail(payload),
        })
        break

      case "review-request":
        emailResult = await sendEmail({
          to: payload.customerEmail,
          subject: `Share Your Thoughts on Your Recent Purchase from ${payload.storeName}`,
          react: ReviewRequestEmail(payload),
        })
        break

      case "account-verification":
        emailResult = await sendEmail({
          to: payload.email,
          subject: `Verify Your Email Address for ${payload.storeName}`,
          react: AccountVerificationEmail(payload),
        })
        break

      default:
        throw new Error(`Unknown email type: ${type}`)
    }

    if (!emailResult.success) {
      throw new Error(emailResult.error || "Failed to send email")
    }

    emailLogger.info({
      event: "email_sent",
      template: type,
      emailId: emailResult.data?.id,
      metadata: {
        jobId: job.id,
        ...metadata,
      },
    })

    return { success: true, emailId: emailResult.data?.id }
  } catch (error) {
    emailLogger.error({
      event: "email_send_error",
      template: type,
      error,
      metadata: {
        jobId: job.id,
        ...metadata,
      },
    })

    throw error // Re-throw to trigger job retry
  }
}

/**
 * Create and start the email worker
 */
export function startEmailWorker() {
  const worker = new Worker<EmailJobData>(QUEUE_NAMES.EMAIL, processEmailJob, {
    connection: redisConnection,
    concurrency: 5, // Process 5 jobs at a time
  })

  worker.on("completed", (job) => {
    emailLogger.debug({
      event: "job_completed",
      template: job.data.type,
      metadata: {
        jobId: job.id,
        ...job.data.metadata,
      },
    })
  })

  worker.on("failed", (job, error) => {
    emailLogger.error({
      event: "job_failed",
      template: job?.data.type,
      error,
      metadata: {
        jobId: job?.id,
        attempts: job?.attemptsMade,
        ...job?.data.metadata,
      },
    })
  })

  emailLogger.info({
    event: "worker_started",
    metadata: {
      queue: QUEUE_NAMES.EMAIL,
      concurrency: 5,
    },
  })

  return worker
}
