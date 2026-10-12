import { emptyState, type AppState } from '@coado/shared'
import { SUBJECT_COLORS } from './utils'

/*
 * Antes da conta (quando o app ainda se chamava Rumo), tudo ficava no localStorage. Na primeira entrada oferecemos trazer
 * esses dados para a conta; depois a chave é renomeada para não perguntar de novo.
 */

const LEGACY_KEY = 'rumo:v1'
const MIGRATED_KEY = 'rumo:v1:migrado'
const THEME_KEY = 'coado:tema'

/** Paleta usada antes do tema café; cores nela são trocadas pelas pastéis equivalentes */
const LEGACY_COLORS = [
  '#FEAEA5', '#FFB6C1', '#FFEDBB', '#B0EAEB', '#FF9999', '#FFDE87', '#B9ACBD', '#ABE0AC',
  '#E8BDFF', '#AFCAF9', '#9ED8C4', '#F7C59F', '#C3B1E1', '#A0C4FF', '#FDCB82', '#B5EAD7',
]

const migrateColors = (s: AppState): AppState => ({
  ...s,
  subjects: s.subjects.map((sub) => {
    const i = LEGACY_COLORS.indexOf(sub.color.toUpperCase())
    return i === -1 ? sub : { ...sub, color: SUBJECT_COLORS[i] }
  }),
})

export function readLegacyState(): AppState | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    const parsed = { ...emptyState(), ...JSON.parse(raw) } as AppState
    if (!Array.isArray(parsed.plans) || !parsed.plans.length) return null
    return migrateColors(parsed)
  } catch {
    return null
  }
}

export function markLegacyMigrated() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (raw) localStorage.setItem(MIGRATED_KEY, raw)
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    /* storage indisponível */
  }
}

/** Tema em cache para pintar a tela certa antes de os dados chegarem */
export function cachedTheme(): AppState['theme'] {
  try {
    const t = localStorage.getItem(THEME_KEY)
    return t === 'light' || t === 'dark' ? t : 'system'
  } catch {
    return 'system'
  }
}

export function cacheTheme(theme: AppState['theme']) {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* ignore */
  }
}

export function applyTheme(theme: AppState['theme']) {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
}
