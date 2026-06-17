export type Priority = 'P0' | 'P1' | 'P2' | 'P3'
export type ItemStatus = 'backlog' | 'in_progress' | 'in_review' | 'done'
export type ViewMode = 'board' | 'list'

export interface BacklogItem {
  id: string
  title: string
  description: string
  priority: Priority
  status: ItemStatus
  sprint_id: string | null
  tags: string[]
  effort?: 'XS' | 'S' | 'M' | 'L' | 'XL'
  created_at: string
  updated_at: string
  completed_at?: string
  dependencies?: string[] // IDs of items this depends on
  notes?: string // freeform markdown notes
}

export interface Sprint {
  id: string
  name: string
  goal?: string
  start_date?: string
  end_date?: string
  status: 'planning' | 'active' | 'completed' | 'archived'
  created_at: string
  track?: string
}

export interface Project {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface ContextDoc {
  id: string
  title: string
  content: string // markdown content
  project_id: string
  created_at: string
  updated_at: string
}

export interface AppState {
  projects: Project[]
  sprints: Sprint[]
  items: BacklogItem[]
  contextDocs: ContextDoc[]
  activeProjectId: string | null
  activeSprintId: string | null
  activeItemId: string | null
  activeDocId: string | null
  viewMode: ViewMode
  searchQuery: string
  filterPriority: Priority | null
  filterStatus: ItemStatus | null
  manifestBacked: boolean
  generatedAt?: string
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  P0: { label: 'P0', color: '#F85149', bg: '#F8514926' },
  P1: { label: 'P1', color: '#D29922', bg: '#D2992226' },
  P2: { label: 'P2', color: '#58A6FF', bg: '#58A6FF26' },
  P3: { label: 'P3', color: '#3FB950', bg: '#3FB95026' },
}

export const STATUS_CONFIG: Record<ItemStatus, { label: string; icon: string; color: string }> = {
  backlog: { label: 'Queue', icon: '□', color: '#8B949E' },
  in_progress: { label: 'Running', icon: '▶', color: '#D29922' },
  in_review: { label: 'Review', icon: '◆', color: '#A371F7' },
  done: { label: 'Shipped', icon: '■', color: '#3FB950' },
}

export const EFFORT_CONFIG: Record<string, { label: string; hours: string }> = {
  XS: { label: 'XS', hours: '< 1h' },
  S: { label: 'S', hours: '1-2h' },
  M: { label: 'M', hours: '2-4h' },
  L: { label: 'L', hours: '4-8h' },
  XL: { label: 'XL', hours: '8h+' },
}
