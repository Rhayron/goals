import { createContext, useContext } from 'react'

export type RadioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'
export type Radio = {
  track: { title: string; src: string }
  status: RadioStatus
  volume: number
  trackNumber: number
  trackCount: number
  youtubeVideoId: string | null
  selectYoutube: (videoId: string | null) => void
  toggle: () => void
  next: () => void
  setVolume: (volume: number) => void
}

export const RadioContext = createContext<Radio | null>(null)

export function useRadio() {
  const radio = useContext(RadioContext)
  if (!radio) throw new Error('RadioProvider ausente')
  return radio
}
