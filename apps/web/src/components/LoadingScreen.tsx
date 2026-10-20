import { useEffect, useState } from 'react'
import { RefreshCcw } from 'lucide-react'
import { BrewingArt } from './cafe-art'

const STEPS = ['Abrindo seus planos…', 'Conferindo as revisões…', 'Montando o ciclo…', 'Arrumando a mesa…']

/** Tela de carregamento: o café vai sendo coado e a jarra enche enquanto os dados da conta chegam */
export function LoadingScreen({ error, onRetry }: { error?: string | null; onRetry?: () => void }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (error) return
    const t = setInterval(() => setTick((n) => n + 1), 900)
    return () => clearInterval(t)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center" aria-busy={!error}>
      {/* enche depressa no começo e cada vez mais devagar: numa espera longa, nunca esvazia de repente */}
      <BrewingArt level={error ? 0.15 : 0.12 + 0.82 * (1 - 0.82 ** tick)} className="h-44 w-40" />
      {error ? (
        <>
          <p className="font-display text-xl font-semibold">Não deu para carregar seus dados.</p>
          <p className="max-w-sm text-sm text-muted">{error}</p>
          {onRetry && (
            <button onClick={onRetry} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              <RefreshCcw size={14} /> Tentar de novo
            </button>
          )}
        </>
      ) : (
        <p className="font-display text-lg italic text-muted" role="status">
          {STEPS[Math.floor(tick / 2) % STEPS.length]}
        </p>
      )}
    </div>
  )
}
