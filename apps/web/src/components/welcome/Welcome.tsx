import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useAuth, useMe } from '../../lib/auth'
import { isTutorial, TUTORIAL_CLOSE, TUTORIAL_RESTART } from '../../lib/tutorial-mode'

const Ctx = createContext<{ openWelcome: () => void } | null>(null)

export function useWelcome() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useWelcome fora do WelcomeProvider')
  return ctx
}

/** Only onboarding metadata is saved. Demo studies are never imported into the account. */
export function WelcomeProvider({ children }: { children: ReactNode }) {
  const me = useMe()
  const { updateProfile } = useAuth()
  const [open, setOpen] = useState(!isTutorial && !me.onboardedAt)
  const [error, setError] = useState('')
  const finishing = useRef(false)
  const value = useMemo(() => ({ openWelcome: () => {
    if (isTutorial) window.dispatchEvent(new Event(TUTORIAL_RESTART))
    else { setError(''); setOpen(true) }
  } }), [])
  const close = useCallback(async () => {
    if (finishing.current) return
    finishing.current = true
    try {
      if (!me.onboardedAt) await updateProfile({ onboarded: true })
      setOpen(false)
    } catch {
      setError('Não foi possível concluir as boas-vindas. Tente sair novamente.')
    } finally { finishing.current = false }
  }, [me.onboardedAt, updateProfile])
  return (
    <Ctx.Provider value={value}>
      {children}
      {open && <TutorialDialog onClose={() => void close()} error={error} />}
    </Ctx.Provider>
  )
}

/** Separate document keeps the account's current route, clock, audio and state mounted. */
export function TutorialDialog({ onClose, error }: { onClose: () => void; error?: string }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const dialog = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.focus()
    const message = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.source === frame.current?.contentWindow && e.data === TUTORIAL_CLOSE) onClose()
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && e.target === dialog.current) { e.preventDefault(); frame.current?.focus() }
    }
    const focus = (e: FocusEvent) => {
      if (e.target instanceof Node && !dialog.current?.contains(e.target)) dialog.current?.focus()
    }
    window.addEventListener('message', message)
    window.addEventListener('keydown', key)
    document.addEventListener('focusin', focus)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('message', message)
      window.removeEventListener('keydown', key)
      document.removeEventListener('focusin', focus)
      previous?.focus()
    }
  }, [onClose])
  return (
    <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Tutorial de boas-vindas do Coado" className="fixed inset-0 z-[100] bg-kraft outline-none">
      <iframe ref={frame} src="/tutorial" title="Tour guiado do Coado com dados fictícios" className="h-full w-full border-0" />
      {error && <p role="alert" className="absolute left-4 right-16 top-2 rounded-lg bg-surface px-3 py-2 text-sm text-bad shadow">{error}</p>}
      <button type="button" onClick={onClose} aria-label="Sair do tutorial" className="absolute right-3 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-muted hover:bg-surface-2"><X size={20} /></button>
    </div>
  )
}
