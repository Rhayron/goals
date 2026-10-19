import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { useStore } from '../../lib/store'
import { firstName, useMe } from '../../lib/auth'
import { constancy, cycleProgress, nextSessions, today } from '../../lib/utils'
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
  const { studies, reviews, planning, subjects, openTimer } = useStore()
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
    <section className="mb-3 grid overflow-hidden rounded-2xl border border-line bg-surface shadow-sm xl:grid-cols-[.8fr_1.2fr]">
      <div className="flex min-w-0 flex-col p-4 sm:p-5">
        <p className="text-left text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">Seu espaço de estudos</p>
        <div className="flex flex-1 flex-col justify-center py-4">
          <h2 className="font-display text-2xl font-bold">
            {greeting()}, {firstName(me.name)}.
          </h2>
          <p className="mt-1 text-sm text-muted">{line}</p>
          <div className={`mt-3 grid gap-4 text-sm ${nextSubject && due > 0 ? 'sm:grid-cols-2' : ''}`}>
            {nextSubject && (
              <button
                onClick={() => openTimer({ subjectId: nextSubject.id, topicId: next?.topicId })}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-transparent bg-brand-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-brand-700"
              >
                <Play size={12} className="shrink-0" /> Próximo ciclo: {nextSubject.name}
              </button>
            )}
            {due > 0 && (
              <Link
                to="/revisoes"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-line bg-surface px-3 py-2 text-center text-xs font-semibold text-ink hover:bg-surface-2"
              >
                {due} {due === 1 ? 'revisão pendente' : 'revisões pendentes'}
              </Link>
            )}
          </div>
        </div>
      </div>
      <PomodoroScene />
    </section>
  )
}
