import { createHash, randomBytes } from 'node:crypto'
import type { AuthConfig, AuthErrorCode } from '@rumo/shared'
import type { FastifyInstance, FastifyReply } from 'fastify'
import { z } from 'zod'
import type { Deps } from '../deps'
import { notFound } from '../errors'
import { clearSessionCookie, createSession, deleteSessionByToken, SESSION_COOKIE, setSessionCookie } from './sessions'
import { ensureUser } from './users'

const OAUTH_COOKIE = 'rumo_oauth'
const OAUTH_COOKIE_PATH = '/api/auth'

const random = (bytes = 32) => randomBytes(bytes).toString('base64url')
const s256 = (v: string) => createHash('sha256').update(v).digest('base64url')

/** Só aceita caminhos internos (evita open redirect para outro domínio) */
export function safeReturnTo(value: unknown): string {
  if (typeof value !== 'string' || value.length > 500) return '/'
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return '/'
  if (/[\u0000-\u001f\u007f]/.test(value)) return '/'
  return value
}

const OAuthCookieSchema = z.object({ state: z.string(), verifier: z.string(), nonce: z.string(), returnTo: z.string() })

const CallbackQuery = z.object({
  code: z.string().max(2000).optional(),
  state: z.string().max(200).optional(),
  error: z.string().max(200).optional(),
})

const DevLoginBody = z.object({
  name: z.string().trim().min(1).max(120).default('Visitante'),
  email: z.email().max(200).default('dev@rumo.local'),
})

const authLimit = { rateLimit: { max: 30, timeWindow: '1 minute' } }

export async function authRoutes(app: FastifyInstance, { config, pool, oauth }: Deps) {
  const cookieOpts = { path: OAUTH_COOKIE_PATH, httpOnly: true, sameSite: 'lax' as const, secure: config.secureCookies }

  const fail = (reply: FastifyReply, code: AuthErrorCode) => reply.redirect(`/?authError=${code}`)

  app.get('/auth/config', async (): Promise<AuthConfig> => ({ google: !!oauth, devLogin: config.devLogin }))

  app.get('/auth/google', { config: authLimit }, async (request, reply) => {
    if (!oauth) return fail(reply, 'config')
    const { returnTo } = request.query as { returnTo?: unknown }
    const flow = { state: random(), verifier: random(48), nonce: random(), returnTo: safeReturnTo(returnTo) }
    reply.setCookie(OAUTH_COOKIE, JSON.stringify(flow), { ...cookieOpts, signed: true, maxAge: 600 })
    return reply.redirect(oauth.authorizationUrl({ state: flow.state, nonce: flow.nonce, codeChallenge: s256(flow.verifier) }))
  })

  app.get('/auth/google/callback', { config: authLimit }, async (request, reply) => {
    if (!oauth) return fail(reply, 'config')
    const query = CallbackQuery.safeParse(request.query)

    // o cookie do fluxo vale para uma única tentativa
    const raw = request.cookies[OAUTH_COOKIE]
    reply.clearCookie(OAUTH_COOKIE, cookieOpts)
    const unsigned = raw ? request.unsignCookie(raw) : null
    let flow: z.infer<typeof OAuthCookieSchema> | null = null
    if (unsigned?.valid && unsigned.value) {
      try {
        flow = OAuthCookieSchema.parse(JSON.parse(unsigned.value))
      } catch {
        flow = null
      }
    }

    if (!query.success) return fail(reply, 'state')
    if (query.data.error) return fail(reply, 'denied')
    if (!flow || !query.data.state || query.data.state !== flow.state || !query.data.code) return fail(reply, 'state')

    let identity
    try {
      identity = await oauth.exchangeCode(query.data.code, flow.verifier)
    } catch (err) {
      request.log.warn({ err }, 'falha ao trocar o code do Google')
      return fail(reply, 'exchange')
    }
    if (identity.nonce !== flow.nonce) return fail(reply, 'state')
    if (!identity.emailVerified) return fail(reply, 'email')

    const user = await ensureUser(pool, {
      googleSub: identity.sub,
      email: identity.email,
      name: identity.name,
      avatarUrl: identity.picture,
    })
    const token = await createSession(pool, config, user.id, request.headers['user-agent'])
    setSessionCookie(reply, config, token)
    return reply.redirect(safeReturnTo(flow.returnTo))
  })

  app.post('/auth/dev', { config: authLimit }, async (request, reply) => {
    if (!config.devLogin) throw notFound('Rota')
    const body = DevLoginBody.parse(request.body ?? {})
    const user = await ensureUser(pool, { googleSub: `dev:${body.email}`, email: body.email, name: body.name, avatarUrl: null })
    const token = await createSession(pool, config, user.id, request.headers['user-agent'])
    setSessionCookie(reply, config, token)
    return reply.code(204).send()
  })

  app.post('/auth/logout', async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE]
    if (token) await deleteSessionByToken(pool, token)
    clearSessionCookie(reply, config)
    return reply.code(204).send()
  })
}
