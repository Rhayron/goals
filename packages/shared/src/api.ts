/*
 * Contrato HTTP entre web e api (prefixo /api).
 *
 * Toda requisição que altera algo (POST/PUT/PATCH/DELETE) precisa do cabeçalho
 * `X-Rumo-Request: 1` — defesa contra CSRF somada ao cookie SameSite=Lax.
 *
 *  GET    /health                       → { status, db }
 *  GET    /auth/config                  → AuthConfig
 *  GET    /auth/google?returnTo=/rota   → 302 para o Google
 *  GET    /auth/google/callback         → 302 para returnTo (ou /?authError=codigo)
 *  POST   /auth/dev  { name?, email? }  → 204 (só com AUTH_DEV_LOGIN=true fora de produção)
 *  POST   /auth/logout                  → 204
 *  GET    /me                           → Me
 *  PATCH  /me        ProfilePatch       → Me
 *  DELETE /me                           → 204 (apaga conta, dados e arquivos)
 *  GET    /me/sessions                  → SessionInfo[]
 *  DELETE /me/sessions                  → 204 (encerra as outras sessões)
 *  DELETE /me/sessions/:id              → 204
 *  GET    /state                        → AppState
 *  PUT    /state     AppState           → AppState (substitui tudo; importação de backup)
 *  POST   /sync      SyncRequest        → SyncResponse
 *  GET    /files                        → FilesResponse
 *  POST   /files     multipart: file, planId?, subjectId? → FileMeta (201)
 *  PATCH  /files/:id FilePatch          → FileMeta
 *  GET    /files/:id/content[?download=1] → conteúdo do arquivo
 *  DELETE /files/:id                    → 204
 */

export const CSRF_HEADER = 'x-rumo-request'

export interface AuthConfig {
  google: boolean
  devLogin: boolean
}

export interface Me {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  createdAt: string
  onboardedAt: string | null
}

export interface SessionInfo {
  id: string
  createdAt: string
  lastSeenAt: string
  userAgent: string | null
  current: boolean
}

export interface FileMeta {
  id: string
  name: string
  mime: string
  size: number
  planId: string | null
  subjectId: string | null
  createdAt: string
}

export interface StorageUsage {
  /** bytes */
  used: number
  quota: number
  maxFileSize: number
}

export interface FilesResponse {
  files: FileMeta[]
  usage: StorageUsage
}

export interface SyncResponse {
  ok: true
  syncedAt: string
}

export interface ApiErrorBody {
  error: string
  message: string
  details?: unknown
}

/** Códigos de erro de login devolvidos em /?authError= */
export type AuthErrorCode = 'state' | 'denied' | 'exchange' | 'email' | 'config'
