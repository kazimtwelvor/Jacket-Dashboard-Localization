/**
 * Debug utilities for tracking data flow through components
 */

// Enable or disable debug logging
const DEBUG_ENABLED = true

// Create a unique session ID for this page load
const SESSION_ID = Math.random().toString(36).substring(2, 8)

// Track component render counts
const renderCounts: Record<string, number> = {}

/**
 * Log debug information with consistent formatting
 */
export function debugLog(component: string, action: string, data: any) {
  if (!DEBUG_ENABLED) return

  // Increment render count
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
