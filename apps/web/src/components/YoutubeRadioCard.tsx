import { useEffect, useRef, useState } from 'react'
import { CloudMoon, Coffee, ExternalLink, Headphones, Leaf, Moon, Music2, Play, X, Youtube } from 'lucide-react'
import { useRadio } from '../lib/radio-context'
import { useFrases } from '../lib/frases'
import { clsx } from '../lib/utils'

// Transmissões dos canais @LofiGirl e @ChillhopMusic, conferidas em 17/10/2026.
const STATIONS = [
  { videoId: 'rFZHOHl-L8A', name: 'Lofi Girl', channel: 'Lofi Girl', subtitle: 'Beats para estudar', description: 'Lofi hip hop para acompanhar o café, a leitura e mais um capítulo.', icon: Coffee },
  { videoId: '4xDzrJKXOOY', name: 'Synthwave', channel: 'Lofi Girl', subtitle: 'Foco pela madrugada', description: 'Sintetizadores e uma atmosfera noturna para entrar no ritmo.', icon: Moon },
  { videoId: '5yx6BWlEVcY', name: 'Chillhop Radio', channel: 'Chillhop Music', subtitle: 'Jazz e hip hop suave', description: 'Batidas instrumentais e jazz para deixar a sessão de estudos mais leve.', icon: Headphones },
  { videoId: 'E2vONfzoyRI', name: 'Jazz Lofi', channel: 'Lofi Girl', subtitle: 'Clima de cafeteria', description: 'Jazz e lo-fi para acompanhar uma pausa, uma leitura ou um café demorado.', icon: Music2 },
  { videoId: '1Tl2FtV06qo', name: 'Asian Lofi', channel: 'Lofi Girl', subtitle: 'Melodias do Oriente', description: 'Melodias de inspiração asiática e batidas tranquilas para estudar.', icon: Leaf },
  { videoId: 'VAlMDl00mYY', name: 'Sleep Lofi', channel: 'Lofi Girl', subtitle: 'Desacelerar e relaxar', description: 'Uma seleção calma para reduzir o ritmo depois dos estudos.', icon: CloudMoon },
] as const

/** The iframe is removed when hidden, so YouTube never becomes an audio-only player. */
function YoutubeStream({ videoId, title }: { videoId: string; title: string }) {
  const container = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [pageVisible, setPageVisible] = useState(!document.hidden)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    if (container.current) observer.observe(container.current)
    const onVisibility = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div ref={container} className="aspect-video min-h-[200px] w-full bg-black">
      {inView && pageVisible ? (
        <iframe
          key={videoId}
          src={`https://www.youtube.com/embed/${videoId}?playsinline=1&autoplay=0`}
          title={`Rádio ${title} no YouTube`}
          className="h-full min-h-[200px] w-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <div className="flex h-full min-h-[200px] items-center justify-center px-6 text-center text-sm text-white/70">
          Volte ao vídeo para dar play na rádio.
        </div>
      )}
    </div>
  )
}

export function YoutubeRadioCard() {
  const frases = useFrases()
  const { youtubeVideoId, selectYoutube, trackCount, toggle } = useRadio()
  const station = STATIONS.find((item) => item.videoId === youtubeVideoId)

  return (
    <section aria-labelledby="youtube-radio-heading" className="mb-6 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-kraft text-brand-700 dark:text-brand-300">
            <Headphones size={22} aria-hidden />
          </span>
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
              <Youtube size={14} className="text-red-600 dark:text-red-400" aria-hidden /> Rádios do YouTube · {STATIONS.length} estações
            </div>
            <h2 id="youtube-radio-heading" className="font-display text-lg font-semibold">{frases.radio}</h2>
          </div>
          {station && (
            <button type="button" onClick={() => selectYoutube(null)} aria-label="Fechar rádio do YouTube" title="Fechar rádio do YouTube" className="ml-auto rounded-full p-2 text-muted hover:bg-surface-2 hover:text-ink">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Escolher rádio do YouTube">
            {STATIONS.map(({ videoId, name, subtitle, icon: Icon }) => (
              <button
                key={videoId}
                type="button"
                onClick={() => selectYoutube(videoId)}
                aria-pressed={youtubeVideoId === videoId}
                aria-controls="youtube-radio-player"
                className={clsx(
                  'flex min-w-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
                  youtubeVideoId === videoId ? 'border-brand-400 bg-brand-50 text-brand-800 dark:bg-brand-600/15 dark:text-brand-200' : 'border-line bg-surface-2/50 text-ink hover:border-brand-300 hover:bg-surface-2',
                )}
              >
                <Icon size={18} className="hidden shrink-0 text-brand-500 sm:block" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{name}</span>
                  <span className="block text-[11px] text-muted">{subtitle}</span>
                </span>
                <Play size={13} className="shrink-0 text-brand-500" aria-hidden />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div id="youtube-radio-player">
        {station && (
          <div className="grid gap-4 border-t border-line bg-surface-2/40 p-4 sm:p-5 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:items-center motion-safe:animate-rise">
            <YoutubeStream videoId={station.videoId} title={station.name} />
            <div className="space-y-3 md:px-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{station.channel} · canal oficial</p>
              <h3 className="font-display text-xl font-semibold">{station.subtitle}</h3>
              <p className="text-sm leading-relaxed text-muted">{station.description} Dê play no vídeo para ouvir.</p>
              <a href={`https://www.youtube.com/watch?v=${station.videoId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline dark:text-brand-300">
                Abrir no YouTube <ExternalLink size={13} aria-hidden />
              </a>
              <div className="border-t border-line pt-3">
                <p className="mb-2 text-xs leading-relaxed text-muted">Para continuar ouvindo ao rolar a página ou trocar de aba, use o disco do Coado.</p>
                <button type="button" onClick={toggle} className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-bold text-ink transition-colors hover:bg-surface-2">
                  <Headphones size={14} aria-hidden /> Ouvir Rádio Coado · {trackCount} faixas
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
