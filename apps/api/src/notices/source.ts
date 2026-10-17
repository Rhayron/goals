import { lookup } from 'node:dns/promises'
import { request } from 'node:https'
import ipaddr from 'ipaddr.js'
import { load } from 'cheerio'
import type { NoticeSourceLinks } from '@coado/shared'
import { badRequest, HttpError } from '../errors'

export const MAX_SOURCE_BYTES = 20 * 1024 * 1024
const TIMEOUT = 20_000
export const publicIp = (address: string) => {
  try {
    return ipaddr.process(address).range() === 'unicast'
  } catch {
    return false
  }
}
export function publicUrl(raw: string): URL {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw badRequest('Informe um link HTTPS válido.')
  }
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443'))
    throw badRequest('Use um link HTTPS público, sem usuário, senha ou porta especial.')
  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (!host.includes('.') || /(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(host) || (ipaddr.isValid(host) && !publicIp(host)))
    throw badRequest('Esse endereço não é um site público permitido.')
  url.hash = ''
  return url
}

/** Resolve e fixa o IP da conexão. Redirecionamentos passam por toda a validação novamente. */
export async function fetchPublicSource(raw: string, signal: AbortSignal, hops = 0): Promise<{ bytes: Buffer; type: string; url: string }> {
  const url = publicUrl(raw)
  if (hops > 4) throw badRequest('O link redireciona vezes demais. Use o endereço final do PDF.')
  const addresses = await Promise.race([
    lookup(url.hostname, { all: true }),
    new Promise<never>((_, reject) => {
      if (signal.aborted) reject(badRequest('Tempo de consulta esgotado.'))
      else signal.addEventListener('abort', () => reject(badRequest('Tempo de consulta esgotado.')), { once: true })
    }),
  ])
  if (!addresses.length || addresses.some((a) => !publicIp(a.address))) throw badRequest('O link aponta para uma rede não permitida.')
  const result = await new Promise<{ bytes: Buffer; type: string; redirect?: string }>((resolve, reject) => {
    const pinned = addresses[0]
    const req = request(
      url,
      {
        signal,
        agent: false,
        headers: { Accept: 'application/pdf,text/html;q=0.8', 'Accept-Encoding': 'identity', 'User-Agent': 'Coado-Edital/1.0' },
        lookup: (_host, options, cb) => {
          if (typeof options === 'object' && options.all) cb(null, [pinned])
          else cb(null, pinned.address, pinned.family)
        },
      },
      (res) => {
        const fail = (error: Error) => {
          res.destroy()
          reject(error)
        }
        if ([301, 302, 303, 307, 308].includes(res.statusCode ?? 0)) {
          const location = res.headers.location
          res.destroy()
          if (!location) return reject(badRequest('Redirecionamento sem destino.'))
          return resolve({ bytes: Buffer.alloc(0), type: '', redirect: new URL(location, url).href })
        }
        if (res.statusCode !== 200) return fail(badRequest(`A fonte respondeu HTTP ${res.statusCode}. Baixe o PDF e importe o arquivo.`))
        if (res.headers['content-encoding'] && res.headers['content-encoding'] !== 'identity')
          return fail(badRequest('A fonte enviou um formato não suportado. Importe o arquivo baixado.'))
        if (Number(res.headers['content-length']) > MAX_SOURCE_BYTES)
          return fail(new HttpError(413, 'source_large', 'O PDF deve ter até 20 MB.'))
        const chunks: Buffer[] = []
        let size = 0
        res.on('data', (chunk: Buffer) => {
          size += chunk.length
          if (size > MAX_SOURCE_BYTES) return fail(new HttpError(413, 'source_large', 'O arquivo deve ter até 20 MB.'))
          chunks.push(chunk)
        })
        res.on('error', reject)
        res.on('end', () => resolve({ bytes: Buffer.concat(chunks), type: res.headers['content-type'] ?? '' }))
      },
    )
    req.on('error', reject)
    req.end()
  })
  if (result.redirect) return fetchPublicSource(result.redirect, signal, hops + 1)
  return { ...result, url: url.href }
}

export function sourceLinks(bytes: Buffer, url: string): NoticeSourceLinks {
  const $ = load(bytes.toString('utf8'))
  const links = new Map<string, string>()
  $('a[href]').each((_, a) => {
    if (links.size >= 40) return
    const label = $(a).text().replace(/\s+/g, ' ').trim()
    try {
      const target = publicUrl(new URL($(a).attr('href')!, url).href).href
      if (/\.pdf(?:[?#]|$)/i.test(target) || /edital|retifica|conteúdo programático|anexo/i.test(label))
        links.set(target, (label || new URL(target).pathname.split('/').pop() || 'Documento').slice(0, 200))
    } catch {
      /* ignora links não públicos */
    }
  })
  return { kind: 'links', sourceUrl: url, links: [...links].map(([url, title]) => ({ title, url })) }
}

export async function getSource(raw: string) {
  try {
    const result = await fetchPublicSource(raw, AbortSignal.timeout(TIMEOUT))
    if (result.bytes.subarray(0, 5).toString() === '%PDF-') return { kind: 'pdf' as const, ...result }
    if (/text\/html|application\/xhtml\+xml/i.test(result.type)) return sourceLinks(result.bytes, result.url)
    throw badRequest('O link não retornou PDF nem página de edital. Baixe o PDF e importe o arquivo.')
  } catch (e) {
    if (e instanceof HttpError) throw e
    throw badRequest('Não foi possível acessar essa fonte. Confira o link ou importe o PDF baixado.')
  }
}
