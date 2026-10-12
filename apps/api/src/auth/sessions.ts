import { createHash, randomBytes } from 'node:crypto'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { Config } from '../config'
import type { Db, Pool } from '../db'
import { unauthorized } from '../errors'
import { toMe, type UserRow } from './users'

export const SESSION_COOKIE = 'rumo_session'

const HOUR = 60 * 60 * 1000

export const hashToken = (token: string) => createHash('sha256').update(token).digest()

export function setSessionCookie(reply: FastifyReply, config: Config, token: string) {
  reply.setCookie(SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: config.secureCookies,
    maxAge: Math.floor(config.sessionTtlMs / 1000),
  })
}

export function clearSessionCookie(reply: FastifyReply, config: Config) {
  reply.clearCookie(SESSION_COOKIE, { path: '/', httpOnly: true, sameSite: 'lax', secure: config.secureCookies })
}

/** Abre uma sessão e devolve o token que vai no cookie (o banco guarda só o hash) */
export async function createSession(db: Db, config: Config, userId: string, userAgent: string | undefined) {
  const token = randomBytes(32).toString('base64url')
  await db.query(
    `insert into sessions (token_hash, user_id, user_agent, expires_at)
     values ($1, $2, $3, now() + make_interval(secs => $4))`,
    [hashToken(token), userId, userAgent?.slice(0, 500) ?? null, config.sessionTtlMs / 1000],
  )
  return token
}

export async function deleteSessionByToken(db: Db, token: string) {
  await db.query('delete from sessions where token_hash = $1', [hashToken(token)])
}

export async function deleteExpiredSessions(db: Db) {
  const { rowCount } = await db.query('delete from sessions where expires_at <= now()')
  return rowCount ?? 0
}

/**
 * Hook de autenticação: resolve o usuário pelo cookie e renova a sessão de forma deslizante
 * (atualiza last_seen a cada hora e estende a validade quando passou da metade).
 */
export function requireUser(pool: Pool, config: Config) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.cookies[SESSION_COOKIE]
    if (!token) throw unauthorized()
    const { rows } = await pool.query<UserRow & { session_id: string; last_seen_at: Date; expires_at: Date }>(
      `select s.id as session_id, s.last_seen_at, s.expires_at,
              u.id, u.email, u.name, u.avatar_url, u.created_at, u.onboarded_at
         from sessions s join users u on u.id = s.user_id
        where s.token_hash = $1 and s.expires_at > now()`,
      [hashToken(token)],
    )
    const row = rows[0]
    if (!row) {
      clearSessionCookie(reply, config)
      throw unauthorized()
    }

    const now = Date.now()
    const extend = row.expires_at.getTime() - now < config.sessionTtlMs / 2
    if (extend || now - row.last_seen_at.getTime() > HOUR) {
      await pool.query(
        `update sessions set last_seen_at = now(),
                expires_at = case when $2 then now() + make_interval(secs => $3) else expires_at end
          where id = $1`,
        [row.session_id, extend, config.sessionTtlMs / 1000],
      )
      if (extend) setSessionCookie(reply, config, token)
    }

    request.user = toMe(row)
    request.sessionId = row.session_id
  }
}
