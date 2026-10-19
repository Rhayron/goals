import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Loader2, ShieldCheck } from 'lucide-react'
import { AccountProfileSchema, type CommunityProfile } from '@coado/shared'
import { Avatar, SyncBadge } from './account'
import { Button, Card } from './ui'
import { useAuth, useMe } from '../lib/auth'
import { api } from '../lib/api'
import { AppearanceSection, CategoriesSection, TimerSection } from '../pages/Settings'
import { ReviewIntervalsSection } from './ReviewIntervalsSection'

const REGIONS = AccountProfileSchema.shape.region.removeDefault().options

export function ProfileDetails() {
  const me = useMe()
  const { updateProfile } = useAuth()
  const [name, setName] = useState(me.name)
  const [profile, setProfile] = useState(() => AccountProfileSchema.parse(me.profile ?? {}))
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null)
  const saved = AccountProfileSchema.parse(me.profile ?? {})
  const changed = name !== me.name || JSON.stringify(profile) !== JSON.stringify(saved)

  const cancel = () => { setName(me.name); setProfile(saved); setMessage(null) }
  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setMessage({ error: true, text: 'Digite seu nome.' }); return }
    setBusy(true)
    setMessage(null)
    try {
      const next = await updateProfile({ name: name.trim(), profile })
      if (!next.profile) throw new Error('Não foi possível confirmar os novos dados. Tente novamente em instantes.')
      setName(next.name)
      setProfile(AccountProfileSchema.parse(next.profile ?? {}))
      setMessage({ error: false, text: 'Perfil salvo.' })
    } catch (error) {
      setMessage({ error: true, text: error instanceof Error ? error.message : 'Não foi possível salvar o perfil.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={(e) => void save(e)} className="space-y-6">
      <div className="flex flex-wrap items-center gap-5 rounded-3xl border border-line bg-gradient-to-br from-brand-100 via-surface to-surface p-6 dark:from-brand-900/60">
        <Avatar name={name || me.name} src={profile.avatarStyle === 'initials' ? null : me.avatarUrl} className="h-20 w-20 text-2xl shadow-md" />
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-display text-2xl font-bold">{me.name}</h3>
          <p className="break-all text-sm text-muted">{me.email}</p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted"><CalendarDays size={14} /> No Coado desde {new Date(me.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
      <Card title="Seus dados">
        <fieldset disabled={busy} className="space-y-5">
          <label className="block"><span className="label">Nome completo</span><input className="field" autoComplete="name" value={name} maxLength={120} required onChange={(e) => setName(e.target.value)} /></label>
          <div><label className="block"><span className="label">E-mail de acesso</span><input type="email" className="field bg-surface-2 text-muted" value={me.email} readOnly /></label><p className="mt-1 text-xs text-muted">Vinculado à conta Google usada para entrar.</p></div>
          <label className="block"><span className="label">Sobre seus estudos</span><textarea aria-label="Sobre seus estudos" className="field min-h-24" value={profile.bio} maxLength={160} placeholder="O que você está estudando e onde quer chegar" onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /><span className="mt-1 block text-right text-xs text-muted">{profile.bio.length}/160</span></label>
          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <label><span className="label">Cidade (opcional)</span><input className="field" autoComplete="address-level2" value={profile.city} maxLength={80} onChange={(e) => setProfile({ ...profile, city: e.target.value })} /></label>
            <label><span className="label">Estado (opcional)</span><select className="field" autoComplete="address-level1" value={profile.region} onChange={(e) => setProfile({ ...profile, region: e.target.value as typeof profile.region })}>{REGIONS.map((region) => <option key={region} value={region}>{region || 'Não informar'}</option>)}</select></label>
          </div>
          <fieldset><legend className="label">Imagem no Coado</legend><div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="radio" name="avatar-style" value="google" checked={profile.avatarStyle === 'google'} onChange={() => setProfile({ ...profile, avatarStyle: 'google' })} />Foto do Google</label>
            <label className="flex items-center gap-2"><input type="radio" name="avatar-style" value="initials" checked={profile.avatarStyle === 'initials'} onChange={() => setProfile({ ...profile, avatarStyle: 'initials' })} />Minhas iniciais</label>
          </div><p className="mt-2 text-xs text-muted">Sem foto disponível, usamos suas iniciais.</p></fieldset>
          <p className="text-xs text-muted">Sua apresentação e localização ficam nesta conta. Esses campos não aparecem no ranking.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={busy || !changed || !name.trim()}>{busy && <Loader2 size={14} className="animate-spin" />}Salvar perfil</Button>
            <Button type="button" variant="secondary" disabled={busy || !changed} onClick={cancel}>Cancelar alterações</Button>
            {message && <p role={message.error ? 'alert' : 'status'} className={`text-sm ${message.error ? 'text-bad' : 'text-ok'}`}>{message.text}</p>}
          </div>
        </fieldset>
      </Card>
    </form>
  )
}

export function CommunityPreferences() {
  const [profile, setProfile] = useState<CommunityProfile | null>(null)
  const [saved, setSaved] = useState<CommunityProfile | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const requestId = useRef(0)
  const load = async () => {
    const id = ++requestId.current
    setBusy(true)
    setError('')
    try {
      const data = await api.get<{ profile: CommunityProfile }>('/community')
      if (id === requestId.current) { setProfile(data.profile); setSaved(data.profile) }
    } catch (e) {
      if (id === requestId.current) setError((e as Error).message)
    } finally {
      if (id === requestId.current) setBusy(false)
    }
  }
  useEffect(() => {
    const requests = requestId
    void load()
    return () => { requests.current++ }
  }, [])
  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setBusy(true); setError(''); setNotice('')
    try {
      const next = await api.put<CommunityProfile>('/community/profile', { ...profile, nickname: profile.nickname.trim(), focus: profile.focus.trim() })
      setProfile(next); setSaved(next); setNotice('Preferências da comunidade salvas.')
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }
  return (
    <Card title="Como você aparece na comunidade">
      <p className="mb-5 text-sm text-muted">O apelido e a área de estudo são os mesmos usados em Ranking e grupos.</p>
      {!profile && (busy ? <p role="status" className="text-sm text-muted">Carregando preferências…</p> : <Button variant="secondary" onClick={() => void load()}>Tentar novamente</Button>)}
      {profile && <form onSubmit={(e) => void save(e)}><fieldset disabled={busy} className="space-y-4">
        <label className="block"><span className="label">Apelido na comunidade</span><input className="field" required maxLength={40} value={profile.nickname} onChange={(e) => { setNotice(''); setProfile({ ...profile, nickname: e.target.value }) }} /></label>
        <label className="block"><span className="label">Área de estudo</span><input className="field" maxLength={100} placeholder="Ex.: Engenharia, tribunais, tecnologia" value={profile.focus} onChange={(e) => { setNotice(''); setProfile({ ...profile, focus: e.target.value }) }} /><span className="mt-1 block text-xs text-muted">Usada para filtrar o ranking por área.</span></label>
        <label className="flex items-start gap-3 rounded-xl border border-line p-4"><input type="checkbox" className="mt-1" checked={profile.globalEnabled} onChange={(e) => { setNotice(''); setProfile({ ...profile, globalEnabled: e.target.checked }) }} /><span><span className="block text-sm font-semibold">Participar do ranking global</span><span className="mt-1 block text-xs text-muted">Publica seu apelido e totais semanais de estudo. Desativar retira você do ranking global.</span></span></label>
        <p className="text-xs text-muted">Nos grupos dos quais você participa, os membros continuam vendo seu apelido e pontuação. E-mail, localização, apresentação, materiais e anotações não são compartilhados.</p>
        <div className="flex flex-wrap gap-3"><Button type="submit" disabled={busy || !profile.nickname.trim() || JSON.stringify(profile) === JSON.stringify(saved)}>{busy && <Loader2 size={14} className="animate-spin" />}Salvar comunidade</Button><Button type="button" variant="secondary" disabled={busy || JSON.stringify(profile) === JSON.stringify(saved)} onClick={() => { setProfile(saved); setError(''); setNotice('') }}>Cancelar alterações</Button></div>
      </fieldset></form>}
      {error && <p role="alert" className="mt-3 text-sm text-bad">{error}</p>}
      {notice && <p role="status" className="mt-3 text-sm text-ok">{notice}</p>}
      <Link className="mt-5 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300" to="/comunidade">Gerenciar meus grupos e ranking</Link>
    </Card>
  )
}

export function ProfilePreferences() {
  return <>
    <div className="grid gap-6 2xl:grid-cols-2"><div className="space-y-6"><AppearanceSection /><ReviewIntervalsSection /></div><div className="space-y-6"><TimerSection /><CategoriesSection /></div></div>
    <Card title="Sua rotina"><p className="text-sm text-muted">Os dias e a carga de estudo são definidos por plano, no planejamento. As metas semanais ficam na página inicial.</p><Link className="mt-3 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300" to="/planejamento">Ajustar meu planejamento</Link></Card>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-2 p-4"><p className="text-sm text-muted">As alterações são salvas automaticamente. A paleta vale só neste aparelho.</p><SyncBadge /></div>
  </>
}

export function AccountSecurity() {
  const me = useMe()
  return <Card title="Acesso à conta">
    <ShieldCheck className="mb-3 text-brand-600" size={28} />
    <p className="text-sm">O Coado usa sua conta Google para entrar. Não há uma senha separada do Coado.</p>
    <p className="mt-3 break-all text-sm font-semibold">{me.email}</p>
    <p className="mt-3 text-sm text-muted">Senha, recuperação de acesso e verificação em duas etapas são gerenciadas na conta Google.</p>
    <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-brand-700 dark:text-brand-300"><a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer">Abrir segurança do Google</a><Link to="#aparelhos">Ver aparelhos conectados</Link></div>
  </Card>
}
