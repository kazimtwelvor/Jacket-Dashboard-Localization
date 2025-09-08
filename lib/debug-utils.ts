

const DEBUG_ENABLED = true

const SESSION_ID = Math.random().toString(36).substring(2, 8)

const renderCounts: Record<string, number> = {}

export function debugLog(component: string, action: string, data: any) {
  if (!DEBUG_ENABLED) return

  renderCounts[component] = (renderCounts[component] || 0) + 1

}

export function trackDataFlow(source: string, destination: string, data: any) {
  if (!DEBUG_ENABLED) return

}

export function logProps(component: string, props: any) {
  if (!DEBUG_ENABLED) return

}


export function initializeDebugger() {
  if (typeof window !== "undefined") {
    ;(window as any).__DEBUG_STORE_SWITCHER = {
      session: SESSION_ID,
      renderCounts,
      enableDebug: () => {
        ;(window as any).__DEBUG_STORE_SWITCHER.isEnabled = true
      },
      disableDebug: () => {
        ;(window as any).__DEBUG_STORE_SWITCHER.isEnabled = false
      },
      isEnabled: DEBUG_ENABLED,
      inspectStores: (stores: any) => {
        console.table(stores)
        return stores
      },
    }
  }
}
