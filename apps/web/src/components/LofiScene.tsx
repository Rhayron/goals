import { useRef, useState, type ReactNode } from 'react'
import { Pause, Play } from 'lucide-react'
import { clsx } from '../lib/utils'
import type { ArtProps } from './illustration-parts'
import { useLofiVideo } from './useLofiVideo'

const cover = '/illustrations/coado-lofi-cover.png'
const breakCover = '/illustrations/coado-lofi-break.png'

function ArtworkLayer({ resting, visible, paused, title }: { resting: boolean; visible: boolean; paused: boolean; title: string }) {
  const video = useRef<HTMLVideoElement>(null)
  const source = resting ? breakCover : cover
  const ready = useLofiVideo(video, visible, paused)
  return (
    <div className={clsx('absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none', visible ? 'opacity-100' : 'opacity-0')} aria-hidden={!visible}>
      <img src={source} width="1672" height="941" alt={title} className="block h-full w-full object-cover" fetchPriority={resting ? 'auto' : 'high'} />
      <video
        ref={video}
        src={`/illustrations/motion/${resting ? 'break' : 'study'}-loop.mp4?v=calm-cat-1`}
        poster={source}
        muted loop playsInline preload="none" disablePictureInPicture
        aria-hidden data-ready={ready}
        className={clsx('pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 motion-reduce:transition-none', ready ? 'opacity-100' : 'opacity-0')}
      />
    </div>
  )
}

export function LofiScene({
  className,
  title = 'Uma estudante escreve de fones, com café e um gato dormindo, diante de uma janela chuvosa',
  embedded = false,
  activity = 'study',
  withBreakScene = false,
  children,
}: ArtProps & { embedded?: boolean; activity?: 'study' | 'break'; withBreakScene?: boolean; children?: ReactNode }) {
  const [paused, setPaused] = useState(false)
  const resting = withBreakScene && activity === 'break'

  return (
    <div className={clsx('coado-room relative isolate overflow-hidden', !embedded && 'rounded-[1.5rem] border border-brand-700/20 shadow-xl', className)} data-paused={paused} data-activity={activity}>
      <div className="aspect-[1672/941]" />
      <ArtworkLayer resting={false} visible={!resting} paused={paused} title={title} />
      {withBreakScene && <ArtworkLayer resting visible={resting} paused={paused} title="Na pausa, a estudante descansa tomando café enquanto o gato dorme ao lado" />}
      {children}
      <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? 'Retomar animações do ambiente' : 'Pausar animações do ambiente'} className="coado-motion-control absolute right-3 top-3 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/20 bg-[#2b241e]/85 px-3 py-2 text-[10px] font-bold text-[#fff2d9] backdrop-blur transition hover:bg-[#2b241e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
        {paused ? <Play size={12} aria-hidden /> : <Pause size={12} aria-hidden />}
        {paused ? 'Retomar ambiente' : 'Pausar ambiente'}
      </button>
    </div>
  )
}
