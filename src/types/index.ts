export interface User {
  id: number
  name: string
  email: string
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
