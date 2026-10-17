import { describe, expect, it } from 'vitest'
import { emptyState } from '@coado/shared'
import { importNoticePlan, suggestOutline } from './notice-import'

describe('revisão de edital', () => {
  it('sugere disciplinas com títulos em maiúsculas e preserva conteúdo numerado', () => {
    const rows = suggestOutline(
      'LÍNGUA PORTUGUESA:\n1 Compreensão de textos. 2 Concordância.\nDIREITO ADMINISTRATIVO:\n1 Lei 8.112 de 1990.\n2 Atos administrativos.',
    )
    expect(rows.map((s) => s.name)).toEqual(['LÍNGUA PORTUGUESA', 'DIREITO ADMINISTRATIVO'])
    expect(rows[0].topics).toHaveLength(2)
    expect(rows[1].topics[0]).toBe('1 Lei 8.112 de 1990.')
  })
  it('não descarta texto quando não reconhece a formatação', () => {
    expect(suggestOutline('Um tópico em texto livre.')[0]).toEqual({ name: 'Conteúdo a organizar', topics: ['Um tópico em texto livre.'] })
  })
  it('só cria a cópia revisada, preservando planos e progresso existentes', () => {
    const old = {
      ...emptyState(),
      plans: [{ id: 'old', name: 'Antigo', createdAt: '2026-01-01T00:00:00Z', weeklyGoal: { minutes: 60, questions: 10 } }],
    }
    const r = importNoticePlan(
      old,
      {
        name: 'Meu edital',
        agency: 'Órgão',
        role: 'Engenheiro',
        examDate: '2026-12-01',
        source: 'edital.pdf',
        fingerprint: 'a'.repeat(64),
      },
      [{ name: 'Matemática revisada', topics: ['Somente o tópico escolhido'] }],
    )
    expect(old.plans).toHaveLength(1)
    expect(r.state.plans).toHaveLength(2)
    expect(r.state.plans[0]).toEqual(old.plans[0])
    expect(r.state.activePlanId).toBe(r.planId)
    expect(r.state.topics[0]).toMatchObject({ name: 'Somente o tópico escolhido', finished: false })
    expect(r.state.plans[1].importedFrom?.sha256).toBe('a'.repeat(64))
  })
  it('recusa plano sem cargo e tópicos acima do limite, em vez de truncar', () => {
    const details = { name: 'Plano', agency: '', role: '', examDate: '', source: 'edital.pdf' }
    expect(() => importNoticePlan(emptyState(), details, [{ name: 'Português', topics: ['Textos'] }])).toThrow('cargo')
    expect(() =>
      importNoticePlan(emptyState(), { ...details, role: 'Analista' }, [{ name: 'Português', topics: ['x'.repeat(1001)] }]),
    ).toThrow()
  })
})
