import { emptyState, type AppState, type Me } from '@coado/shared'
import { addDays, today } from '../../lib/utils'

export const DEMO_PLAN = 'tutorial-concurso'
export const DEMO_SEMESTER = 'tutorial-semestre'

export function tutorialMe(): Me {
  return { id: 'tutorial-pessoa', name: 'Alex do Coado', email: 'alex@example.invalid', avatarUrl: null, createdAt: new Date().toISOString(), onboardedAt: new Date().toISOString() }
}

/** Fresh objects and dates on every visit. Never import this example into an account. */
export function tutorialState(date = today()): AppState {
  const state = emptyState()
  const createdAt = `${date}T12:00:00.000Z`
  state.theme = 'light'
  state.timerPrefs.sound = false
  state.reviewIntervals = [1, 7, 30]
  state.activePlanId = DEMO_PLAN
  state.plans = [
    { id: DEMO_PLAN, name: 'Meu próximo concurso', org: 'Instituto Horizonte (fictício)', kind: 'concurso', role: 'Analista', examDate: addDays(date, 60), weeklyGoal: { minutes: 600, questions: 100 }, createdAt },
    { id: DEMO_SEMESTER, name: 'Faculdade · semestre atual', kind: 'universidade', weeklyGoal: { minutes: 480, questions: 60 }, createdAt },
  ]
  const subjects = [
    ['Português', '#D9A789', 'Interpretação de texto', 'Concordância', 'Pontuação'],
    ['Matemática', '#94AF9A', 'Porcentagem', 'Probabilidade', 'Funções'],
    ['Informática', '#94A9C9', 'Redes de computadores', 'Segurança da informação', 'Planilhas'],
    ['Cálculo I', '#B49BC9', 'Limites', 'Derivadas', 'Integrais'],
    ['Programação', '#D6B46D', 'Variáveis e tipos', 'Laços de repetição', 'Funções em Python'],
  ]
  subjects.forEach(([name, color, ...topics], i) => {
    const subjectId = `tutorial-disciplina-${i}`
    state.subjects.push({ id: subjectId, planId: i < 3 ? DEMO_PLAN : DEMO_SEMESTER, name, color, order: i })
    topics.forEach((topic, n) => state.topics.push({ id: `tutorial-topico-${i}-${n}`, subjectId, name: topic, order: n, finished: n === 0, finishedAt: n === 0 ? createdAt : undefined, links: [] }))
  })
  for (let day = 13; day >= 0; day--) {
    for (let session = 0; session < 2; session++) {
      const subject = (day + session) % 3
      const studyDate = addDays(date, -day)
      state.studies.push({
        id: `tutorial-estudo-${day}-${session}`, planId: DEMO_PLAN, subjectId: `tutorial-disciplina-${subject}`, topicId: `tutorial-topico-${subject}-${session}`,
        date: studyDate, time: session ? '19:00' : '08:30', duration: (session ? 25 : 45) * 60,
        categoryId: session ? 'questoes' : 'teoria', hits: session ? 8 + day % 3 : 0, misses: session ? 2 : 0,
        pages: session ? [] : [{ start: 1 + day * 4, end: 4 + day * 4 }], videos: [], material: 'Caderno de estudos (exemplo)',
        comment: session ? 'Rever as questões em que confundi os conceitos.' : 'Resumo dos pontos principais.', countInPlanning: true, createdAt: `${studyDate}T12:00:00.000Z`,
      })
    }
  }
  state.reviews = [-2, 0, 1, 7].map((offset, i) => ({
    id: `tutorial-revisao-${i}`, planId: DEMO_PLAN, studyId: `tutorial-estudo-${i + 1}-0`, subjectId: `tutorial-disciplina-${(i + 1) % 3}`,
    topicId: `tutorial-topico-${(i + 1) % 3}-0`, dueDate: addDays(date, offset), interval: i < 2 ? 1 : 7, status: 'pending',
  }))
  state.plannings[DEMO_PLAN] = {
    planId: DEMO_PLAN, type: 'cycle', completedCycles: 2, cycleStartedAt: date,
    config: { weeklyMinutes: 600, days: [false, true, true, true, true, true, false], minSession: 25, maxSession: 50, subjects: state.subjects.slice(0, 3).map((s, i) => ({ subjectId: s.id, importance: 3 + i, knowledge: 2 })) },
    cycle: [0, 1, 2, 1, 0, 2].map((n, i) => ({ id: `tutorial-sessao-${i}`, subjectId: `tutorial-disciplina-${n}`, topicId: `tutorial-topico-${n}-1`, duration: i % 2 ? 25 : 45 })),
  }
  state.exams = [14, 7, 1].map((days, i) => ({
    id: `tutorial-simulado-${i}`, planId: DEMO_PLAN, name: `Simulado de treino ${i + 1}`, date: addDays(date, -days), style: 'multiple', board: 'Questões de exemplo', timeSpent: 5400, comment: 'Treino fictício para acompanhar a evolução.',
    rows: state.subjects.slice(0, 3).map((s, n) => ({ subjectId: s.id, weight: 1, total: 20, hits: 12 + i * 2 + n, misses: 8 - i * 2 - n })),
  }))
  state.assessments = [
    { id: 'tutorial-prova', planId: DEMO_SEMESTER, subjectId: 'tutorial-disciplina-3', name: 'Prova de derivadas', kind: 'prova', date: addDays(date, 5), time: '19:00', weight: '40%', done: false, notes: 'Capítulos 2 e 3.', createdAt },
    { id: 'tutorial-trabalho', planId: DEMO_SEMESTER, subjectId: 'tutorial-disciplina-4', name: 'Projeto em Python', kind: 'trabalho', date: addDays(date, 10), weight: '30%', done: false, notes: 'Entregar código e um breve relatório.', createdAt },
    { id: 'tutorial-lista', planId: DEMO_SEMESTER, subjectId: 'tutorial-disciplina-3', name: 'Lista de limites', kind: 'lista', date: addDays(date, -3), weight: '10%', done: true, grade: 8.5, maxGrade: 10, notes: '', createdAt },
  ]
  state.reminders = [{ id: 'tutorial-lembrete', text: 'Separar as dúvidas de matemática para a próxima sessão', date, done: false, createdAt }]
  state.note = 'Lembrete de exemplo: revisar probabilidade antes do próximo simulado.'
  return state
}
