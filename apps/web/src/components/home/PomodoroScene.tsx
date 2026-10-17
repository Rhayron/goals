import { Bell, BellOff, Check, Coffee, Maximize2, Pause, Play, SkipForward, Square } from 'lucide-react'
import { useStore } from '../../lib/store'
import { useTimerSession } from '../../lib/timer-session'
import { LofiScene } from '../LofiScene'

export function PomodoroScene() {
  const { state } = useStore()
  const session = useTimerSession()
  const { active, mode, phase, round, elapsed, target, display, running, pause, start, finish, advancePhase, setMinimized, preparePomodoro, setSound } = session
  const showing = active && mode === 'pomodoro'
  const resting = showing && phase !== 'study'
  const rounds = state.timerPrefs.pomodoroRounds
  const progress = target > 0 ? Math.min(1, elapsed / target) : 0
  const seconds = Math.ceil(display)
  const remaining = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  const playLabel = running ? 'Pausar' : elapsed > 0 ? 'Retomar' : 'Iniciar'
  const phaseLabel = phase === 'study' ? 'Hora de focar' : phase === 'short' ? 'Pausa para um café' : 'Respira, pausa longa'

  return (
    <LofiScene embedded withBreakScene activity={resting ? 'break' : 'study'} className="order-first self-center xl:order-last">
      {showing ? (
        <div className="coado-pomodoro absolute bottom-3 left-3 w-[180px] rounded-2xl border border-white/20 bg-[#201b16]/90 p-2.5 text-[#fff2d9] shadow-lg backdrop-blur sm:w-[218px] sm:p-3" role="region" aria-label="Pomodoro na capa">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#e0b88a]" aria-live="polite">
            {resting && <Coffee size={11} aria-hidden />}
            {phaseLabel}
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-2xl font-semibold leading-none tabular sm:text-3xl" role="timer" aria-label={`${remaining} restantes`}>{remaining}</span>
            <span className="text-right text-[9px] leading-tight text-[#d1beaa]">Ciclo {round}/{rounds}<br />{running ? (resting ? 'Descansando' : 'Estudando') : 'Em espera'}</span>
          </div>
          <div className="my-2 flex items-center gap-2">
          <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto pb-0.5" aria-label="Progresso dos ciclos">
            {Array.from({ length: rounds }, (_, i) => {
              const value = i + 1 < round || (i + 1 === round && resting) ? 100 : i + 1 === round ? progress * 100 : 0
              return (
                <div key={i} className="relative h-6 w-6 shrink-0" role="progressbar" aria-label={`Ciclo ${i + 1}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}>
                  <svg viewBox="0 0 28 28" className="h-full w-full -rotate-90" aria-hidden>
                    <circle cx="14" cy="14" r="11" fill="none" stroke="#fff2d9" strokeOpacity=".16" strokeWidth="3" />
                    <circle cx="14" cy="14" r="11" fill="none" stroke={value >= 100 ? '#a6c5a2' : '#e0b88a'} strokeWidth="3" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - value} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px]">{value >= 100 ? <Check size={11} aria-hidden /> : i + 1}</span>
                </div>
              )
            })}
          </div>
            <button
              type="button"
              onClick={() => setSound(!state.timerPrefs.sound)}
              aria-label={state.timerPrefs.sound ? 'Silenciar sininho dos ciclos' : 'Ativar sininho dos ciclos'}
              aria-pressed={state.timerPrefs.sound}
              title={state.timerPrefs.sound ? 'Sininho ligado ao terminar estudo ou pausa' : 'Sininho desligado. Clique para ativar e ouvir'}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-[#e0b88a] ${state.timerPrefs.sound ? 'bg-[#e0b88a]/15 text-[#e0b88a]' : 'text-[#d1beaa]/60'}`}
            >
              {state.timerPrefs.sound ? <Bell size={14} aria-hidden /> : <BellOff size={14} aria-hidden />}
            </button>
          </div>
          {resting && <div role="progressbar" aria-label="Progresso da pausa" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} className="mb-2 h-1 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-[#a6c5a2]" style={{ width: `${progress * 100}%` }} /></div>}
          <div className="flex items-center gap-1 border-t border-white/10 pt-1.5">
            <button type="button" onClick={running ? pause : start} aria-label={`${playLabel} Pomodoro`} className="flex h-8 flex-1 items-center justify-center gap-1 rounded-full bg-[#e0b88a] text-[10px] font-bold text-[#281b12] hover:bg-[#f0cda6]">
              {running ? <Pause size={12} /> : <Play size={12} />}{playLabel}
            </button>
            <button type="button" onClick={() => advancePhase(running)} aria-label="Pular fase do Pomodoro" title="Pular fase" className="rounded-full p-2 hover:bg-white/10"><SkipForward size={14} /></button>
            <button type="button" onClick={finish} aria-label="Finalizar Pomodoro e registrar" title="Finalizar e registrar" className="rounded-full p-2 hover:bg-white/10"><Square size={13} /></button>
            <button type="button" onClick={() => setMinimized(false)} aria-label="Expandir Pomodoro" title="Expandir" className="rounded-full p-2 hover:bg-white/10"><Maximize2 size={13} /></button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={preparePomodoro} className="absolute bottom-3 left-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/25 bg-[#201b16]/85 px-4 py-2 text-xs font-bold text-[#fff2d9] shadow-lg backdrop-blur hover:bg-[#201b16]">
          <Play size={13} />{active ? 'Ver relógio' : 'Preparar Pomodoro'}
        </button>
      )}
    </LofiScene>
  )
}
