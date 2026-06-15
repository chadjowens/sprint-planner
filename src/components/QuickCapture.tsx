/*
  DESIGN: Terminal Aesthetic — QA Quick Capture Panel
  Slide-out panel for capturing QA findings directly into GitHub inbox.
  Opens on `q`, closes on Escape or second `q`.
*/
import { useState, useEffect, useRef } from 'react'
import { X, Zap, CheckCircle, AlertCircle, ExternalLink, Key } from 'lucide-react'
import { PRIORITY_CONFIG } from '@/lib/types'
import type { Priority } from '@/lib/types'
import { hasPat, setPat, clearPat, writeInboxFile } from '@/lib/github'

interface Props {
  open: boolean
  onClose: () => void
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export default function QuickCapture({ open, onClose }: Props) {
  const titleRef = useRef<HTMLInputElement>(null)
  const tokenRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('P1')
  const [notes, setNotes] = useState('')
  const [titleError, setTitleError] = useState(false)

  const [patSet, setPatSet] = useState(hasPat)
  const [showSetup, setShowSetup] = useState(false)
  const [tokenInput, setTokenInput] = useState('')

  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Re-check PAT status when panel opens
  useEffect(() => {
    if (open) {
      const has = hasPat()
      setPatSet(has)
      if (!has) setShowSetup(true)
      else setShowSetup(false)
      setSubmitState('idle')
      setErrorMsg('')
      setTitleError(false)
      setTimeout(() => titleRef.current?.focus(), 150)
    }
  }, [open])

  const handleSaveToken = () => {
    const trimmed = tokenInput.trim()
    if (!trimmed) return
    setPat(trimmed)
    setPatSet(true)
    setShowSetup(false)
    setTokenInput('')
    setTimeout(() => titleRef.current?.focus(), 100)
  }

  const handleClearToken = () => {
    clearPat()
    setPatSet(false)
    setShowSetup(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setTitleError(true)
      titleRef.current?.focus()
      return
    }

    setTitleError(false)
    setSubmitState('submitting')
    setErrorMsg('')

    const result = await writeInboxFile({
      title: title.trim(),
      priority,
      notes: notes.trim() || undefined,
    })

    if (result.ok) {
      setSubmitState('success')
      setTimeout(() => {
        setTitle('')
        setPriority('P1')
        setNotes('')
        setSubmitState('idle')
      }, 1500)
    } else {
      setSubmitState('error')
      setErrorMsg(result.error || 'Unknown error')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 max-w-full flex flex-col border-l shadow-2xl"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border-default)',
        animation: 'slideInRight 0.15s ease-out',
      }}>

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Zap size={13} style={{ color: 'var(--color-warning)' }} />
        <h2 className="text-xs font-semibold flex-1" style={{ color: 'var(--color-text-primary)' }}>
          Quick Capture
        </h2>
        {/* PAT indicator */}
        <button
          onClick={() => patSet ? handleClearToken() : setShowSetup(s => !s)}
          className="text-[10px] px-1.5 py-0.5 rounded-sm flex items-center gap-1"
          style={{
            color: patSet ? 'var(--color-success)' : 'var(--color-danger)',
            backgroundColor: patSet ? 'var(--color-success-muted)' : 'var(--color-danger-muted)',
          }}
          title={patSet ? 'PAT configured — click to clear' : 'PAT not set — click to configure'}>
          <Key size={9} />
          {patSet ? 'PAT set ✓' : 'PAT not set ✗'}
        </button>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--color-border-subtle)]"
          style={{ color: 'var(--color-text-muted)' }}>
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">

        {/* PAT Setup Flow */}
        {showSetup && (
          <div className="mb-4 p-3 rounded border space-y-2"
            style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-base)' }}>
            <p className="text-[10px] uppercase tracking-wider font-semibold"
              style={{ color: 'var(--color-text-muted)' }}>
              GitHub PAT Setup
            </p>
            <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
              Create a Personal Access Token with <code className="text-[10px] px-1 py-0.5 rounded"
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)' }}>
                contents:write</code> scope:
            </p>
            <a
              href="https://github.com/settings/tokens/new?scopes=repo&description=sprint-planner-quick-capture"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] flex items-center gap-1 hover:underline"
              style={{ color: 'var(--color-accent)' }}>
              <ExternalLink size={10} />
              github.com/settings/tokens/new
            </a>
            <input
              ref={tokenRef}
              type="password"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveToken() }}
              placeholder="Paste token here..."
              className="w-full text-xs px-2 py-1.5 rounded border bg-transparent"
              style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-surface)' }}
            />
            <button
              onClick={handleSaveToken}
              disabled={!tokenInput.trim()}
              className="text-[10px] px-3 py-1.5 rounded font-semibold transition-colors disabled:opacity-40"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-base)' }}>
              Save Token
            </button>
          </div>
        )}

        {/* Capture Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Title */}
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1"
              style={{ color: 'var(--color-text-muted)' }}>Title *</label>
            <input
              ref={titleRef}
              value={title}
              onChange={e => { setTitle(e.target.value); if (e.target.value.trim()) setTitleError(false) }}
              placeholder="What did you find?"
              className="w-full text-xs px-2 py-1.5 rounded border bg-transparent"
              style={{
                borderColor: titleError ? 'var(--color-danger)' : 'var(--color-border-default)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-base)',
              }}
            />
            {titleError && (
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-danger)' }}>
                Title is required
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1"
              style={{ color: 'var(--color-text-muted)' }}>Priority</label>
            <div className="flex gap-1">
              {(['P0', 'P1', 'P2', 'P3'] as Priority[]).map(p => (
                <label key={p}
                  className="text-[10px] font-bold px-2 py-1 rounded-sm transition-all cursor-pointer"
                  style={{
                    color: PRIORITY_CONFIG[p].color,
                    backgroundColor: priority === p ? PRIORITY_CONFIG[p].bg : 'transparent',
                    border: `1px solid ${priority === p ? PRIORITY_CONFIG[p].color : 'var(--color-border-subtle)'}`,
                  }}>
                  <input
                    type="radio"
                    name="priority"
                    value={p}
                    checked={priority === p}
                    onChange={() => setPriority(p)}
                    className="sr-only"
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1"
              style={{ color: 'var(--color-text-muted)' }}>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              placeholder="Additional context..."
              className="w-full text-xs px-2 py-1.5 rounded border bg-transparent resize-y"
              style={{
                borderColor: 'var(--color-border-default)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-base)',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={submitState === 'submitting' || !patSet}
              className="text-[10px] px-3 py-1.5 rounded font-semibold transition-colors disabled:opacity-40"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-base)' }}>
              {submitState === 'submitting' ? 'Submitting...' : 'Submit'}
            </button>
            <button type="button" onClick={onClose}
              className="text-[10px] px-3 py-1.5 rounded"
              style={{ color: 'var(--color-text-muted)' }}>
              Cancel
            </button>
          </div>

          {/* Status Messages */}
          {submitState === 'success' && (
            <div className="flex items-center gap-1.5 text-[11px] px-2 py-1.5 rounded"
              style={{ color: 'var(--color-success)', backgroundColor: 'var(--color-success-muted)' }}>
              <CheckCircle size={12} />
              Captured ✓
            </div>
          )}
          {submitState === 'error' && (
            <div className="flex items-center gap-1.5 text-[11px] px-2 py-1.5 rounded"
              style={{ color: 'var(--color-danger)', backgroundColor: 'var(--color-danger-muted)' }}>
              <AlertCircle size={12} />
              {errorMsg}
            </div>
          )}
        </form>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t text-center"
        style={{ borderColor: 'var(--color-border-subtle)' }}>
        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
          Press <kbd>q</kbd> or <kbd>Esc</kbd> to close
        </span>
      </div>
    </div>
  )
}
