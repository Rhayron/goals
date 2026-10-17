import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { client, DB_URL, devLogin, setup, type TestCtx } from './helpers'
import { ingestNotice, publishNotice, type CatalogMetadata } from '../src/notices/catalog'
import { fetchQapiPage, parseQapiPage } from '../src/notices/qapi'

const metadata: CatalogMetadata = {
  title: 'Concurso de engenharia 2026',
  agency: 'Órgão exemplo',
  organizer: 'Banca exemplo',
  state: 'PR',
  positions: ['Engenheiro eletricista'],
  year: 2026,
  sourceUrl: 'https://example.com/concurso',
  providerStatus: 'editais publicados',
  registrationStart: '1 de outubro',
  registrationEnd: '30 de outubro',
  examDateText: 'A definir',
}
describe.skipIf(!DB_URL)('catálogo compartilhado com revisão', () => {
  let ctx: TestCtx,
    api: ReturnType<typeof client>,
    id = ''
  beforeAll(async () => {
    ctx = await setup()
    api = client(ctx.app, await devLogin(ctx.app))
  })
  afterAll(() => ctx?.close())
  it('ingestão entra pendente e não vaza para busca ou detalhe', async () => {
    id = (await ingestNotice(ctx.pool, 'qapi', 'external-1', metadata)).id
    expect((await api.get('/api/catalog/notices')).json().items).toEqual([])
    expect((await api.get(`/api/catalog/notices/${id}`)).statusCode).toBe(404)
    expect((await client(ctx.app).get('/api/catalog/notices')).statusCode).toBe(401)
  })
  it('publicação exige versão revisada e busca lê somente a base', async () => {
    await expect(publishNotice(ctx.pool, id, 2, 'revisor', 'https://example.com/edital.pdf')).rejects.toThrow('alterado')
    await publishNotice(ctx.pool, id, 1, 'revisor', 'https://example.com/edital.pdf')
    const r = (await api.get('/api/catalog/notices?q=eletricista&uf=PR')).json()
    expect(r.total).toBe(1)
    expect(r.items[0]).toMatchObject({ id, version: 1, pdfUrl: 'https://example.com/edital.pdf' })
    expect(r.items[0]).not.toHaveProperty('reviewed_by')
    expect((await api.get('/api/catalog/notices?uf=SP')).json().total).toBe(0)
    expect((await api.get('/api/catalog/notices?q=%25')).json().total).toBe(0)
  })
  it('reingestão idempotente preserva publicação; mudança cria versão e exige nova revisão', async () => {
    expect((await ingestNotice(ctx.pool, 'qapi', 'external-1', metadata)).version).toBe(1)
    expect((await api.get('/api/catalog/notices')).json().total).toBe(1)
    expect((await ingestNotice(ctx.pool, 'qapi', 'external-1', { ...metadata, registrationEnd: 'Prorrogada até novembro' })).version).toBe(
      2,
    )
    expect((await api.get('/api/catalog/notices')).json().total).toBe(0)
    expect((await ctx.pool.query('select version from catalog.revisions order by version')).rows.map((r) => r.version)).toEqual([1, 2])
    await expect(publishNotice(ctx.pool, id, 1, 'revisor', 'https://example.com/edital.pdf')).rejects.toThrow()
  })
  it('não há escrita editorial pelo navegador; valida a fonte antes de baixar', async () => {
    expect((await api.post('/api/catalog/notices', { title: 'forjado' })).statusCode).toBe(404)
    expect((await api.post('/api/notices/source', { url: 'https://127.0.0.1/secret' })).statusCode).toBe(400)
  })
})
describe('contrato QAPI documentado', () => {
  const row = {
    _id: 'x',
    orgao: { nome: 'Órgão' },
    banca: { nome: 'Banca' },
    ano: 2026,
    descricao: 'Concurso',
    status: 'editais publicados',
    website: 'https://example.com/concurso',
    cargos: ['Engenheiro'],
    siglaEstado: 'PR',
    dataProva: 'A definir',
  }
  it('normaliza objetos e preserva data textual; não inventa fontes faltantes', () => {
    const r = parseQapiPage({ concursos: [row, { ...row, _id: 'sem-link', website: null }], total: 2, page: 1, pages: 1 })
    expect(r.records[0].metadata).toMatchObject({ agency: 'Órgão', organizer: 'Banca', examDateText: 'A definir' })
    expect(r.skipped).toEqual(['sem-link'])
    expect(() => parseQapiPage({ concursos: [{ ...row, orgao: 'changed' }], total: 1, page: 1, pages: 1 })).toThrow()
  })
  it('chama somente /concursos com chave no servidor e interrompe em quota esgotada', async () => {
    const f = vi.fn().mockResolvedValue(new Response(JSON.stringify({ concursos: [row], total: 1, page: 1, pages: 1 }), { status: 200 }))
    await fetchQapiPage('test-key', 1, 2026, f)
    expect(f.mock.calls[0][0]).toContain('/api/concursos?')
    expect(f.mock.calls[0][1]).toMatchObject({ headers: { 'Q-Api-Key': 'test-key' }, redirect: 'error' })
    f.mockResolvedValue(new Response('', { status: 402 }))
    await expect(fetchQapiPage('test-key', 2, 2026, f)).rejects.toThrow('402')
    expect(f).toHaveBeenCalledTimes(2)
  })
})
