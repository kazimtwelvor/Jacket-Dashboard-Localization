import { startEmailWorker } from "./queue/consumer"

let worker: ReturnType<typeof startEmailWorker> | null = null

export function initializeEmailWorker() {
  // Only start the worker in production or if explicitly enabled
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_EMAIL_WORKER === "true") {
    if (!worker) {
      worker = startEmailWorker()
      console.log("Email worker initialized")
    }
    return worker
  }

  console.log("Email worker not started (not in production)")
  return null
}

// For development, you can manually start/stop the worker
export function getEmailWorker() {
  return worker
}

export function stopEmailWorker() {
  if (worker) {
    worker.close()
    worker = null
    console.log("Email worker stopped")
  }
}
