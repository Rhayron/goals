import 'fastify'
import type { Me } from '@rumo/shared'

declare module 'fastify' {
  interface FastifyRequest {
    /** preenchido pelo hook requireUser nas rotas autenticadas */
    user: Me
    sessionId: string
  }
}
