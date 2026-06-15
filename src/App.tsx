/*
  DESIGN: Terminal Aesthetic — App Shell
  Three-column layout: Sidebar | Main (Toolbar + Board/List) | Detail Panel
  Keyboard shortcuts: n=new, /=search, Esc=close
*/
import { useState, useEffect } from 'react'
import { useAppState, useActions, useIsManifestBacked } from '@/store/useStore'
import Sidebar from '@/components/Sidebar'
import Toolbar from '@/components/Toolbar'
import KanbanBoard from '@/components/KanbanBoard'
import ListView from '@/components/ListView'
import ItemDetail from '@/components/ItemDetail'
import ContextDocViewer from '@/components/ContextDocViewer'
import NewItemDialog from '@/components/NewItemDialog'
import QuickCapture from '@/components/QuickCapture'
import { seedInitialData } from '@/data/seed'
import './index.css'

export default function App() {
  const state = useAppState()
  const actions = useActions()
  const manifestBacked = useIsManifestBacked()
  const [showNewItem, setShowNewItem] = useState(false)
  const [showQuickCapture, setShowQuickCapture] = useState(false)

  // Seed initial data on first load
  useEffect(() => {
    // Only seed if localStorage is truly empty
    const raw = localStorage.getItem('sprint-planner-state')
    if (!raw) {
      seedInitialData(actions)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      switch (e.key) {
        case 'n':
          if (manifestBacked) break
          e.preventDefault()
          setShowNewItem(true)
          break
        case '/':
          e.preventDefault()
          document.querySelector<HTMLInputElement>('input[placeholder="Search items..."]')?.focus()
          break
        case 'q':
          e.preventDefault()
          setShowQuickCapture(prev => !prev)
          break
        case 'Escape':
          if (showQuickCapture) setShowQuickCapture(false)
          else if (state.activeItemId) actions.setActiveItem(null)
          else if (showNewItem) setShowNewItem(false)
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state.activeItemId, showNewItem, manifestBacked, showQuickCapture])

  return (
    <div className="h-full flex overflow-hidden" style={{ backgroundColor: 'var(--color-base)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Toolbar onNewItem={() => setShowNewItem(true)} />
        {state.viewMode === 'board' ? <KanbanBoard /> : <ListView />}
      </div>
      {state.activeItemId && <ItemDetail readOnly={manifestBacked} />}
      {state.activeDocId && <ContextDocViewer />}
      <NewItemDialog open={showNewItem} onClose={() => setShowNewItem(false)} />
      <QuickCapture open={showQuickCapture} onClose={() => setShowQuickCapture(false)} />
    </div>
  )
}
