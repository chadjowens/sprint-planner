/*
  DESIGN: Terminal Aesthetic — List View
  Dense table-like list with sortable columns.
  Monospace, flat borders, priority badges.
*/
import { useState } from 'react'
import { useFilteredItems, useActions } from '@/store/useStore'
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/lib/types'
import type { BacklogItem, Priority, ItemStatus } from '@/lib/types'
import { Copy, ArrowUp, ArrowDown } from 'lucide-react'
import { itemToMarkdown, copyToClipboard } from '@/lib/markdown'

type SortField = 'priority' | 'title' | 'status' | 'effort' | 'updated_at'
type SortDir = 'asc' | 'desc'

export default function ListView() {
  const items = useFilteredItems()
  const actions = useActions()
  const [sortField, setSortField] = useState<SortField>('priority')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const priorityOrder: Record<Priority, number> = { P0: 0, P1: 1, P2: 2, P3: 3 }
  const statusOrder: Record<ItemStatus, number> = { backlog: 0, in_progress: 1, in_review: 2, done: 3 }

  const sorted = [...items].sort((a, b) => {
    let cmp = 0
    switch (sortField) {
      case 'priority': cmp = priorityOrder[a.priority] - priorityOrder[b.priority]; break
      case 'title': cmp = a.title.localeCompare(b.title); break
      case 'status': cmp = statusOrder[a.status] - statusOrder[b.status]; break
      case 'effort': cmp = (a.effort || 'M').localeCompare(b.effort || 'M'); break
      case 'updated_at': cmp = a.updated_at.localeCompare(b.updated_at); break
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  const handleCopy = async (item: BacklogItem) => {
    const md = itemToMarkdown(item)
    const ok = await copyToClipboard(md)
    if (ok) {
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(null), 1500)
    }
  }

  const SortHeader = ({ field, label, width }: { field: SortField; label: string; width: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider py-2 px-2 hover:text-[var(--color-text-primary)] transition-colors"
      style={{ color: sortField === field ? 'var(--color-accent)' : 'var(--color-text-muted)', width }}>
      {label}
      {sortField === field && (
        sortDir === 'asc' ? <ArrowUp size={9} /> : <ArrowDown size={9} />
      )}
    </button>
  )

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      {/* Table header */}
      <div className="flex items-center border-b pb-1 mb-1"
        style={{ borderColor: 'var(--color-border-subtle)' }}>
        <SortHeader field="priority" label="Pri" width="60px" />
        <SortHeader field="title" label="Title" width="auto" />
        <SortHeader field="status" label="Status" width="120px" />
        <SortHeader field="effort" label="Effort" width="70px" />
        <div style={{ width: '36px' }} />
      </div>

      {/* Table body */}
      <div className="flex-1 overflow-y-auto">
        {sorted.map(item => {
          const pConfig = PRIORITY_CONFIG[item.priority]
          const sConfig = STATUS_CONFIG[item.status]
          return (
            <div
              key={item.id}
              onClick={() => actions.setActiveItem(item.id)}
              className="flex items-center py-2 px-0 border-b cursor-pointer transition-colors group hover:bg-[var(--color-surface-hover)]"
              style={{ borderColor: 'var(--color-border-subtle)' }}>

              {/* Priority */}
              <div className="px-2" style={{ width: '60px' }}>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
                  style={{ color: pConfig.color, backgroundColor: pConfig.bg }}>
                  [{item.priority}]
                </span>
              </div>

              {/* Title */}
              <div className="flex-1 px-2 min-w-0">
                <p className="text-xs truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {item.title}
                </p>
                {item.tags.length > 0 && (
                  <div className="flex gap-1 mt-0.5">
                    {item.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[9px] px-1 rounded-sm"
                        style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-border-subtle)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="px-2" style={{ width: '120px' }}>
                <span className="text-[10px] flex items-center gap-1"
                  style={{ color: sConfig.color }}>
                  {sConfig.icon} {sConfig.label}
                </span>
              </div>

              {/* Effort */}
              <div className="px-2 text-[10px]" style={{ width: '70px', color: 'var(--color-text-muted)' }}>
                {item.effort || '—'}
              </div>

              {/* Copy */}
              <div style={{ width: '36px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopy(item) }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: copiedId === item.id ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                  title="Copy as Markdown">
                  <Copy size={11} />
                </button>
              </div>
            </div>
          )
        })}

        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>No items found</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              Press <kbd>n</kbd> to create a new item
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
