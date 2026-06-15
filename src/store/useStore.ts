import { useCallback, useSyncExternalStore } from 'react'
import type { AppState, BacklogItem, Sprint, Project, ContextDoc, Priority, ItemStatus, ViewMode } from '@/lib/types'
import { v4 as uuid } from 'uuid'

const STORAGE_KEY = 'sprint-planner-state'

const defaultState: AppState = {
  projects: [],
  sprints: [],
  items: [],
  contextDocs: [],
  activeProjectId: null,
  activeSprintId: null,
  activeItemId: null,
  activeDocId: null,
  viewMode: 'board',
  searchQuery: '',
  filterPriority: null,
  filterStatus: null,
  manifestBacked: false,
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...defaultState, ...parsed }
    }
  } catch {}
  return defaultState
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

// Simple external store
let state = loadState()
let listeners: Set<() => void> = new Set()

function getState() { return state }
function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
function setState(updater: (prev: AppState) => AppState) {
  state = updater(state)
  saveState(state)
  listeners.forEach(fn => fn())
}

// Selectors
export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState)
}

export function useActiveProject(): Project | null {
  const s = useAppState()
  return s.projects.find(p => p.id === s.activeProjectId) ?? null
}

export function useActiveSprint(): Sprint | null {
  const s = useAppState()
  return s.sprints.find(sp => sp.id === s.activeSprintId) ?? null
}

export function useActiveItem(): BacklogItem | null {
  const s = useAppState()
  return s.items.find(i => i.id === s.activeItemId) ?? null
}

export function useIsManifestBacked(): boolean {
  const s = useAppState()
  return s.manifestBacked
}

export function useActiveDoc(): ContextDoc | null {
  const s = useAppState()
  return s.contextDocs.find(d => d.id === s.activeDocId) ?? null
}

export function useFilteredItems(): BacklogItem[] {
  const s = useAppState()
  let items = s.items

  if (s.activeProjectId) {
    const projectSprints = s.sprints.filter(sp => true) // all sprints belong to active project for now
    const sprintIds = new Set(projectSprints.map(sp => sp.id))
    // Show items in project sprints or unassigned
    items = items.filter(i => i.sprint_id === null || sprintIds.has(i.sprint_id!))
  }

  if (s.activeSprintId) {
    items = items.filter(i => i.sprint_id === s.activeSprintId)
  }

  if (s.filterPriority) {
    items = items.filter(i => i.priority === s.filterPriority)
  }

  if (s.filterStatus) {
    items = items.filter(i => i.status === s.filterStatus)
  }

  if (s.searchQuery) {
    const q = s.searchQuery.toLowerCase()
    items = items.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  return items
}

// Actions
export function useActions() {
  const now = () => new Date().toISOString()

  return {
    // Projects
    createProject: useCallback((name: string, description?: string) => {
      const project: Project = { id: uuid(), name, description, created_at: now() }
      setState(s => ({
        ...s,
        projects: [...s.projects, project],
        activeProjectId: project.id,
      }))
      return project
    }, []),

    setActiveProject: useCallback((id: string | null) => {
      setState(s => ({ ...s, activeProjectId: id, activeSprintId: null, activeItemId: null }))
    }, []),

    // Sprints
    createSprint: useCallback((name: string, goal?: string) => {
      const sprint: Sprint = { id: uuid(), name, goal, status: 'planning', created_at: now() }
      setState(s => ({
        ...s,
        sprints: [...s.sprints, sprint],
        activeSprintId: sprint.id,
      }))
      return sprint
    }, []),

    updateSprint: useCallback((id: string, updates: Partial<Sprint>) => {
      setState(s => ({
        ...s,
        sprints: s.sprints.map(sp => sp.id === id ? { ...sp, ...updates } : sp),
      }))
    }, []),

    deleteSprint: useCallback((id: string) => {
      setState(s => ({
        ...s,
        sprints: s.sprints.filter(sp => sp.id !== id),
        items: s.items.map(i => i.sprint_id === id ? { ...i, sprint_id: null } : i),
        activeSprintId: s.activeSprintId === id ? null : s.activeSprintId,
      }))
    }, []),

    setActiveSprint: useCallback((id: string | null) => {
      setState(s => ({ ...s, activeSprintId: id, activeItemId: null }))
    }, []),

    // Items
    createItem: useCallback((item: Omit<BacklogItem, 'id' | 'created_at' | 'updated_at'>) => {
      const newItem: BacklogItem = {
        ...item,
        id: uuid(),
        created_at: now(),
        updated_at: now(),
      }
      setState(s => ({ ...s, items: [...s.items, newItem] }))
      return newItem
    }, []),

    updateItem: useCallback((id: string, updates: Partial<BacklogItem>) => {
      setState(s => ({
        ...s,
        items: s.items.map(i => {
          if (i.id !== id) return i
          const updated = { ...i, ...updates, updated_at: now() }
          if (updates.status === 'done' && i.status !== 'done') {
            updated.completed_at = now()
          }
          return updated
        }),
      }))
    }, []),

    deleteItem: useCallback((id: string) => {
      setState(s => ({
        ...s,
        items: s.items.filter(i => i.id !== id),
        activeItemId: s.activeItemId === id ? null : s.activeItemId,
      }))
    }, []),

    moveItem: useCallback((id: string, status: ItemStatus, sprintId?: string | null) => {
      setState(s => ({
        ...s,
        items: s.items.map(i => {
          if (i.id !== id) return i
          const updated = { ...i, status, updated_at: now() }
          if (sprintId !== undefined) updated.sprint_id = sprintId
          if (status === 'done' && i.status !== 'done') updated.completed_at = now()
          return updated
        }),
      }))
    }, []),

    setActiveItem: useCallback((id: string | null) => {
      setState(s => ({ ...s, activeItemId: id, activeDocId: null }))
    }, []),

    setActiveDoc: useCallback((id: string | null) => {
      setState(s => ({ ...s, activeDocId: id, activeItemId: null }))
    }, []),

    // Context Docs
    createContextDoc: useCallback((title: string, content: string, projectId: string) => {
      const doc: ContextDoc = { id: uuid(), title, content, project_id: projectId, created_at: now(), updated_at: now() }
      setState(s => ({ ...s, contextDocs: [...s.contextDocs, doc] }))
      return doc
    }, []),

    updateContextDoc: useCallback((id: string, updates: Partial<ContextDoc>) => {
      setState(s => ({
        ...s,
        contextDocs: s.contextDocs.map(d => d.id === id ? { ...d, ...updates, updated_at: now() } : d),
      }))
    }, []),

    deleteContextDoc: useCallback((id: string) => {
      setState(s => ({ ...s, contextDocs: s.contextDocs.filter(d => d.id !== id) }))
    }, []),

    // UI State
    setViewMode: useCallback((mode: ViewMode) => {
      setState(s => ({ ...s, viewMode: mode }))
    }, []),

    setSearchQuery: useCallback((query: string) => {
      setState(s => ({ ...s, searchQuery: query }))
    }, []),

    setFilterPriority: useCallback((priority: Priority | null) => {
      setState(s => ({ ...s, filterPriority: priority }))
    }, []),

    setFilterStatus: useCallback((status: ItemStatus | null) => {
      setState(s => ({ ...s, filterStatus: status }))
    }, []),

    // Bulk import (full replacement, not merge) — marks state as manifest-backed
    importState: useCallback((data: Partial<AppState>) => {
      setState(() => ({ ...defaultState, ...data, manifestBacked: true }))
    }, []),

    // Export full state
    exportState: useCallback((): AppState => {
      return getState()
    }, []),

    // Reset
    resetState: useCallback(() => {
      setState(() => defaultState)
    }, []),
  }
}
