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

  // Format the log with component name, action, and render count
  console.log(
    `%c[DEBUG ${SESSION_ID}]%c ${component} %c(render #${renderCounts[component]})%c ${action}:`,
    "color: #ff5722; font-weight: bold;",
    "color: #2196f3; font-weight: bold;",
    "color: #9e9e9e;",
    "color: #000;",
    data,
  )
}

/**
 * Track data flow between components
 */
export function trackDataFlow(source: string, destination: string, data: any) {
  if (!DEBUG_ENABLED) return

  console.log(
    `%c[DATA FLOW ${SESSION_ID}]%c ${source} → ${destination}:`,
    "color: #4caf50; font-weight: bold;",
    "color: #000;",
    data,
  )
}

/**
 * Log component props
 */
export function logProps(component: string, props: any) {
  if (!DEBUG_ENABLED) return

  console.log(`%c[PROPS ${SESSION_ID}]%c ${component}:`, "color: #9c27b0; font-weight: bold;", "color: #000;", props)
}

/**
 * Create a global debug object for browser console access
 */
export function initializeDebugger() {
  if (typeof window !== "undefined") {
    ;(window as any).__DEBUG_STORE_SWITCHER = {
      session: SESSION_ID,
      renderCounts,
      enableDebug: () => {
        ;(window as any).__DEBUG_STORE_SWITCHER.isEnabled = true
        console.log("%c[DEBUG] Enabled for session " + SESSION_ID, "color: #4caf50; font-weight: bold;")
      },
      disableDebug: () => {
        ;(window as any).__DEBUG_STORE_SWITCHER.isEnabled = false
        console.log("%c[DEBUG] Disabled for session " + SESSION_ID, "color: #f44336; font-weight: bold;")
      },
      isEnabled: DEBUG_ENABLED,
      inspectStores: (stores: any) => {
        console.table(stores)
        return stores
      },
    }
  }
}
