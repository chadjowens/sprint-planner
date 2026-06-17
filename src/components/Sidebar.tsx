/*
  DESIGN: Terminal Aesthetic — Sidebar Navigation
  Narrow left panel with project tree, sprint list grouped by feature track, and context docs.
  JetBrains Mono, flat borders, monospace labels.

  Track grouping: sprints with a `track` field are grouped under collapsible
  feature-track folders that mirror docs/sprints/ in biz-automation-dashboard.
  Sprints without a track fall into an "Other" group at the bottom.
*/
import { useState, useMemo } from 'react'
import { useAppState, useActions, useIsManifestBacked } from '@/store/useStore'
import { ChevronDown, ChevronRight, Plus, FolderOpen, Folder, Zap, FileText, LayoutGrid, List, ArrowRight } from 'lucide-react'
import type { Sprint } from '@/lib/types'
import SprintCloseOut from '@/components/SprintCloseOut'

// Format a track slug into a readable label
// e.g. "email-nurture" -> "Email Nurture", "infrastructure-ops" -> "Infrastructure Ops"
function formatTrackLabel(track: string): string {
  return track
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function Sidebar() {
  const state = useAppState()
  const actions = useActions()
  const manifestBacked = useIsManifestBacked()

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sprints: true,
    backlog: true,
    docs: false,
  })
  // Track-level expand state — all tracks start expanded
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>({})
  const [showNewSprint, setShowNewSprint] = useState(false)
  const [newSprintName, setNewSprintName] = useState('')
  const [closeOutSprintId, setCloseOutSprintId] = useState<string | null>(null)

  const toggle = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const toggleTrack = (track: string) => {
    setExpandedTracks(prev => ({ ...prev, [track]: prev[track] === false ? true : false }))
  }

  const isTrackExpanded = (track: string) => expandedTracks[track] !== false

  const activeProject = state.projects.find(p => p.id === state.activeProjectId)
  const projectSprints = state.sprints
  const backlogCount = state.items.filter(i => i.sprint_id === null).length
  const docsCount = state.contextDocs.length

  // Group sprints by track, preserving order
  const trackGroups = useMemo(() => {
    const groups = new Map<string, Sprint[]>()
    for (const sprint of projectSprints) {
      const key = sprint.track || '__other__'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(sprint)
    }
    // Sort tracks alphabetically, with __other__ last
    const sorted = [...groups.entries()].sort(([a], [b]) => {
      if (a === '__other__') return 1
      if (b === '__other__') return -1
      return a.localeCompare(b)
    })
    return sorted
  }, [projectSprints])

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

  const renderSprint = (sprint: Sprint, indent = false) => {
    const counts = getSprintItemCounts(sprint)
    const isActive = state.activeSprintId === sprint.id
    return (
      <div key={sprint.id}>
        <button
          onClick={() => actions.setActiveSprint(sprint.id)}
          className="w-full flex items-center gap-2 py-1.5 text-xs transition-colors hover:bg-[var(--color-surface-hover)] group"
          style={{
            paddingLeft: indent ? '2rem' : '0.75rem',
            paddingRight: '0.75rem',
            color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            backgroundColor: isActive ? 'var(--color-accent-muted)' : 'transparent',
          }}>
          <Zap size={11} style={{
            flexShrink: 0,
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
            className="w-full flex items-center gap-1 pr-3 py-1 text-[10px] transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{ paddingLeft: indent ? '3rem' : '2rem', color: 'var(--color-success)' }}>
            <ArrowRight size={9} />
            Close sprint
          </button>
        )}
      </div>
    )
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

              {/* Track-grouped sprint tree */}
              {trackGroups.length > 0 ? (
                trackGroups.map(([track, sprints]) => {
                  const trackLabel = track === '__other__' ? 'Other' : formatTrackLabel(track)
                  const expanded = isTrackExpanded(track)
                  const trackSprintCount = sprints.length
                  const trackDoneCount = sprints.reduce((acc, s) => {
                    return acc + state.items.filter(i => i.sprint_id === s.id && i.status === 'done').length
                  }, 0)
                  const trackTotalCount = sprints.reduce((acc, s) => {
                    return acc + state.items.filter(i => i.sprint_id === s.id).length
                  }, 0)

                  return (
                    <div key={track}>
                      {/* Track folder header */}
                      <button
                        onClick={() => toggleTrack(track)}
                        className="w-full flex items-center gap-1.5 px-3 py-1 text-[10px] font-medium transition-colors hover:bg-[var(--color-surface-hover)]"
                        style={{ color: 'var(--color-text-secondary)' }}>
                        {expanded ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
                        {expanded
                          ? <FolderOpen size={10} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                          : <Folder size={10} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                        }
                        <span className="truncate">{trackLabel}</span>
                        <span className="ml-auto text-[10px] whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
                          {trackSprintCount}
                          {trackTotalCount > 0 && (
                            <span className="ml-1">· {trackDoneCount}/{trackTotalCount}</span>
                          )}
                        </span>
                      </button>

                      {/* Sprint entries under this track */}
                      {expanded && sprints.map(sprint => renderSprint(sprint, true))}
                    </div>
                  )
                })
              ) : (
                !showNewSprint && (
                  <div className="px-3 py-2 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    No sprints yet
                  </div>
                )
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
          {expandedSections.backlog && (
            <div>
              {state.items
                .filter(i => i.sprint_id === null)
                .map(item => (
                  <button
                    key={item.id}
                    onClick={() => actions.setActiveItem(item.id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors hover:bg-[var(--color-surface-hover)]"
                    style={{
                      color: state.activeItemId === item.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                      backgroundColor: state.activeItemId === item.id ? 'var(--color-accent-muted)' : 'transparent',
                    }}>
                    <span className="text-[10px] font-mono shrink-0" style={{ color: 'var(--color-text-muted)' }}>{item.id}</span>
                    <span className="truncate">{item.title}</span>
                  </button>
                ))
              }
              {backlogCount === 0 && (
                <div className="px-3 py-2 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  No unassigned items
                </div>
              )}
            </div>
          )}
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
