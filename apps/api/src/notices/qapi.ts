import { z } from 'zod'
import { CatalogMetadataSchema, type CatalogMetadata } from './catalog'

const Name = z.object({ nome: z.string().min(1).max(300) })
const RawNotice = z.object({
  _id: z.string().min(1).max(100),
  orgao: Name,
  banca: Name.nullish(),
  ano: z.number().int(),
  descricao: z.string().max(20000),
  status: z.string().max(100),
  website: z.string().nullish(),
  cargos: z.array(z.string().max(300)).max(100).nullish(),
  siglaEstado: z.string().nullish(),
  inicioInscricao: z.string().nullish(),
  fimInscricao: z.string().nullish(),
  dataProva: z.string().nullish(),
})
const Page = z.object({
  concursos: z.array(RawNotice).max(10),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pages: z.number().int().nonnegative(),
})
export function parseQapiPage(raw: unknown) {
  const data = Page.parse(raw)
  const records: { externalId: string; metadata: CatalogMetadata }[] = []
  const skipped: string[] = []
  for (const row of data.concursos) {
    const normalized = CatalogMetadataSchema.safeParse({
      title: `${row.orgao.nome} — ${row.ano}`.slice(0, 200),
      agency: row.orgao.nome,
      organizer: row.banca?.nome ?? '',
      year: row.ano,
      state: row.siglaEstado ?? '',
      positions: row.cargos ?? [],
      sourceUrl: row.website ?? '',
      providerStatus: row.status,
      registrationStart: row.inicioInscricao ?? '',
      registrationEnd: row.fimInscricao ?? '',
      examDateText: row.dataProva ?? '',
    })
    // Não inventa URL oficial ou transforma uma data textual em uma data confirmada.
    if (!normalized.success) skipped.push(row._id)
    else records.push({ externalId: row._id, metadata: normalized.data })
  }
  return { records, skipped, page: data.page, pages: data.pages, total: data.total }
}
export async function fetchQapiPage(key: string, page: number, year?: number, fetcher = fetch) {
  const query = new URLSearchParams({ page: String(page), size: '10' })
  if (year) query.set('ano', String(year))
  const res = await fetcher(`https://qapi.otunac.com/api/concursos?${query}`, {
    headers: { 'Q-Api-Key': key, Accept: 'application/json' },
    signal: AbortSignal.timeout(20_000),
    redirect: 'error',
  })
  if (!res.ok) throw new Error(`QAPI respondeu HTTP ${res.status}. Ingestão interrompida sem retry automático.`)
  const text = await res.text()
  if (text.length > 2_000_000) throw new Error('Resposta QAPI maior que o limite esperado.')
  return parseQapiPage(JSON.parse(text))
}
