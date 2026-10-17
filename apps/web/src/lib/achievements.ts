import type { AppState } from '@coado/shared'
import { addDays, studyPages, today } from './utils'
export interface Achievement {
  id: string
  title: string
  category: string
  unit: string
  target: number
  value: number
  unlocked: boolean
  date?: string
}
export function achievements(state: AppState): Achievement[] {
  const cutoff = today()
  const studies = [...state.studies].filter((s) => s.date <= cutoff).sort((a, b) => a.date.localeCompare(b.date))
  const days = [...new Set(studies.map((s) => s.date))]
  let run = 0,
    previous = '',
    record = 0
  const streaks = days.map((date) => {
    run = previous && addDays(previous, 1) === date ? run + 1 : 1
    previous = date
    record = Math.max(record, run)
    return { date, value: record }
  })
  const series = (values: { date: string; value: number }[]) => {
    let n = 0
    return values.sort((a, b) => a.date.localeCompare(b.date)).map((x) => ({ date: x.date, value: (n += x.value) }))
  }
  const time = series(studies.map((s) => ({ date: s.date, value: s.duration / 3600 })))
  const questions = series(studies.map((s) => ({ date: s.date, value: s.hits + s.misses })))
  const pages = series(studies.map((s) => ({ date: s.date, value: studyPages(s) })))
  const reviews = series(state.reviews.filter((r) => r.status === 'done').map((r) => ({ date: r.doneAt?.slice(0, 10) ?? '', value: 1 })))
  const exams = series(state.exams.filter((e) => e.date <= cutoff).map((e) => ({ date: e.date, value: 1 })))
  const result: Achievement[] = []
  function track(category: string, unit: string, values: { date: string; value: number }[], goals: [number, string][]) {
    for (const [target, title] of goals) {
      const value = values[values.length - 1]?.value ?? 0
      result.push({
        id: `${category}-${target}`,
        title,
        category,
        unit: target === 1 ? ({ horas: 'hora', revisões: 'revisão', simulados: 'simulado' }[unit] ?? unit) : unit,
        target,
        value,
        unlocked: value >= target,
        date: values.find((v) => v.value >= target)?.date || undefined,
      })
    }
  }
  track('Constância', 'dias seguidos', streaks, [
    [3, 'Primeira moagem'],
    [7, 'Café de toda semana'],
    [30, 'Ritual da casa'],
    [100, 'Barista da constância'],
  ])
  track('Tempo', 'horas', time, [
    [1, 'Primeira xícara'],
    [10, 'Café passado'],
    [50, 'Reserva especial'],
    [100, 'Mestre da torra'],
  ])
  track('Questões', 'questões', questions, [
    [50, 'Primeiros grãos'],
    [250, 'Moagem fina'],
    [1000, 'Extração perfeita'],
  ])
  track('Leitura', 'páginas', pages, [
    [50, 'Livro na mesa'],
    [250, 'Estante da cafeteria'],
    [1000, 'Biblioteca de sabores'],
  ])
  track('Revisões', 'revisões', reviews, [
    [1, 'Mais um gole'],
    [10, 'Sabor que fica'],
    [50, 'Memória encorpada'],
  ])
  track('Simulados', 'simulados', exams, [
    [1, 'Prova do café'],
    [5, 'Degustador'],
    [10, 'Especialista da casa'],
  ])
  return result
}
