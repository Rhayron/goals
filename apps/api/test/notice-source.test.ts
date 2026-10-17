import { EventEmitter } from 'node:events'
import { Readable } from 'node:stream'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ lookup: vi.fn(), request: vi.fn() }))
vi.mock('node:dns/promises', () => ({ lookup: mocks.lookup }))
vi.mock('node:https', () => ({ request: mocks.request }))
import { getSource, publicIp, publicUrl, sourceLinks, MAX_SOURCE_BYTES } from '../src/notices/source'

describe('leitura de fontes públicas', () => {
  const responses: { status: number; headers: Record<string, string>; body: string }[] = []
  beforeEach(() => {
    responses.length = 0
    mocks.lookup.mockReset()
    mocks.request.mockReset()
    mocks.lookup.mockResolvedValue([{ address: '8.8.8.8', family: 4 }])
    mocks.request.mockImplementation((_url, _opts, cb) => {
      const req = new EventEmitter() as EventEmitter & { end: () => void }
      req.end = () =>
        queueMicrotask(() => {
          const next = responses.shift() ?? { status: 200, headers: { 'content-type': 'application/pdf' }, body: '%PDF-1.7 test' }
          const res = Object.assign(Readable.from([Buffer.from(next.body)]), { statusCode: next.status, headers: next.headers })
          cb(res)
        })
      return req
    })
  })
  it('recusa redes privadas, loopback, metadata, IPv6 mapeado e protocolos impróprios', () => {
    for (const ip of [
      '127.0.0.1',
      '10.1.1.1',
      '172.16.0.1',
      '192.168.1.1',
      '169.254.169.254',
      '100.64.0.1',
      '::1',
      '::ffff:127.0.0.1',
      'fc00::1',
      'fe80::1',
      '0.0.0.0',
    ])
      expect(publicIp(ip), ip).toBe(false)
    for (const url of [
      'http://example.com/a.pdf',
      'file:///etc/passwd',
      'https://localhost/',
      'https://0x7f000001/',
      'https://127.1/',
      'https://user:pass@example.com/',
      'https://example.com:444/',
      'https://example.local/',
    ])
      expect(() => publicUrl(url), url).toThrow()
    expect(publicIp('8.8.8.8')).toBe(true)
  })
  it('fixa o IP validado no socket mantendo hostname HTTPS', async () => {
    expect((await getSource('https://example.com/edital.pdf')).kind).toBe('pdf')
    const [url, options] = mocks.request.mock.calls[0]
    expect(url.hostname).toBe('example.com')
    const cb = vi.fn()
    options.lookup('example.com', {}, cb)
    expect(cb).toHaveBeenCalledWith(null, '8.8.8.8', 4)
    expect(options.agent).toBe(false)
  })
  it('revalida cada redirecionamento e recusa DNS com IP privado', async () => {
    responses.push({ status: 302, headers: { location: 'https://internal.example.com/' }, body: '' })
    mocks.lookup.mockResolvedValueOnce([{ address: '8.8.8.8', family: 4 }]).mockResolvedValueOnce([{ address: '10.0.0.3', family: 4 }])
    await expect(getSource('https://example.com/')).rejects.toThrow('rede não permitida')
    expect(mocks.request).toHaveBeenCalledTimes(1)
  })
  it('limita tamanho, redirecionamentos e conteúdo retornado', async () => {
    responses.push({ status: 200, headers: { 'content-length': String(MAX_SOURCE_BYTES + 1) }, body: 'large' })
    await expect(getSource('https://example.com/')).rejects.toThrow('20 MB')
    for (let i = 0; i < 5; i++) responses.push({ status: 302, headers: { location: '/loop' }, body: '' })
    await expect(getSource('https://example.com/')).rejects.toThrow('redireciona')
    responses.push({ status: 200, headers: { 'content-type': 'application/pdf' }, body: 'not a pdf' })
    await expect(getSource('https://example.com/')).rejects.toThrow('não retornou PDF')
  })
  it('lista PDFs e editais com URLs relativas, sem executar scripts ou links privados', () => {
    const r = sourceLinks(
      Buffer.from(
        '<script>alert(1)</script><a href="/edital.pdf">Edital &amp; Anexos</a><a href="javascript:alert(1)">Edital falso</a><a href="https://127.0.0.1/a.pdf">Interno</a><a href="/login">Login</a>',
      ),
      'https://example.com/concurso/',
    )
    expect(r.links).toEqual([{ title: 'Edital & Anexos', url: 'https://example.com/edital.pdf' }])
  })
})
