import { useEffect, useState } from 'react'
import { RefreshCcw } from 'lucide-react'
import { FillingCup } from './cafe-art'

const STEPS = ['Moendo os grãos…', 'Aquecendo a água…', 'Passando o café…', 'Arrumando sua mesa…']

/** Tela de carregamento: a xícara vai enchendo enquanto os dados da conta chegam */
export function BrewingScreen({ error, onRetry }: { error?: string | null; onRetry?: () => void }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (error) return
    const t = setInterval(() => setTick((n) => n + 1), 900)
    return () => clearInterval(t)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center" aria-busy={!error}>
      <FillingCup level={error ? 0.15 : ((tick % 5) + 1) / 5} className="h-28 w-28" />
      {error ? (
        <>
          <p className="font-display text-xl font-semibold">O café esfriou no caminho.</p>
          <p className="max-w-sm text-sm text-muted">{error}</p>
          {onRetry && (
            <button onClick={onRetry} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              <RefreshCcw size={14} /> Passar outro
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
