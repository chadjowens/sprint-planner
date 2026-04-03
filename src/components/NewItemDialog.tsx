/*
  DESIGN: Terminal Aesthetic — New Item Dialog
  Modal overlay for creating a new backlog item.
*/
import { useState, useEffect, useRef } from 'react'
import { useActions, useAppState } from '@/store/useStore'
import { PRIORITY_CONFIG, EFFORT_CONFIG } from '@/lib/types'
import type { Priority, ItemStatus } from '@/lib/types'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

export default function NewItemDialog({ open, onClose }: Props) {
  const actions = useActions()
  const state = useAppState()
  const titleRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('P2')
  const [effort, setEffort] = useState<string>('M')
  const [tags, setTags] = useState('')
  const [sprintId, setSprintId] = useState<string>('')

  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setPriority('P2')
      setEffort('M')
      setTags('')
      setSprintId(state.activeSprintId || '')
      setTimeout(() => titleRef.current?.focus(), 100)
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    actions.createItem({
      title: title.trim(),
      description: description.trim(),
      priority,
      status: 'backlog' as ItemStatus,
      sprint_id: sprintId || null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      effort: effort as any,
    })
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-lg border shadow-2xl"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-default)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--color-border-subtle)' }}>
          <h2 className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            New Item
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--color-border-subtle)]"
            style={{ color: 'var(--color-text-muted)' }}>
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 py-3 space-y-3">
          {/* Title */}
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1"
              style={{ color: 'var(--color-text-muted)' }}>Title *</label>
            <input ref={titleRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full text-xs px-2 py-1.5 rounded border bg-transparent"
              style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-base)' }}
            />
          </div>

          {/* Priority + Effort row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider block mb-1"
                style={{ color: 'var(--color-text-muted)' }}>Priority</label>
              <div className="flex gap-1">
                {(['P0', 'P1', 'P2', 'P3'] as Priority[]).map(p => (
                  <button key={p} type="button"
                    onClick={() => setPriority(p)}
                    className="text-[10px] font-bold px-2 py-1 rounded-sm transition-all"
                    style={{
                      color: PRIORITY_CONFIG[p].color,
                      backgroundColor: priority === p ? PRIORITY_CONFIG[p].bg : 'transparent',
                      border: `1px solid ${priority === p ? PRIORITY_CONFIG[p].color : 'var(--color-border-subtle)'}`,
                    }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider block mb-1"
                style={{ color: 'var(--color-text-muted)' }}>Effort</label>
              <div className="flex gap-1">
                {Object.keys(EFFORT_CONFIG).map(key => (
                  <button key={key} type="button"
                    onClick={() => setEffort(key)}
                    className="text-[10px] px-2 py-1 rounded-sm transition-all"
                    style={{
                      color: effort === key ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      backgroundColor: effort === key ? 'var(--color-accent-muted)' : 'transparent',
                      border: `1px solid ${effort === key ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
                    }}>
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sprint */}
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1"
              style={{ color: 'var(--color-text-muted)' }}>Sprint</label>
            <select
              value={sprintId}
              onChange={e => setSprintId(e.target.value)}
              className="w-full text-xs px-2 py-1.5 rounded border bg-transparent"
              style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-base)' }}>
              <option value="">Unassigned</option>
              {state.sprints.map(sp => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1"
              style={{ color: 'var(--color-text-muted)' }}>Tags (comma separated)</label>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="e.g. frontend, api, compliance"
              className="w-full text-xs px-2 py-1.5 rounded border bg-transparent"
              style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-base)' }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1"
              style={{ color: 'var(--color-text-muted)' }}>Description (Markdown)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the work..."
              className="w-full text-xs px-2 py-1.5 rounded border bg-transparent resize-y"
              style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-base)', fontFamily: 'var(--font-sans)' }}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="text-[10px] px-3 py-1.5 rounded"
              style={{ color: 'var(--color-text-muted)' }}>
              Cancel
            </button>
            <button type="submit"
              disabled={!title.trim()}
              className="text-[10px] px-3 py-1.5 rounded font-semibold transition-colors disabled:opacity-40"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-base)' }}>
              Create Item
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
