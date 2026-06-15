/*
  GitHub REST API client for QA Quick Capture.
  Manages PAT in localStorage and writes stub files to docs/backlog/_inbox/.
*/

const STORAGE_KEY = 'gh_pat_inbox'
const REPO_OWNER = 'chadjowens'
const REPO_NAME = 'biz-automation-dashboard'
const TARGET_BRANCH = 'staging'

export function getPat(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function setPat(token: string): void {
  localStorage.setItem(STORAGE_KEY, token)
}

export function clearPat(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function hasPat(): boolean {
  return !!getPat()
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

export interface CapturePayload {
  title: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  notes?: string
}

export interface CaptureResult {
  ok: boolean
  filename?: string
  error?: string
}

export async function writeInboxFile(payload: CapturePayload): Promise<CaptureResult> {
  const pat = getPat()
  if (!pat) {
    return { ok: false, error: 'No GitHub PAT configured' }
  }

  const now = new Date()
  const iso = now.toISOString()
  const datePart = now.getFullYear()
    + '-' + String(now.getMonth() + 1).padStart(2, '0')
    + '-' + String(now.getDate()).padStart(2, '0')
  const timePart = String(now.getHours()).padStart(2, '0')
    + String(now.getMinutes()).padStart(2, '0')
  const slug = slugify(payload.title)
  const filename = `${datePart}T${timePart}-${slug}.md`

  const notesBlock = payload.notes?.trim() ? `\n${payload.notes.trim()}\n` : ''
  const stub = `---
captured: ${iso}
priority: ${payload.priority}
source: qa-walkthrough
---
# ${payload.title}
${notesBlock}
<!-- Agent: add acceptance criteria, effort estimate, file list, and move to docs/backlog/ -->
`

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/docs/backlog/_inbox/${filename}`

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${pat}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: 'chore(inbox): quick-capture from QA',
        content: toBase64(stub),
        branch: TARGET_BRANCH,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const msg = (body as Record<string, unknown>).message || `HTTP ${res.status}`
      return { ok: false, error: String(msg) }
    }

    return { ok: true, filename }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' }
  }
}
