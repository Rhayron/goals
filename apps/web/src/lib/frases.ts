import { useSyncExternalStore } from 'react'
import { cachedPalette, type Palette } from './legacy'

/**
 * Frases de cada paleta. O produto continua Coado; o que muda é a voz do tema.
 * `cafe` é o tema de café. As outras paletas são temas sem café, cada uma com a própria voz.
 */
export interface Frases {
  tagline: string
  quadro: string
  quadroLabel: string
  menu: [string, string][]
  radio: string
}

const MENU_BASE: [string, string][] = [
  ['Ciclo de estudos', 'pelo peso de cada matéria'],
  ['Pomodoro', 'com pausas curtas e longas'],
  ['Revisões espaçadas', '1 · 7 · 30 dias'],
  ['Edital ou programa', 'tópico a tópico'],
  ['Estatísticas', 'tempo, acertos e constância'],
]

export const FRASES: Record<Palette, Frases> = {
  cafe: {
    tagline: 'devagar, que o café coa.',
    quadro: '~ cardápio da casa ~',
    quadroLabel: 'Cardápio da casa',
    menu: [
      ['Ciclo de estudos', 'moído no peso de cada matéria'],
      ['Pomodoro', 'xícara cheia, pausa curta'],
      ['Revisões espaçadas', '1 · 7 · 30 dias'],
      ['Edital ou programa', 'tópico a tópico'],
      ['Estatísticas', 'a conta do que já foi coado'],
    ],
    radio: 'Um café, uma boa faixa.',
  },
  grafite: {
    tagline: 'sem enfeite, só o próximo bloco.',
    quadro: 'o que tem aqui',
    quadroLabel: 'O que tem aqui',
    menu: MENU_BASE,
    radio: 'Fundo baixo, foco alto.',
  },
  oceano: {
    tagline: 'uma maré de cada vez.',
    quadro: 'o que tem aqui',
    quadroLabel: 'O que tem aqui',
    menu: MENU_BASE,
    radio: 'Maré baixa para estudar.',
  },
  floresta: {
    tagline: 'sombra, silêncio, mais uma página.',
    quadro: 'o que tem aqui',
    quadroLabel: 'O que tem aqui',
    menu: MENU_BASE,
    radio: 'Sob as árvores, o volume fica baixo.',
  },
  ameixa: {
    tagline: 'calmo, e no seu ritmo.',
    quadro: 'o que tem aqui',
    quadroLabel: 'O que tem aqui',
    menu: MENU_BASE,
    radio: 'Uma faixa roxa para a sessão.',
  },
  magenta: {
    tagline: 'aceso, mas sem pressa.',
    quadro: 'o que tem aqui',
    quadroLabel: 'O que tem aqui',
    menu: MENU_BASE,
    radio: 'Volume na medida da sessão.',
  },
}

const EVENT = 'coado:palette'

export function notifyPalette() {
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}

export function useFrases(): Frases {
  const palette = useSyncExternalStore(subscribe, cachedPalette, () => 'cafe' as Palette)
  return FRASES[palette]
}
