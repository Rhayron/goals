import { createHash, randomBytes } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { CommunityProfile, StudyGroup, RankEntry } from '@coado/shared'
import { tx, type Db } from '../db'
import type { Deps } from '../deps'
import { HttpError, notFound, badRequest } from '../errors'

const Profile = z.object({ nickname: z.string().trim().min(1).max(40), globalEnabled: z.boolean(), focus: z.string().trim().max(100) })
const Group = z.object({ name: z.string().trim().min(1).max(80), description: z.string().trim().max(500).default('') })
const idOf = (params: unknown) => z.object({ id: z.uuid() }).parse(params).id
const hash = (token: string) => createHash('sha256').update(token).digest('hex')
const tokenOf = (body: unknown) => z.object({ token: z.string().regex(/^[a-f0-9]{48}$/) }).parse(body).token

export async function communityRoutes(app: FastifyInstance, { pool }: Deps) {
  async function member(db: Db, groupId: string, userId: string, owner = false) {
    const { rows } = await db.query(
      `select g.* from study_groups g join group_members m on m.group_id=g.id
      where g.id=$1 and m.user_id=$2`,
      [groupId, userId],
    )
    const g = rows[0]
    if (!g) throw notFound('Grupo')
    if (owner && g.owner_id !== userId) throw new HttpError(403, 'forbidden', 'Somente quem criou o grupo pode fazer isso.')
    return g
  }
  const groups = async (userId: string): Promise<StudyGroup[]> =>
    (
      await pool.query(
        `
    select g.id, g.name, g.description, g.owner_id as "ownerId", count(all_m.user_id)::int as members
    from study_groups g join group_members mine on mine.group_id=g.id and mine.user_id=$1
    join group_members all_m on all_m.group_id=g.id group by g.id order by g.created_at desc`,
        [userId],
      )
    ).rows

  app.get('/community', async (req) => {
    const p = (
      await pool.query(`select nickname, global_enabled as "globalEnabled", focus from community_profiles where user_id=$1`, [req.user.id])
    ).rows[0]
    return { profile: p ?? { nickname: req.user.name.slice(0, 40), globalEnabled: false, focus: '' }, groups: await groups(req.user.id) }
  })
  app.put('/community/profile', async (req): Promise<CommunityProfile> => {
    const p = Profile.parse(req.body)
    await pool.query(
      `insert into community_profiles(user_id,nickname,global_enabled,focus) values($1,$2,$3,$4)
      on conflict(user_id) do update set nickname=$2,global_enabled=$3,focus=$4`,
      [req.user.id, p.nickname, p.globalEnabled, p.focus],
    )
    return p
  })
  app.post('/community/groups', async (req, reply) => {
    const data = Group.parse(req.body)
    const id = await tx(pool, async (db) => {
      // Serializa a cota de criação por conta.
      await db.query('select id from users where id=$1 for update', [req.user.id])
      const count = (await db.query('select count(*)::int as n from study_groups where owner_id=$1', [req.user.id])).rows[0].n
      if (count >= 20) throw badRequest('Limite de 20 grupos criados por conta.')
      await db.query(`insert into community_profiles(user_id,nickname) values($1,$2) on conflict do nothing`, [
        req.user.id,
        req.user.name.slice(0, 40),
      ])
      const g = (
        await db.query('insert into study_groups(owner_id,name,description) values($1,$2,$3) returning id', [
          req.user.id,
          data.name,
          data.description,
        ])
      ).rows[0]
      await db.query('insert into group_members(group_id,user_id) values($1,$2)', [g.id, req.user.id])
      return g.id
    })
    return reply.code(201).send((await groups(req.user.id)).find((g) => g.id === id))
  })
  app.patch('/community/groups/:id', async (req) => {
    const id = idOf(req.params),
      data = Group.parse(req.body)
    await member(pool, id, req.user.id, true)
    await pool.query('update study_groups set name=$2,description=$3 where id=$1', [id, data.name, data.description])
    return { ok: true }
  })
  app.delete('/community/groups/:id', async (req) => {
    const id = idOf(req.params)
    await member(pool, id, req.user.id, true)
    await pool.query('delete from study_groups where id=$1', [id])
    return { ok: true }
  })
  app.get('/community/groups/:id/members', async (req) => {
    const id = idOf(req.params)
    await member(pool, id, req.user.id)
    return (
      await pool.query(
        `select m.user_id as "userId", p.nickname, m.joined_at as "joinedAt" from group_members m
      join community_profiles p on p.user_id=m.user_id where m.group_id=$1 order by m.joined_at`,
        [id],
      )
    ).rows
  })
  app.delete('/community/groups/:id/members/:userId', async (req) => {
    const { id, userId } = z.object({ id: z.uuid(), userId: z.uuid() }).parse(req.params)
    const g = await member(pool, id, req.user.id)
    if (userId === g.owner_id) throw badRequest('O criador deve encerrar o grupo em vez de sair.')
    if (userId !== req.user.id && g.owner_id !== req.user.id) throw new HttpError(403, 'forbidden', 'Você não pode remover esse membro.')
    await pool.query('delete from group_members where group_id=$1 and user_id=$2', [id, userId])
    return { ok: true }
  })
  app.post('/community/groups/:id/invite', async (req) => {
    const id = idOf(req.params),
      token = randomBytes(24).toString('hex')
    await tx(pool, async (db) => {
      await member(db, id, req.user.id, true)
      await db.query('select id from study_groups where id=$1 for update', [id])
      await db.query('delete from group_invites where group_id=$1', [id])
      await db.query("insert into group_invites(token_hash,group_id,expires_at) values($1,$2,now()+interval '7 days')", [hash(token), id])
    })
    return { token, expiresInDays: 7 }
  })
  app.delete('/community/groups/:id/invite', async (req) => {
    const id = idOf(req.params)
    await member(pool, id, req.user.id, true)
    await pool.query('delete from group_invites where group_id=$1', [id])
    return { ok: true }
  })
  app.post('/community/invites/preview', async (req) => {
    const token = tokenOf(req.body)
    const g = (
      await pool.query(
        `select g.name,g.description from group_invites i join study_groups g on g.id=i.group_id
      where i.token_hash=$1 and i.expires_at>now()`,
        [hash(token)],
      )
    ).rows[0]
    if (!g) throw notFound('Convite válido')
    return g
  })
  app.post('/community/invites/join', async (req) => {
    const token = tokenOf(req.body)
    return tx(pool, async (db) => {
      const invite = (await db.query('select group_id from group_invites where token_hash=$1 and expires_at>now()', [hash(token)])).rows[0]
      if (!invite) throw notFound('Convite válido')
      await db.query('select id from study_groups where id=$1 for update', [invite.group_id])
      if (!(await db.query('select 1 from group_invites where token_hash=$1 and expires_at>now() for update', [hash(token)])).rowCount)
        throw notFound('Convite válido')
      const exists = (await db.query('select 1 from group_members where group_id=$1 and user_id=$2', [invite.group_id, req.user.id]))
        .rowCount
      if (!exists) {
        const n = (await db.query('select count(*)::int as n from group_members where group_id=$1', [invite.group_id])).rows[0].n
        if (n >= 200) throw badRequest('Este grupo atingiu o limite de 200 participantes.')
        await db.query('insert into community_profiles(user_id,nickname) values($1,$2) on conflict do nothing', [
          req.user.id,
          req.user.name.slice(0, 40),
        ])
        await db.query('insert into group_members(group_id,user_id) values($1,$2) on conflict do nothing', [invite.group_id, req.user.id])
      }
      return { groupId: invite.group_id }
    })
  })
  app.get('/community/ranking', async (req) => {
    const q = z
      .object({
        groupId: z.uuid().optional(),
        metric: z.enum(['time', 'questions', 'pages']).default('time'),
        week: z.coerce.number().int().min(-52).max(0).default(0),
        focus: z.string().max(100).optional(),
      })
      .parse(req.query)
    if (q.groupId) await member(pool, q.groupId, req.user.id)
    // Dias de estudo são datas civis; a competição fecha domingo no fuso de Brasília.
    const dates = (
      await pool.query(
        `select (date_trunc('week',now() at time zone 'America/Sao_Paulo')::date + $1::int*7)::text as "from",
      (date_trunc('week',now() at time zone 'America/Sao_Paulo')::date + $1::int*7+6)::text as "to"`,
        [q.week],
      )
    ).rows[0]
    const metric = { time: 'seconds', questions: 'questions', pages: 'pages' }[q.metric]
    const { rows } = await pool.query(
      `with eligible as (
      select p.user_id,p.nickname from community_profiles p where
      ($1::uuid is null and p.global_enabled and ($5::text is null or lower(p.focus)=lower($5))) or
      ($1::uuid is not null and exists(select 1 from group_members m where m.group_id=$1 and m.user_id=p.user_id))
    ), scores as (
      select e.user_id,e.nickname,coalesce(sum(s.duration),0)::float8 as seconds,
        coalesce(sum(s.hits+s.misses),0)::float8 as questions,
        coalesce(sum((select sum(greatest(0,(r->>'end')::int-(r->>'start')::int)) from jsonb_array_elements(s.pages) r)),0)::float8 as pages
      from eligible e left join studies s on s.user_id=e.user_id and s.date between $2::date and least($3::date,(now() at time zone 'America/Sao_Paulo')::date)
      group by e.user_id,e.nickname
    ), ranked as (
      select user_id as "userId",nickname,${metric} as value,rank() over(order by ${metric} desc)::int as position,
        count(*) over()::int as participants,row_number() over(order by ${metric} desc,nickname,user_id) as row_num
      from scores where ${metric}>0
    ) select * from ranked where row_num<=100 or "userId"=$4::uuid order by row_num`,
      [q.groupId ?? null, dates.from, dates.to, req.user.id, q.focus || null],
    )
    const clean = (r: (typeof rows)[number]): RankEntry => ({
      userId: r.userId,
      nickname: r.nickname,
      value: r.value,
      position: r.position,
    })
    return {
      ...dates,
      metric: q.metric,
      entries: rows.filter((r) => r.row_num <= 100).map(clean),
      me: rows.find((r) => r.userId === req.user.id) ? clean(rows.find((r) => r.userId === req.user.id)!) : null,
      participants: rows[0]?.participants ?? 0,
    }
  })
}
