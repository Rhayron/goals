import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { Deps } from '../deps'
import { HttpError, notFound } from '../errors'
import { getSource } from './source'
import { publicNotice } from './catalog'

export async function noticeRoutes(app: FastifyInstance, { pool }: Deps) {
  const active = new Set<string>()
  app.post('/notices/source', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (req, reply) => {
    const { url } = z.object({ url: z.string().min(1).max(2048) }).parse(req.body)
    if (active.size >= 4 || active.has(req.user.id))
      throw new HttpError(429, 'source_busy', 'Já há uma leitura em andamento. Tente novamente em instantes.')
    active.add(req.user.id)
    try {
      const source = await getSource(url)
      reply.header('Cache-Control', 'no-store')
      if (source.kind === 'pdf')
        return reply.type('application/pdf').header('X-Coado-Source', encodeURIComponent(source.url)).send(source.bytes)
      return source
    } finally {
      active.delete(req.user.id)
    }
  })
  // Estas rotas consultam somente a base local; nunca chamam a QAPI.
  app.get('/catalog/notices', async (req) => {
    const q = z
      .object({
        q: z.string().trim().max(100).default(''),
        uf: z
          .string()
          .regex(/^[A-Za-z]{2}$/)
          .optional(),
        page: z.coerce.number().int().min(1).max(10000).default(1),
      })
      .parse(req.query)
    const term = `%${q.q.replace(/[\\%_]/g, '\\$&')}%`
    const where = `status='published' and ($2::text is null or upper(metadata->>'state')=$2)
      and concat_ws(' ',metadata->>'title',metadata->>'agency',metadata->>'organizer',metadata->>'positions') ilike $1`
    const values = [term, q.uf?.toUpperCase() ?? null]
    const { rows } = await pool.query(`select * from catalog.notices where ${where} order by reviewed_at desc,id limit 20 offset $3`, [
      ...values,
      (q.page - 1) * 20,
    ])
    const total = (await pool.query(`select count(*)::int as n from catalog.notices where ${where}`, values)).rows[0].n
    return { items: rows.map(publicNotice), total, page: q.page }
  })
  app.get('/catalog/notices/:id', async (req) => {
    const { id } = z.object({ id: z.uuid() }).parse(req.params)
    const row = (await pool.query(`select * from catalog.notices where id=$1 and status='published'`, [id])).rows[0]
    if (!row) throw notFound('Edital publicado')
    return publicNotice(row)
  })
}
