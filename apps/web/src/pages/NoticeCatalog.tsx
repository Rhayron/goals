import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, FileText, Search } from 'lucide-react'
import type { CatalogSearch } from '@coado/shared'
import { PageHeader } from '../components/Layout'
import { Button, Card } from '../components/ui'
import { api } from '../lib/api'
import { fmtDate } from '../lib/utils'

export default function NoticeCatalog() {
  const [query, setQuery] = useState(''),
    [uf, setUf] = useState(''),
    [search, setSearch] = useState({ q: '', uf: '', page: 1 })
  const [result, setResult] = useState<CatalogSearch | null>(null),
    [error, setError] = useState(''),
    [revision, setRevision] = useState(0)
  useEffect(() => {
    const c = new AbortController()
    setResult(null)
    setError('')
    const params = new URLSearchParams({ q: search.q, page: String(search.page) })
    if (search.uf) params.set('uf', search.uf)
    api
      .get<CatalogSearch>(`/catalog/notices?${params}`, { signal: c.signal })
      .then(setResult)
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message)
      })
    return () => c.abort()
  }, [search, revision])
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSearch({ q: query, uf, page: 1 })
  }
  return (
    <>
      <PageHeader title="Base de editais" hidePlan>
        <Link className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white" to="/importar-edital">
          Importar PDF ou link
        </Link>
      </PageHeader>
      <p className="mb-5 text-muted">Encontre uma fonte revisada e transforme o conteúdo do seu cargo em um plano pessoal.</p>
      <form onSubmit={submit} className="mb-6 flex flex-wrap items-end gap-3">
        <label className="min-w-48 flex-1 text-sm">
          Órgão, cargo ou banca
          <input
            className="field mt-1"
            maxLength={100}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex.: engenharia, Petrobras, FGV"
          />
        </label>
        <label className="text-sm">
          UF
          <select className="field mt-1 w-28" value={uf} onChange={(e) => setUf(e.target.value)}>
            <option value="">Todas</option>
            {'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ').map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </label>
        <Button type="submit">
          <Search size={16} />
          Buscar
        </Button>
      </form>
      {error ? (
        <p role="alert" className="rounded-xl bg-bad/10 p-4 text-sm">
          {error}{' '}
          <button className="underline" onClick={() => setRevision((v) => v + 1)}>
            Tentar novamente
          </button>
        </p>
      ) : !result ? (
        <p role="status">Consultando a base…</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">{result.total} editais encontrados</p>
          {!result.items.length && (
            <Card title="Nenhum edital disponível nesta busca">
              <p className="text-sm text-muted">
                O catálogo contém apenas registros publicados após revisão. Você já pode importar o PDF ou o link oficial do seu concurso.
              </p>
              <Link className="mt-4 inline-block text-brand-600 underline" to="/importar-edital">
                Importar meu edital
              </Link>
            </Card>
          )}
          <div className="grid gap-5 lg:grid-cols-2">
            {result.items.map((n) => (
              <Card key={n.id}>
                <p className="text-xs font-semibold uppercase text-muted">
                  {n.organizer || 'Banca não informada'} · {n.state || 'Abrangência não informada'}
                </p>
                {n.provider === 'qapi' && (
                  <p className="mt-2 text-xs text-muted">
                    Dados de concurso fornecidos por{' '}
                    <a href="https://qapi.otunac.com/" target="_blank" rel="noreferrer" className="underline">
                      QAPI
                    </a>
                    .
                  </p>
                )}
                <h2 className="mt-2 font-display text-xl font-bold">{n.title}</h2>
                <p className="mt-2 text-sm">{n.positions.join(' · ') || 'Consulte os cargos no edital'}</p>
                <dl className="my-4 space-y-2 text-sm">
                  <div>
                    <dt className="text-muted">Situação informada pela fonte</dt>
                    <dd>{n.providerStatus}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Inscrições</dt>
                    <dd>
                      {n.registrationStart || 'Não informado'} → {n.registrationEnd || 'Não informado'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Prova</dt>
                    <dd>{n.examDateText || 'Consulte o edital'}</dd>
                  </div>
                </dl>
                <p className="mb-4 text-xs text-muted">
                  Revisado em {fmtDate(n.checkedAt.slice(0, 10))} · versão {n.version}. Confira retificações e prazos na fonte.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white"
                    to={`/importar-edital?catalog=${n.id}`}
                  >
                    <FileText size={16} />
                    Revisar e usar edital
                  </Link>
                  <a className="inline-flex items-center gap-1 text-sm underline" href={n.sourceUrl} target="_blank" rel="noreferrer">
                    Fonte <ExternalLink size={14} />
                  </a>
                </div>
              </Card>
            ))}
          </div>
          {result.total > 20 && (
            <div className="mt-5 flex items-center gap-3">
              <Button variant="secondary" disabled={search.page === 1} onClick={() => setSearch((s) => ({ ...s, page: s.page - 1 }))}>
                Anterior
              </Button>
              <span>
                Página {search.page} de {Math.ceil(result.total / 20)}
              </span>
              <Button
                variant="secondary"
                disabled={search.page * 20 >= result.total}
                onClick={() => setSearch((s) => ({ ...s, page: s.page + 1 }))}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </>
  )
}
