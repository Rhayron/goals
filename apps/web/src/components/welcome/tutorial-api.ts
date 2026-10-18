import type { CatalogNotice, FilesResponse, Ranking, StudyGroup } from '@coado/shared'
import { addDays, today } from '../../lib/utils'
import { tutorialOnlyMessage } from '../../lib/tutorial-mode'
import { DEMO_PLAN, tutorialMe } from './tutorial-data'

/** All account requests in the tutorial terminate here, including unknown endpoints. */
export async function tutorialRequest<T>(method: string, path: string): Promise<T> {
  if (method !== 'GET') throw new Error(tutorialOnlyMessage)
  const url = new URL(path, 'https://tutorial.invalid')
  const date = today(), now = new Date().toISOString()
  const me = tutorialMe()
  let result: unknown
  if (url.pathname === '/files') {
    result = {
      files: [
        { id: 'tutorial-arquivo-1', name: 'Resumo de probabilidade.pdf', mime: 'application/pdf', size: 245760, planId: DEMO_PLAN, subjectId: 'tutorial-disciplina-1', createdAt: now },
        { id: 'tutorial-arquivo-2', name: 'Caderno de questões.pdf', mime: 'application/pdf', size: 1048576, planId: DEMO_PLAN, subjectId: 'tutorial-disciplina-0', createdAt: now },
      ],
      usage: { used: 1294336, quota: 104857600, maxFileSize: 20971520 },
    } satisfies FilesResponse
  } else if (url.pathname === '/me/sessions') {
    result = [{ id: 'tutorial-sessao', createdAt: now, lastSeenAt: now, userAgent: 'Coado Tutorial', current: true }]
  } else if (url.pathname === '/community') {
    result = { profile: { nickname: me.name, globalEnabled: true, focus: 'Estudos' }, groups: [{ id: 'tutorial-grupo', name: 'Mesa de estudos', description: 'Grupo fictício para conhecer o ranking.', ownerId: me.id, members: 3 } satisfies StudyGroup] }
  } else if (url.pathname === '/community/ranking') {
    const metric = (url.searchParams.get('metric') || 'time') as Ranking['metric']
    const entries = ['Marina (exemplo)', me.name, 'Caio (exemplo)'].map((nickname, i) => ({ userId: i === 1 ? me.id : `tutorial-colega-${i}`, nickname, position: i + 1, value: (metric === 'time' ? 3600 : metric === 'questions' ? 20 : 10) * (10 - i * 2) }))
    result = { from: addDays(date, -6), to: date, metric, entries, me: entries[1], participants: 3 } satisfies Ranking
  } else if (url.pathname === '/community/groups/tutorial-grupo/members') {
    result = ['Marina (exemplo)', me.name, 'Caio (exemplo)'].map((nickname, i) => ({ userId: i === 1 ? me.id : `tutorial-colega-${i}`, nickname, joinedAt: now }))
  } else if (url.pathname.startsWith('/catalog/notices')) {
    const item: CatalogNotice = { id: 'tutorial-edital', title: 'Instituto Horizonte · exemplo fictício', agency: 'Instituto Horizonte', organizer: 'Banca de exemplo', state: 'SP', positions: ['Analista'], year: Number(date.slice(0, 4)), sourceUrl: '#exemplo', pdfUrl: null, provider: 'tutorial', providerStatus: 'Demonstração, sem concurso real', registrationStart: date, registrationEnd: addDays(date, 20), examDateText: addDays(date, 60), checkedAt: now, version: 1 }
    result = url.pathname === '/catalog/notices' ? { items: [item], total: 1, page: 1 } : item
  } else {
    throw new Error(tutorialOnlyMessage)
  }
  return result as T
}
