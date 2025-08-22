import { Queue, QueueScheduler } from "bullmq"
import { redisConnection, QUEUE_NAMES } from "../queue/config"
import prismadb from "@/lib/prismadb"
import { emailLogger } from "../logger"
import { sendAbandonedCartEmail } from "@/app/api/email/advanced-actions"

// Create scheduler for abandoned cart jobs
const abandonedCartScheduler = new QueueScheduler(QUEUE_NAMES.ABANDONED_CART_CHECK, {
  connection: redisConnection,
})

// Create queue for abandoned cart check jobs
const abandonedCartQueue = new Queue(QUEUE_NAMES.ABANDONED_CART_CHECK, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
})

/**
 * Schedule a job to check for abandoned carts
 */
export async function scheduleAbandonedCartCheck(interval = 60 * 60 * 1000) {
  // Default: every hour
  try {
    // Remove any existing repeat jobs
    const repeatableJobs = await abandonedCartQueue.getRepeatableJobs()
    for (const job of repeatableJobs) {
      await abandonedCartQueue.removeRepeatableByKey(job.key)
    }

    // Add new repeatable job
    await abandonedCartQueue.add(
      "check-abandoned-carts",
      {},
      {
        repeat: {
          every: interval,
        },
      },
    )

    emailLogger.info({
      event: "abandoned_cart_check_scheduled",
      metadata: { interval },
    })

    return { success: true }
  } catch (error) {
    emailLogger.error({
      event: "schedule_abandoned_cart_check_error",
      error,
    })

    return { success: false, error }
  }
}

/**
 * Process to check for abandoned carts
 */
export async function processAbandonedCartCheck() {
  try {
    // Find carts that have been abandoned for more than 4 hours but less than 24 hours
    // and haven't had an email sent yet
    const abandonedCarts = await prismadb.cart.findMany({
      where: {
        updatedAt: {
          lt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        },
        emailSent: false,
        userId: {
          not: null,
        },
        items: {
          some: {},
        },
      },
      include: {
        items: true,
      },
    })

    emailLogger.info({
      event: "abandoned_carts_found",
      metadata: { count: abandonedCarts.length },
    })

    // Send emails for each abandoned cart
    const emailPromises = abandonedCarts.map(async (cart) => {
      // Determine if we should include a discount (e.g., for carts with higher value)
      const cartValue = cart.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
      const includeDiscount = cartValue > 100 // Only include discount for carts worth more than $100

      const result = await sendAbandonedCartEmail(cart.id, {
        includeDiscount,
        discountCode: includeDiscount ? "COMEBACK15" : undefined,
        discountAmount: includeDiscount ? "15%" : undefined,
        expiryHours: 24,
      })

      // Mark cart as having received an email
      await prismadb.cart.update({
        where: { id: cart.id },
        data: { emailSent: true },
      })

      return result
    })

    const results = await Promise.all(emailPromises)
    return { success: true, emailsSent: results.length }
  } catch (error) {
    emailLogger.error({
      event: "process_abandoned_cart_check_error",
      error,
    })

    throw error
  }
}

/**
 * Start the abandoned cart worker
 */
export function startAbandonedCartWorker() {
  const worker = new Worker(
    QUEUE_NAMES.ABANDONED_CART_CHECK,
    async () => {
      return processAbandonedCartCheck()
    },
    {
      connection: redisConnection,
      concurrency: 1, // Only one job at a time
    },
  )

  worker.on("completed", (job, result) => {
    emailLogger.info({
      event: "abandoned_cart_check_completed",
      metadata: { jobId: job.id, ...result },
    })
  })

  worker.on("failed", (job, error) => {
    emailLogger.error({
      event: "abandoned_cart_check_failed",
      error,
      metadata: { jobId: job?.id },
    })
  })

  // Schedule the job to run every hour
  scheduleAbandonedCartCheck()

  return worker
}

// Import Worker at the top of the file
import { Worker } from "bullmq"
