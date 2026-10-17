import 'fake-indexeddb/auto'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { emptyState, type AppState, type Planning, type Study } from '@coado/shared'
import { appendChange, pendingChanges, recoverPending, removeChange } from './outbox'
import { SyncEngine } from './sync'
import { achievements } from './achievements'
import { cycleProgress } from './utils'

const post = vi.hoisted(() => vi.fn())
vi.mock('./api', async (importOriginal) => ({ ...(await importOriginal<typeof import('./api')>()), api: { post } }))
const state = (): AppState => ({
  ...emptyState(),
  plans: [{ id: 'p', name: 'Plano', weeklyGoal: { minutes: 60, questions: 10 }, createdAt: '2026-01-01T00:00:00Z' }],
  subjects: [{ id: 's', planId: 'p', name: 'Disciplina', order: 0, color: '#fff' }],
})
const study = (id: string, date: string, topicId?: string): Study => ({
  id,
  planId: 'p',
  subjectId: 's',
  topicId,
  date,
  duration: 3600,
  categoryId: 'teoria',
  hits: 8,
  misses: 2,
  pages: [],
  videos: [],
  material: '',
  comment: '',
  countInPlanning: true,
  createdAt: `${date}T12:00:00Z`,
})

describe('fila durável por conta', () => {
  const engines: SyncEngine[] = []
  beforeEach(async () => {
    post.mockReset()
    vi.stubGlobal('navigator', {})
    for (const account of ['ana', 'bia']) for (const c of await pendingChanges(account)) await removeChange(c.id)
  })
  afterEach(() => {
    engines.forEach((e) => e.dispose())
    engines.length = 0
    vi.unstubAllGlobals()
  })
  it('recupera após recarga e preserva alterações remotas em outras linhas', async () => {
    await appendChange({ id: '1', account: 'ana', createdAt: 1, patch: { upserts: { studies: [study('local', '2026-01-02')] } } })
    const remote = { ...state(), studies: [study('remoto', '2026-01-01')] }
    expect((await recoverPending('ana', remote)).studies.map((s) => s.id)).toEqual(['remoto', 'local'])
    expect((await recoverPending('bia', remote)).studies.map((s) => s.id)).toEqual(['remoto'])
  })
  it('falha de rede mantém o lote; novo motor reenvia e remove somente após ACK', async () => {
    const { ApiError } = await import('./api')
    post.mockRejectedValue(new ApiError(0, 'offline', 'offline'))
    const engine = new SyncEngine(state(), () => {}, 'ana')
    engines.push(engine)
    engine.push({ ...state(), studies: [study('local', '2026-01-02')] })
    await engine.flush()
    expect(engine.getStatus()).toBe('offline')
    expect(await pendingChanges('ana')).toHaveLength(1)
    engine.dispose()
    const recovered = await recoverPending('ana', state())
    const next = new SyncEngine(recovered, () => {}, 'ana')
    engines.push(next)
    post.mockResolvedValue({ ok: true })
    await next.flush()
    expect(await pendingChanges('ana')).toHaveLength(0)
    expect(next.getStatus()).toBe('saved')
  })
  it('não apaga um lote novo criado durante o envio e não mistura contas', async () => {
    let release: () => void = () => {}
    post
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            release = resolve
          }),
      )
      .mockResolvedValue({ ok: true })
    const e = new SyncEngine(state(), () => {}, 'ana')
    engines.push(e)
    const first = { ...state(), studies: [study('one', '2026-01-01')] }
    e.push(first)
    const sending = e.flush()
    await vi.waitFor(() => expect(post).toHaveBeenCalledOnce())
    e.push({ ...first, studies: [...first.studies, study('two', '2026-01-02')] })
    await appendChange({ id: 'bia', account: 'bia', createdAt: 1, patch: { settings: { note: 'de Bia' } } })
    release()
    await sending
    await e.flush()
    expect(await pendingChanges('ana')).toHaveLength(0)
    expect(await pendingChanges('bia')).toHaveLength(1)
    expect(post.mock.calls[1][1].upserts.studies[0].id).toBe('two')
  })
  it('recusa substituir dados com lote rejeitado e mantém backup recuperável', async () => {
    const { ApiError } = await import('./api')
    post.mockRejectedValue(new ApiError(409, 'conflict', 'conflito'))
    const e = new SyncEngine(state(), () => {}, 'ana')
    engines.push(e)
    e.push({ ...state(), note: 'não perder' })
    await expect(e.settle()).rejects.toThrow('Sincronize')
    expect((await recoverPending('ana', state())).note).toBe('não perder')
  })
})

describe('ciclo por tópico e conquistas', () => {
  it('um tópico não preenche a sessão de outro; sessões livres continuam compatíveis', () => {
    const p: Planning = {
      planId: 'p',
      type: 'cycle',
      completedCycles: 0,
      cycleStartedAt: '2026-01-01',
      config: { weeklyMinutes: 120, days: [true, true, true, true, true, true, true], minSession: 60, maxSession: 60, subjects: [] },
      cycle: [
        { id: 'a', subjectId: 's', topicId: 't1', duration: 60 },
        { id: 'b', subjectId: 's', topicId: 't2', duration: 60 },
        { id: 'c', subjectId: 's', duration: 60 },
      ],
    }
    expect(cycleProgress(p, [study('x', '2026-01-02', 't2')]).map((c) => c.done)).toEqual([false, true, false])
    expect(cycleProgress(p, [study('x', '2026-01-02')]).map((c) => c.done)).toEqual([false, false, true])
  })
  it('conquistas usam a mesma contagem de páginas das estatísticas existentes', () => {
    const reading = { ...study('reading', '2026-01-01'), pages: [{ start: 1, end: 50 }] }
    const badge = achievements({ ...state(), studies: [reading] }).find((a) => a.id === 'Leitura-50')!
    expect(badge.value).toBe(49)
    expect(badge.unlocked).toBe(false)
  })
  it('constância conta dias únicos, calcula data e recalcula após remover registros', () => {
    const s = {
      ...state(),
      studies: [study('a', '2026-01-01'), study('b', '2026-01-01'), study('c', '2026-01-02'), study('d', '2026-01-03')],
    }
    const earned = achievements(s).find((a) => a.id === 'Constância-3')!
    expect(earned.unlocked).toBe(true)
    expect(earned.date).toBe('2026-01-03')
    expect(achievements({ ...s, studies: s.studies.slice(0, 3) }).find((a) => a.id === 'Constância-3')!.unlocked).toBe(false)
  })
})
