/**
 * Web Auth Store
 *
 * Re-exports from @aria/core — shared across web and mobile.
 * Initialization happens in app/layout.tsx with web-specific config.
 */

export { useAuthStore, initializeAuthStore } from '@aria/core'
export { useChatStore, initializeChatStore } from '@/store/chat'
