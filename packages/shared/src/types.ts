export type ID = string

/** Data no formato YYYY-MM-DD (fuso local) */
export type DateStr = string

export interface Plan {
  id: ID
  name: string
  org?: string
  role?: string
  notes?: string
  /** Proveniência da importação, preservada nos backups sem poluir as notas do plano. */
  importedFrom?: { source: string; sha256?: string; catalogId?: string; catalogVersion?: number; provider?: string; reviewedAt: string }
  /** Data da prova (contagem regressiva na home) */
  examDate?: DateStr
  /** Metas semanais */
  weeklyGoal: { minutes: number; questions: number }
  createdAt: string
}

export interface Subject {
  id: ID
  planId: ID
  name: string
  color: string
  order: number
  archived?: boolean
}

export interface TopicLink {
  title: string
  url: string
}

export interface Topic {
  id: ID
  subjectId: ID
  name: string
  order: number
  finished: boolean
  finishedAt?: string
  links: TopicLink[]
}

export interface Category {
  id: ID
  name: string
  builtin?: boolean
}

export interface PageRange {
  start: number
  end: number
}

export interface VideoRange {
  title: string
  /** segundos */
  start: number
  /** segundos */
  end: number
}

export interface Study {
  id: ID
  planId: ID
  subjectId: ID
  topicId?: ID
  categoryId: ID
  date: DateStr
  /** HH:mm */
  time?: string
  /** segundos */
  duration: number
  material: string
  hits: number
  misses: number
  pages: PageRange[]
  videos: VideoRange[]
  comment: string
  /** Conta no ciclo/planejamento */
  countInPlanning: boolean
  createdAt: string
}

export type ReviewStatus = 'pending' | 'done' | 'ignored'

export interface Review {
  id: ID
  planId: ID
  studyId: ID
  subjectId: ID
  topicId?: ID
  dueDate: DateStr
  /** intervalo em dias que gerou essa revisão */
  interval: number
  status: ReviewStatus
  doneAt?: string
}

export interface SubjectWeight {
  subjectId: ID
  /** 0.5 – 5 */
  importance: number
  /** 0 – 5 */
  knowledge: number
}

export interface PlanningConfig {
  weeklyMinutes: number
  /** dom..sáb */
  days: boolean[]
  /** minutos */
  minSession: number
  /** minutos */
  maxSession: number
  subjects: SubjectWeight[]
}

export interface CycleItem {
  id: ID
  subjectId: ID
  topicId?: ID
  /** minutos planejados */
  duration: number
}

export interface Planning {
  planId: ID
  type: 'cycle' | 'weekly'
  config: PlanningConfig
  /** Sequência do ciclo (no modo semanal, a sequência é distribuída pelos dias) */
  cycle: CycleItem[]
  completedCycles: number
  /** Estudos com data >= essa contam para o ciclo atual */
  cycleStartedAt: DateStr
}

export interface ExamRow {
  subjectId: ID
  weight: number
  total: number
  hits: number
  misses: number
}

export interface Exam {
  id: ID
  planId: ID
  date: DateStr
  name: string
  style: 'multiple' | 'true_false'
  board: string
  /** segundos */
  timeSpent: number
  rows: ExamRow[]
  comment: string
}

export interface Reminder {
  id: ID
  text: string
  date?: DateStr
  done: boolean
  createdAt: string
}

export interface TimerPrefs {
  pomodoroStudy: number
  pomodoroShort: number
  pomodoroLong: number
  pomodoroRounds: number
  countdown: number
  sound: boolean
}

export interface AppState {
  version: 1
  plans: Plan[]
  activePlanId: ID | null
  subjects: Subject[]
  topics: Topic[]
  categories: Category[]
  studies: Study[]
  reviews: Review[]
  plannings: Record<ID, Planning>
  exams: Exam[]
  reminders: Reminder[]
  note: string
  theme: 'light' | 'dark' | 'system'
  timerPrefs: TimerPrefs
  /** Intervalos padrão de revisão (dias) */
  reviewIntervals: number[]
}
