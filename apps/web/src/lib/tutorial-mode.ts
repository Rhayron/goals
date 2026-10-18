/** Dedicated document: its router, state and preferences never belong to an account. */
export const isTutorial = typeof window !== 'undefined' && window.location.pathname === '/tutorial'

export const TUTORIAL_CLOSE = 'coado:tutorial-close'
export const TUTORIAL_RESTART = 'coado:tutorial-restart'

export const tutorialOnlyMessage = 'Esta ação fica disponível fora do tutorial. Aqui usamos apenas exemplos temporários.'
