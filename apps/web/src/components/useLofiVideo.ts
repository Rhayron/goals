import { useEffect, useRef, useState, type RefObject } from 'react'

/** Only the visible scene plays; manual pause preserves the current frame. */
export function useLofiVideo(ref: RefObject<HTMLVideoElement | null>, active: boolean, paused: boolean) {
  const [ready, setReady] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const playback = useRef({ active, paused })
  const syncRef = useRef<() => void>(() => {})

  useEffect(() => {
    playback.current = { active, paused }
    syncRef.current()
  }, [active, paused])

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    let inView = false
    let disposed = false
    let failed = false
    let playPending = false
    let resync = false

    const canPlay = () => !disposed && !failed && inView && playback.current.active && !playback.current.paused && !preference.matches && !document.hidden
    const sync = () => {
      if (playPending) {
        resync = true
        if (!canPlay()) video.pause()
        return
      }
      if (!canPlay()) { video.pause(); return }
      if (!video.paused) return
      playPending = true
      resync = false
      video.play().then(() => {
        if (!canPlay()) video.pause()
      }).catch(() => {
        // A static poster remains visible when autoplay or decoding is unavailable.
      }).finally(() => {
        playPending = false
        if (resync) sync()
      })
    }
    syncRef.current = sync
    const loaded = () => { setReady(true); sync() }
    const error = () => { failed = true; setReady(false); video.pause() }
    const preferenceChanged = () => { setReducedMotion(preference.matches); sync() }
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync() })
    video.muted = true
    video.defaultMuted = true
    observer.observe(video)
    video.addEventListener('loadeddata', loaded)
    video.addEventListener('error', error)
    document.addEventListener('visibilitychange', sync)
    preference.addEventListener('change', preferenceChanged)
    preferenceChanged()
    if (video.readyState >= 2) loaded()

    return () => {
      disposed = true
      syncRef.current = () => {}
      video.pause()
      observer.disconnect()
      video.removeEventListener('loadeddata', loaded)
      video.removeEventListener('error', error)
      document.removeEventListener('visibilitychange', sync)
      preference.removeEventListener('change', preferenceChanged)
    }
  }, [ref])

  return ready && !reducedMotion
}
