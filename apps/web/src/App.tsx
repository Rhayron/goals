import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { AppState } from '@coado/shared'
import { AuthProvider, useAuth } from './lib/auth'
import { RadioProvider } from './lib/radio'
import { api, ApiError } from './lib/api'
import { recoverPending } from './lib/outbox'
import { TimerSessionProvider } from './lib/timer-session'
import { StoreProvider } from './lib/store'
import { Layout } from './components/Layout'
import { BrewingScreen } from './components/BrewingScreen'
import { WelcomeProvider } from './components/welcome/Welcome'
import Community from './pages/Community'
import Achievements from './pages/Achievements'
import Templates from './pages/Templates'
import Help from './pages/Help'
import Library from './pages/Library'
import ImportNotice from './pages/ImportNotice'
import NoticeCatalog from './pages/NoticeCatalog'
import LoginPage from './pages/Login'
import Home from './pages/Home'
import Plans from './pages/Plans'
import Subjects from './pages/Subjects'
import Edital from './pages/Edital'
import PlanningPage from './pages/Planning'
import Reviews from './pages/Reviews'
import HistoryPage from './pages/History'
import Statistics from './pages/Statistics'
import Exams from './pages/Exams'
import FilesPage from './pages/Files'
import ProfilePage from './pages/Profile'
import SettingsPage from './pages/Settings'

export default function App() {
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
  if (state.status === 'loading') return <BrewingScreen />
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

  if (!data) return <BrewingScreen error={error} onRetry={load} />

  return (
    <StoreProvider initial={data} onUnauthorized={expire}>
      <TimerSessionProvider>
        <WelcomeProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="planos" element={<Plans />} />
              <Route path="disciplinas" element={<Subjects />} />
              <Route path="edital" element={<Edital />} />
              <Route path="planejamento" element={<PlanningPage />} />
              <Route path="revisoes" element={<Reviews />} />
              <Route path="historico" element={<HistoryPage />} />
              <Route path="estatisticas" element={<Statistics />} />
              <Route path="simulados" element={<Exams />} />
              <Route path="arquivos" element={<FilesPage />} />
              <Route path="comunidade" element={<Community />} />
              <Route path="conquistas" element={<Achievements />} />
              <Route path="modelos" element={<Templates />} />
              <Route path="importar-edital" element={<ImportNotice />} />
              <Route path="concursos" element={<NoticeCatalog />} />
              <Route path="biblioteca" element={<Library />} />
              <Route path="ajuda" element={<Help />} />
              <Route path="perfil" element={<ProfilePage />} />
              <Route path="configuracoes" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </WelcomeProvider>
      </TimerSessionProvider>
    </StoreProvider>
  )
}
