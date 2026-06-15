/*
  DESIGN: Terminal Aesthetic — Item Detail Panel
  Right panel showing full item details with inline editing.
  Markdown preview for description/notes.
*/
import { useState, useEffect } from 'react'
import { useActiveItem, useActions, useAppState } from '@/store/useStore'
import { PRIORITY_CONFIG, STATUS_CONFIG, EFFORT_CONFIG } from '@/lib/types'
import type { Priority, ItemStatus, BacklogItem } from '@/lib/types'
import { X, Copy, Download, Trash2, Check } from 'lucide-react'
import { itemToMarkdown, copyToClipboard, downloadAsFile } from '@/lib/markdown'
import ReactMarkdown from 'react-markdown'

export default function ItemDetail({ readOnly = false }: { readOnly?: boolean }) {
  const item = useActiveItem()
  const state = useAppState()
  const actions = useActions()
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    setEditing(null)
    setShowDelete(false)
  }, [item?.id])

  if (!item) return null

  const pConfig = PRIORITY_CONFIG[item.priority]
  const sConfig = STATUS_CONFIG[item.status]

  const handleCopy = async () => {
    const md = itemToMarkdown(item)
    const ok = await copyToClipboard(md)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const handleDownload = () => {
    const md = itemToMarkdown(item)
    const filename = `${item.priority}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`
    downloadAsFile(md, filename)
  }

  const startEdit = (field: string, value: string) => {
    if (readOnly) return
    setEditing(field)
    setEditValue(value)
  }

  const saveEdit = (field: string) => {
    if (field === 'title') actions.updateItem(item.id, { title: editValue })
    if (field === 'description') actions.updateItem(item.id, { description: editValue })
    if (field === 'notes') actions.updateItem(item.id, { notes: editValue })
    setEditing(null)
  }

  const handleAddTag = () => {
    if (readOnly) return
    if (!newTag.trim()) return
    if (!item.tags.includes(newTag.trim())) {
      actions.updateItem(item.id, { tags: [...item.tags, newTag.trim()] })
    }
    setNewTag('')
  }

  const handleRemoveTag = (tag: string) => {
    if (readOnly) return
    actions.updateItem(item.id, { tags: item.tags.filter(t => t !== tag) })
  }

  return (
    <aside className="w-96 min-w-96 h-full border-l flex flex-col overflow-hidden"
      style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-surface)' }}>

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-border-subtle)' }}>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
          style={{ color: pConfig.color, backgroundColor: pConfig.bg }}>
          [{item.priority}]
        </span>
        <span className="text-[10px]" style={{ color: sConfig.color }}>
          {sConfig.icon} {sConfig.label}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={handleCopy} className="p-1 rounded hover:bg-[var(--color-border-subtle)]"
            style={{ color: copied ? 'var(--color-success)' : 'var(--color-text-muted)' }}
            title="Copy as Markdown">
            <Copy size={13} />
          </button>
          <button onClick={handleDownload} className="p-1 rounded hover:bg-[var(--color-border-subtle)]"
            style={{ color: 'var(--color-text-muted)' }} title="Download as .md">
            <Download size={13} />
          </button>
          <button onClick={() => actions.setActiveItem(null)}
            className="p-1 rounded hover:bg-[var(--color-border-subtle)]"
            style={{ color: 'var(--color-text-muted)' }}>
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">

        {/* Title */}
        {!readOnly && editing === 'title' ? (
          <input
            autoFocus
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') saveEdit('title'); if (e.key === 'Escape') setEditing(null) }}
            onBlur={() => saveEdit('title')}
            className="w-full text-sm font-semibold px-2 py-1 rounded border bg-transparent"
            style={{ borderColor: 'var(--color-accent)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-base)' }}
          />
        ) : (
          <h2
            onClick={() => startEdit('title', item.title)}
            className={`text-sm font-semibold transition-colors ${readOnly ? '' : 'cursor-pointer hover:text-[var(--color-accent)]'}`}
            style={{ color: 'var(--color-text-primary)' }}>
            {item.title}
          </h2>
        )}

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Priority */}
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1"
              style={{ color: 'var(--color-text-muted)' }}>Priority</label>
            <div className="flex gap-1">
              {(['P0', 'P1', 'P2', 'P3'] as Priority[]).map(p => (
                <button key={p}
                  onClick={() => { if (!readOnly) actions.updateItem(item.id, { priority: p }) }}
                  disabled={readOnly}
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm transition-all"
                  style={{
                    color: PRIORITY_CONFIG[p].color,
                    backgroundColor: item.priority === p ? PRIORITY_CONFIG[p].bg : 'transparent',
                    border: `1px solid ${item.priority === p ? PRIORITY_CONFIG[p].color : 'var(--color-border-subtle)'}`,
                    opacity: readOnly ? 0.7 : 1,
                    cursor: readOnly ? 'default' : 'pointer',
                  }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1"
              style={{ color: 'var(--color-text-muted)' }}>Status</label>
            <select
              value={item.status}
              onChange={e => { if (!readOnly) actions.moveItem(item.id, e.target.value as ItemStatus) }}
              disabled={readOnly}
              className="text-[11px] px-2 py-1 rounded border bg-transparent w-full"
              style={{
                borderColor: 'var(--color-border-default)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-base)',
                opacity: readOnly ? 0.7 : 1,
                cursor: readOnly ? 'default' : 'pointer',
              }}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
              ))}
            </select>
          </div>

          {/* Effort */}
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1"
              style={{ color: 'var(--color-text-muted)' }}>Effort</label>
            <div className="flex gap-1">
              {Object.entries(EFFORT_CONFIG).map(([key, cfg]) => (
                <button key={key}
                  onClick={() => { if (!readOnly) actions.updateItem(item.id, { effort: key as BacklogItem['effort'] }) }}
                  disabled={readOnly}
                  className="text-[10px] px-1.5 py-0.5 rounded-sm transition-all"
                  style={{
                    color: item.effort === key ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    backgroundColor: item.effort === key ? 'var(--color-accent-muted)' : 'transparent',
                    border: `1px solid ${item.effort === key ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
                    opacity: readOnly ? 0.7 : 1,
                    cursor: readOnly ? 'default' : 'pointer',
                  }}>
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Sprint */}
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1"
              style={{ color: 'var(--color-text-muted)' }}>Sprint</label>
            <select
              value={item.sprint_id || ''}
              onChange={e => { if (!readOnly) actions.updateItem(item.id, { sprint_id: e.target.value || null }) }}
              disabled={readOnly}
              className="text-[11px] px-2 py-1 rounded border bg-transparent w-full"
              style={{
                borderColor: 'var(--color-border-default)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-base)',
                opacity: readOnly ? 0.7 : 1,
                cursor: readOnly ? 'default' : 'pointer',
              }}>
              <option value="">Unassigned</option>
              {state.sprints.map(sp => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-[10px] uppercase tracking-wider block mb-1"
            style={{ color: 'var(--color-text-muted)' }}>Tags</label>
          <div className="flex flex-wrap gap-1 mb-1">
            {item.tags.map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-sm flex items-center gap-1 group"
                style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-border-subtle)' }}>
                {tag}
                {!readOnly && (
                  <button onClick={() => handleRemoveTag(tag)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--color-danger)' }}>
                    <X size={8} />
                  </button>
                )}
              </span>
            ))}
          </div>
          {!readOnly && (
            <input
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); if (e.key === 'Escape') setNewTag('') }}
              placeholder="Add tag..."
              className="text-[10px] px-2 py-1 rounded border bg-transparent w-full"
              style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-base)' }}
            />
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] uppercase tracking-wider block mb-1"
            style={{ color: 'var(--color-text-muted)' }}>Description</label>
          {!readOnly && editing === 'description' ? (
            <div>
              <textarea
                autoFocus
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') setEditing(null) }}
                rows={8}
                className="w-full text-xs px-2 py-1.5 rounded border bg-transparent resize-y font-[var(--font-sans)]"
                style={{ borderColor: 'var(--color-accent)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-base)', fontFamily: 'var(--font-sans)' }}
              />
              <div className="flex gap-1 mt-1">
                <button onClick={() => saveEdit('description')}
                  className="text-[10px] px-2 py-1 rounded flex items-center gap-1"
                  style={{ backgroundColor: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}>
                  <Check size={10} /> Save
                </button>
                <button onClick={() => setEditing(null)}
                  className="text-[10px] px-2 py-1 rounded"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => startEdit('description', item.description)}
              className={`text-xs rounded p-2 min-h-[60px] transition-colors ${readOnly ? '' : 'cursor-pointer hover:bg-[var(--color-surface-hover)]'}`}
              style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-base)', fontFamily: 'var(--font-sans)' }}>
              {item.description ? (
                <div className="prose prose-invert prose-xs max-w-none [&_p]:text-xs [&_p]:leading-relaxed [&_li]:text-xs [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_code]:text-[10px] [&_code]:bg-[var(--color-surface)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded">
                  <ReactMarkdown>{item.description}</ReactMarkdown>
                </div>
              ) : (
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {readOnly ? 'No description' : 'Click to add description...'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-[10px] uppercase tracking-wider block mb-1"
            style={{ color: 'var(--color-text-muted)' }}>Notes</label>
          {!readOnly && editing === 'notes' ? (
            <div>
              <textarea
                autoFocus
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') setEditing(null) }}
                rows={6}
                className="w-full text-xs px-2 py-1.5 rounded border bg-transparent resize-y"
                style={{ borderColor: 'var(--color-accent)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-base)', fontFamily: 'var(--font-sans)' }}
              />
              <div className="flex gap-1 mt-1">
                <button onClick={() => saveEdit('notes')}
                  className="text-[10px] px-2 py-1 rounded flex items-center gap-1"
                  style={{ backgroundColor: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}>
                  <Check size={10} /> Save
                </button>
                <button onClick={() => setEditing(null)}
                  className="text-[10px] px-2 py-1 rounded"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => startEdit('notes', item.notes || '')}
              className={`text-xs rounded p-2 min-h-[40px] transition-colors ${readOnly ? '' : 'cursor-pointer hover:bg-[var(--color-surface-hover)]'}`}
              style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-base)', fontFamily: 'var(--font-sans)' }}>
              {item.notes ? (
                <div className="prose prose-invert prose-xs max-w-none [&_p]:text-xs [&_p]:leading-relaxed">
                  <ReactMarkdown>{item.notes}</ReactMarkdown>
                </div>
              ) : (
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {readOnly ? 'No notes' : 'Click to add notes...'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="pt-2 border-t space-y-1" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            Created: {new Date(item.created_at).toLocaleDateString()}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            Updated: {new Date(item.updated_at).toLocaleDateString()}
          </p>
          {item.completed_at && (
            <p className="text-[10px]" style={{ color: 'var(--color-success)' }}>
              Completed: {new Date(item.completed_at).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Delete — hidden in read-only mode */}
        {!readOnly && (
          <div className="pt-2">
            {showDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px]" style={{ color: 'var(--color-danger)' }}>Delete this item?</span>
                <button onClick={() => actions.deleteItem(item.id)}
                  className="text-[10px] px-2 py-1 rounded"
                  style={{ backgroundColor: 'var(--color-danger-muted)', color: 'var(--color-danger)' }}>
                  Yes, delete
                </button>
                <button onClick={() => setShowDelete(false)}
                  className="text-[10px] px-2 py-1 rounded"
                  style={{ color: 'var(--color-text-muted)' }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setShowDelete(true)}
                className="text-[10px] flex items-center gap-1 px-2 py-1 rounded transition-colors hover:bg-[var(--color-danger-muted)]"
                style={{ color: 'var(--color-text-muted)' }}>
                <Trash2 size={10} /> Delete item
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
