export interface PlanTemplate {
  id: string
  name: string
  area: string
  description: string
  subjects: { name: string; topics: string[] }[]
}
const portuguese = {
  name: 'Português',
  topics: ['Interpretação de textos', 'Classes de palavras', 'Sintaxe e concordância', 'Pontuação e crase'],
}
const logic = {
  name: 'Raciocínio lógico',
  topics: ['Proposições e conectivos', 'Equivalências e negações', 'Porcentagens e proporções', 'Probabilidade básica'],
}
/** Roteiros originais de preparação, sem promessa de cobertura de edital ou concurso aberto. */
export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: 'engenharia',
    name: 'Base de engenharia',
    area: 'Engenharia',
    description: 'Matemática e fundamentos técnicos para organizar a preparação antes de escolher um edital.',
    subjects: [
      portuguese,
      { name: 'Cálculo', topics: ['Limites e continuidade', 'Derivadas e aplicações', 'Integrais', 'Equações diferenciais'] },
      { name: 'Estatística', topics: ['Estatística descritiva', 'Distribuições de probabilidade', 'Inferência e intervalos de confiança'] },
      { name: 'Física', topics: ['Mecânica', 'Termodinâmica', 'Eletricidade e magnetismo'] },
      {
        name: 'Engenharia elétrica',
        topics: ['Circuitos elétricos', 'Máquinas elétricas', 'Sistemas de potência', 'Controle e automação'],
      },
    ],
  },
  {
    id: 'administrativo',
    name: 'Base administrativa',
    area: 'Administrativa',
    description: 'Ponto de partida para concursos administrativos. Ajuste leis, profundidade e disciplinas ao cargo.',
    subjects: [
      portuguese,
      logic,
      {
        name: 'Direito administrativo',
        topics: ['Princípios da administração pública', 'Atos administrativos', 'Agentes públicos', 'Licitações e contratos'],
      },
      {
        name: 'Direito constitucional',
        topics: ['Direitos e garantias fundamentais', 'Organização do Estado', 'Administração pública na Constituição'],
      },
      { name: 'Informática', topics: ['Sistemas operacionais', 'Planilhas e editores de texto', 'Redes e segurança da informação'] },
    ],
  },
  {
    id: 'fiscal',
    name: 'Base fiscal',
    area: 'Fiscal',
    description: 'Roteiro inicial das disciplinas comuns à área fiscal, para personalizar conforme o edital escolhido.',
    subjects: [
      portuguese,
      logic,
      { name: 'Contabilidade', topics: ['Patrimônio e contas', 'Escrituração contábil', 'Demonstrações contábeis'] },
      {
        name: 'Direito tributário',
        topics: ['Sistema tributário nacional', 'Obrigação e crédito tributário', 'Limitações ao poder de tributar'],
      },
      { name: 'Auditoria', topics: ['Planejamento de auditoria', 'Evidências e procedimentos', 'Controles internos'] },
    ],
  },
]
