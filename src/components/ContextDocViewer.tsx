/*
  DESIGN: Terminal Aesthetic — Context Doc Viewer
  Read-only markdown viewer for context docs (wiki, graph report, tech debt).
  Same slide-over pattern as ItemDetail.tsx. GFM tables supported.
*/
import { useEffect, useRef } from 'react'
import { useActiveDoc, useActions } from '@/store/useStore'
import { X, FileText } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function ContextDocViewer() {
  const doc = useActiveDoc()
  const actions = useActions()
  const panelRef = useRef<HTMLElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!doc) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') actions.setActiveDoc(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [doc])

  // Close on click outside
  useEffect(() => {
    if (!doc) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        actions.setActiveDoc(null)
      }
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [doc])

  if (!doc) return null

  return (
    <aside
      ref={panelRef}
      className="w-[480px] min-w-[480px] h-full border-l flex flex-col overflow-hidden"
      style={{
        borderColor: 'var(--color-border-subtle)',
        backgroundColor: 'var(--color-surface)',
      }}>

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-border-subtle)' }}>
        <FileText size={13} style={{ color: 'var(--color-info)' }} />
        <h2 className="text-xs font-semibold flex-1 truncate"
          style={{ color: 'var(--color-text-primary)' }}>
          {doc.title}
        </h2>
        <button
          onClick={() => actions.setActiveDoc(null)}
          className="p-1 rounded hover:bg-[var(--color-border-subtle)]"
          style={{ color: 'var(--color-text-muted)' }}>
          <X size={13} />
        </button>
      </div>

      {/* Markdown Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div
          className="prose prose-invert prose-sm max-w-none
            [&_p]:text-xs [&_p]:leading-relaxed
            [&_li]:text-xs
            [&_h1]:text-sm [&_h1]:font-bold [&_h1]:border-b [&_h1]:border-[var(--color-border-subtle)] [&_h1]:pb-1 [&_h1]:mb-3
            [&_h2]:text-xs [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2
            [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1
            [&_code]:text-[10px] [&_code]:bg-[var(--color-base)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded
            [&_pre]:bg-[var(--color-base)] [&_pre]:rounded [&_pre]:p-3 [&_pre]:text-[11px] [&_pre]:overflow-x-auto
            [&_table]:text-[11px] [&_table]:w-full
            [&_th]:text-left [&_th]:px-2 [&_th]:py-1 [&_th]:border-b [&_th]:border-[var(--color-border-default)] [&_th]:font-semibold [&_th]:text-[var(--color-text-primary)]
            [&_td]:px-2 [&_td]:py-1 [&_td]:border-b [&_td]:border-[var(--color-border-subtle)] [&_td]:text-[var(--color-text-secondary)]
            [&_a]:text-[var(--color-accent)] [&_a]:no-underline hover:[&_a]:underline
            [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--color-border-emphasis)] [&_blockquote]:pl-3 [&_blockquote]:text-[var(--color-text-muted)]
            [&_hr]:border-[var(--color-border-subtle)]"
          style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content}</ReactMarkdown>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t text-[10px]"
        style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-muted)' }}>
        Updated: {new Date(doc.updated_at).toLocaleDateString()}
      </div>
    </aside>
  )
}
