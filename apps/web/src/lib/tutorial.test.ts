import { afterEach, describe, expect, it, vi } from 'vitest'
import { tutorialState, DEMO_PLAN, DEMO_SEMESTER } from '../components/welcome/tutorial-data'
import { tutorialRequest } from '../components/welcome/tutorial-api'
import hosting from '../../../../vercel.json'

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules() })

describe('dados temporários do tutorial', () => {
  it('cria sessões independentes e não reaproveita alterações da visita anterior', () => {
    const first = tutorialState('2026-10-18')
    first.plans[0].name = 'Alterado no tutorial'
    first.studies.pop()
    first.topics[0].finished = false
    first.timerPrefs.pomodoroStudy = 90
    const fresh = tutorialState('2026-10-18')
    expect(fresh.plans[0].name).toBe('Meu próximo concurso')
    expect(fresh.studies).toHaveLength(28)
    expect(fresh.topics[0].finished).toBe(true)
    expect(fresh.timerPrefs.pomodoroStudy).toBe(25)
  })

  it('mantém datas relativas, concurso e faculdade e vínculos válidos', () => {
    const s = tutorialState('2027-01-02')
    expect(s.activePlanId).toBe(DEMO_PLAN)
    expect(new Set(s.studies.map((x) => x.date)).size).toBe(14)
    expect(s.studies.at(-1)?.date).toBe('2027-01-02')
    expect(s.reviews.some((r) => r.dueDate === '2027-01-02')).toBe(true)
    for (const review of s.reviews) {
      const study = s.studies.find((x) => x.id === review.studyId)
      expect(study?.subjectId).toBe(review.subjectId)
      expect(study?.topicId).toBe(review.topicId)
    }
    expect(s.assessments.every((a) => a.planId === DEMO_SEMESTER)).toBe(true)
    expect(s.topics.filter((t) => t.finished && s.subjects.some((x) => x.id === t.subjectId && x.planId === DEMO_PLAN))).toHaveLength(3)
  })

  it('retorna novas cópias dos exemplos remotos e rejeita endpoints desconhecidos', async () => {
    const files = await tutorialRequest<{ files: unknown[] }>('GET', '/files')
    files.files.length = 0
    expect((await tutorialRequest<{ files: unknown[] }>('GET', '/files')).files).toHaveLength(2)
    await expect(tutorialRequest('GET', '/state')).rejects.toThrow('tutorial')
    await expect(tutorialRequest('DELETE', '/me')).rejects.toThrow('tutorial')
  })
})

describe('barreira entre tutorial e conta', () => {
  it('libera incorporação apenas da rota do tutorial na mesma origem e bloqueia sua rede', () => {
    const tutorial = hosting.headers.find((rule) => rule.source === '/tutorial')!
    const normal = hosting.headers[0]
    const header = (rule: typeof tutorial, key: string) => rule.headers.find((h) => h.key === key)?.value
    expect(header(tutorial, 'X-Frame-Options')).toBe('SAMEORIGIN')
    expect(header(tutorial, 'Content-Security-Policy')).toContain("frame-ancestors 'self'")
    expect(header(tutorial, 'Content-Security-Policy')).toContain("connect-src 'none'")
    expect(header(normal, 'X-Frame-Options')).toBe('DENY')
    expect(new RegExp(`^${normal.source}$`).test('/tutorial')).toBe(false)
    expect(new RegExp(`^${normal.source}$`).test('/perfil')).toBe(true)
  })

  it('não usa fetch nem XHR para leituras, alterações, upload ou rotas desconhecidas', async () => {
    vi.stubGlobal('window', { location: { pathname: '/tutorial' } })
    const fetch = vi.fn(), xhr = vi.fn()
    vi.stubGlobal('fetch', fetch)
    vi.stubGlobal('XMLHttpRequest', xhr)
    const { api, uploadWithProgress } = await import('./api')
    await expect(api.get('/files')).resolves.toHaveProperty('files')
    await expect(api.get('/community/ranking?metric=time')).resolves.toHaveProperty('entries')
    await expect(api.get('/me')).rejects.toThrow('tutorial')
    await expect(api.post('/sync', { synthetic: true })).rejects.toThrow('tutorial')
    await expect(api.put('/state', tutorialState())).rejects.toThrow('tutorial')
    await expect(api.patch('/me', { name: 'Exemplo' })).rejects.toThrow('tutorial')
    await expect(api.delete('/me')).rejects.toThrow('tutorial')
    await expect(uploadWithProgress('/files', new FormData(), vi.fn())).rejects.toThrow('tutorial')
    expect(fetch).not.toHaveBeenCalled()
    expect(xhr).not.toHaveBeenCalled()
  })

  it('não lê nem grava preferências e migrações reais no tutorial', async () => {
    vi.stubGlobal('window', { location: { pathname: '/tutorial' } })
    vi.stubGlobal('document', { documentElement: { dataset: {} } })
    const storage = { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() }
    vi.stubGlobal('localStorage', storage)
    const legacy = await import('./legacy')
    expect(legacy.readLegacyState()).toBeNull()
    expect(legacy.cachedTheme()).toBe('light')
    expect(legacy.cachedPalette()).toBe('cafe')
    legacy.cacheTheme('dark')
    legacy.cachePalette('oceano')
    legacy.markLegacyMigrated()
    Object.values(storage).forEach((fn) => expect(fn).not.toHaveBeenCalled())
  })

  it('mantém o cliente HTTP normal fora da rota do tutorial', async () => {
    vi.stubGlobal('window', { location: { pathname: '/historico' } })
    const fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) })
    vi.stubGlobal('fetch', fetch)
    const { api } = await import('./api')
    await api.post('/sync', { real: true })
    expect(fetch).toHaveBeenCalledWith('/api/sync', expect.objectContaining({ method: 'POST', credentials: 'same-origin', body: '{"real":true}' }))
  })
})
