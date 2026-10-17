import { createHash } from 'node:crypto'
import { z } from 'zod'
import type { CatalogNotice } from '@coado/shared'
import { tx, type Pool } from '../db'
import { publicUrl } from './source'

export const CatalogMetadataSchema = z.object({
  title: z.string().min(1).max(200),
  agency: z.string().max(300),
  organizer: z.string().max(300),
  state: z.string().max(2),
  positions: z.array(z.string().max(300)).max(100),
  year: z.number().int().min(1900).max(2200),
  sourceUrl: z
    .string()
    .max(2048)
    .refine((v) => {
      try {
        publicUrl(v)
        return true
      } catch {
        return false
      }
    }, 'Fonte HTTPS pública obrigatória'),
  providerStatus: z.string().max(100),
  registrationStart: z.string().max(200),
  registrationEnd: z.string().max(200),
  examDateText: z.string().max(200),
})
export type CatalogMetadata = z.infer<typeof CatalogMetadataSchema>
export const sourceHash = (metadata: CatalogMetadata) =>
  createHash('sha256')
    .update(JSON.stringify(CatalogMetadataSchema.parse(metadata)))
    .digest('hex')

export async function ingestNotice(pool: Pool, provider: string, externalId: string, input: CatalogMetadata) {
  const metadata = CatalogMetadataSchema.parse(input),
    hash = sourceHash(metadata)
  return tx(pool, async (db) => {
    const { rows } = await db.query(
      `insert into catalog.notices(provider,external_id,source_hash,metadata)
      values($1,$2,$3,$4) on conflict(provider,external_id) do update set
      last_seen_at=now(), metadata=excluded.metadata, source_hash=excluded.source_hash,
      version=catalog.notices.version + case when catalog.notices.source_hash<>excluded.source_hash then 1 else 0 end,
      status=case when catalog.notices.source_hash<>excluded.source_hash then 'pending' else catalog.notices.status end,
      reviewed_at=case when catalog.notices.source_hash<>excluded.source_hash then null else catalog.notices.reviewed_at end,
      reviewed_by=case when catalog.notices.source_hash<>excluded.source_hash then null else catalog.notices.reviewed_by end
      returning id,version`,
      [provider, externalId, hash, metadata],
    )
    const row = rows[0]
    await db.query(`insert into catalog.revisions(notice_id,version,metadata,source_hash) values($1,$2,$3,$4) on conflict do nothing`, [
      row.id,
      row.version,
      metadata,
      hash,
    ])
    return row as { id: string; version: number }
  })
}
export async function publishNotice(pool: Pool, id: string, expectedVersion: number, reviewer: string, pdfUrl: string) {
  publicUrl(pdfUrl)
  const r = await pool.query(
    `update catalog.notices set status='published',pdf_url=$3,reviewed_by=$4,reviewed_at=now()
    where id=$1 and version=$2 returning id`,
    [id, expectedVersion, pdfUrl, reviewer],
  )
  if (!r.rowCount) throw new Error('Registro ausente ou alterado desde a revisão. Consulte a versão atual antes de publicar.')
}
export function publicNotice(row: Record<string, any>): CatalogNotice {
  return {
    ...CatalogMetadataSchema.parse(row.metadata),
    id: row.id,
    pdfUrl: row.pdf_url,
    provider: row.provider,
    checkedAt: new Date(row.reviewed_at).toISOString(),
    version: row.version,
  }
}
