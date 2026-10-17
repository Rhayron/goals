import { diffState, type AppState } from '@coado/shared'
import { api, ApiError } from './api'
import { appendChange, pendingChanges, removeChange, type PendingChange } from './outbox'

export type SyncStatus = 'saved' | 'pending' | 'saving' | 'offline' | 'error'

/** Fila durável por conta. Cada lote sai do IndexedDB somente após confirmação do servidor. */
export class SyncEngine {
  private current: AppState
  private status: SyncStatus = 'pending'
  private timer: ReturnType<typeof setTimeout> | null = null
  private inFlight: Promise<void> | null = null
  private listeners = new Set<() => void>()
  private writes: Promise<unknown> = Promise.resolve()
  private unpersisted: PendingChange[] = []
  private retryMs = 2000
  private disposed = false
  private clock = Date.now()
  errorMessage = ''

  private onUnauthorized: () => void
  private account: string
  constructor(initial: AppState, onUnauthorized: () => void, account: string) {
    this.current = initial
    this.onUnauthorized = onUnauthorized
    this.account = account
  }
  start() {
    this.disposed = false
    this.retry()
  }
  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
  getStatus = () => this.status
  get dirty() {
    return this.status !== 'saved' || this.unpersisted.length > 0 || this.inFlight !== null
  }
  get idle() {
    return !this.dirty && !this.timer
  }
  get snapshot() {
    return this.current
  }
  private setStatus(status: SyncStatus) {
    this.status = status
    this.listeners.forEach((fn) => fn())
  }
  private persist() {
    this.writes = this.writes
      .catch(() => undefined)
      .then(async () => {
        while (this.unpersisted.length) {
          await appendChange(this.unpersisted[0])
          this.unpersisted.shift()
        }
      })
    return this.writes
  }
  push(next: AppState) {
    const patch = diffState(this.current, next)
    this.current = next
    if (!patch) return
    this.clock = Math.max(Date.now(), this.clock + 1)
    this.unpersisted.push({ id: crypto.randomUUID(), account: this.account, createdAt: this.clock, patch })
    this.setStatus('pending')
    void this.persist().catch(() => {
      this.errorMessage = 'O navegador não conseguiu guardar a fila local. Mantenha esta aba aberta e tente novamente.'
      this.setStatus('error')
    })
    if (!this.timer) this.schedule(700)
  }
  private schedule(ms: number) {
    if (this.disposed) return
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.timer = null
      void this.flush()
    }, ms)
  }
  flush(_opts: { keepalive?: boolean } = {}): Promise<void> {
    if (this.inFlight) return this.inFlight
    const run = async () => {
      await this.persist()
      const changes = await pendingChanges(this.account)
      if (changes.length) this.setStatus('saving')
      for (const change of changes) {
        await api.post('/sync', change.patch)
        await removeChange(change.id)
      }
      this.errorMessage = ''
      this.retryMs = 2000
      const remaining = this.unpersisted.length || (await pendingChanges(this.account)).length
      this.setStatus(remaining ? 'pending' : 'saved')
      if (remaining) this.schedule(700)
    }
    // Uma única aba envia por vez; os lotes são idempotentes também no fallback.
    this.inFlight = (navigator.locks ? navigator.locks.request(`coado-sync:${this.account}`, run) : run())
      .catch((e: unknown) => {
        this.errorMessage = (e as Error).message
        if (e instanceof ApiError && e.status === 401) {
          this.setStatus('error')
          this.onUnauthorized()
          return
        }
        if (e instanceof ApiError && (e.status === 0 || e.status >= 500 || e.status === 429)) {
          this.errorMessage = 'Alterações guardadas neste navegador. Vamos reenviar quando a conexão voltar.'
          this.setStatus('offline')
          this.schedule(this.retryMs)
          this.retryMs = Math.min(30_000, this.retryMs * 2)
        } else this.setStatus('error')
      })
      .finally(() => {
        this.inFlight = null
      })
    return this.inFlight
  }
  retry() {
    void this.flush()
  }
  async settle() {
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    await this.flush()
    if (this.dirty) throw new Error('Sincronize as alterações pendentes antes de substituir os dados da conta.')
  }
  rebase(state: AppState) {
    this.current = state
  }
  dispose() {
    this.disposed = true
    if (this.timer) clearTimeout(this.timer)
    this.listeners.clear()
  }
}
