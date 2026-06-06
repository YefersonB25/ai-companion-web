export interface User {
  id: number
  name: string
  email: string
  is_admin?: boolean
  created_at: string
}

export interface UserSetting {
  id: number
  user_id: number
  default_provider: string
  default_model: string
  language: string
  timezone: string
  memory_enabled: boolean
  auto_title: boolean
  stream_responses: boolean
  routing_rules: RoutingRule[] | null
  persona: Persona | null
  briefing_enabled: boolean
  briefing_time: string
  briefing_city: string | null
  tts_provider: string | null
}

export interface RoutingRule {
  task: string
  provider: string
}

export interface Persona {
  name: string
  prompt: string
}

export interface AiProvider {
  id: number
  user_id: number
  provider: string
  model: string
  base_url: string | null
  is_active: boolean
  is_default: boolean
  priority: number
  config: Record<string, unknown> | null
}

export interface SupportedProvider {
  name: string
  label: string
  models: string[]
}

export interface Conversation {
  id: number
  user_id: number
  title: string | null
  provider: string | null
  model: string | null
  channel: string
  token_count: number
  messages_count?: number
  messages?: Message[]
  created_at: string
  updated_at: string
}

export interface Message {
  id: number
  conversation_id: number
  user_id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  provider: string | null
  model: string | null
  input_tokens: number
  output_tokens: number
  latency_ms: number | null
  created_at: string
}

export interface MemoryNode {
  id: number
  user_id: number
  type: string
  label: string
  content: string
  attributes: Record<string, unknown> | null
  importance: number
  parent_id: number | null
  access_count: number
  last_accessed_at: string | null
  created_at: string
}

export interface MindMapData {
  nodes: MindMapNode[]
  edges: MindMapEdge[]
}

export interface MindMapNode {
  id: number
  type: string
  label: string
  importance: number
  parent_id: number | null
  attributes: Record<string, unknown> | null
}

export interface MindMapEdge {
  source: number
  target: number
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
