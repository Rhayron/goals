import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useStore } from './store'
import { prepareTimerBell, ringTimerBell } from './timer-bell'

type Mode = 'stopwatch' | 'countdown' | 'pomodoro'
export type TimerPhase = 'study' | 'short' | 'long'
type Phase = TimerPhase

// Keep the active clock through Vite updates while working on its UI.
// This cache exists only in development and never stores account data on disk.
type ClockSnapshot = {
  mode: Mode; minimized: boolean; subjectId: string; topicId: string
  running: boolean; accum: number; start: number | null
  phase: Phase; round: number; studiedPomodoro: number
}
const devSnapshot = import.meta.hot?.data.clockSnapshot as ClockSnapshot | undefined
let latestSnapshot = devSnapshot
if (import.meta.hot) import.meta.hot.dispose((data) => { data.clockSnapshot = latestSnapshot })

function useTimerController() {
  const { timer, closeTimer, openTimer, openStudy, state, update } = useStore()
  const prefs = state.timerPrefs
  const restored = timer ? devSnapshot : undefined

  const [mode, setMode] = useState<Mode>(restored?.mode ?? 'stopwatch')
  const [minimized, setMinimized] = useState(restored?.minimized ?? false)
  const [subjectId, setSubjectId] = useState(restored?.subjectId ?? '')
  const [topicId, setTopicId] = useState(restored?.topicId ?? '')

  // relógio baseado em timestamps: elapsed acumulado + início da corrida atual
  const [running, setRunning] = useState(restored?.running ?? false)
  const [accum, setAccum] = useState(restored?.accum ?? 0)
  const startRef = useRef<number | null>(restored?.start ?? null)
  const [, force] = useState(0)

  // pomodoro
  const [phase, setPhase] = useState<Phase>(restored?.phase ?? 'study')
  const [round, setRound] = useState(restored?.round ?? 1)
  /** tempo de estudo acumulado nas fases "study" concluídas */
  const [studiedPomodoro, setStudiedPomodoro] = useState(restored?.studiedPomodoro ?? 0)

  useEffect(() => {
    if (timer) {
      setSubjectId(timer.subjectId ?? '')
      setTopicId(timer.topicId ?? '')
      setMinimized(false)
    }
  }, [timer])

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => force((x) => x + 1), 250)
    return () => clearInterval(t)
  }, [running])

  const elapsed = accum + (running && startRef.current !== null ? Math.max(0, Date.now() - startRef.current) / 1000 : 0)

  const phaseTarget = (p: Phase) => (p === 'study' ? prefs.pomodoroStudy : p === 'short' ? prefs.pomodoroShort : prefs.pomodoroLong) * 60
  const target = mode === 'countdown' ? prefs.countdown * 60 : mode === 'pomodoro' ? phaseTarget(phase) : 0
  const display = mode === 'stopwatch' ? elapsed : Math.max(0, target - elapsed)

  if (import.meta.hot) latestSnapshot = timer ? {
    mode, minimized, subjectId, topicId, running, accum,
    start: startRef.current, phase, round, studiedPomodoro,
  } : undefined

  // fim de contagem
  useEffect(() => {
    if (!running || mode === 'stopwatch' || elapsed < target) return
    if (prefs.sound) void ringTimerBell()
    if (mode === 'countdown') {
      pause()
      return
    }
    advancePhase(true)
  })

  const setSound = (sound: boolean) => {
    update((s) => ({ ...s, timerPrefs: { ...s.timerPrefs, sound } }))
    if (sound) void ringTimerBell()
  }

  const start = () => {
    if (prefs.sound) void prepareTimerBell()
    startRef.current = Date.now()
    setRunning(true)
  }
  const pause = () => {
    setAccum(elapsed)
    startRef.current = null
    setRunning(false)
  }
  const resetClock = () => {
    setAccum(0)
    startRef.current = running ? Date.now() : null
  }

  const advancePhase = (keepRunning: boolean) => {
    if (phase === 'study') {
      setStudiedPomodoro((s) => s + Math.min(elapsed, target))
      setPhase(round % prefs.pomodoroRounds === 0 ? 'long' : 'short')
    } else {
      setPhase('study')
      if (phase === 'long') setRound(1)
      else setRound((r) => r + 1)
    }
    setAccum(0)
    startRef.current = keepRunning ? Date.now() : null
    setRunning(keepRunning)
  }

  const studiedSeconds = () => {
    if (mode === 'pomodoro') return Math.round(studiedPomodoro + (phase === 'study' ? elapsed : 0))
    return Math.round(Math.min(elapsed, mode === 'countdown' ? target : Infinity))
  }

  const resetAll = () => {
    setRunning(false)
    setAccum(0)
    startRef.current = null
    setPhase('study')
    setRound(1)
    setStudiedPomodoro(0)
  }

  const finish = () => {
    const seconds = studiedSeconds()
    resetAll()
    closeTimer()
    if (seconds >= 60) openStudy({ duration: seconds, subjectId: subjectId || undefined, topicId: topicId || undefined, categoryId: timer?.categoryId })
  }

  const close = () => {
    if (studiedSeconds() >= 60 && !window.confirm('Descartar o tempo em andamento?')) return
    resetAll()
    closeTimer()
  }

  const switchMode = (m: Mode) => {
    if (m === mode) return
    if (studiedSeconds() >= 60 && !window.confirm('Trocar de modo zera o relógio atual. Continuar?')) return
    resetAll()
    setMode(m)
  }

  const preparePomodoro = () => {
    if (timer) { setMinimized(false); return }
    resetAll()
    setMode('pomodoro')
    openTimer()
  }

  return {
    active: !!timer, mode, switchMode, minimized, setMinimized,
    subjectId, setSubjectId, topicId, setTopicId,
    running, elapsed, target, display, phase, round,
    start, pause, resetClock, advancePhase, finish, close, preparePomodoro, setSound,
  }
}

const TimerSession = createContext<ReturnType<typeof useTimerController> | null>(null)

/** One clock shared by the fullscreen controls, the mini player and the home cover. */
export function TimerSessionProvider({ children }: { children: ReactNode }) {
  const session = useTimerController()
  return <TimerSession.Provider value={session}>{children}</TimerSession.Provider>
}

export function useTimerSession() {
  const session = useContext(TimerSession)
  if (!session) throw new Error('useTimerSession fora do TimerSessionProvider')
  return session
}
