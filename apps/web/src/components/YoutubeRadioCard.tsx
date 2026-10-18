import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, ChevronDown, CloudMoon, ExternalLink, Headphones, Leaf, Moon, Music2, Play, X, Youtube } from 'lucide-react'
import { useRadio } from '../lib/radio-context'
import { useTimerSession } from '../lib/timer-session'
import { useStore } from '../lib/store'
import { clsx } from '../lib/utils'

const CARD_SLOT = 'youtube-radio-slot'
const MINI_SLOT = 'youtube-mini-slot'

// Transmissões dos canais @LofiGirl e @ChillhopMusic, conferidas em 17/10/2026.
const STATIONS = [
  { videoId: 'rFZHOHl-L8A', name: 'Lofi Girl', channel: 'Lofi Girl', subtitle: 'Beats para estudar', description: 'Lofi hip hop para acompanhar a leitura e mais um capítulo.', icon: BookOpen },
  { videoId: '4xDzrJKXOOY', name: 'Synthwave', channel: 'Lofi Girl', subtitle: 'Foco pela madrugada', description: 'Sintetizadores e uma atmosfera noturna para entrar no ritmo.', icon: Moon },
  { videoId: '5yx6BWlEVcY', name: 'Chillhop Radio', channel: 'Chillhop Music', subtitle: 'Jazz e hip hop suave', description: 'Batidas instrumentais e jazz para deixar a sessão de estudos mais leve.', icon: Headphones },
  { videoId: 'E2vONfzoyRI', name: 'Jazz Lofi', channel: 'Lofi Girl', subtitle: 'Clima de cafeteria', description: 'Jazz e lo-fi para acompanhar uma pausa, uma leitura ou um café demorado.', icon: Music2 },
  { videoId: '1Tl2FtV06qo', name: 'Asian Lofi', channel: 'Lofi Girl', subtitle: 'Melodias do Oriente', description: 'Melodias de inspiração asiática e batidas tranquilas para estudar.', icon: Leaf },
  { videoId: 'VAlMDl00mYY', name: 'Sleep Lofi', channel: 'Lofi Girl', subtitle: 'Desacelerar e relaxar', description: 'Uma seleção calma para reduzir o ritmo depois dos estudos.', icon: CloudMoon },
] as const

export function youtubeStation(videoId: string | null) {
  return STATIONS.find((item) => item.videoId === videoId) ?? null
}

/** Preserve o iframe ao rolar, recolher o card ou trocar de aba. */
function YoutubeStream({ videoId, title }: { videoId: string; title: string }) {
  return (
    <div className="aspect-video min-h-[120px] w-full bg-black">
      <iframe
        key={videoId}
        src={`https://www.youtube.com/embed/${videoId}?playsinline=1&autoplay=0`}
        title={`Rádio ${title} no YouTube`}
        className="h-full min-h-[120px] w-full border-0"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  )
}

/** Um iframe só. No pomodoro em tela cheia ele vai para o canto. Fora disso, fica no card. */
export function YoutubePlayerDock() {
  const { youtubeVideoId, status } = useRadio()
  const { timer } = useStore()
  const { minimized } = useTimerSession()
  const station = youtubeStation(youtubeVideoId)
  const coadoOn = status === 'playing' || status === 'loading'
  const onTimer = !!timer && !minimized && !!station && !coadoOn
  const [slot, setSlot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const id = onTimer ? MINI_SLOT : CARD_SLOT
    setSlot(document.getElementById(id))
  }, [onTimer, youtubeVideoId])

  if (!station || !slot) return null
  return createPortal(<YoutubeStream videoId={station.videoId} title={station.name} />, slot)
}

export function YoutubeMiniSlot() {
  const { youtubeVideoId, status, selectYoutube } = useRadio()
  const station = youtubeStation(youtubeVideoId)
  const coadoOn = status === 'playing' || status === 'loading'
  if (!station || coadoOn) return null
  return (
    <div className="relative z-10 m-4 mt-auto w-[calc(100%-2rem)] max-w-72 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-black/50 sm:absolute sm:bottom-4 sm:left-4 sm:m-0 sm:w-72">
      <div id={MINI_SLOT} />
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">{station.channel}</p>
          <p className="truncate text-sm font-semibold">{station.name}</p>
        </div>
        <button type="button" onClick={() => selectYoutube(null)} aria-label="Fechar canal" title="Fechar canal" className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export function YoutubeRadioCard() {
  const { youtubeVideoId, selectYoutube, trackCount, toggle, status } = useRadio()
  const { timer } = useStore()
  const { minimized } = useTimerSession()
  const [open, setOpen] = useState(false)
  const station = youtubeStation(youtubeVideoId)
  const coadoOn = status === 'playing' || status === 'loading'
  const onTimer = !!timer && !minimized && !!station && !coadoOn

  return (
    <section aria-labelledby="youtube-radio-heading" className="mb-6 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="flex items-center gap-3 p-4 sm:p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-kraft text-brand-700 dark:text-brand-300">
          <Headphones size={22} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            <Youtube size={14} className="text-red-600 dark:text-red-400" aria-hidden /> Rádios do YouTube · {STATIONS.length} estações
          </div>
          <h2 id="youtube-radio-heading" className="font-display text-lg font-semibold">
            {station && !open ? station.name : 'Trilhas para ler e estudar.'}
          </h2>
          {station && !open && <p className="truncate text-xs text-muted">{station.subtitle}</p>}
        </div>
        {station && (
          <button type="button" onClick={() => selectYoutube(null)} aria-label="Fechar rádio do YouTube" title="Fechar rádio do YouTube" className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-ink">
            <X size={18} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="youtube-radio-stations youtube-radio-player"
          className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-ink"
        >
          <ChevronDown size={18} className={clsx('transition', open && 'rotate-180')} aria-hidden />
          <span className="sr-only">{open ? 'Recolher rádio do YouTube' : 'Expandir rádio do YouTube'}</span>
        </button>
      </div>

      {open && (
        <div id="youtube-radio-stations" className="px-4 pb-4 sm:px-5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Escolher rádio do YouTube">
            {STATIONS.map(({ videoId, name, subtitle, icon: StationIcon }) => (
              <button
                key={videoId}
                type="button"
                onClick={() => selectYoutube(videoId)}
                aria-pressed={youtubeVideoId === videoId}
                className={clsx(
                  'flex min-w-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
                  youtubeVideoId === videoId ? 'border-brand-400 bg-brand-50 text-brand-800 dark:bg-brand-600/15 dark:text-brand-200' : 'border-line bg-surface-2/50 text-ink hover:border-brand-300 hover:bg-surface-2',
                )}
              >
                <StationIcon size={18} className="hidden shrink-0 text-brand-500 sm:block" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{name}</span>
                  <span className="block text-[11px] text-muted">{subtitle}</span>
                </span>
                <Play size={13} className="shrink-0 text-brand-500" aria-hidden />
              </button>
            ))}
          </div>
        </div>
      )}

      {station && !onTimer && (
        <div id="youtube-radio-player" hidden={!open} className="border-t border-line bg-surface-2/40 p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:items-center">
            <div id={CARD_SLOT} />
            {open && (
              <div className="space-y-3 md:px-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{station.channel} · canal oficial</p>
                <h3 className="font-display text-xl font-semibold">{station.subtitle}</h3>
                <p className="text-sm leading-relaxed text-muted">{station.description} Dê play no vídeo para ouvir.</p>
                <a href={`https://www.youtube.com/watch?v=${station.videoId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline dark:text-brand-300">
                  Abrir no YouTube <ExternalLink size={13} aria-hidden />
                </a>
                <div className="border-t border-line pt-3">
                  <p className="mb-2 text-xs leading-relaxed text-muted">Prefere uma trilha instrumental? Use o disco do Coado.</p>
                  <button type="button" onClick={toggle} className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-bold text-ink transition-colors hover:bg-surface-2">
                    <Headphones size={14} aria-hidden /> Ouvir Rádio Coado · {trackCount} faixas
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
