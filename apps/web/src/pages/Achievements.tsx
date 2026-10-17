import { useState } from 'react'
import { Award, Download, Lock } from 'lucide-react'
import { PageHeader } from '../components/Layout'
import { Button, Card, ProgressBar } from '../components/ui'
import { useStore } from '../lib/store'
import { useMe } from '../lib/auth'
import { achievements, type Achievement } from '../lib/achievements'
import { fmtDate } from '../lib/utils'

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!)
export default function Achievements() {
  const { state } = useStore(),
    me = useMe()
  const [filter, setFilter] = useState('all'),
    [timeline, setTimeline] = useState(false)
  const all = achievements(state),
    earned = all.filter((a) => a.unlocked)
  const closest = all.filter((a) => !a.unlocked).sort((a, b) => b.value / b.target - a.value / a.target)[0]
  let visible = all.filter((a) => filter === 'all' || (filter === 'earned' ? a.unlocked : !a.unlocked))
  if (timeline) visible = visible.filter((a) => a.unlocked).sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  function download(a: Achievement) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="600" viewBox="0 0 1000 600"><rect width="1000" height="600" rx="32" fill="#f8efe2"/><rect x="28" y="28" width="944" height="544" rx="24" fill="none" stroke="#865a38" stroke-width="3"/><g fill="#583821" text-anchor="middle" font-family="Georgia,serif"><text x="500" y="110" font-size="36">coado · conquistas</text><text x="500" y="240" font-size="44">${escape(a.title)}</text><text x="500" y="320" font-size="28">${escape(me.name)}</text><text x="500" y="400" font-size="24">${a.target} ${escape(a.unit)}</text><text x="500" y="490" font-size="20">${a.date ? escape(fmtDate(a.date)) : 'Conquista desbloqueada'} · um gole por vez</text></g></svg>`
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `coado-conquista-${a.target}.svg`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <>
      <PageHeader title="Conquistas" hidePlan />
      <div className="mb-6 rounded-2xl bg-kraft/50 p-6">
        <Award size={36} className="mb-3 text-brand-600" />
        <h2 className="font-display text-2xl font-bold">Sua coleção de bons hábitos</h2>
        <p className="mt-2">
          {earned.length} de {all.length} conquistas · cada sessão conta.
        </p>
        <ProgressBar value={(earned.length / all.length) * 100} className="mt-3" />
        {closest && (
          <p className="mt-3 text-sm text-muted">
            Próxima da coleção: <strong>{closest.title}</strong> · faltam{' '}
            {Math.max(0, closest.target - closest.value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} {closest.unit}.
          </p>
        )}
      </div>
      <div className="mb-5 flex flex-wrap gap-3">
        <select aria-label="Filtrar conquistas" className="field w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todas</option>
          <option value="earned">Conquistadas</option>
          <option value="pending">Em progresso</option>
        </select>
        <Button variant="secondary" onClick={() => setTimeline(!timeline)}>
          {timeline ? 'Ver coleção' : 'Ver linha do tempo'}
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((a) => (
          <Card key={a.id} className={a.unlocked ? 'border-brand-300' : 'opacity-80'}>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted">{a.category}</span>
              {a.unlocked ? <Award className="text-brand-600" /> : <Lock size={18} className="text-muted" />}
            </div>
            <h3 className="mt-3 font-display text-xl font-bold">{a.title}</h3>
            <p className="mt-1 text-sm">
              {a.target} {a.unit}
            </p>
            <ProgressBar className="my-3" value={Math.min(100, (a.value / a.target) * 100)} />
            <p className="text-xs text-muted">
              {a.unlocked
                ? a.date
                  ? `Conquistada em ${fmtDate(a.date)}`
                  : 'Conquistada'
                : `${Math.min(a.value, a.target).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} / ${a.target}`}
            </p>
            {a.unlocked && (
              <Button className="mt-3" variant="ghost" size="sm" onClick={() => download(a)}>
                <Download size={14} />
                Baixar cartão
              </Button>
            )}
          </Card>
        ))}
      </div>
      {!visible.length && <p className="py-8 text-center text-muted">Nenhuma conquista neste filtro ainda.</p>}
      <p className="mt-5 text-xs text-muted">
        A coleção considera todos os seus planos e é recalculada quando registros são editados ou removidos.
      </p>
    </>
  )
}
