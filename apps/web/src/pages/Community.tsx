import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Coffee, Copy, Crown, Plus, Trophy, Users } from 'lucide-react'
import type { CommunityProfile, StudyGroup, Ranking, GroupMember } from '@coado/shared'
import { PageHeader } from '../components/Layout'
import { Button, Card, Empty, Modal, confirmAction } from '../components/ui'
import { api } from '../lib/api'
import { useMe } from '../lib/auth'
import { fmtDate, fmtDuration } from '../lib/utils'

export default function Community() {
  const me = useMe()
  const [profile, setProfile] = useState<CommunityProfile>({ nickname: me.name.slice(0, 40), globalEnabled: false, focus: '' })
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [groupId, setGroupId] = useState('')
  const [metric, setMetric] = useState<Ranking['metric']>('time')
  const [week, setWeek] = useState(0)
  const [sameFocus, setSameFocus] = useState(false)
  const [ranking, setRanking] = useState<Ranking | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState<StudyGroup | 'new' | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [invite, setInvite] = useState('')
  const [revision, setRevision] = useState(0)
  const location = useLocation(),
    navigate = useNavigate()
  useEffect(() => {
    const saved = sessionStorage.getItem('coado-invite')
    if (saved) {
      sessionStorage.removeItem('coado-invite')
      if (!location.hash && /^#convite=[a-f0-9]{48}$/.test(saved)) navigate(`/comunidade${saved}`, { replace: true })
    }
  }, [location.hash, navigate])
  const token = new URLSearchParams(location.hash.slice(1)).get('convite')
  const [preview, setPreview] = useState<{ name: string; description: string } | null>(null)
  const [previewError, setPreviewError] = useState('')
  const selected = groups.find((g) => g.id === groupId)
  const owner = selected?.ownerId === me.id
  const load = useCallback(async () => {
    const data = await api.get<{ profile: CommunityProfile; groups: StudyGroup[] }>('/community')
    setProfile(data.profile)
    setGroups(data.groups)
    setReady(true)
  }, [])
  useEffect(() => {
    void load().catch((e) => setError(e.message))
  }, [load])
  useEffect(() => {
    setPreview(null)
    setPreviewError('')
    if (!token) {
      return
    }
    let active = true
    api
      .post<{ name: string; description: string }>('/community/invites/preview', { token })
      .then((x) => {
        if (active) setPreview(x)
      })
      .catch((e) => {
        if (active) setPreviewError(e.message)
      })
    return () => {
      active = false
    }
  }, [token])
  useEffect(() => {
    if (!ready) return
    let active = true
    setRanking(null)
    setMembers([])
    const query = new URLSearchParams({ metric, week: String(week) })
    if (groupId) query.set('groupId', groupId)
    if (!groupId && sameFocus && profile.focus) query.set('focus', profile.focus)
    api
      .get<Ranking>(`/community/ranking?${query}`)
      .then((x) => {
        if (active) setRanking(x)
      })
      .catch((e) => {
        if (active) setError(e.message)
      })
    if (groupId)
      api
        .get<GroupMember[]>(`/community/groups/${groupId}/members`)
        .then((x) => {
          if (active) setMembers(x)
        })
        .catch((e) => {
          if (active) setError(e.message)
        })
    return () => {
      active = false
    }
  }, [ready, groupId, metric, week, sameFocus, profile.focus, revision])
  async function act(fn: () => Promise<void>) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await fn()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  const saveProfile = (e: FormEvent) => {
    e.preventDefault()
    void act(async () => {
      await api.put('/community/profile', profile)
      setNotice('Perfil da comunidade salvo.')
      setRevision((x) => x + 1)
    })
  }
  const edit = (g: StudyGroup | 'new') => {
    setEditing(g)
    setName(g === 'new' ? '' : g.name)
    setDescription(g === 'new' ? '' : g.description)
  }
  const saveGroup = (e: FormEvent) => {
    e.preventDefault()
    void act(async () => {
      if (editing === 'new') {
        const g = await api.post<StudyGroup>('/community/groups', { name, description })
        setGroupId(g.id)
      } else if (editing) await api.patch(`/community/groups/${editing.id}`, { name, description })
      await load()
      setEditing(null)
      setRevision((x) => x + 1)
    })
  }
  const amount = (n: number) =>
    metric === 'time' ? fmtDuration(n) : `${n.toLocaleString('pt-BR')} ${metric === 'questions' ? 'questões' : 'páginas'}`
  return (
    <>
      <PageHeader title="Ranking e grupos" hidePlan>
        <Button onClick={() => edit('new')} disabled={!ready}>
          <Plus size={16} /> Criar grupo
        </Button>
      </PageHeader>
      <div className="mb-6 rounded-2xl border border-line bg-kraft/40 p-5">
        <h2 className="font-display text-2xl font-bold">Uma mesa para estudar junto ☕</h2>
        <p className="mt-1 text-sm text-muted">
          Convide seus amigos, acompanhe a semana e comemore cada avanço. Uma nova rodada começa toda segunda-feira.
        </p>
      </div>
      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-bad/10 p-3 text-sm text-bad">
          {error}{' '}
          <button
            className="underline"
            onClick={() => {
              setError('')
              void load()
                .then(() => setRevision((x) => x + 1))
                .catch((e) => setError(e.message))
            }}
          >
            Tentar novamente
          </button>
        </p>
      )}
      {notice && (
        <p role="status" className="mb-4 text-sm text-ok">
          {notice}
        </p>
      )}
      {token && (
        <Card className="mb-5" title="Convite para uma mesa">
          {preview ? (
            <>
              <p className="text-lg font-bold">{preview.name}</p>
              <p className="text-sm text-muted">{preview.description}</p>
              <p className="my-3 text-sm">
                Ao entrar, seu apelido e seus totais semanais de horas, questões e páginas, inclusive de semanas anteriores, ficam visíveis
                aos membros. Seus materiais e anotações continuam privados.
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={busy}
                  onClick={() =>
                    void act(async () => {
                      const r = await api.post<{ groupId: string }>('/community/invites/join', { token })
                      await load()
                      setGroupId(r.groupId)
                      setRevision((x) => x + 1)
                      navigate('/comunidade', { replace: true })
                      setNotice('Você entrou no grupo!')
                    })
                  }
                >
                  Entrar no grupo
                </Button>
                <Button variant="secondary" onClick={() => navigate('/comunidade', { replace: true })}>
                  Agora não
                </Button>
              </div>
            </>
          ) : (
            <div>
              <p role={previewError ? 'alert' : 'status'}>{previewError || 'Consultando convite…'}</p>
              {previewError && (
                <Button variant="secondary" onClick={() => navigate('/comunidade', { replace: true })}>
                  Fechar convite
                </Button>
              )}
            </div>
          )}
        </Card>
      )}
      <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
        <div className="space-y-5">
          <Card title="Suas mesas">
            <nav aria-label="Escopo do ranking" className="space-y-2">
              <button
                onClick={() => {
                  setGroupId('')
                  setInvite('')
                }}
                className={`flex w-full items-center gap-2 rounded-xl p-3 text-left ${!groupId ? 'bg-brand-100 dark:bg-brand-900' : 'bg-surface-2'}`}
              >
                <Trophy size={18} /> Ranking global
              </button>
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setGroupId(g.id)
                    setInvite('')
                  }}
                  className={`w-full rounded-xl p-3 text-left ${groupId === g.id ? 'bg-brand-100 dark:bg-brand-900' : 'bg-surface-2'}`}
                >
                  <span className="flex items-center gap-2">
                    <Users size={16} />
                    {g.name}
                  </span>
                  <span className="text-xs text-muted">
                    {g.members} {g.members === 1 ? 'participante' : 'participantes'}
                  </span>
                </button>
              ))}
            </nav>
            {ready && !groups.length && <p className="mt-3 text-sm text-muted">Crie seu primeiro grupo ou abra o convite de um amigo.</p>}
          </Card>
          <Card title="Seu perfil na comunidade">
            <details>
              <summary className="cursor-pointer text-sm font-semibold">Editar apelido e participação</summary>
              <form onSubmit={saveProfile} className="mt-4 space-y-3">
                <label className="label">
                  Apelido
                  <input
                    className="field mt-1"
                    required
                    maxLength={40}
                    value={profile.nickname}
                    onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                  />
                </label>
                <label className="label">
                  Concurso ou área de interesse
                  <input
                    className="field mt-1"
                    maxLength={100}
                    placeholder="Ex.: Petrobras"
                    value={profile.focus}
                    onChange={(e) => setProfile({ ...profile, focus: e.target.value })}
                  />
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={profile.globalEnabled}
                    onChange={(e) => setProfile({ ...profile, globalEnabled: e.target.checked })}
                  />
                  Participar do ranking global
                </label>
                <p className="text-xs text-muted">
                  No global, seu apelido e totais ficam visíveis aos usuários do Coado. Nos grupos, apenas aos membros. Você pode sair do
                  global a qualquer momento.
                </p>
                <Button type="submit" disabled={busy || !ready}>
                  Salvar preferências
                </Button>
              </form>
            </details>
          </Card>
        </div>
        <div className="space-y-5">
          <Card
            title={selected?.name ?? 'Ranking global'}
            actions={
              <Button variant="ghost" size="sm" onClick={() => setRevision((x) => x + 1)}>
                Atualizar
              </Button>
            }
          >
            {selected && <p className="mb-4 text-sm text-muted">{selected.description}</p>}
            <div className="mb-4 flex flex-wrap gap-3">
              <select
                aria-label="Métrica do ranking"
                className="field w-auto"
                value={metric}
                onChange={(e) => setMetric(e.target.value as Ranking['metric'])}
              >
                <option value="time">Horas estudadas</option>
                <option value="questions">Questões resolvidas</option>
                <option value="pages">Páginas lidas</option>
              </select>
              <select
                aria-label="Semana do ranking"
                className="field w-auto"
                value={week}
                onChange={(e) => setWeek(Number(e.target.value))}
              >
                {Array.from({ length: 13 }, (_, i) => (
                  <option key={i} value={-i}>
                    {i === 0 ? 'Esta semana' : i === 1 ? 'Semana passada' : `${i} semanas atrás`}
                  </option>
                ))}
              </select>
              {!groupId && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={sameFocus} disabled={!profile.focus} onChange={(e) => setSameFocus(e.target.checked)} />
                  Minha área
                </label>
              )}
            </div>
            {!groupId && !profile.globalEnabled && (
              <p className="mb-3 rounded-xl bg-surface-2 p-3 text-sm">
                Você está só acompanhando. Ative sua participação para aparecer no ranking global.
              </p>
            )}
            {!ranking ? (
              <p role="status" className="py-8 text-center text-muted">
                Preparando o ranking…
              </p>
            ) : (
              <>
                <p className="mb-4 text-xs text-muted">
                  {fmtDate(ranking.from)} a {fmtDate(ranking.to)} · horário de Brasília · {ranking.participants} participantes com pontuação
                </p>
                {ranking.me && (
                  <div className="mb-4 rounded-xl bg-brand-50 p-4 dark:bg-brand-900/40">
                    <span className="text-sm">Sua posição</span>
                    <strong className="ml-3 text-xl">{ranking.me.position}º</strong>
                    <span className="ml-3 text-sm">{amount(ranking.me.value)}</span>
                  </div>
                )}
                {!ranking.entries.length ? (
                  <Empty icon={<Coffee size={32} />} title="A mesa está começando">
                    Registre um estudo nesta semana para abrir a rodada.
                  </Empty>
                ) : (
                  <ol className="divide-y divide-line">
                    {ranking.entries.map((r) => (
                      <li
                        key={r.userId}
                        className={`flex items-center gap-3 rounded-lg px-2 py-3 ${r.userId === me.id ? 'bg-brand-50 dark:bg-brand-900/30' : ''}`}
                      >
                        <span className="w-10 font-bold tabular">{r.position}º</span>
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {r.nickname}
                          {r.userId === me.id ? ' (você)' : ''}
                        </span>
                        {r.position === 1 && <Crown size={18} className="text-amber-600" />}
                        <span className="text-sm tabular">{amount(r.value)}</span>
                      </li>
                    ))}
                  </ol>
                )}
                <p className="mt-4 text-xs text-muted">
                  Até 100 posições. Empates recebem a mesma colocação. Totais autodeclarados, somados entre seus planos; editar ou apagar
                  registros atualiza a pontuação.
                </p>
              </>
            )}
          </Card>
          {selected && (
            <Card title="Pessoas e convites">
              {owner && (
                <div className="mb-4 flex flex-wrap gap-2">
                  <Button
                    disabled={busy}
                    onClick={() =>
                      void act(async () => {
                        const r = await api.post<{ token: string }>(`/community/groups/${groupId}/invite`)
                        setInvite(`${window.location.origin}/comunidade#convite=${r.token}`)
                        setNotice('Convite válido por 7 dias. O convite anterior foi revogado.')
                      })
                    }
                  >
                    Gerar convite
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() =>
                      void act(async () => {
                        await api.delete(`/community/groups/${groupId}/invite`)
                        setInvite('')
                        setNotice('Convite revogado.')
                      })
                    }
                  >
                    Revogar convite
                  </Button>
                  <Button variant="ghost" onClick={() => edit(selected)}>
                    Editar grupo
                  </Button>
                </div>
              )}
              {invite && (
                <div className="mb-4 flex flex-wrap gap-2">
                  <input aria-label="Link de convite" className="field min-w-0 flex-1" readOnly value={invite} />
                  <Button
                    onClick={() =>
                      void act(async () => {
                        await navigator.clipboard.writeText(invite)
                        setNotice('Link copiado. Envie aos amigos pelo aplicativo que preferir.')
                      })
                    }
                  >
                    <Copy size={16} />
                    Copiar
                  </Button>
                </div>
              )}
              <ul className="divide-y divide-line">
                {members.map((m) => (
                  <li key={m.userId} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span>
                      {m.nickname}
                      {m.userId === selected.ownerId ? ' · anfitrião' : ''}
                    </span>
                    {owner && m.userId !== me.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() => {
                          if (confirmAction(`Remover ${m.nickname} do grupo?`))
                            void act(async () => {
                              await api.delete(`/community/groups/${groupId}/members/${m.userId}`)
                              await load()
                              setRevision((x) => x + 1)
                            })
                        }}
                      >
                        Remover
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-4"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  if (
                    confirmAction(
                      owner ? 'Encerrar o grupo e invalidar seus convites? Os estudos de todos serão preservados.' : 'Sair deste grupo?',
                    )
                  )
                    void act(async () => {
                      await api.delete(owner ? `/community/groups/${groupId}` : `/community/groups/${groupId}/members/${me.id}`)
                      setGroupId('')
                      setInvite('')
                      await load()
                      setRevision((x) => x + 1)
                    })
                }}
              >
                {owner ? 'Encerrar grupo' : 'Sair do grupo'}
              </Button>
            </Card>
          )}
          <p className="text-xs text-muted">
            Precisa de ajuda?{' '}
            <Link to="/ajuda#comunidade" className="underline">
              Entenda grupos, convites e pontuação.
            </Link>
          </p>
        </div>
      </div>
      {editing && (
        <Modal open onClose={() => setEditing(null)} title={editing === 'new' ? 'Criar uma mesa de estudos' : 'Editar grupo'}>
          <form onSubmit={saveGroup} className="space-y-4">
            <label className="label">
              Nome do grupo
              <input
                className="field mt-1"
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Café e Petrobras"
              />
            </label>
            <label className="label">
              Descrição
              <textarea
                className="field mt-1"
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Objetivo e combinados do grupo"
              />
            </label>
            <p className="text-sm text-muted">O grupo é privado. Você compartilha o convite e cada amigo confirma a entrada.</p>
            <Button type="submit" disabled={busy}>
              Salvar grupo
            </Button>
          </form>
        </Modal>
      )}
    </>
  )
}
