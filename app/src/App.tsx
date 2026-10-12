import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './lib/store'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import Plans from './pages/Plans'
import Subjects from './pages/Subjects'
import Edital from './pages/Edital'
import PlanningPage from './pages/Planning'
import Reviews from './pages/Reviews'
import HistoryPage from './pages/History'
import Statistics from './pages/Statistics'
import Exams from './pages/Exams'
import SettingsPage from './pages/Settings'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
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
            <Route path="configuracoes" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
