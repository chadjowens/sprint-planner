/*
  DESIGN: Terminal Aesthetic — Kanban Board
  Four columns: Backlog, In Progress, In Review, Done
  Flat borders, monospace labels, priority badges as terminal tags.
*/
import { useFilteredItems, useActions, useAppState } from '@/store/useStore'
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/lib/types'
import type { BacklogItem, ItemStatus } from '@/lib/types'
import { Copy, GripVertical, MoreHorizontal } from 'lucide-react'
import { itemToMarkdown, copyToClipboard } from '@/lib/markdown'
import { useState } from 'react'

const COLUMNS: ItemStatus[] = ['backlog', 'in_progress', 'in_review', 'done']

function ItemCard({ item, onSelect, onCopy }: {
  item: BacklogItem
  onSelect: () => void
  onCopy: () => void
}) {
  const [copied, setCopied] = useState(false)
  const pConfig = PRIORITY_CONFIG[item.priority]

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const md = itemToMarkdown(item)
    const ok = await copyToClipboard(md)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
    onCopy()
  }

  return (
    <div
      onClick={onSelect}
      className="group px-3 py-2.5 border rounded cursor-pointer transition-all duration-100 hover:translate-x-0.5"
      style={{
        borderColor: 'var(--color-border-subtle)',
        backgroundColor: 'var(--color-surface)',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-border-default)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border-subtle)')}
    >
      {/* Top row: priority + copy */}
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
          style={{ color: pConfig.color, backgroundColor: pConfig.bg }}
        >
          [{item.priority}]
        </span>
        {item.effort && (
          <span className="text-[10px] px-1 py-0.5 rounded-sm"
            style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-border-subtle)' }}>
            {item.effort}
          </span>
        )}
        <button
          onClick={handleCopy}
          className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity"
          style={{ color: copied ? 'var(--color-success)' : 'var(--color-text-muted)' }}
          title="Copy as Markdown">
          <Copy size={11} />
        </button>
      </div>

      {/* Title */}
      <p className="text-xs leading-snug mb-1" style={{ color: 'var(--color-text-primary)' }}>
        {item.title}
      </p>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {item.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-sm"
              style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-border-subtle)' }}>
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              +{item.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function Column({ status, items }: { status: ItemStatus; items: BacklogItem[] }) {
  const actions = useActions()
  const config = STATUS_CONFIG[status]

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const itemId = e.dataTransfer.getData('text/plain')
    if (itemId) {
      actions.moveItem(itemId, status)
    }
    ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-accent-muted)'
  }

  const handleDragLeave = (e: React.DragEvent) => {
    ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
  }

  return (
    <div
      className="flex-1 min-w-[220px] flex flex-col rounded"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{ transition: 'background-color 150ms' }}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-2 py-2 mb-2">
        <span className="text-sm" style={{ color: config.color }}>{config.icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-text-secondary)' }}>
          {config.label}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full"
          style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-border-subtle)' }}>
          {items.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 flex flex-col gap-1.5 px-1 pb-2 overflow-y-auto">
        {items.map(item => (
          <div
            key={item.id}
            draggable
            onDragStart={e => e.dataTransfer.setData('text/plain', item.id)}
          >
            <ItemCard
              item={item}
              onSelect={() => actions.setActiveItem(item.id)}
              onCopy={() => {}}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function KanbanBoard() {
  const items = useFilteredItems()

  const columnItems: Record<ItemStatus, BacklogItem[]> = {
    backlog: [],
    in_progress: [],
    in_review: [],
    done: [],
  }

  for (const item of items) {
    columnItems[item.status].push(item)
  }

  // Sort each column by priority
  const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 }
  for (const status of COLUMNS) {
    columnItems[status].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  }

  return (
    <div className="flex-1 flex gap-3 p-4 overflow-x-auto">
      {COLUMNS.map(status => (
        <Column key={status} status={status} items={columnItems[status]} />
      ))}
    </div>
  )
}
