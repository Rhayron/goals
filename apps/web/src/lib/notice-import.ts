import { NoticeOutlineSchema, type AppState, type NoticeOutline } from '@coado/shared'
import { SUBJECT_COLORS, uid, fmtDate, today } from './utils'

export interface ImportDetails {
  name: string
  agency: string
  role: string
  examDate: string
  source: string
  fingerprint?: string
  catalogId?: string
  catalogVersion?: number
  catalogProvider?: string
}

/** Sugestão conservadora. O texto original continua disponível e nada é criado sem revisão. */
export function suggestOutline(text: string): NoticeOutline {
  const sections: { name: string; body: string[] }[] = []
  const cleaned = text
    .replace(/\r/g, '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .replace(/([.;])\s+([A-ZÀ-Ý][A-ZÀ-Ý /(),-]{3,120}):/g, '$1\n$2:')
  for (const raw of cleaned.split('\n')) {
    const line = raw.trim()
    if (!line || /^\[Página \d+\]$/.test(line) || /^\d+$/.test(line)) continue
    const match = line.match(/^(?:\d+(?:\.\d+)*[.)]?\s+)?([A-ZÀ-Ý][A-ZÀ-Ý /(),&-]{2,150})(?::\s*(.*))?$/)
    if (match && !/^(?:ANEXO|CARGO|CONHECIMENTOS|CONTEÚDO PROGRAMÁTICO|EDITAL|NÍVEL)\b/.test(match[1])) {
      sections.push({ name: match[1].trim(), body: match[2] ? [match[2]] : [] })
    } else {
      if (!sections.length) sections.push({ name: 'Conteúdo a organizar', body: [] })
      sections[sections.length - 1].body.push(line)
    }
  }
  return sections
    .filter((s) => s.body.length || s.name !== 'Conteúdo a organizar')
    .map((s) => ({
      name: s.name,
      topics: s.body
        .join('\n')
        .split(/\n\s*(?:[-•*]\s+)|(?<=\s)(?=\d+(?:\.\d+)*[.)]?\s+[A-ZÀ-Ý])/)
        .map((t) => t.replace(/\s+/g, ' ').trim())
        .filter(Boolean),
    }))
}

export function importNoticePlan(state: AppState, details: ImportDetails, outline: NoticeOutline): { state: AppState; planId: string } {
  const rows = NoticeOutlineSchema.parse(outline)
  if (!details.name.trim() || !details.role.trim()) throw new Error('Informe o nome do plano e o cargo antes de criar.')
  if (details.name.length > 200 || details.role.length > 300 || details.agency.length > 300)
    throw new Error('Nome, órgão ou cargo acima do limite.')
  const planId = uid()
  const subjects = rows.map((s, order) => ({
    id: uid(),
    planId,
    name: s.name,
    color: SUBJECT_COLORS[order % SUBJECT_COLORS.length],
    order,
  }))
  const topics = rows.flatMap((s, i) =>
    s.topics.map((name, order) => ({ id: uid(), subjectId: subjects[i].id, name, order, finished: false, links: [] })),
  )
  const notes = [
    `Edital revisado e importado em ${fmtDate(today())}.`,
    `Fonte: ${details.source}`,
    details.catalogProvider === 'qapi' ? 'Dados de concurso fornecidos por QAPI (https://qapi.otunac.com).' : '',
    'Cópia pessoal: retificações na fonte não alteram este plano automaticamente.',
  ]
    .filter(Boolean)
    .join('\n')
  return {
    planId,
    state: {
      ...state,
      activePlanId: planId,
      plans: [
        ...state.plans,
        {
          id: planId,
          name: details.name.trim(),
          org: details.agency.trim(),
          role: details.role.trim(),
          notes,
          importedFrom: {
            source: details.source,
            sha256: details.fingerprint,
            catalogId: details.catalogId,
            catalogVersion: details.catalogVersion,
            provider: details.catalogProvider,
            reviewedAt: new Date().toISOString(),
          },
          ...(details.examDate ? { examDate: details.examDate } : {}),
          weeklyGoal: { minutes: 600, questions: 100 },
          createdAt: new Date().toISOString(),
        },
      ],
      subjects: [...state.subjects, ...subjects],
      topics: [...state.topics, ...topics],
    },
  }
}
