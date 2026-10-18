import { describe, expect, it } from 'vitest'
import type { Planning, Study } from '@coado/shared'
import { cycleProgress, nextSessions, weeklySchedule } from './utils'

// seg, ter e qua, 3 sessões de 60 min por dia (180 min/dia): a1 a3 na segunda, b1 a b3 na terça, c1 a c3 na quarta
const planning = (type: Planning['type'], carryOver?: boolean): Planning => ({
  planId: 'p',
  type,
  config: {
    weeklyMinutes: 540,
    days: [false, true, true, true, false, false, false],
    minSession: 30,
    maxSession: 90,
    subjects: [],
    ...(carryOver === undefined ? {} : { carryOver }),
  },
  cycle: ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3'].map((id) => ({ id, subjectId: id, duration: 60 })),
  completedCycles: 0,
  cycleStartedAt: '2026-10-12',
})

// segunda feita só pela metade (a1), terça e quarta por fazer
const studies: Study[] = [
  {
    id: 's1', planId: 'p', subjectId: 'a1', categoryId: 'teoria', date: '2026-10-12', duration: 3600, material: '', hits: 0, misses: 0,
    pages: [], videos: [], comment: '', countInPlanning: true, createdAt: '2026-10-12T10:00:00.000Z',
  },
]
const TER = '2026-10-13'
const QUA = '2026-10-14'
const SAB = '2026-10-17'
const ids = (p: Planning, ref: string) => nextSessions(p, cycleProgress(p, studies), ref).map((i) => i.id)

describe('nextSessions', () => {
  it('a grade do teste é a esperada', () => {
    const g = weeklySchedule(planning('weekly'))
    expect([1, 2, 3].map((d) => g[d].items.map((i) => i.id))).toEqual([
      ['a1', 'a2', 'a3'],
      ['b1', 'b2', 'b3'],
      ['c1', 'c2', 'c3'],
    ])
  })

  it('ciclo: ordem da sequência, sem olhar o dia', () => {
    expect(ids(planning('cycle'), QUA)[0]).toBe('a2')
    expect(ids(planning('cycle', false), QUA)[0]).toBe('a2')
  })

  it('semanal com carryOver ausente ou ligado: a sessão que ficou de segunda vem primeiro', () => {
    expect(ids(planning('weekly'), QUA).slice(0, 3)).toEqual(['a2', 'a3', 'b1'])
    expect(ids(planning('weekly', true), QUA).slice(0, 3)).toEqual(['a2', 'a3', 'b1'])
  })

  it('semanal com carryOver desligado: primeiro as de hoje, depois as demais na ordem da sequência', () => {
    expect(ids(planning('weekly', false), QUA)).toEqual(['c1', 'c2', 'c3', 'a2', 'a3', 'b1', 'b2', 'b3'])
    expect(ids(planning('weekly', false), TER).slice(0, 4)).toEqual(['b1', 'b2', 'b3', 'a2'])
  })

  it('semanal com carryOver desligado num dia de folga: a próxima pendente da sequência', () => {
    expect(ids(planning('weekly', false), SAB)[0]).toBe('a2')
  })
})
