import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Pause, Play, SkipForward, Volume2 } from 'lucide-react'
import { VinylArt } from './cafe-art'
import { useRadio } from '../lib/radio-context'
import { clsx } from '../lib/utils'

export function RadioPlayer({ className, compact = false, collapsible = false }: { className?: string; compact?: boolean; collapsible?: boolean }) {
  const { track, trackNumber, trackCount, status, volume, toggle, next, setVolume } = useRadio()
  const [expanded, setExpanded] = useState(false)
  const playerRef = useRef<HTMLDivElement>(null)
  const collapseTimer = useRef<number | null>(null)
  const collapseArmed = useRef(false)
  const active = status === 'playing' || status === 'loading'

  const clearCollapseTimer = () => {
    if (collapseTimer.current !== null) window.clearTimeout(collapseTimer.current)
    collapseTimer.current = null
  }

  useEffect(() => () => {
    if (collapseTimer.current !== null) window.clearTimeout(collapseTimer.current)
  }, [])

  const scheduleCollapse = (pointerLeft = false) => {
    clearCollapseTimer()
    if (!collapseArmed.current) return
    if (!pointerLeft && window.matchMedia('(hover: hover)').matches && playerRef.current?.matches(':hover')) return
    collapseTimer.current = window.setTimeout(() => {
      setExpanded(false)
      collapseArmed.current = false
      collapseTimer.current = null
    }, 3000)
  }

  const togglePlayback = () => {
    toggle()
    if (!collapsible) return
    collapseArmed.current = true
    scheduleCollapse()
  }

  const panel = (
    <div
      ref={playerRef}
      onPointerEnter={collapsible ? clearCollapseTimer : undefined}
      onPointerLeave={collapsible ? () => scheduleCollapse(true) : undefined}
      inert={collapsible && !expanded}
      aria-hidden={collapsible && !expanded}
      data-expanded={collapsible ? expanded : undefined}
      className={clsx(
        'rounded-2xl border border-line/70 p-3 text-ink shadow-md',
        collapsible ? 'radio-panel absolute bottom-0 left-0 w-[calc(100vw-6rem)] max-w-[360px] bg-surface/95' : 'bg-surface/90 backdrop-blur',
        collapsible && !expanded && 'pointer-events-none',
        !collapsible && className,
      )}
    >
      <div className={collapsible ? 'radio-panel-content' : undefined}>
        <div className="flex items-center gap-3">
          <VinylArt className={compact ? 'h-10 w-10 shrink-0' : 'h-12 w-12 shrink-0'} spinning={status === 'playing'} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">rádio coado · lofi</p>
            <p className="truncate font-display text-sm font-semibold" aria-live="polite">{track.title}</p>
            <a
              href="https://freemusicarchive.org/music/holiznacc0/public-domain-lofi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-muted underline-offset-2 hover:text-brand-600 hover:underline"
            >
              HoliznaCC0 · CC0
            </a>
          </div>
          {collapsible && (
            <button
              type="button"
              onClick={() => { clearCollapseTimer(); collapseArmed.current = false; setExpanded(false) }}
              aria-label="Recolher rádio"
              title="Recolher rádio"
              className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-600"
            >
              <ChevronDown size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={togglePlayback}
            aria-label={active ? 'Pausar rádio' : 'Tocar rádio'}
            title={active ? 'Pausar rádio' : 'Tocar rádio'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            {active ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2 border-t border-line/70 pt-2">
          <span className="min-w-0 flex-1 truncate text-[11px] text-muted" role="status">
            {status === 'error' ? 'Não foi possível tocar. Tente outra faixa.' : status === 'loading' ? 'Preparando o café…' : `${status === 'playing' ? 'Tocando' : 'Faixa'} ${trackNumber} de ${trackCount}`}
          </span>
          <button type="button" onClick={next} aria-label="Próxima faixa" title="Próxima faixa" className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-ink">
            <SkipForward size={16} />
          </button>
          <Volume2 size={15} className="shrink-0 text-muted" aria-hidden />
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(volume * 100)}
            onChange={(event) => setVolume(Number(event.target.value) / 100)}
            aria-label="Volume da rádio"
            className="w-16 accent-brand-600 sm:w-20"
          />
        </div>
      </div>
    </div>
  )

  if (!collapsible) return panel

  return (
    <div className={className}>
      <div className="relative h-14 w-14">
        <button
          type="button"
          onClick={() => { clearCollapseTimer(); collapseArmed.current = false; setExpanded(true) }}
          aria-label={`Abrir rádio, ${status === 'playing' ? `tocando ${track.title}` : 'pausada'}`}
          aria-expanded={expanded}
          aria-hidden={expanded}
          inert={expanded}
          tabIndex={expanded ? -1 : 0}
          data-expanded={expanded}
          title="Abrir rádio"
          className={clsx(
            'radio-disc absolute inset-0 z-10 rounded-full shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
            expanded && 'pointer-events-none',
          )}
        >
          <VinylArt className="h-14 w-14" spinning={status === 'playing'} />
        </button>
        {panel}
      </div>
    </div>
  )
}
