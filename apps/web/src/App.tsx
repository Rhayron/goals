import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import type { AppState } from '@coado/shared'
import { AuthProvider, useAuth } from './lib/auth'
import { RadioProvider } from './lib/radio'
import { api, ApiError } from './lib/api'
import { recoverPending } from './lib/outbox'
import { TimerSessionProvider } from './lib/timer-session'
import { StoreProvider } from './lib/store'
import { LoadingScreen } from './components/LoadingScreen'
import { WelcomeProvider } from './components/welcome/Welcome'
import LoginPage from './pages/Login'
import { AppRoutes } from './AppRoutes'
import { isTutorial } from './lib/tutorial-mode'

const TutorialApp = lazy(() => import('./components/welcome/TutorialApp'))

export default function App() {
  if (isTutorial) return <Suspense fallback={<LoadingScreen />}><TutorialApp /></Suspense>
  return (
    <AuthProvider>
      <BrowserRouter>
        <RadioProvider>
          <Gate />
        </RadioProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

/** Decide entre carregamento, tela de entrada e o app */
function Gate() {
  const { state } = useAuth()
  if (state.status === 'loading') return <LoadingScreen />
  if (state.status === 'anonymous') return <LoginPage config={state.config} reason={state.reason} />
  return <AccountApp key={state.me.id} />
}

/** Baixa os dados da conta e monta o app em cima deles */
function AccountApp() {
  const { expire, state: auth } = useAuth()
  const account = auth.status === 'authenticated' ? auth.me.id : ''
  const [data, setData] = useState<AppState | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setError(null)
    api
      .get<AppState>('/state')
      .then((data) => recoverPending(account, data))
      .then(setData)
      .catch((e: unknown) => {
        if (e instanceof ApiError && e.status === 401) expire()
        else setError(e instanceof ApiError ? e.message : 'Não foi possível carregar seus dados.')
      })
  }, [expire, account])

  useEffect(load, [load])

  if (!data) return <LoadingScreen error={error} onRetry={load} />

  return (
    <StoreProvider initial={data} onUnauthorized={expire}>
      <TimerSessionProvider>
        <WelcomeProvider>
          <AppRoutes />
        </WelcomeProvider>
      </TimerSessionProvider>
    </StoreProvider>
  )
}
