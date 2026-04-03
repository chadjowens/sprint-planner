import type { BacklogItem, Sprint, Project, ContextDoc, PRIORITY_CONFIG, STATUS_CONFIG } from './types'

/**
 * Export a single item as Markdown — optimized for pasting into Claude Code / Warp
 */
export function itemToMarkdown(item: BacklogItem): string {
  const lines: string[] = []
  lines.push(`## [${item.priority}] ${item.title}`)
  lines.push('')
  lines.push(`- **Status:** ${item.status.replace('_', ' ')}`)
  lines.push(`- **Priority:** ${item.priority}`)
  if (item.effort) lines.push(`- **Effort:** ${item.effort}`)
  if (item.tags.length > 0) lines.push(`- **Tags:** ${item.tags.join(', ')}`)
  if (item.sprint_id) lines.push(`- **Sprint:** ${item.sprint_id}`)
  if (item.dependencies && item.dependencies.length > 0) {
    lines.push(`- **Dependencies:** ${item.dependencies.join(', ')}`)
  }
  lines.push('')
  if (item.description) {
    lines.push(item.description)
    lines.push('')
  }
  if (item.notes) {
    lines.push('### Notes')
    lines.push('')
    lines.push(item.notes)
    lines.push('')
  }
  return lines.join('\n')
}

/**
 * Export a sprint as Markdown with all its items
 */
export function sprintToMarkdown(sprint: Sprint, items: BacklogItem[]): string {
  const lines: string[] = []
  lines.push(`# Sprint: ${sprint.name}`)
  lines.push('')
  if (sprint.goal) {
    lines.push(`> ${sprint.goal}`)
    lines.push('')
  }
  lines.push(`**Status:** ${sprint.status} | **Created:** ${sprint.created_at.split('T')[0]}`)
  if (sprint.start_date) lines.push(`**Start:** ${sprint.start_date} | **End:** ${sprint.end_date || 'TBD'}`)
  lines.push('')
  lines.push('---')
  lines.push('')

  const sprintItems = items.filter(i => i.sprint_id === sprint.id)
  const byStatus = {
    backlog: sprintItems.filter(i => i.status === 'backlog'),
    in_progress: sprintItems.filter(i => i.status === 'in_progress'),
    in_review: sprintItems.filter(i => i.status === 'in_review'),
    done: sprintItems.filter(i => i.status === 'done'),
  }

  for (const [status, statusItems] of Object.entries(byStatus)) {
    if (statusItems.length === 0) continue
    const label = status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
    lines.push(`## ${label} (${statusItems.length})`)
    lines.push('')
    for (const item of statusItems) {
      const check = status === 'done' ? 'x' : ' '
      lines.push(`- [${check}] **[${item.priority}]** ${item.title}${item.effort ? ` _(${item.effort})_` : ''}`)
      if (item.description) {
        const firstLine = item.description.split('\n')[0].substring(0, 100)
        lines.push(`  > ${firstLine}${item.description.length > 100 ? '...' : ''}`)
      }
    }
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Export the full backlog as Markdown
 */
export function backlogToMarkdown(items: BacklogItem[], sprints: Sprint[]): string {
  const lines: string[] = []
  lines.push('# Backlog')
  lines.push('')
  lines.push(`_${items.length} items | ${items.filter(i => i.status === 'done').length} done_`)
  lines.push('')
  lines.push('---')
  lines.push('')

  // Group by priority
  const priorities = ['P0', 'P1', 'P2', 'P3'] as const
  for (const p of priorities) {
    const pItems = items.filter(i => i.priority === p)
    if (pItems.length === 0) continue
    lines.push(`## ${p} Items (${pItems.length})`)
    lines.push('')
    for (const item of pItems) {
      const check = item.status === 'done' ? 'x' : ' '
      const sprint = sprints.find(s => s.id === item.sprint_id)
      const sprintLabel = sprint ? ` → _${sprint.name}_` : ''
      lines.push(`- [${check}] ${item.title}${sprintLabel}${item.effort ? ` _(${item.effort})_` : ''}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Export a context doc as Markdown
 */
export function contextDocToMarkdown(doc: ContextDoc): string {
  return `# ${doc.title}\n\n_Updated: ${doc.updated_at.split('T')[0]}_\n\n---\n\n${doc.content}`
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  }
}

/**
 * Download text as a file
 */
export function downloadAsFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
