/*
  DESIGN: Terminal Aesthetic — Toolbar
  Top bar with search, priority/status filters, and action buttons.
*/
import { useRef, useState } from 'react'
import { useAppState, useActions, useActiveSprint, useIsManifestBacked } from '@/store/useStore'
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/lib/types'
import type { Priority, ItemStatus, AppState } from '@/lib/types'
import { Search, Plus, Download, Upload, RefreshCw, X } from 'lucide-react'
import { backlogToMarkdown, downloadAsFile } from '@/lib/markdown'

export default function Toolbar({ onNewItem }: { onNewItem: () => void }) {
  const state = useAppState()
  const actions = useActions()
  const activeSprint = useActiveSprint()
  const manifestBacked = useIsManifestBacked()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [syncing, setSyncing] = useState(false)

  const handleExportAll = () => {
    const md = backlogToMarkdown(state.items, state.sprints)
    downloadAsFile(md, 'backlog.md')
  }

  const handleSync = async () => {
    const url = import.meta.env.VITE_MANIFEST_URL
    if (!url) {
      alert('VITE_MANIFEST_URL is not configured.')
      return
    }
    setSyncing(true)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Partial<AppState> = await res.json()
      actions.importState(data)
    } catch (err) {
      alert(`Sync failed: ${err instanceof Error ? err.message : err}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data: Partial<AppState> = JSON.parse(reader.result as string)
        actions.importState(data)
      } catch {
        alert('Invalid JSON file.')
      }
    }
    reader.readAsText(file)
    // Reset input so the same file can be re-imported
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b"
      style={{ borderColor: 'var(--color-border-subtle)' }}>

      {/* Sprint label */}
      <div className="flex items-center gap-2 mr-2">
        <h1 className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {activeSprint ? activeSprint.name : 'All Items'}
        </h1>
        {activeSprint?.goal && (
          <span className="text-[10px] max-w-[200px] truncate" style={{ color: 'var(--color-text-muted)' }}>
            — {activeSprint.goal}
          </span>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded border flex-1 max-w-xs"
        style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-base)' }}>
        <Search size={12} style={{ color: 'var(--color-text-muted)' }} />
        <input
          value={state.searchQuery}
          onChange={e => actions.setSearchQuery(e.target.value)}
          placeholder="Search items..."
          className="flex-1 bg-transparent text-xs outline-none"
          style={{ color: 'var(--color-text-primary)' }}
        />
        {state.searchQuery && (
          <button onClick={() => actions.setSearchQuery('')}
            style={{ color: 'var(--color-text-muted)' }}>
            <X size={10} />
          </button>
        )}
      </div>

      {/* Priority filter */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] mr-1" style={{ color: 'var(--color-text-muted)' }}>Pri:</span>
        {(['P0', 'P1', 'P2', 'P3'] as Priority[]).map(p => (
          <button key={p}
            onClick={() => actions.setFilterPriority(state.filterPriority === p ? null : p)}
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm transition-all"
            style={{
              color: PRIORITY_CONFIG[p].color,
              backgroundColor: state.filterPriority === p ? PRIORITY_CONFIG[p].bg : 'transparent',
              opacity: state.filterPriority && state.filterPriority !== p ? 0.3 : 1,
            }}>
            {p}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] mr-1" style={{ color: 'var(--color-text-muted)' }}>Status:</span>
        {(Object.entries(STATUS_CONFIG) as [ItemStatus, typeof STATUS_CONFIG[ItemStatus]][]).map(([key, cfg]) => (
          <button key={key}
            onClick={() => actions.setFilterStatus(state.filterStatus === key ? null : key)}
            className="text-[10px] px-1.5 py-0.5 rounded-sm transition-all"
            style={{
              color: cfg.color,
              backgroundColor: state.filterStatus === key ? `${cfg.color}26` : 'transparent',
              opacity: state.filterStatus && state.filterStatus !== key ? 0.3 : 1,
            }}>
            {cfg.icon}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Sync from remote manifest */}
        <button onClick={handleSync} disabled={syncing}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded transition-colors hover:bg-[var(--color-surface-hover)]"
          style={{ color: 'var(--color-text-muted)', opacity: syncing ? 0.5 : 1 }}
          title="Fetch sprints.json from VITE_MANIFEST_URL">
          <RefreshCw size={11} className={syncing ? 'animate-spin' : ''} /> ↓ Sync
        </button>

        {/* Import local file */}
        <button onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded transition-colors hover:bg-[var(--color-surface-hover)]"
          style={{ color: 'var(--color-text-muted)' }}
          title="Import a local sprints.json file">
          <Upload size={11} /> ↑ Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportFile}
          className="hidden"
        />

        <button onClick={handleExportAll}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded transition-colors hover:bg-[var(--color-surface-hover)]"
          style={{ color: 'var(--color-text-muted)' }}
          title="Export backlog as Markdown">
          <Download size={11} /> Export
        </button>

        {/* Hide New Item in manifest-backed mode */}
        {!manifestBacked && (
          <button onClick={onNewItem}
            className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded transition-colors"
            style={{ backgroundColor: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}>
            <Plus size={11} /> New Item
          </button>
        )}
      </div>
    </div>
  )
}
