/*
  DESIGN: Terminal Aesthetic — Sidebar Navigation
  Narrow left panel with project tree, sprint list, and context docs.
  JetBrains Mono, flat borders, monospace labels.
*/
import { useState } from 'react'
import { useAppState, useActions, useIsManifestBacked } from '@/store/useStore'
import { ChevronDown, ChevronRight, Plus, FolderOpen, Zap, FileText, LayoutGrid, List, Trash2, Settings, ArrowRight } from 'lucide-react'
import type { Sprint } from '@/lib/types'
import SprintCloseOut from '@/components/SprintCloseOut'

export default function Sidebar() {
  const state = useAppState()
  const actions = useActions()
  const manifestBacked = useIsManifestBacked()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sprints: true,
    backlog: true,
    docs: false,
  })
  const [showNewSprint, setShowNewSprint] = useState(false)
  const [newSprintName, setNewSprintName] = useState('')
  const [closeOutSprintId, setCloseOutSprintId] = useState<string | null>(null)

  const toggle = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const activeProject = state.projects.find(p => p.id === state.activeProjectId)
  const projectSprints = state.sprints
  const backlogCount = state.items.filter(i => i.sprint_id === null).length
  const docsCount = state.contextDocs.length

  const handleCreateSprint = () => {
    if (!newSprintName.trim()) return
    actions.createSprint(newSprintName.trim())
    setNewSprintName('')
    setShowNewSprint(false)
  }

  const getSprintItemCounts = (sprint: Sprint) => {
    const items = state.items.filter(i => i.sprint_id === sprint.id)
    const done = items.filter(i => i.status === 'done').length
    return { total: items.length, done }
  }

  return (
    <aside className="w-60 min-w-60 h-full border-r flex flex-col"
      style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-surface)' }}>

      {/* Header */}
      <div className="px-3 py-3 border-b flex items-center gap-2"
        style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}>
          SP
        </div>
        <span className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
          {activeProject?.name || 'Sprint Planner'}
        </span>
      </div>

      {/* View Toggle */}
      <div className="px-3 py-2 border-b flex gap-1"
        style={{ borderColor: 'var(--color-border-subtle)' }}>
        <button
          onClick={() => actions.setViewMode('board')}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs transition-colors"
          style={{
            backgroundColor: state.viewMode === 'board' ? 'var(--color-accent-muted)' : 'transparent',
            color: state.viewMode === 'board' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          }}>
          <LayoutGrid size={12} /> Board
        </button>
        <button
          onClick={() => actions.setViewMode('list')}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs transition-colors"
          style={{
            backgroundColor: state.viewMode === 'list' ? 'var(--color-accent-muted)' : 'transparent',
            color: state.viewMode === 'list' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          }}>
          <List size={12} /> List
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-1">

        {/* All Items */}
        <button
          onClick={() => { actions.setActiveSprint(null) }}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-[var(--color-surface-hover)]"
          style={{
            color: state.activeSprintId === null ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            backgroundColor: state.activeSprintId === null ? 'var(--color-accent-muted)' : 'transparent',
          }}>
          <FolderOpen size={12} />
          <span>All Items</span>
          <span className="ml-auto text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            {state.items.length}
          </span>
        </button>

        {/* Sprints Section */}
        <div className="mt-1">
          <button
            onClick={() => toggle('sprints')}
            className="w-full flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-text-muted)' }}>
            {expandedSections.sprints ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            Sprints
            {!manifestBacked && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowNewSprint(true) }}
                className="ml-auto p-0.5 rounded hover:bg-[var(--color-border-subtle)]"
                title="New sprint (keyboard: s)">
                <Plus size={10} />
              </button>
            )}
          </button>

          {expandedSections.sprints && (
            <div>
              {showNewSprint && (
                <div className="px-3 py-1">
                  <input
                    autoFocus
                    value={newSprintName}
                    onChange={e => setNewSprintName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleCreateSprint()
                      if (e.key === 'Escape') { setShowNewSprint(false); setNewSprintName('') }
                    }}
                    onBlur={() => { if (!newSprintName.trim()) setShowNewSprint(false) }}
                    placeholder="Sprint name..."
                    className="w-full px-2 py-1 text-xs rounded border bg-transparent focus:outline-none"
                    style={{
                      borderColor: 'var(--color-accent)',
                      color: 'var(--color-text-primary)',
                      backgroundColor: 'var(--color-base)',
                    }}
                  />
                </div>
              )}

              {projectSprints.map(sprint => {
                const counts = getSprintItemCounts(sprint)
                const isActive = state.activeSprintId === sprint.id
                return (
                  <div key={sprint.id}>
                    <button
                      onClick={() => actions.setActiveSprint(sprint.id)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-[var(--color-surface-hover)] group"
                      style={{
                        color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        backgroundColor: isActive ? 'var(--color-accent-muted)' : 'transparent',
                      }}>
                      <Zap size={11} style={{
                        color: sprint.status === 'active' ? 'var(--color-warning)' :
                               sprint.status === 'completed' ? 'var(--color-success)' : 'var(--color-text-muted)'
                      }} />
                      <span className="truncate">{sprint.name}</span>
                      <span className="ml-auto text-[10px] whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
                        {counts.done}/{counts.total}
                      </span>
                    </button>
                    {sprint.status === 'completed' && (
                      <button
                        onClick={() => setCloseOutSprintId(sprint.id)}
                        className="w-full flex items-center gap-1 pl-8 pr-3 py-1 text-[10px] transition-colors hover:bg-[var(--color-surface-hover)]"
                        style={{ color: 'var(--color-success)' }}>
                        <ArrowRight size={9} />
                        Close sprint
                      </button>
                    )}
                  </div>
                )
              })}

              {projectSprints.length === 0 && !showNewSprint && (
                <div className="px-3 py-2 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  No sprints yet
                </div>
              )}
            </div>
          )}
        </div>

        {/* Backlog Section */}
        <div className="mt-1">
          <button
            onClick={() => toggle('backlog')}
            className="w-full flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-text-muted)' }}>
            {expandedSections.backlog ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            Unassigned
            <span className="ml-auto text-[10px]">{backlogCount}</span>
          </button>
        </div>

        {/* Context Docs Section */}
        <div className="mt-1">
          <button
            onClick={() => toggle('docs')}
            className="w-full flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-text-muted)' }}>
            {expandedSections.docs ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            Context Docs
            <span className="ml-auto text-[10px]">{docsCount}</span>
          </button>

          {expandedSections.docs && (
            <div>
              {state.contextDocs.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => actions.setActiveDoc(doc.id)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-[var(--color-surface-hover)]"
                  style={{
                    color: state.activeDocId === doc.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    backgroundColor: state.activeDocId === doc.id ? 'var(--color-accent-muted)' : 'transparent',
                  }}>
                  <FileText size={11} />
                  <span className="truncate">{doc.title}</span>
                </button>
              ))}
              {docsCount === 0 && (
                <div className="px-3 py-2 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  No docs yet
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-2 border-t text-[10px] flex items-center gap-2"
        style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-muted)' }}>
        <kbd>/</kbd> search
        <kbd>n</kbd> new
        <kbd>?</kbd> help
      </div>

      {/* Sprint Close-Out Panel */}
      {closeOutSprintId && (() => {
        const sprint = state.sprints.find(s => s.id === closeOutSprintId)
        if (!sprint) return null
        const sprintItems = state.items.filter(i => i.sprint_id === sprint.id)
        return (
          <SprintCloseOut
            sprint={sprint}
            items={sprintItems}
            onClose={() => setCloseOutSprintId(null)}
            onArchive={() => {
              actions.updateSprint(sprint.id, { status: 'archived' })
              setCloseOutSprintId(null)
            }}
          />
        )
      })()}
    </aside>
  )
}
