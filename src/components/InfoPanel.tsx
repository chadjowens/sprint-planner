import { X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import guideContent from './InfoPanelGuide.md?raw'

export default function InfoPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-96 border-l flex flex-col bg-[var(--color-surface)] shadow-xl absolute right-0 top-0 bottom-0 z-50"
      style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: 'var(--color-border-subtle)' }}>
        <h2 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
          System Overview
        </h2>
        <button onClick={onClose}
          className="p-1 rounded transition-colors hover:bg-[var(--color-surface-hover)]"
          style={{ color: 'var(--color-text-muted)' }}>
          <X size={14} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5">
        <div className="prose prose-sm prose-invert max-w-none
          prose-headings:text-[var(--color-text-primary)]
          prose-p:text-[var(--color-text-secondary)]
          prose-a:text-[var(--color-accent)]
          prose-strong:text-[var(--color-text-primary)]
          prose-code:text-[var(--color-accent)] prose-code:bg-[var(--color-base)] prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-hr:border-[var(--color-border-subtle)]
          prose-ul:text-[var(--color-text-secondary)]
          prose-ol:text-[var(--color-text-secondary)]"
          style={{ fontSize: '11px', lineHeight: '1.6' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {guideContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
