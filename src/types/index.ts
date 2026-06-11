// Re-export shared types from @aria/core
export type {
  AiProvider,
  Conversation,
  Message,
  MemoryNode,
  MindMapData,
} from '@aria/core'

import type { User as BaseUser, UserSetting as BaseUserSetting } from '@aria/core'

// Extend shared types with web-specific fields
export interface User extends BaseUser {
  is_admin?: boolean
  created_at: string
}

export interface UserSetting extends BaseUserSetting {
  id: number
  user_id: number
  auto_title: boolean
  timezone: string
  routing_rules: RoutingRule[] | null
  persona: Persona | null
  briefing_enabled: boolean
  briefing_time: string
  briefing_city: string | null
}

// Web-specific types
export interface RoutingRule {
  task: string
  provider: string
}

export interface Persona {
  name: string
  prompt: string
}

export interface SupportedProvider {
  name: string
  label: string
  models: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

// ─── License ──────────────────────────────────

export interface LicenseSetting {
  id: number
  licenses_required: boolean
  whatsapp_number: string
  price_monthly_cop: number
  price_yearly_cop: number
  license_features: string[]
}

export interface License {
  id: number
  user_id: number
  key: string
  type: 'monthly' | 'yearly' | 'custom'
  status: 'active' | 'expired' | 'revoked'
  starts_at: string
  expires_at: string
  granted_by: number | null
  price_paid: number | null
  notes: string | null
  days_remaining?: number
  is_active?: boolean
  user?: { id: number; name: string; email: string }
  granted_by_user?: { id: number; name: string }
  created_at: string
  updated_at: string
}

export interface LicenseRequest {
  id: number
  user_id: number | null
  name: string
  email: string
  phone: string
  company: string | null
  city: string | null
  plan_type: 'monthly' | 'yearly'
  status: 'pending' | 'accepted' | 'rejected'
  admin_notes: string | null
  catalog_sent_at: string | null
  user?: { id: number; name: string; email: string }
  created_at: string
  updated_at: string
}

export interface LicenseStatus {
  licenses_required: boolean
  has_active_license: boolean
  license: {
    id: number
    key: string
    type: 'monthly' | 'yearly' | 'custom'
    status: 'active' | 'expired' | 'revoked'
    starts_at: string
    expires_at: string
    days_remaining: number
    is_active: boolean
  } | null
  pending_request: {
    id: number
    plan_type: 'monthly' | 'yearly'
    status: string
    created_at: string
  } | null
}

export interface LicenseSummary {
  licenses_required: boolean
  total_active: number
  total_expired: number
  total_revoked: number
  pending_requests: number
  expiring_week: number
}
