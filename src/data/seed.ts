/*
  Seed data for the SuperSymm Content Engine sprint planner.
  All 27 completed backlog items from Sprints 1-4, plus next-phase items
  from the code quality scorecard.
*/
import type { BacklogItem, Sprint, Project, ContextDoc } from '@/lib/types'

interface Actions {
  importState: (data: any) => void
}

function makeId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function seedInitialData(actions: Actions) {
  const now = new Date().toISOString()

  // Build all data in-memory, then import as a single atomic state update
  const projectId = makeId()
  const project: Project = { id: projectId, name: 'SuperSymm Content Engine', description: 'AI-powered content automation platform for financial services — strategy planning, content generation, compliance review, and campaign management.', created_at: now }

  const sprint1Id = makeId(), sprint2Id = makeId(), sprint3Id = makeId(), sprint4Id = makeId(), sprint5Id = makeId(), sprint6Id = makeId()

  const sprints: Sprint[] = [
    { id: sprint1Id, name: 'Sprint 1 — Foundation', goal: 'Context assembly, scaffolding engine, FINRA compliance, anchor asset pipeline', status: 'completed', start_date: '2025-03-01', end_date: '2025-03-14', created_at: now },
    { id: sprint2Id, name: 'Sprint 2 — Generation Pipeline', goal: 'Content generation, email scaffolding, progress tracking, review integration', status: 'completed', start_date: '2025-03-15', end_date: '2025-03-28', created_at: now },
    { id: sprint3Id, name: 'Sprint 3 — Funnel & Hub', goal: 'Funnel node panel, AI SDR, hub linking, ads archive, social archive', status: 'completed', start_date: '2025-03-29', end_date: '2025-04-11', created_at: now },
    { id: sprint4Id, name: 'Sprint 4 — Polish & Archives', goal: 'Prompt review, volume tracking, multi-model, analytics, reflow, archives, presets', status: 'completed', start_date: '2025-04-12', end_date: '2025-04-25', created_at: now },
    { id: sprint5Id, name: 'Sprint 5 — Quality & UX', goal: 'Address code quality scorecard findings, UX friction points, and testing gaps', status: 'planning', created_at: now },
    { id: sprint6Id, name: 'Sprint 6 — Integrations', goal: 'MCP Server, Hermes, OpenClaw — advanced integration layer', status: 'planning', created_at: now },
  ]

  const sprint1 = { id: sprint1Id }, sprint2 = { id: sprint2Id }, sprint3 = { id: sprint3Id }, sprint4 = { id: sprint4Id }

  // --- Sprint 1 Items (P0) ---
  const p0Items: Array<Omit<BacklogItem, 'id' | 'created_at' | 'updated_at'>> = [
    {
      title: 'P0-1: Context Assembly Pipeline',
      description: 'Unified `assembleStrategyContextWithConfig()` function that pulls strategy, persona, compliance rules, and anchor content into a single context object for all generation paths.',
      priority: 'P0', status: 'done', sprint_id: sprint1.id,
      tags: ['context', 'pipeline', 'foundation'], effort: 'XL',
      completed_at: '2025-03-10T00:00:00Z',
    },
    {
      title: 'P0-2: Scaffolding Engine (Article + LP)',
      description: 'Calendar scaffolding engine that generates article and landing page content plans from strategy context. Produces structured calendar entries with dates, topics, and content briefs.',
      priority: 'P0', status: 'done', sprint_id: sprint1.id,
      tags: ['scaffolding', 'calendar', 'articles', 'landing-pages'], effort: 'XL',
      completed_at: '2025-03-12T00:00:00Z',
    },
    {
      title: 'P0-3: FINRA Compliance Scoring',
      description: 'Real-time FINRA compliance scoring with rule-based checks for financial content. Scores content on a 0-100 scale across disclosure, suitability, and fair-balance dimensions.',
      priority: 'P0', status: 'done', sprint_id: sprint1.id,
      tags: ['compliance', 'FINRA', 'scoring'], effort: 'L',
      completed_at: '2025-03-08T00:00:00Z',
    },
    {
      title: 'P0-4: Email Scaffolding + Warm Sequences',
      description: 'Email-specific scaffolding with warm/cold sequence support, drip campaign templates, and email-specific compliance sections for CAN-SPAM and financial disclosure.',
      priority: 'P0', status: 'done', sprint_id: sprint1.id,
      tags: ['email', 'scaffolding', 'sequences'], effort: 'L',
      completed_at: '2025-03-14T00:00:00Z',
    },
    {
      title: 'P0-5: Anchor Asset Ingestion Pipeline',
      description: 'Anchor asset model with migration, types, and ingestion pipeline. Supports white papers, webinars, and research reports as anchor content that drives derivative content generation.',
      priority: 'P0', status: 'done', sprint_id: sprint1.id,
      tags: ['anchor', 'ingestion', 'pipeline'], effort: 'L',
      completed_at: '2025-03-13T00:00:00Z',
    },
  ]

  // --- Sprint 2 Items (P1) ---
  const p1Items: Array<Omit<BacklogItem, 'id' | 'created_at' | 'updated_at'>> = [
    {
      title: 'P1-1: Content Generation via Inngest',
      description: 'Async content generation pipeline using Inngest step functions. Handles article, landing page, email, ad, and social content generation with retry logic and progress tracking.',
      priority: 'P1', status: 'done', sprint_id: sprint2.id,
      tags: ['generation', 'inngest', 'async'], effort: 'XL',
      completed_at: '2025-03-20T00:00:00Z',
    },
    {
      title: 'P1-2: Funnel Scaffolding Engine',
      description: 'Funnel-specific scaffolding that generates multi-stage funnel plans from strategy context. Produces awareness → consideration → decision → retention stage content plans.',
      priority: 'P1', status: 'done', sprint_id: sprint2.id,
      tags: ['funnel', 'scaffolding', 'stages'], effort: 'L',
      completed_at: '2025-03-18T00:00:00Z',
    },
    {
      title: 'P1-3: Prompt Composer + Template Sections',
      description: 'Modular prompt composition system with anchor-aware template sections. Composes prompts from strategy context, persona data, compliance rules, and content-type-specific templates.',
      priority: 'P1', status: 'done', sprint_id: sprint2.id,
      tags: ['prompts', 'templates', 'composer'], effort: 'L',
      completed_at: '2025-03-22T00:00:00Z',
    },
    {
      title: 'P1-4: Strategy Dashboard + Readiness Panel',
      description: 'Strategy planning dashboard with readiness indicators showing completion status across personas, compliance config, anchor assets, and content calendar.',
      priority: 'P1', status: 'done', sprint_id: sprint2.id,
      tags: ['dashboard', 'strategy', 'readiness'], effort: 'M',
      completed_at: '2025-03-25T00:00:00Z',
    },
    {
      title: 'P1-5: Generation Progress Indicator',
      description: 'Real-time progress tracking for content generation jobs. Shows per-item status, estimated completion, and error states via polling hook.',
      priority: 'P1', status: 'done', sprint_id: sprint2.id,
      tags: ['progress', 'UX', 'generation'], effort: 'M',
      completed_at: '2025-03-26T00:00:00Z',
    },
    {
      title: 'P1-6: Campaign Plan Wizard',
      description: 'Multi-step campaign creation wizard with anchor type selection, persona targeting, content type configuration, and calendar date range selection.',
      priority: 'P1', status: 'done', sprint_id: sprint2.id,
      tags: ['campaign', 'wizard', 'creation'], effort: 'L',
      completed_at: '2025-03-24T00:00:00Z',
    },
    {
      title: 'P1-7: Context Config System',
      description: 'Configurable context assembly with per-section toggle controls. Allows users to include/exclude strategy sections, persona data, compliance rules, and anchor content from generation context.',
      priority: 'P1', status: 'done', sprint_id: sprint2.id,
      tags: ['context', 'config', 'toggles'], effort: 'M',
      completed_at: '2025-03-27T00:00:00Z',
    },
    {
      title: 'P1-8: Email Archive + Compliance Viewer',
      description: 'Email compliance archive with versioned snapshots, FINRA score history, and side-by-side diff view for tracking compliance changes across email revisions.',
      priority: 'P1', status: 'done', sprint_id: sprint2.id,
      tags: ['email', 'archive', 'compliance'], effort: 'M',
      completed_at: '2025-03-28T00:00:00Z',
    },
  ]

  // --- Sprint 3 Items (P2) ---
  const p2Items: Array<Omit<BacklogItem, 'id' | 'created_at' | 'updated_at'>> = [
    {
      title: 'P2-1: Funnel Node Detail Panel',
      description: 'Expandable detail panel for funnel canvas nodes. Shows node-specific content, metrics, linked assets, and action buttons for generation and compliance review.',
      priority: 'P2', status: 'done', sprint_id: sprint3.id,
      tags: ['funnel', 'canvas', 'detail-panel'], effort: 'L',
      completed_at: '2025-04-02T00:00:00Z',
    },
    {
      title: 'P2-2: AI SDR Integration Config',
      description: 'SDR configuration section with context extractor, persona-specific SDR settings, and integration hooks for automated outreach sequences.',
      priority: 'P2', status: 'done', sprint_id: sprint3.id,
      tags: ['SDR', 'integration', 'config'], effort: 'M',
      completed_at: '2025-04-04T00:00:00Z',
    },
    {
      title: 'P2-3: Review Integration in Campaign Detail',
      description: 'Compliance review workflow integrated into campaign detail view. Includes reviewer assignment, feedback submission, approval/rejection flow, and compliance score display.',
      priority: 'P2', status: 'done', sprint_id: sprint3.id,
      tags: ['review', 'compliance', 'campaign'], effort: 'M',
      completed_at: '2025-04-06T00:00:00Z',
    },
    {
      title: 'P2-4: Hub Bidirectional Linking',
      description: 'Content-to-hub and hub-to-content bidirectional linking system. Links generated content back to source campaigns, strategies, and anchor assets for full traceability.',
      priority: 'P2', status: 'done', sprint_id: sprint3.id,
      tags: ['hub', 'linking', 'traceability'], effort: 'M',
      completed_at: '2025-04-08T00:00:00Z',
    },
    {
      title: 'P2-5: Ads Compliance Archive',
      description: 'Ads-specific compliance archive with versioned snapshots, platform-specific compliance rules (Meta, Google, LinkedIn), and approval workflow.',
      priority: 'P2', status: 'done', sprint_id: sprint3.id,
      tags: ['ads', 'archive', 'compliance'], effort: 'M',
      completed_at: '2025-04-10T00:00:00Z',
    },
    {
      title: 'P2-6: Social Content Archive',
      description: 'Social media content compliance archive with platform-specific formatting, character count validation, and hashtag compliance checking.',
      priority: 'P2', status: 'done', sprint_id: sprint3.id,
      tags: ['social', 'archive', 'compliance'], effort: 'M',
      completed_at: '2025-04-11T00:00:00Z',
    },
  ]

  // --- Sprint 4 Items (P3) ---
  const p3Items: Array<Omit<BacklogItem, 'id' | 'created_at' | 'updated_at'>> = [
    {
      title: 'P3-1: Unified Compliance Dashboard',
      description: 'Unified compliance dashboard aggregating all 5 content type archives (article, LP, email, ads, social) with cross-type filtering, search, and bulk compliance actions.',
      priority: 'P3', status: 'done', sprint_id: sprint4.id,
      tags: ['compliance', 'dashboard', 'unified'], effort: 'L',
      completed_at: '2025-04-18T00:00:00Z',
    },
    {
      title: 'P3-2: Prompt Template Review UI',
      description: 'UI for reviewing and editing prompt templates used in content generation. Shows template structure, variable placeholders, and allows inline editing with preview.',
      priority: 'P3', status: 'done', sprint_id: sprint4.id,
      tags: ['prompts', 'templates', 'review'], effort: 'S',
      completed_at: '2025-04-13T00:00:00Z',
    },
    {
      title: 'P3-3: Warm Email Prefix Fix',
      description: 'Migration fix for warm email sequence prefix naming convention. Ensures consistent `warm_` prefix across all email sequence types in the database.',
      priority: 'P3', status: 'done', sprint_id: sprint4.id,
      tags: ['email', 'migration', 'fix'], effort: 'XS',
      completed_at: '2025-04-12T00:00:00Z',
    },
    {
      title: 'P3-4: Content Volume Tracker',
      description: 'Dashboard widget tracking content generation volume across all types. Shows daily/weekly/monthly generation counts with trend indicators and capacity alerts.',
      priority: 'P3', status: 'done', sprint_id: sprint4.id,
      tags: ['analytics', 'volume', 'tracking'], effort: 'M',
      completed_at: '2025-04-15T00:00:00Z',
    },
    {
      title: 'P3-5: Multi-Model Selection',
      description: 'Model selection dropdown in content generation banner. Allows choosing between different AI models (GPT-4, Claude, etc.) for content generation with model-specific parameter tuning.',
      priority: 'P3', status: 'done', sprint_id: sprint4.id,
      tags: ['models', 'generation', 'selection'], effort: 'S',
      completed_at: '2025-04-14T00:00:00Z',
    },
    {
      title: 'P3-6: Funnel Analytics Overlay',
      description: 'Analytics overlay on funnel canvas showing conversion rates, drop-off points, and stage-level metrics. Toggleable via button on the canvas toolbar.',
      priority: 'P3', status: 'done', sprint_id: sprint4.id,
      tags: ['funnel', 'analytics', 'overlay'], effort: 'M',
      completed_at: '2025-04-20T00:00:00Z',
    },
    {
      title: 'P3-7: Strategy Template Selector',
      description: 'Pre-built strategy templates for common financial advisory scenarios (retirement planning, wealth management, etc.) with one-click application to campaign plans.',
      priority: 'P3', status: 'done', sprint_id: sprint4.id,
      tags: ['strategy', 'templates', 'selector'], effort: 'S',
      completed_at: '2025-04-16T00:00:00Z',
    },
    {
      title: 'P3-8: Reflow Cascade System',
      description: 'Change detection and downstream propagation system. When strategy data changes, creates change flags that trigger reflow of dependent content (articles, emails, ads, etc.).',
      priority: 'P3', status: 'done', sprint_id: sprint4.id,
      tags: ['reflow', 'cascade', 'change-detection'], effort: 'L',
      completed_at: '2025-04-22T00:00:00Z',
    },
    {
      title: 'P3-9: Article + LP Hub Archives',
      description: 'Article hub and landing page compliance archives accessible through the unified compliance dashboard. Includes versioned snapshots and FINRA scoring.',
      priority: 'P3', status: 'done', sprint_id: sprint4.id,
      tags: ['articles', 'landing-pages', 'archive'], effort: 'M',
      completed_at: '2025-04-24T00:00:00Z',
    },
    {
      title: 'P3-10: Config Preset Quick-Select',
      description: 'Preset configuration profiles for context assembly. Quick-select buttons for common configurations (full context, minimal, compliance-focused, etc.).',
      priority: 'P3', status: 'done', sprint_id: sprint4.id,
      tags: ['config', 'presets', 'quick-select'], effort: 'S',
      completed_at: '2025-04-25T00:00:00Z',
    },
  ]

  // Build all items in-memory
  function makeItem(data: Omit<BacklogItem, 'id' | 'created_at' | 'updated_at'>): BacklogItem {
    return { ...data, id: makeId(), created_at: now, updated_at: now }
  }

  const allItems: BacklogItem[] = [
    ...p0Items.map(makeItem),
    ...p1Items.map(makeItem),
    ...p2Items.map(makeItem),
    ...p3Items.map(makeItem),
    // Sprint 5 items
    makeItem({ title: 'Add unit tests for pure pipeline functions', description: 'Write Vitest unit tests for the core pipeline functions: `assembleStrategyContextWithConfig()`, `composePrompt()`, FINRA scoring, and scaffolding engine.', priority: 'P1', status: 'backlog', sprint_id: sprint5Id, tags: ['testing', 'quality', 'pipeline'], effort: 'L' }),
    makeItem({ title: 'Refactor campaign-detail.tsx (1,991 lines)', description: 'Break the 1,991-line god component into focused sub-components: CampaignHeader, ContentList, ComplianceTab, FunnelTab, TimelineTab.', priority: 'P2', status: 'backlog', sprint_id: sprint5Id, tags: ['refactor', 'quality', 'components'], effort: 'L' }),
    makeItem({ title: 'Validate reflow cascade trigger mechanism', description: 'Verify that change flags are automatically created when strategy data changes. Test: edit strategy → flag created → downstream content marked stale.', priority: 'P1', status: 'backlog', sprint_id: sprint5Id, tags: ['testing', 'reflow', 'validation'], effort: 'M' }),
    makeItem({ title: 'Add standalone article/LP archive routes', description: 'Create `/dashboard/article-hub/archive` and `/dashboard/landing-pages/archive` route pages for consistency with ads/social archives.', priority: 'P3', status: 'backlog', sprint_id: sprint5Id, tags: ['routes', 'UX', 'consistency'], effort: 'S' }),
    makeItem({ title: 'Clean up stale docs and duplicate spec files', description: 'Update or remove `docs/backlog/STATUS.md`. Remove duplicate spec files for P2-4, P2-5, P2-6. Archive old stream rules files.', priority: 'P3', status: 'backlog', sprint_id: sprint5Id, tags: ['docs', 'cleanup', 'maintenance'], effort: 'XS' }),
    makeItem({ title: 'Add error boundaries to generation pipeline', description: 'Add React error boundaries around content generation progress view and compliance review panels.', priority: 'P2', status: 'backlog', sprint_id: sprint5Id, tags: ['error-handling', 'resilience', 'UX'], effort: 'M' }),
    makeItem({ title: 'Run full UI testing plan (10 phases)', description: 'Execute the comprehensive testing plan covering all 10 phases: strategy foundation, campaign creation, context config, calendar scaffolding, funnel canvas, compliance review, archives, and end-to-end flows.', priority: 'P0', status: 'backlog', sprint_id: sprint5Id, tags: ['testing', 'QA', 'manual'], effort: 'XL' }),
    makeItem({ title: 'Address UX findings from testing plan', description: 'Fix any UX issues, broken flows, or visual inconsistencies discovered during testing plan execution.', priority: 'P1', status: 'backlog', sprint_id: sprint5Id, tags: ['UX', 'fixes', 'testing'], effort: 'L' }),
    // Sprint 6 items
    makeItem({ title: 'INT-1: MCP Server for AI Agent Access', description: 'Model Context Protocol server exposing strategy context, campaign data, and content generation capabilities to external AI agents.', priority: 'P2', status: 'backlog', sprint_id: sprint6Id, tags: ['integration', 'MCP', 'AI-agents'], effort: 'XL' }),
    makeItem({ title: 'INT-2: OpenClaw Integration', description: 'OpenClaw integration for advanced compliance checking and regulatory document analysis.', priority: 'P2', status: 'backlog', sprint_id: sprint6Id, tags: ['integration', 'OpenClaw', 'compliance'], effort: 'XL' }),
    makeItem({ title: 'INT-3: Hermes Communication Layer', description: 'Hermes integration for cross-service communication between content engine, CRM, and external marketing platforms.', priority: 'P2', status: 'backlog', sprint_id: sprint6Id, tags: ['integration', 'Hermes', 'messaging'], effort: 'XL' }),
  ]

  // Build context docs in-memory
  const contextDocs: ContextDoc[] = [
    {
      id: makeId(), project_id: projectId, created_at: now, updated_at: now,
      title: 'Architecture Overview',
      content:
    `# SuperSymm Content Engine — Architecture

## Core Pipeline
\`\`\`
Strategy Context → Context Assembly → Prompt Composition → AI Generation → Compliance Review → Archive
\`\`\`

## Key Modules
- **strategy-planning/** — Strategy dashboard, campaign plans, funnel canvas
- **content-generation/** — Inngest-powered async generation pipeline
- **compliance/** — FINRA scoring, review workflow, 5 content-type archives
- **hub pages** — Article hub, landing pages, ads, social, email management

## Data Flow
1. User creates strategy with personas, compliance rules, anchor assets
2. Campaign wizard scaffolds content calendar from strategy context
3. Context assembler pulls all relevant data into generation context
4. Prompt composer builds content-type-specific prompts
5. Inngest functions generate content asynchronously
6. FINRA scoring runs automatically on generated content
7. Content enters review workflow → approval → archive

## Tech Stack
- React 19 + TypeScript + Tailwind CSS (frontend)
- Express + tRPC (API layer)
- Supabase PostgreSQL + Drizzle ORM (database)
- Inngest (async job processing)
- AI SDK (multi-model content generation)`,
    },
    {
      id: makeId(), project_id: projectId, created_at: now, updated_at: now,
      title: 'Code Quality Scorecard',
      content: `# Code Quality Scorecard — 82/100

| Dimension | Score |
|-----------|-------|
| Code Quality & Type Safety | 91 |
| Architecture & Module Boundaries | 88 |
| Data Flow Continuity | 85 |
| UI Cohesion & Navigation | 78 |
| Error Handling & Resilience | 72 |
| Workflow Completeness (E2E) | 80 |
| Documentation & Maintainability | 75 |

## Key Strengths
- Zero \`any\` types across 15,800 lines of strategy-planning code
- Unified context assembly called from 5 generation paths
- Consistent archive pattern across all 5 content types
- Clean barrel exports and module boundaries

## Key Risks
1. No automated test coverage for pure pipeline functions
2. campaign-detail.tsx is 1,991 lines (god component)
3. Reflow cascade trigger mechanism needs validation
4. 8 pre-existing TODOs in non-strategy code`,
    },
    {
      id: makeId(), project_id: projectId, created_at: now, updated_at: now,
      title: 'Testing Plan Summary',
      content: `# UI Testing Plan — 10 Phases, 25 Test Cases

## Phase 1: Strategy Foundation
- TC-1.1: Create new strategy with all required fields
- TC-1.2: Add personas with differentiated profiles
- TC-1.3: Configure compliance rules

## Phase 2: Campaign Plan Creation
- TC-2.1: Create campaign from white paper anchor
- TC-2.2: Create campaign from webinar anchor
- TC-2.3: Create campaign from research report anchor

## Phase 3-4: Context Config + Calendar
- TC-3.1: Toggle context sections on/off
- TC-3.2: Apply preset configurations
- TC-4.1: Verify scaffolded calendar entries

## Phase 5-6: Funnel + Hub
- TC-5.1: Navigate funnel canvas
- TC-5.2: Open node detail panel
- TC-5.3: Toggle analytics overlay
- TC-6.1: Verify hub bidirectional links

## Phase 7-8: Compliance + Archives
- TC-7.1: Submit content for review
- TC-7.2: Check FINRA scores
- TC-8.1: Browse all 5 archive types

## Phase 9-10: E2E + Edge Cases
- TC-9.1: Full anchor-to-archive flow
- TC-10.1: Multi-persona differentiation
- TC-10.2: Strategy change propagation`,
    },
  ]

  // Single atomic import — prevents StrictMode double-seed
  actions.importState({
    projects: [project],
    sprints,
    items: allItems,
    contextDocs,
    activeProjectId: projectId,
    activeSprintId: null,
    activeItemId: null,
    viewMode: 'board' as const,
    searchQuery: '',
    filterPriority: null,
    filterStatus: null,
  })
}
