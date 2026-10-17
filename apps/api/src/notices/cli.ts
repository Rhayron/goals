import { parseArgs } from 'node:util'
import { z } from 'zod'
import { createPool } from '../db'
import { ingestNotice, publishNotice } from './catalog'
import { fetchQapiPage } from './qapi'
import { getSource } from './source'

/** Operação editorial/ingestão. Não é exposta como endpoint do produto. */
async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      apply: { type: 'boolean' },
      'max-pages': { type: 'string', default: '3' },
      'start-page': { type: 'string', default: '1' },
      year: { type: 'string' },
      id: { type: 'string' },
      version: { type: 'string' },
      reviewer: { type: 'string' },
      'pdf-url': { type: 'string' },
    },
  })
  const command = z.enum(['sync-qapi', 'pending', 'publish', 'archive']).parse(positionals[0])
  if (!process.env.DATABASE_URL) throw new Error('Defina DATABASE_URL da base de editais.')
  const pool = createPool(process.env.DATABASE_URL)
  try {
    if (command === 'pending') {
      console.log(
        JSON.stringify(
          (
            await pool.query(
              `select id,version,metadata,last_seen_at from catalog.notices where status='pending' order by last_seen_at desc limit 100`,
            )
          ).rows,
          null,
          2,
        ),
      )
      return
    }
    if (command === 'publish') {
      const id = z.uuid().parse(values.id),
        version = z.coerce.number().int().positive().parse(values.version)
      const reviewer = z.string().trim().min(1).max(100).parse(values.reviewer),
        pdf = z.url().max(2048).parse(values['pdf-url'])
      if ((await getSource(pdf)).kind !== 'pdf') throw new Error('Informe o link direto do PDF revisado.')
      await publishNotice(pool, id, version, reviewer, pdf)
      console.log('Edital publicado na base. Planos pessoais existentes não foram modificados.')
      return
    }
    if (command === 'archive') {
      const id = z.uuid().parse(values.id)
      await pool.query(`update catalog.notices set status='archived' where id=$1`, [id])
      console.log('Registro retirado da busca; histórico e planos pessoais preservados.')
      return
    }
    if (process.env.QAPI_INGESTION_ENABLED !== 'true' || !process.env.QAPI_API_KEY)
      throw new Error(
        'QAPI desativada. Configure QAPI_API_KEY e QAPI_INGESTION_ENABLED=true após validar os direitos de armazenamento e redistribuição.',
      )
    const maxPages = z.coerce.number().int().min(1).max(100).parse(values['max-pages'])
    const start = z.coerce.number().int().positive().parse(values['start-page'])
    const year = values.year ? z.coerce.number().int().min(1900).max(2200).parse(values.year) : undefined
    const lock = await pool.connect()
    let runId = '',
      requests = 0,
      records = 0,
      skipped = 0
    try {
      if (!(await lock.query("select pg_try_advisory_lock(hashtext('coado-qapi-ingest')) as locked")).rows[0].locked)
        throw new Error('Já existe uma ingestão QAPI em andamento.')
      runId = (await pool.query(`insert into catalog.ingestion_runs(provider,status) values('qapi','running') returning id`)).rows[0].id
      let complete = false
      for (let page = start; page < start + maxPages; page++) {
        requests++
        const result = await fetchQapiPage(process.env.QAPI_API_KEY, page, year)
        if (result.page !== page) throw new Error('QAPI retornou página inesperada; ingestão interrompida.')
        for (const item of result.records) {
          if (values.apply) await ingestNotice(pool, 'qapi', item.externalId, item.metadata)
          records++
        }
        skipped += result.skipped.length
        if (page >= result.pages) {
          complete = true
          break
        }
      }
      await pool.query(`update catalog.ingestion_runs set finished_at=now(),status=$2,requests=$3,records=$4 where id=$1`, [
        runId,
        values.apply ? (complete ? 'complete' : 'partial') : 'dry-run',
        requests,
        records,
      ])
      console.log(
        JSON.stringify({
          mode: values.apply ? 'apply' : 'dry-run',
          requests,
          records,
          skipped,
          complete,
          nextPage: complete ? null : start + requests,
          note: 'A simulação também consome chamadas pagas. Nenhum registro é publicado automaticamente.',
        }),
      )
    } catch (e) {
      if (runId)
        await pool.query(
          `update catalog.ingestion_runs set finished_at=now(),status='failed',requests=$2,records=$3,error=$4 where id=$1`,
          [runId, requests, records, (e as Error).message.slice(0, 1000)],
        )
      throw e
    } finally {
      await lock.query("select pg_advisory_unlock(hashtext('coado-qapi-ingest'))")
      lock.release()
    }
  } finally {
    await pool.end()
  }
}
main().catch((e) => {
  console.error((e as Error).message)
  process.exitCode = 1
})
