import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FileText, Link2, Plus, Trash2, Upload } from 'lucide-react'
import {
  CSRF_HEADER,
  DateStrSchema,
  NoticeOutlineSchema,
  type CatalogNotice,
  type NoticeOutline,
  type NoticeSourceLinks,
} from '@coado/shared'
import { PageHeader } from '../components/Layout'
import { Button, Card } from '../components/ui'
import { api } from '../lib/api'
import { useStore } from '../lib/store'
import { importNoticePlan, suggestOutline, type ImportDetails } from '../lib/notice-import'

const blank: ImportDetails = { name: '', agency: '', role: '', examDate: '', source: '' }
export default function ImportNotice() {
  const { update } = useStore(),
    navigate = useNavigate(),
    [params] = useSearchParams()
  const [stage, setStage] = useState<1 | 2 | 3>(1),
    [details, setDetails] = useState<ImportDetails>(blank)
  const [url, setUrl] = useState(''),
    [links, setLinks] = useState<NoticeSourceLinks | null>(null)
  const [pages, setPages] = useState<string[]>([]),
    [from, setFrom] = useState(1),
    [to, setTo] = useState(1)
  const [text, setText] = useState(''),
    [outline, setOutline] = useState<NoticeOutline>([])
  const [error, setError] = useState(''),
    [warning, setWarning] = useState(''),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState('')
  const [confirmed, setConfirmed] = useState(false),
    [previewUrl, setPreviewUrl] = useState('')
  const controller = useRef<AbortController | null>(null),
    previewRef = useRef(''),
    created = useRef(false)
  const catalogId = params.get('catalog')
  useEffect(
    () => () => {
      controller.current?.abort()
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    },
    [],
  )
  useEffect(() => {
    if (!catalogId) return
    let active = true
    api
      .get<CatalogNotice>(`/catalog/notices/${encodeURIComponent(catalogId)}`)
      .then((n) => {
        if (!active) return
        setUrl(n.pdfUrl ?? n.sourceUrl)
        setDetails({
          ...blank,
          name: n.title,
          agency: n.agency,
          source: n.pdfUrl ?? n.sourceUrl,
          catalogId: n.id,
          catalogVersion: n.version,
          catalogProvider: n.provider,
          role: n.positions.length === 1 ? n.positions[0] : '',
        })
      })
      .catch((e) => {
        if (active) setError(e.message)
      })
    return () => {
      active = false
    }
  }, [catalogId])
  useEffect(() => {
    const prevent = (e: BeforeUnloadEvent) => {
      if (stage > 1 && !created.current) e.preventDefault()
    }
    window.addEventListener('beforeunload', prevent)
    return () => window.removeEventListener('beforeunload', prevent)
  }, [stage])
  const change = (key: keyof ImportDetails, value: string) => {
    setDetails((d) => ({ ...d, [key]: value }))
    setConfirmed(false)
  }
  async function readPdf(bytes: Uint8Array, source: string, signal: AbortSignal) {
    const blob = new Blob([bytes.slice().buffer], { type: 'application/pdf' })
    const { extractPdf } = await import('../lib/pdf-import')
    const result = await extractPdf(bytes, (p, n) => setProgress(`Lendo página ${p} de ${n}…`), signal)
    if (signal.aborted) return
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = URL.createObjectURL(blob)
    setPreviewUrl(previewRef.current)
    setPages(result.pages)
    setFrom(1)
    setTo(result.pages.length)
    setText('')
    setOutline([])
    setConfirmed(false)
    setDetails((d) => ({
      ...d,
      source,
      fingerprint: result.fingerprint,
      name:
        d.name ||
        source
          .split('/')
          .pop()
          ?.replace(/\.pdf$/i, '')
          .slice(0, 200) ||
        'Novo edital',
    }))
    setWarning(
      result.emptyPages.length
        ? `${result.emptyPages.length} página(s) têm pouco ou nenhum texto extraível. Confira o PDF: pode haver imagens ou tabelas que exigem transcrição. Esta versão não executa OCR.`
        : 'Confira a ordem do texto, os anexos e as retificações; tabelas e colunas podem sair fora de ordem.',
    )
    setStage(2)
  }
  async function run(fn: (signal: AbortSignal) => Promise<void>) {
    controller.current?.abort()
    const c = new AbortController()
    controller.current = c
    setBusy(true)
    setError('')
    setProgress('Preparando documento…')
    try {
      await fn(c.signal)
    } catch (e) {
      if (!c.signal.aborted) setError((e as Error).message)
    } finally {
      if (controller.current === c) {
        setBusy(false)
        setProgress('')
      }
    }
  }
  const file = (f: File) =>
    void run(async (signal) => {
      setDetails(blank)
      if (f.size > 20 * 1024 * 1024) throw new Error('Escolha um PDF de até 20 MB.')
      await readPdf(new Uint8Array(await f.arrayBuffer()), f.name, signal)
    })
  const link = (target: string) =>
    void run(async (signal) => {
      const res = await fetch('/api/notices/source', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', [CSRF_HEADER]: '1' },
        body: JSON.stringify({ url: target }),
        signal,
      })
      if (!res.ok) {
        const e = await res.json().catch(() => null)
        throw new Error(e?.message ?? 'Não foi possível ler a fonte.')
      }
      if (res.headers.get('content-type')?.includes('application/pdf')) {
        const source = decodeURIComponent(res.headers.get('X-Coado-Source') ?? encodeURIComponent(target))
        const blob = await res.blob()
        await readPdf(new Uint8Array(await blob.arrayBuffer()), source, signal)
      } else {
        setLinks(await res.json())
        setProgress('')
      }
    })
  function organize() {
    if (!text.trim()) {
      setError('Selecione as páginas ou cole o conteúdo programático do cargo.')
      return
    }
    const suggestion = suggestOutline(text)
    setOutline(suggestion.length ? suggestion : [{ name: 'Conteúdo a organizar', topics: [] }])
    setConfirmed(false)
    setError('')
    setStage(3)
  }
  function create() {
    if (!confirmed || created.current) return
    const parsed = NoticeOutlineSchema.safeParse(outline.map((s) => ({ ...s, topics: s.topics.map((t) => t.trim()).filter(Boolean) })))
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revise as disciplinas e tópicos.')
      return
    }
    if (!details.name.trim() || !details.role.trim()) {
      setError('Informe nome do plano e cargo.')
      return
    }
    if (details.examDate && !DateStrSchema.safeParse(details.examDate).success) {
      setError('Confira a data da prova.')
      return
    }
    created.current = true
    update((s) => importNoticePlan(s, details, parsed.data).state)
    navigate('/edital')
  }
  function editRows(next: NoticeOutline) {
    setOutline(next)
    setConfirmed(false)
  }
  const total = outline.reduce((n, s) => n + s.topics.length, 0)
  return (
    <>
      <PageHeader title="Importar edital" hidePlan />
      <p className="mb-5 text-muted">Transforme o conteúdo do seu cargo em um plano. Você revisa tudo antes de criar.</p>
      <ol className="mb-6 flex flex-wrap gap-3 text-sm" aria-label="Etapas da importação">
        {['Escolher fonte', 'Selecionar conteúdo', 'Revisar e criar'].map((name, i) => (
          <li
            key={name}
            aria-current={stage === i + 1 ? 'step' : undefined}
            className={`rounded-full px-4 py-2 ${stage === i + 1 ? 'bg-brand-600 text-white' : 'bg-surface-2 text-muted'}`}
          >
            {i + 1}. {name}
          </li>
        ))}
      </ol>
      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-bad/10 p-4 text-sm text-bad">
          {error}
        </p>
      )}
      {busy && (
        <div role="status" className="mb-4 flex items-center gap-4 rounded-xl bg-surface-2 p-4">
          <span>{progress}</span>
          <Button
            variant="secondary"
            onClick={() => {
              controller.current?.abort()
              setBusy(false)
              setProgress('')
            }}
          >
            Cancelar leitura
          </Button>
        </div>
      )}
      {stage === 1 && (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            <Card title="Arquivo PDF">
              <Upload className="mb-3 text-brand-600" />
              <p className="mb-4 text-sm text-muted">
                Até 20 MB e 300 páginas. O arquivo é lido no seu navegador; o PDF pessoal não é publicado na base compartilhada.
              </p>
              <label className="block text-sm font-semibold">
                Selecionar PDF
                <input
                  aria-label="Selecionar PDF"
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={busy}
                  className="field mt-2"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) file(f)
                    e.target.value = ''
                  }}
                />
              </label>
            </Card>
            <Card title="Link do edital">
              <Link2 className="mb-3 text-brand-600" />
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  link(url)
                }}
              >
                <label className="block text-sm">
                  PDF ou página oficial
                  <input
                    className="field my-2"
                    type="url"
                    required
                    placeholder="https://banca.org.br/edital.pdf"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value)
                      setLinks(null)
                      setDetails(blank)
                    }}
                    disabled={busy}
                  />
                </label>
                <Button type="submit" disabled={busy || !url}>
                  Consultar link
                </Button>
              </form>
              <p className="mt-3 text-xs text-muted">
                Links públicos HTTPS. Páginas com login ou bloqueio devem ser baixadas por você e importadas como arquivo.
              </p>
            </Card>
          </div>
          {links && (
            <Card className="mt-5" title="Documentos encontrados na página">
              <p className="mb-3 text-sm text-muted">
                Escolha o edital ou anexo correspondente ao cargo. Uma página pode conter resultados e versões antigas.
              </p>
              {links.links.length ? (
                <ul className="space-y-2">
                  {links.links.map((l) => (
                    <li key={l.url}>
                      <button
                        disabled={busy}
                        className="w-full break-words rounded-lg bg-surface-2 p-3 text-left text-sm hover:underline"
                        onClick={() => link(l.url)}
                      >
                        {l.title}
                        <span className="mt-1 block text-xs text-muted">{new URL(l.url).hostname}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum documento identificado. Copie o link direto do PDF ou envie o arquivo.</p>
              )}
            </Card>
          )}
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <Link className="text-brand-600 underline" to="/concursos">
              Buscar na base de editais
            </Link>
            <button
              disabled={busy}
              className="underline"
              onClick={() => {
                setDetails(blank)
                setPages([])
                setText('')
                setWarning('')
                setPreviewUrl('')
                setStage(2)
              }}
            >
              Já tenho o texto: colar conteúdo
            </button>
          </div>
        </>
      )}
      {stage === 2 && (
        <div className="space-y-5">
          <Card title="Separe o conteúdo do cargo">
            {warning && <p className="mb-4 rounded-lg bg-warn/10 p-3 text-sm">{warning}</p>}
            <div className="mb-4 flex flex-wrap items-end gap-3">
              {pages.length > 0 && (
                <>
                  <label className="text-sm">
                    Página inicial
                    <input
                      className="field mt-1 w-24"
                      type="number"
                      min="1"
                      max={pages.length}
                      value={from}
                      onChange={(e) => setFrom(Number(e.target.value))}
                    />
                  </label>
                  <label className="text-sm">
                    Página final
                    <input
                      className="field mt-1 w-24"
                      type="number"
                      min={from}
                      max={pages.length}
                      value={to}
                      onChange={(e) => setTo(Number(e.target.value))}
                    />
                  </label>
                  <Button
                    variant="secondary"
                    disabled={from < 1 || to < from || to > pages.length || !Number.isInteger(from) || !Number.isInteger(to)}
                    onClick={() => {
                      setText(pages.slice(from - 1, to).join('\n\n'))
                      setError('')
                    }}
                  >
                    Usar páginas selecionadas
                  </Button>
                  <span className="text-xs text-muted">{pages.length} páginas no PDF</span>
                </>
              )}
              {previewUrl && (
                <a className="text-sm text-brand-600 underline" href={previewUrl} target="_blank" rel="noreferrer">
                  Conferir PDF original
                </a>
              )}
            </div>
            <p className="mb-3 text-sm text-muted">
              Use a numeração do arquivo PDF. Mantenha somente as disciplinas e os tópicos do cargo desejado, incluindo conhecimentos
              gerais. Remova cronograma, regras e conteúdo de outros cargos.
            </p>
            <label className="block text-sm font-semibold">
              Conteúdo programático
              <textarea
                className="field mt-2 min-h-80 font-mono text-sm"
                maxLength={1_000_000}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={'LÍNGUA PORTUGUESA:\n1 Compreensão de textos.\n2 Gramática.\nMATEMÁTICA:\n1 Porcentagem.'}
              />
            </label>
            <p className="mt-2 text-xs text-muted">
              Pode corrigir ou colar o texto aqui. Títulos de disciplinas em MAIÚSCULAS ajudam a organização automática. Se o PDF for
              escaneado, use uma versão com OCR ou transcreva o trecho.
            </p>
          </Card>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setStage(1)}>
              Trocar fonte
            </Button>
            <Button disabled={!text.trim()} onClick={organize}>
              Organizar para revisão
            </Button>
          </div>
        </div>
      )}
      {stage === 3 && (
        <div className="space-y-5">
          <Card title="Dados do novo plano">
            {details.catalogProvider === 'qapi' && (
              <p className="mb-3 text-xs text-muted">
                Dados de concurso fornecidos por{' '}
                <a href="https://qapi.otunac.com/" target="_blank" rel="noreferrer" className="underline">
                  QAPI
                </a>
                .
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                Nome do plano
                <input
                  className="field mt-1"
                  maxLength={200}
                  value={details.name}
                  onChange={(e) => change('name', e.target.value)}
                  required
                />
              </label>
              <label className="text-sm">
                Cargo / especialidade
                <input
                  className="field mt-1"
                  maxLength={300}
                  value={details.role}
                  onChange={(e) => change('role', e.target.value)}
                  required
                />
              </label>
              <label className="text-sm">
                Órgão
                <input className="field mt-1" maxLength={300} value={details.agency} onChange={(e) => change('agency', e.target.value)} />
              </label>
              <label className="text-sm">
                Data da prova (opcional)
                <input className="field mt-1" type="date" value={details.examDate} onChange={(e) => change('examDate', e.target.value)} />
              </label>
              <label className="text-sm md:col-span-2">
                Fonte / identificação do edital
                <input className="field mt-1" maxLength={2048} value={details.source} onChange={(e) => change('source', e.target.value)} />
              </label>
            </div>
          </Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold">
              {outline.length} {outline.length === 1 ? 'disciplina' : 'disciplinas'} · {total} {total === 1 ? 'tópico' : 'tópicos'}
            </h2>
            <Button variant="secondary" disabled={outline.length >= 100} onClick={() => editRows([...outline, { name: '', topics: [] }])}>
              <Plus size={16} />
              Adicionar disciplina
            </Button>
          </div>
          <p className="text-sm text-muted">
            A organização é uma sugestão. Renomeie, remova ou acrescente itens. Cada linha abaixo vira um tópico; divida linhas longas
            quando necessário.
          </p>
          {outline.map((s, i) => (
            <Card key={i}>
              <div className="mb-3 flex items-end gap-3">
                <label className="min-w-0 flex-1 text-sm">
                  Disciplina {i + 1}
                  <input
                    className="field mt-1"
                    maxLength={200}
                    value={s.name}
                    onChange={(e) => editRows(outline.map((v, j) => (j === i ? { ...v, name: e.target.value } : v)))}
                  />
                </label>
                <Button
                  variant="ghost"
                  onClick={() => editRows(outline.filter((_, j) => i !== j))}
                  aria-label={`Remover disciplina ${i + 1}`}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <label className="block text-sm">
                Tópicos — um por linha
                <textarea
                  className="field mt-1 min-h-36 text-sm"
                  value={s.topics.join('\n')}
                  onChange={(e) => editRows(outline.map((v, j) => (j === i ? { ...v, topics: e.target.value.split('\n') } : v)))}
                />
              </label>
            </Card>
          ))}
          <details className="rounded-xl border border-line p-4">
            <summary className="cursor-pointer text-sm font-semibold">Consultar texto de origem</summary>
            <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs">{text}</pre>
            {previewUrl && (
              <a className="text-sm underline" href={previewUrl} target="_blank" rel="noreferrer">
                Conferir PDF original
              </a>
            )}
          </details>
          <Card title="Confirmar revisão">
            <label className="flex items-start gap-3 text-sm">
              <input className="mt-1" type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
              <span>
                Conferi o cargo, as disciplinas e os tópicos com o edital e suas retificações. Quero criar um novo plano com esta versão.
              </span>
            </label>
            <p className="mt-3 text-xs text-muted">
              Seus planos atuais são preservados. A cópia pessoal não recebe mudanças automáticas da fonte nem é publicada no catálogo.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setStage(2)
                  setConfirmed(false)
                }}
              >
                Voltar ao conteúdo
              </Button>
              <Button onClick={create} disabled={!confirmed || !outline.length || !details.name.trim() || !details.role.trim()}>
                <FileText size={16} />
                Criar plano revisado
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
