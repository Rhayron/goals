import { useEffect, useRef, useState, type ReactNode } from 'react'
import { RadioContext, type RadioStatus } from './radio-context'

const TRACKS = [
  { title: 'Tokyo Sunset', src: '/radio/tokyo-sunset.mp3' },
  { title: 'Moon Unit', src: '/radio/moon-unit.mp3' },
  { title: 'Bubbles', src: '/radio/bubbles.mp3' },
  { title: 'Complicated Feelings', src: '/radio/complicated-feelings.mp3' },
  { title: 'Ease into Night', src: '/radio/ease-into-night.mp3' },
  { title: 'Calm Currents', src: '/radio/calm-currents.mp3' },
  { title: 'Tranquil Mindscape', src: '/radio/tranquil-mindscape.mp3' },
  { title: 'Peaceful Drift', src: '/radio/peaceful-drift.mp3' },
  { title: 'Saturation', src: '/radio/saturation.mp3' },
  { title: 'Wetlands', src: '/radio/wetlands.mp3' },
  { title: 'One Night in France', src: '/radio/one-night-in-france.mp3' },
  { title: 'Infinite Echoes', src: '/radio/infinite-echoes.mp3' },
  { title: 'Birds', src: '/radio/birds.mp3' },
  { title: 'Still Life', src: '/radio/still-life.mp3' },
  { title: 'Lucid', src: '/radio/lucid.mp3' },
  { title: 'Waiting Around', src: '/radio/waiting-around.mp3' },
  { title: 'Doodles', src: '/radio/doodles.mp3' },
  { title: 'Theta Frequency', src: '/radio/theta-frequency.mp3' },
  { title: 'Reminders', src: '/radio/reminders.mp3' },
  { title: 'Shimmer', src: '/radio/shimmer.mp3' },
  { title: 'Down Time', src: '/radio/down-time.mp3' },
  { title: 'Warm Fuzz', src: '/radio/warm-fuzz.mp3' },
  { title: 'Ocean Breeze', src: '/radio/ocean-breeze.mp3' },
  { title: 'Into the Mist', src: '/radio/into-the-mist.mp3' },
] as const

export function RadioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const wantsPlayback = useRef(false)
  const [index, setIndex] = useState(0)
  const [status, setStatus] = useState<RadioStatus>('idle')
  const [volume, setVolume] = useState(0.65)
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null)

  const selectYoutube = (videoId: string | null) => {
    if (videoId) {
      wantsPlayback.current = false
      audioRef.current?.pause()
      setStatus((current) => current === 'idle' ? current : 'paused')
    }
    setYoutubeVideoId(videoId)
  }

  const play = (audio: HTMLAudioElement) => {
    setStatus('loading')
    void audio.play().catch((error: unknown) => {
      if (!wantsPlayback.current || (error instanceof DOMException && error.name === 'AbortError')) return
      wantsPlayback.current = false
      setStatus('error')
    })
  }

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (wantsPlayback.current) {
      wantsPlayback.current = false
      audio.pause()
      setStatus('paused')
    } else {
      setYoutubeVideoId(null)
      wantsPlayback.current = true
      play(audio)
    }
  }

  const next = () => {
    if (status === 'error') {
      setYoutubeVideoId(null)
      wantsPlayback.current = true
    }
    setIndex((current) => (current + 1) % TRACKS.length)
  }

  useEffect(() => {
    const audio = audioRef.current
    if (audio && wantsPlayback.current) play(audio)
  }, [index])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  return (
    <RadioContext.Provider value={{ track: TRACKS[index], trackNumber: index + 1, trackCount: TRACKS.length, status, volume, toggle, next, setVolume, youtubeVideoId, selectYoutube }}>
      {children}
      <audio
        ref={audioRef}
        src={TRACKS[index].src}
        preload="none"
        onPlaying={() => setStatus('playing')}
        onWaiting={() => { if (wantsPlayback.current) setStatus('loading') }}
        onEnded={next}
        onError={() => {
          wantsPlayback.current = false
          setStatus('error')
        }}
      />
    </RadioContext.Provider>
  )
}
