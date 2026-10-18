import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Coffee, X } from 'lucide-react'
import { AppRoutes } from '../../AppRoutes'
import { TutorialAuthProvider } from '../../lib/auth'
import { StoreProvider, useStore } from '../../lib/store'
import { TimerSessionProvider, useTimerSession } from '../../lib/timer-session'
import { RadioProvider } from '../../lib/radio'
import { TUTORIAL_CLOSE, TUTORIAL_RESTART, tutorialOnlyMessage } from '../../lib/tutorial-mode'
import { today } from '../../lib/utils'
import { WelcomeProvider } from './Welcome'
import { DEMO_PLAN, DEMO_SEMESTER, tutorialMe, tutorialState } from './tutorial-data'
import { tutorialSteps } from './tutorial-steps'
import './tutorial.css'

function exitTutorial() {
  if (window.parent !== window) window.parent.postMessage(TUTORIAL_CLOSE, window.location.origin)
  else window.location.assign('/')
}

export default function TutorialApp() {
  const [data] = useState(tutorialState)
  const [me] = useState(tutorialMe)
  return (
    <TutorialAuthProvider initial={me} onExit={exitTutorial}>
      <MemoryRouter>
        <RadioProvider>
          <StoreProvider initial={data} transient onUnauthorized={exitTutorial}>
            <TimerSessionProvider>
              <WelcomeProvider><TutorialController /></WelcomeProvider>
            </TimerSessionProvider>
          </StoreProvider>
        </RadioProvider>
      </MemoryRouter>
    </TutorialAuthProvider>
  )
}

function TutorialController() {
  const [index, setIndex] = useState(0)
  const [notice, setNotice] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { setActivePlan, closeStudy, closeTimer, openStudy, openTimer } = useStore()
  const timer = useTimerSession()
  const screen = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const expectedPath = useRef<string | null>(null)
  const currentPath = useRef('/')
  const step = tutorialSteps[index]
  currentPath.current = step.path
  const last = index === tutorialSteps.length - 1

  const go = (next: number) => {
    const s = tutorialSteps[next]
    timer.finish()
    closeTimer()
    closeStudy()
    setActivePlan(s.semester ? DEMO_SEMESTER : DEMO_PLAN)
    setNotice('')
    setCollapsed(false)
    expectedPath.current = pathname === s.path ? null : s.path
    setIndex(next)
    navigate(s.path)
    if (s.action === 'study') openStudy({ subjectId: 'tutorial-disciplina-1', topicId: 'tutorial-topico-1-1', categoryId: 'questoes', duration: 2700, date: today(), hits: 8, misses: 2, material: 'Caderno de questões (exemplo)', comment: 'Rever os conceitos das duas questões erradas.', countInPlanning: true, reviewIntervals: [1, 7, 30] })
    if (s.action === 'timer') { timer.switchMode('pomodoro'); openTimer({}) }
  }
  const goRef = useRef(go)
  goRef.current = go

  useEffect(() => {
    const restart = () => goRef.current(0)
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('#tutorial-screen [role="dialog"]')) exitTutorial() }
    window.addEventListener(TUTORIAL_RESTART, restart)
    window.addEventListener('keydown', key)
    return () => { window.removeEventListener(TUTORIAL_RESTART, restart); window.removeEventListener('keydown', key) }
  }, [])

  useEffect(() => {
    // Router transitions can settle after the guide's state update. Do not move
    // the guide back to the previous screen while that transition is pending.
    if (expectedPath.current) {
      if (pathname === expectedPath.current) expectedPath.current = null
      return
    }
    if (pathname === currentPath.current) return
    const matching = tutorialSteps.findIndex((s) => s.path === pathname && !s.action)
    if (matching >= 0) setIndex(matching)
  }, [pathname])

  useEffect(() => {
    screen.current?.scrollTo(0, 0)
    heading.current?.focus({ preventScroll: true })
    let target: Element | null = null
    const id = requestAnimationFrame(() => {
      target = screen.current?.querySelector(step.target ?? 'main h1') ?? null
      target?.classList.add('tutorial-highlight')
      if (step.target) target?.scrollIntoView({ block: 'start', behavior: 'instant' })
    })
    return () => { cancelAnimationFrame(id); target?.classList.remove('tutorial-highlight') }
  }, [index, step, pathname])

  const preventExternal = (e: MouseEvent) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href]')
    if (link && (link.hasAttribute('download') || !link.getAttribute('href')?.startsWith('/') || link.getAttribute('href')?.startsWith('/api/'))) {
      e.preventDefault()
      e.stopPropagation()
      setNotice(tutorialOnlyMessage)
    }
  }

  return (
    <div className="tutorial-shell">
      <header className="flex min-h-14 items-center gap-3 border-b border-line bg-surface px-4 pr-14 sm:px-6 sm:pr-16">
        <Coffee size={21} className="shrink-0 text-brand-600" aria-hidden />
        <span className="font-display text-lg font-bold">Tour do Coado</span>
        <span className="ml-auto rounded-full bg-brand-100 px-2.5 py-1 text-[10px] font-semibold text-brand-800 sm:text-xs">Dados fictícios</span>
        {window.parent === window && <button onClick={exitTutorial} aria-label="Sair do tutorial" className="absolute right-3 top-2 rounded-full p-2 text-muted"><X size={20} /></button>}
      </header>

      <div className="tutorial-viewport">
        <div ref={screen} id="tutorial-screen" className="tutorial-screen" aria-label={`Tela de exemplo: ${step.label}`} onClickCapture={preventExternal}>
          <AppRoutes />
        </div>
      </div>

      <section role="dialog" aria-modal="false" aria-labelledby="tutorial-step-title" aria-describedby="tutorial-step-body" aria-label="Guia do tutorial" className="tutorial-guide rounded-2xl border border-brand-300 bg-surface p-5 shadow-[0_12px_50px_rgba(45,30,20,0.25)]">
        <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300">
          <Coffee size={17} aria-hidden />
          <span className="text-[10px] font-bold uppercase tracking-widest">{collapsed ? `${index + 1}/${tutorialSteps.length} · ${step.label}` : 'Seu passeio pelo Coado'}</span>
          <button onClick={() => setCollapsed((value) => !value)} aria-expanded={!collapsed} aria-label={collapsed ? 'Expandir explicação' : 'Recolher explicação'} className="ml-auto rounded-full p-1 text-muted hover:bg-surface-2">{collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
          <button onClick={exitTutorial} aria-label="Encerrar tour" className="-mr-1 rounded-full p-1 text-muted hover:bg-surface-2"><X size={16} /></button>
        </div>
        <div hidden={collapsed} className="mt-3">
        <div aria-live="polite" aria-atomic="true">
          <h2 id="tutorial-step-title" ref={heading} tabIndex={-1} className="font-display text-xl font-bold leading-tight outline-none">{step.title}</h2>
          <p id="tutorial-step-body" className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
        </div>
        <details key={index} className="mt-3 rounded-lg bg-kraft px-3 py-2 text-xs text-muted"><summary className="cursor-pointer font-semibold text-brand-700 dark:text-brand-300">Dica desta etapa</summary><p className="mt-2 leading-relaxed">{step.tip}</p></details>
        <div className="mt-4 flex items-center gap-2">
          <label className="mr-auto min-w-0 text-xs text-muted">
            <span className="sr-only">Etapa</span>
            <select aria-label="Etapa do tutorial" value={index} onChange={(e) => go(Number(e.target.value))} className="field w-full max-w-36 py-1.5 text-xs">
              {tutorialSteps.map((s, i) => <option key={i} value={i}>{i + 1}. {s.label}</option>)}
            </select>
          </label>
          <button onClick={() => go(index - 1)} disabled={index === 0} aria-label="Etapa anterior" className="flex h-10 w-9 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-surface-2 disabled:opacity-30"><ArrowLeft size={16} /></button>
          <button onClick={() => last ? exitTutorial() : go(index + 1)} className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-brand-700 px-3 text-sm font-semibold text-brand-50 hover:bg-brand-800">{last ? 'Concluir' : 'Próximo'}{last ? <Check size={16} /> : <ArrowRight size={16} />}</button>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div role="progressbar" aria-label="Progresso do tutorial" aria-valuemin={0} aria-valuemax={tutorialSteps.length} aria-valuenow={index + 1} className="h-1 flex-1 overflow-hidden rounded-full bg-line"><div className="h-full bg-brand-600 transition-[width]" style={{ width: `${(index + 1) / tutorialSteps.length * 100}%` }} /></div>
          <span className="text-[10px] tabular text-muted">{index + 1}/{tutorialSteps.length}</span>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-muted" role={notice ? 'status' : undefined}>{notice || 'Exemplos temporários. Nada é salvo na sua conta.'}</p>
        </div>
      </section>
    </div>
  )
}
