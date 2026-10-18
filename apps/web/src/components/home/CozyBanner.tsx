import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { useStore } from '../../lib/store'
import { firstName, useMe } from '../../lib/auth'
import { constancy, cycleProgress, fmtMinutes, nextSessions, today } from '../../lib/utils'
import { PomodoroScene } from './PomodoroScene'

const greeting = () => {
  const h = new Date().getHours()
  if (h < 5) return 'Madrugada produtiva'
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

/** Faixa de boas-vindas no topo do Início: saudação, sequência e a próxima sessão do ciclo */
export function CozyBanner() {
  const { state, studies, reviews, planning, subjects, openTimer } = useStore()
  const me = useMe()
  const c = constancy(studies)
  const due = reviews.filter((r) => r.status === 'pending' && r.dueDate <= today()).length
  const next = planning ? nextSessions(planning, cycleProgress(planning, studies))[0] : undefined
  const nextSubject = next && subjects.find((s) => s.id === next.subjectId)

  const line =
    c.current > 0
      ? `Você estudou nos últimos ${c.current} ${c.current === 1 ? 'dia' : 'dias'}. Continue no seu ritmo.`
      : c.daysSinceLast === null
        ? 'Escolha uma matéria e registre o primeiro estudo quando terminar.'
        : `Faz ${c.daysSinceLast} ${c.daysSinceLast === 1 ? 'dia' : 'dias'} desde o último estudo. Retome por uma sessão curta.`

  return (
    <section className="mb-6 grid overflow-hidden rounded-2xl border border-line bg-surface shadow-sm xl:grid-cols-[.8fr_1.2fr]">
      <div className="min-w-0 self-center p-5 sm:p-6">
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">Seu espaço de estudo</p>
        <h2 className="font-display text-2xl font-bold">
          {greeting()}, {firstName(me.name)}.
        </h2>
        <p className="mt-1 text-sm text-muted">{line}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {nextSubject && (
            <button
              onClick={() => openTimer({ subjectId: nextSubject.id, topicId: next?.topicId })}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700"
            >
              <Play size={12} /> Próxima do ciclo: {nextSubject.name} · {fmtMinutes(next!.duration)}
              {next?.topicId && ` · ${state.topics.find((t) => t.id === next.topicId)?.name ?? ''}`}
            </button>
          )}
          {due > 0 && (
            <Link
              to="/revisoes"
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface-2"
            >
              {due} {due === 1 ? 'revisão pendente' : 'revisões pendentes'}
            </Link>
          )}
        </div>
      </div>
      <PomodoroScene />
    </section>
  )
}
