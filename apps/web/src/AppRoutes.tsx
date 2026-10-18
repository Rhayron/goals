import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import Community from './pages/Community'
import Achievements from './pages/Achievements'
import Templates from './pages/Templates'
import Help from './pages/Help'
import Library from './pages/Library'
import ImportNotice from './pages/ImportNotice'
import NoticeCatalog from './pages/NoticeCatalog'
import Home from './pages/Home'
import Plans from './pages/Plans'
import Subjects from './pages/Subjects'
import Edital from './pages/Edital'
import PlanningPage from './pages/Planning'
import Reviews from './pages/Reviews'
import HistoryPage from './pages/History'
import Statistics from './pages/Statistics'
import Exams from './pages/Exams'
import Assessments from './pages/Assessments'
import FilesPage from './pages/Files'
import ProfilePage from './pages/Profile'
import SettingsPage from './pages/Settings'

export function AppRoutes() {
  return (
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
        <Route path="avaliacoes" element={<Assessments />} />
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
  )
}
