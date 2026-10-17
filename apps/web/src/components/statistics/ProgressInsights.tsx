import { Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, ProgressBar } from '../ui'
import { useStore } from '../../lib/store'
import { applyFilters, filterRange, type Filters } from '../charts/filters'
import { axisProps, gridProps, tooltipProps, BRAND } from '../charts/theme'
import { fmtDuration, parseDate, pct, toDateStr, today, WEEKDAYS_LONG } from '../../lib/utils'

export default function ProgressInsights({ filters }: { filters: Filters }) {
  const { state, subjects, studies } = useStore()
  const scoped = subjects.filter((s) => !filters.subjectId || s.id === filters.subjectId)
  const subjectIds = new Set(scoped.map((s) => s.id))
  const topics = state.topics.filter((t) => subjectIds.has(t.subjectId))
  const completed = topics
    .filter((t) => t.finished && t.finishedAt)
    .map((t) => ({ ...t, date: toDateStr(new Date(t.finishedAt!)) }))
    .sort((a, b) => a.date.localeCompare(b.date))
  const filtered = applyFilters(studies, filters)
  const range = filterRange(filters)
  const earliest = [...filtered.map((s) => s.date), ...completed.map((t) => t.date)].sort()[0] ?? today()
  const from = range.from ?? earliest,
    to = range.to ?? today()
  const months = new Map<string, { label: string; done: number; total: number }>()
  let accumulated = completed.filter((t) => t.date < from).length
  const monthlyCounts = new Map<string, number>()
  for (const t of completed.filter((t) => t.date >= from && t.date <= to)) {
    const key = t.date.slice(0, 7)
    monthlyCounts.set(key, (monthlyCounts.get(key) ?? 0) + 1)
  }
  // Inclui meses sem conclusão para não sugerir uma evolução contínua inexistente.
  const firstMonth = parseDate(`${from.slice(0, 7)}-01`)
  const lastMonth = to.slice(0, 7)
  for (let month = firstMonth; toDateStr(month).slice(0, 7) <= lastMonth; month = new Date(month.getFullYear(), month.getMonth() + 1, 1)) {
    const key = toDateStr(month).slice(0, 7),
      done = monthlyCounts.get(key) ?? 0
    accumulated += done
    months.set(key, { label: key.split('-').reverse().join('/'), done, total: accumulated })
  }
  const weekdays = WEEKDAYS_LONG.map((name, day) => ({ name: name.slice(0, 3), day, seconds: 0, count: 0 }))
  // Contagem aritmética: inclusive para filtros de vários anos, sem criar listas gigantes.
  const rhythmFrom = range.from ?? filtered.map((s) => s.date).sort()[0] ?? today()
  const start = parseDate(rhythmFrom),
    end = parseDate(to),
    days = Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)
  for (const d of weekdays) d.count = Math.floor(days / 7) + ((d.day - start.getDay() + 7) % 7 < days % 7 ? 1 : 0)
  for (const s of filtered) {
    if (s.date >= rhythmFrom && s.date <= to) weekdays[parseDate(s.date).getDay()].seconds += s.duration
  }
  const rhythm = [...weekdays.slice(1), weekdays[0]].map((d) => ({ ...d, hours: d.count ? d.seconds / d.count / 3600 : 0 }))
  return (
    <div className="mb-6 grid gap-5 lg:grid-cols-2">
      <Card title="Avanço no edital por disciplina">
        <div className="space-y-3">
          {scoped.map((s) => {
            const list = topics.filter((t) => t.subjectId === s.id),
              done = list.filter((t) => t.finished).length
            return (
              <div key={s.id}>
                <div className="mb-1 flex justify-between gap-2 text-sm">
                  <span>{s.name}</span>
                  <span>
                    {done}/{list.length} · {pct(done, list.length)}%
                  </span>
                </div>
                <ProgressBar value={pct(done, list.length)} color={s.color} />
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-muted">Situação atual do edital, independentemente do período.</p>
      </Card>
      <Card title="Ritmo por dia da semana">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rhythm}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={(v) => `${v}h`} />
              <Tooltip {...tooltipProps} formatter={(v) => [fmtDuration(Number(v) * 3600), 'Média por dia']} />
              <Bar dataKey="hours" fill={BRAND} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted">Média por ocorrência do dia no período; dias sem estudo entram na conta.</p>
      </Card>
      <Card title="Evolução do edital" className="lg:col-span-2">
        {completed.length && months.size ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={[...months.values()]}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} allowDecimals={false} />
                <Tooltip {...tooltipProps} />
                <Bar dataKey="done" name="Concluídos no mês" fill={BRAND} maxBarSize={40} />
                <Line dataKey="total" name="Acumulado" stroke="#4c8767" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted">
            Nenhuma conclusão datada neste período. Marque os tópicos estudados no edital para acompanhar a evolução.
          </p>
        )}
        <p className="mt-2 text-xs text-muted">
          Baseado na data de conclusão dos tópicos atualmente concluídos. Reabrir um tópico altera este gráfico; conclusões antigas sem data
          não entram. O filtro de categoria se aplica ao ritmo de estudo.
        </p>
      </Card>
    </div>
  )
}
