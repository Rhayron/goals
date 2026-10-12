/*
 * Ponte com o app Android (apps/android/phone), que mostra este site numa WebView.
 * O app injeta `window.CoadoNative`; fora dele, nada muda.
 */

export interface CoadoNative {
  /** Abre o pomodoro nativo (sobrevive em segundo plano e vai para o relógio). JSON de TimerRequest. */
  openTimer(request: string): void
  /** 'loading' | 'anonymous' | 'authenticated': o app renova a sessão da WebView ou volta ao login nativo */
  authChanged(status: string): void
  /** Pede ao app o login nativo com o Google */
  signIn(): void
}

export const native = (): CoadoNative | null => (window as unknown as { CoadoNative?: CoadoNative }).CoadoNative ?? null
