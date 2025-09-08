import { startEmailWorker } from "./queue/consumer"

let worker: ReturnType<typeof startEmailWorker> | null = null

export function initializeEmailWorker() {
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_EMAIL_WORKER === "true") {
    if (!worker) {
      worker = startEmailWorker()
    }
    return worker
  }

  return null
}

export function getEmailWorker() {
  return worker
}

export function stopEmailWorker() {
  if (worker) {
    worker.close()
    worker = null
  }
}
