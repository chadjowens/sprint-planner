/*
  DESIGN: Terminal Aesthetic — Sprint Close-Out Panel
  Slide-over checklist with 8 steps for sprint close-out.
  Commands/prompts have "Copy" buttons. All 8 checked → "Mark sprint archived".
*/
import { useState } from 'react'
import { X, Square, CheckSquare, Copy, Check, Archive } from 'lucide-react'
import type { Sprint, BacklogItem } from '@/lib/types'

interface Props {
  sprint: Sprint
  items: BacklogItem[]
  onClose: () => void
  onArchive: () => void
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function SprintCloseOut({ sprint, items, onClose, onArchive }: Props) {
  const [checked, setChecked] = useState<boolean[]>(Array(8).fill(false))
  const [copied, setCopied] = useState<number | null>(null)

  const slug = slugify(sprint.name)
  const modules = [...new Set(items.flatMap(i => i.tags))].filter(Boolean)

  const toggleStep = (index: number) => {
    setChecked(prev => prev.map((v, i) => i === index ? !v : v))
  }

  const allChecked = checked.every(Boolean)

  const copyToClipboard = async (text: string, stepIndex: number) => {
    await navigator.clipboard.writeText(text)
    setCopied(stepIndex)
    setTimeout(() => setCopied(null), 1500)
  }

  const step2Commands = modules.map(m => `manus-config config load --search ${m}`)
  const step3Prompt = `Read \`wiki/hot.md\`. Extract any architectural decisions made during \`${slug}\` and append them to \`wiki/decisions.md\`.`
  const step4Prompt = `Clear the completed \`${slug}\` items from \`wiki/hot.md\` and update the current state.`
  const step5Command = 'graphify update .'

  const steps: { label: string; description: string; copyText?: string }[] = [
    {
      label: 'Merge to staging',
      description: `Open PR from sprint/${slug} to staging.`,
    },
    {
      label: 'Update Wiki PRDs',
      description: modules.length > 0
        ? `Run for each module:\n${step2Commands.map(c => `$ ${c}`).join('\n')}`
        : 'No modules found in sprint items.',
      copyText: modules.length > 0 ? step2Commands.join('\n') : undefined,
    },
    {
      label: 'Log Decisions',
      description: step3Prompt,
      copyText: step3Prompt,
    },
    {
      label: 'Update Hot Cache',
      description: step4Prompt,
      copyText: step4Prompt,
    },
    {
      label: 'Regenerate Graph',
      description: `Run in the repo root:\n$ ${step5Command}`,
      copyText: step5Command,
    },
    {
      label: 'Commit Docs',
      description: 'Commit the updated wiki and graph report to staging.',
    },
    {
      label: 'Deploy',
      description: 'Verify the Netlify staging build passes.',
    },
    {
      label: 'Archive',
      description: 'Mark the sprint as archived in the planner.',
    },
  ]

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[420px] max-w-full flex flex-col border-l shadow-2xl"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border-default)',
        animation: 'slideInRight 0.15s ease-out',
      }}>

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-border-subtle)' }}>
        <Archive size={13} style={{ color: 'var(--color-info)' }} />
        <h2 className="text-xs font-semibold flex-1 truncate" style={{ color: 'var(--color-text-primary)' }}>
          Close-Out: {sprint.name}
        </h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--color-border-subtle)]"
          style={{ color: 'var(--color-text-muted)' }}>
          <X size={14} />
        </button>
      </div>

      {/* Module summary */}
      <div className="px-4 py-2 border-b"
        style={{ borderColor: 'var(--color-border-subtle)' }}>
        <p className="text-[10px] uppercase tracking-wider mb-1"
          style={{ color: 'var(--color-text-muted)' }}>
          Modules ({modules.length})
        </p>
        <div className="flex flex-wrap gap-1">
          {modules.map(m => (
            <span key={m} className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}>
              {m}
            </span>
          ))}
          {modules.length === 0 && (
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              No tags on sprint items
            </span>
          )}
        </div>
      </div>

      {/* Checklist */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {steps.map((step, i) => (
          <div key={i}
            className="flex gap-2 p-2 rounded transition-colors"
            style={{
              backgroundColor: checked[i] ? 'var(--color-success-muted)' : 'transparent',
            }}>
            <button onClick={() => toggleStep(i)} className="mt-0.5 shrink-0"
              style={{ color: checked[i] ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
              {checked[i] ? <CheckSquare size={14} /> : <Square size={14} />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1 py-0.5 rounded"
                  style={{
                    backgroundColor: 'var(--color-border-subtle)',
                    color: 'var(--color-text-muted)',
                  }}>
                  {i + 1}
                </span>
                <span className="text-xs font-semibold"
                  style={{
                    color: checked[i] ? 'var(--color-success)' : 'var(--color-text-primary)',
                    textDecoration: checked[i] ? 'line-through' : 'none',
                  }}>
                  {step.label}
                </span>
                {step.copyText && (
                  <button
                    onClick={() => copyToClipboard(step.copyText!, i)}
                    className="ml-auto text-[10px] flex items-center gap-0.5 px-1.5 py-0.5 rounded transition-colors hover:bg-[var(--color-border-subtle)]"
                    style={{ color: copied === i ? 'var(--color-success)' : 'var(--color-accent)' }}
                    title="Copy to clipboard">
                    {copied === i ? <Check size={10} /> : <Copy size={10} />}
                    {copied === i ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <p className="text-[11px] mt-1 whitespace-pre-wrap"
                style={{
                  color: 'var(--color-text-secondary)',
                  fontFamily: step.copyText ? 'var(--font-mono)' : 'var(--font-sans)',
                }}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t space-y-2"
        style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--color-border-subtle)' }}>
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${(checked.filter(Boolean).length / 8) * 100}%`,
                backgroundColor: allChecked ? 'var(--color-success)' : 'var(--color-accent)',
              }}
            />
          </div>
          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            {checked.filter(Boolean).length}/8
          </span>
        </div>
        <button
          onClick={onArchive}
          disabled={!allChecked}
          className="w-full text-xs py-2 rounded font-semibold transition-colors disabled:opacity-30"
          style={{
            backgroundColor: allChecked ? 'var(--color-success)' : 'var(--color-border-subtle)',
            color: allChecked ? 'var(--color-base)' : 'var(--color-text-muted)',
          }}>
          Mark sprint archived
        </button>
      </div>
    </div>
  )
}
