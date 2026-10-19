import { useState, type FormEvent } from 'react'
import { Info, Plus, X } from 'lucide-react'
import { Button, Card } from './ui'
import { useStore } from '../lib/store'
import { BRAND } from '../lib/brand'

const intervalLabel = (n: number) => (n === 1 ? '24h' : `${n} dias`)

export function ReviewIntervalsSection() {
  const { state, update } = useStore()
  const [value, setValue] = useState('')
  const intervals = state.reviewIntervals

  const save = (next: number[]) => update((s) => ({ ...s, reviewIntervals: [...new Set(next)].sort((a, b) => a - b) }))

  const add = (e: FormEvent) => {
    e.preventDefault()
    const n = Math.round(Number(value))
    if (n >= 1 && n <= 3650 && intervals.length < 30) save([...intervals, n])
    setValue('')
  }

  return (
    <Card title="Revisão espaçada" className="self-start">
      <div className="flex gap-3 text-sm text-muted">
        <Info size={18} className="mt-0.5 shrink-0 text-brand-500" />
        <p>
          Revisar o conteúdo em intervalos crescentes combate a curva do esquecimento e fixa a matéria na memória de longo prazo. Ao
          marcar a opção de agendar revisões no registro de estudo, o {BRAND} usa os intervalos abaixo. Alterações valem para novos agendamentos.
        </p>
      </div>

      <p className="label mt-5">Intervalos padrão</p>
      <div className="flex flex-wrap gap-2">
        {intervals.length === 0 && <span className="text-sm text-muted">Nenhum intervalo definido.</span>}
        {intervals.map((n) => (
          <span key={n} className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1 text-sm font-medium text-brand-700 dark:bg-brand-600/15 dark:text-brand-300">
            {intervalLabel(n)}
            <button
              onClick={() => save(intervals.filter((x) => x !== n))}
              className="rounded-full p-0.5 hover:bg-brand-100 dark:hover:bg-brand-600/30"
              aria-label={`Remover intervalo de ${intervalLabel(n)}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <form onSubmit={add} className="mt-3 flex gap-2">
        <input
          type="number"
          min={1}
          max={3650}
          className="field"
          placeholder="Dias (ex.: 15)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Novo intervalo em dias"
        />
        <Button type="submit" variant="secondary" disabled={!(Number(value) >= 1 && Number(value) <= 3650) || intervals.length >= 30}>
          <Plus size={14} /> Adicionar
        </Button>
      </form>
    </Card>
  )
}
