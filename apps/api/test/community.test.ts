import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { client, DB_URL, devLogin, setup, type TestCtx } from './helpers'

describe.skipIf(!DB_URL)('grupos e rankings', () => {
  let ctx: TestCtx, ana: ReturnType<typeof client>, bia: ReturnType<typeof client>, eve: ReturnType<typeof client>
  let groupId = '',
    token = '',
    anaId = '',
    biaId = ''
  beforeAll(async () => {
    ctx = await setup()
    ana = client(ctx.app, await devLogin(ctx.app, 'ana@coado.test', 'Ana'))
    bia = client(ctx.app, await devLogin(ctx.app, 'bia@coado.test', 'Bia'))
    eve = client(ctx.app, await devLogin(ctx.app, 'eve@coado.test', 'Eve'))
    anaId = (await ana.get('/api/me')).json().id
    biaId = (await bia.get('/api/me')).json().id
    const date = (await ctx.pool.query("select (now() at time zone 'America/Sao_Paulo')::date as date")).rows[0].date
    for (const [person, duration] of [
      [ana, 3600],
      [bia, 3600],
      [eve, 7200],
    ] as const) {
      await person.post('/api/sync', {
        upserts: {
          plans: [{ id: 'p', name: 'Plano', weeklyGoal: { minutes: 60, questions: 10 }, createdAt: new Date().toISOString() }],
          subjects: [{ id: 's', planId: 'p', name: 'Matéria', color: '#fff', order: 0 }],
          studies: [
            {
              id: 'st',
              planId: 'p',
              subjectId: 's',
              categoryId: 'teoria',
              date,
              duration,
              material: 'Privado',
              hits: 8,
              misses: 2,
              pages: [{ start: 1, end: 10 }],
              videos: [],
              comment: 'Não divulgar',
              countInPlanning: true,
              createdAt: new Date().toISOString(),
            },
          ],
        },
      })
    }
  })
  afterAll(() => ctx?.close())
  it('não divulga uma conta que não aderiu ao global', async () => {
    await ana.put('/api/community/profile', { nickname: 'Café Ana', globalEnabled: true, focus: 'Engenharia' })
    const r = (await ana.get('/api/community/ranking')).json()
    expect(r.entries).toHaveLength(1)
    expect(r.entries[0]).toMatchObject({ nickname: 'Café Ana', value: 3600, position: 1 })
    expect(JSON.stringify(r)).not.toMatch(/email|Privado|Não divulgar|google_sub/)
  })
  it('cria grupo privado e nega acesso a não membro', async () => {
    const r = await ana.post('/api/community/groups', { name: 'Nossa mesa', description: 'Estudar juntos' })
    expect(r.statusCode).toBe(201)
    groupId = r.json().id
    expect((await eve.get(`/api/community/groups/${groupId}/members`)).statusCode).toBe(404)
    expect((await eve.get(`/api/community/ranking?groupId=${groupId}`)).statusCode).toBe(404)
    token = (await ana.post(`/api/community/groups/${groupId}/invite`)).json().token
    expect((await bia.post('/api/community/invites/preview', { token })).json()).toEqual({
      name: 'Nossa mesa',
      description: 'Estudar juntos',
    })
  })
  it('convite permite entrada idempotente; membro não administra', async () => {
    expect((await bia.post('/api/community/invites/join', { token })).statusCode).toBe(200)
    expect((await bia.post('/api/community/invites/join', { token })).statusCode).toBe(200)
    expect((await ana.get(`/api/community/groups/${groupId}/members`)).json()).toHaveLength(2)
    expect((await bia.post(`/api/community/groups/${groupId}/invite`)).statusCode).toBe(403)
    expect((await bia.patch(`/api/community/groups/${groupId}`, { name: 'roubado' })).statusCode).toBe(403)
    expect((await bia.del(`/api/community/groups/${groupId}`)).statusCode).toBe(403)
    expect((await bia.del(`/api/community/groups/${groupId}/members/${anaId}`)).statusCode).toBe(400)
  })
  it('rankings isolam membros, respeitam empate, métricas e semana', async () => {
    const r = (await bia.get(`/api/community/ranking?groupId=${groupId}`)).json()
    expect(r.entries).toHaveLength(2)
    expect(r.entries.map((x: { position: number }) => x.position)).toEqual([1, 1])
    expect(r.me.userId).toBe(biaId)
    expect((await ana.get(`/api/community/ranking?groupId=${groupId}&metric=questions`)).json().entries[0].value).toBe(10)
    expect((await ana.get(`/api/community/ranking?groupId=${groupId}&metric=pages`)).json().entries[0].value).toBe(9)
    expect((await ana.get(`/api/community/ranking?groupId=${groupId}&week=-1`)).json().entries).toEqual([])
    expect((await ana.get('/api/community/ranking?focus=Outra')).json().entries).toEqual([])
    expect((await ana.get('/api/community/ranking?week=1')).statusCode).toBe(400)
  })
  it('rotação, expiração e revogação invalidam convites', async () => {
    const newer = (await ana.post(`/api/community/groups/${groupId}/invite`)).json().token
    expect((await eve.post('/api/community/invites/join', { token })).statusCode).toBe(404)
    await ctx.pool.query("update group_invites set expires_at=now()-interval '1 second'")
    expect((await eve.post('/api/community/invites/join', { token: newer })).statusCode).toBe(404)
    token = (await ana.post(`/api/community/groups/${groupId}/invite`)).json().token
    await ana.del(`/api/community/groups/${groupId}/invite`)
    expect((await eve.post('/api/community/invites/join', { token })).statusCode).toBe(404)
  })
  it('remover membro corta acesso; sair do global oculta a conta', async () => {
    await ana.del(`/api/community/groups/${groupId}/members/${biaId}`)
    expect((await bia.get(`/api/community/ranking?groupId=${groupId}`)).statusCode).toBe(404)
    await ana.put('/api/community/profile', { nickname: 'Ana', globalEnabled: false, focus: '' })
    expect((await ana.get('/api/community/ranking')).json().entries).toEqual([])
  })
  it('encerrar grupo preserva os estudos e elimina associações', async () => {
    expect((await ana.del(`/api/community/groups/${groupId}`)).statusCode).toBe(200)
    expect((await ana.get('/api/community')).json().groups).toEqual([])
    expect((await ana.get('/api/state')).json().studies).toHaveLength(1)
  })
})
