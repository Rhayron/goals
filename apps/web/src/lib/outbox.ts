import { LIST_COLLECTIONS, sanitizeState, SyncRequestSchema, type AppState, type SyncRequest } from '@coado/shared'

export interface PendingChange {
  id: string
  account: string
  createdAt: number
  patch: SyncRequest
}
let database: Promise<IDBDatabase> | undefined
function db() {
  return (database ??= new Promise((resolve, reject) => {
    const request = indexedDB.open('coado-outbox', 1)
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore('changes', { keyPath: 'id' })
      store.createIndex('account', 'account')
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      database = undefined
      reject(request.error)
    }
  }))
}
async function transact<T>(mode: IDBTransactionMode, action: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await db()
  return new Promise((resolve, reject) => {
    const tx = database.transaction('changes', mode)
    const request = action(tx.objectStore('changes'))
    tx.oncomplete = () => resolve(request.result)
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error ?? new Error('Não foi possível guardar o estudo neste navegador.'))
  })
}
export const appendChange = (change: PendingChange) => transact('readwrite', (s) => s.put(change))
export const removeChange = (id: string) => transact('readwrite', (s) => s.delete(id))
export const pendingChanges = async (account: string) =>
  ((await transact('readonly', (s) => s.index('account').getAll(account))) as PendingChange[]).sort(
    (a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id),
  )

/** Aplica apenas o que mudou localmente, preservando outras linhas atualizadas em outro aparelho. */
export function applyPending(state: AppState, patch: SyncRequest): AppState {
  const next = structuredClone(state)
  for (const key of LIST_COLLECTIONS) {
    const rows = new Map<string, { id: string }>(next[key].map((row) => [row.id, row]))
    for (const row of patch.upserts?.[key] ?? []) rows.set(row.id, row)
    for (const id of patch.deletes?.[key] ?? []) rows.delete(id)
    Object.assign(next, { [key]: [...rows.values()] })
  }
  for (const p of patch.upserts?.plannings ?? []) next.plannings[p.planId] = p
  for (const id of patch.deletes?.plannings ?? []) delete next.plannings[id]
  Object.assign(next, patch.settings)
  return sanitizeState(next)
}
export async function recoverPending(account: string, server: AppState) {
  let state = server
  for (const change of await pendingChanges(account)) state = applyPending(state, SyncRequestSchema.parse(change.patch))
  return state
}
