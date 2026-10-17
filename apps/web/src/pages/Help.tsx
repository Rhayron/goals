import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { Card } from '../components/ui'

const guides = [
  {
    id: 'importar-edital',
    title: 'Importar e revisar um edital',
    to: '/importar-edital',
    steps: [
      'Selecione um PDF de até 20 MB ou informe um link público HTTPS. Uma página de concurso pode mostrar os links dos editais encontrados.',
      'Escolha as páginas do conteúdo programático do seu cargo. PDFs digitalizados sem texto precisam de OCR externo ou transcrição manual.',
      'Confira o texto extraído, organize as disciplinas e edite os tópicos. A sugestão automática pode misturar cabeçalhos, colunas ou cargos.',
      'Informe o cargo e confirme a revisão para criar o plano. Nada é criado antes dessa confirmação.',
      'A Base de editais permite buscar registros conferidos e abrir o PDF para revisão. Seu plano é uma cópia pessoal: acompanhe retificações na fonte oficial.',
    ],
  },
  {
    id: 'planos',
    title: 'Começar um plano',
    to: '/modelos',
    steps: [
      'Escolha um modelo de preparação ou crie um plano em branco em Planos.',
      'Confira o edital oficial do cargo e adapte disciplinas e tópicos. Modelos são pontos de partida.',
      'Defina a data da prova e as metas semanais. O plano ativo controla as telas de estudo.',
    ],
  },
  {
    id: 'planejamento',
    title: 'Montar o ciclo e escolher tópicos',
    to: '/planejamento',
    steps: [
      'Informe seus dias livres, horas semanais e duração das sessões.',
      'Ajuste a importância e seu conhecimento em cada disciplina.',
      'Em Editar ciclo, escolha o tópico de cada sessão. Qualquer tópico mantém a sessão aberta à disciplina inteira.',
      'Inicie pelo planejamento ou pela home. Ao finalizar, confira o registro. Somente estudos que contam no planejamento e correspondem ao tópico preenchem a sessão.',
    ],
  },
  {
    id: 'estudos',
    title: 'Registrar um estudo',
    to: '/historico',
    steps: [
      'Use Adicionar estudo ou finalize o cronômetro/pomodoro.',
      'Confira disciplina, tópico, tempo, categoria e data.',
      'Registre acertos, erros, páginas e vídeos quando fizer sentido.',
      'Marque Teoria finalizada para concluir o tópico e escolha os intervalos de revisão.',
    ],
  },
  {
    id: 'revisoes',
    title: 'Manter as revisões em dia',
    to: '/revisoes',
    steps: [
      'Os intervalos definidos no registro geram revisões espaçadas.',
      'Use Programadas e Atrasadas para encontrar o que revisar.',
      'Registre a sessão da revisão para guardar o tempo, ou marque como concluída quando já a realizou.',
      'Ignorar retira a revisão da fila; você pode consultar as ignoradas depois.',
    ],
  },
  {
    id: 'estatisticas',
    title: 'Ler sua evolução',
    to: '/estatisticas',
    steps: [
      'Filtre por período e disciplina para comparar resultados.',
      'Acompanhe tempo, acertos, páginas e avanço no edital.',
      'O ritmo semanal inclui dias sem estudo na média; ajuda a planejar uma carga realista.',
      'A evolução do edital usa as datas dos tópicos atualmente concluídos.',
    ],
  },
  {
    id: 'simulados',
    title: 'Registrar simulados',
    to: '/simulados',
    steps: [
      'Crie um simulado com data, banca, estilo de prova e tempo gasto.',
      'Preencha questões, acertos, erros e peso por disciplina.',
      'Compare os resultados para decidir o que revisar. O Coado registra seus resultados; você resolve a prova no material de sua escolha.',
    ],
  },
  {
    id: 'comunidade',
    title: 'Grupos, convites e ranking',
    to: '/comunidade',
    steps: [
      'Escolha seu apelido. A participação global é opcional e pode ser desligada.',
      'Crie um grupo e gere um link de convite. Envie o link diretamente aos amigos.',
      'O convite vale por 7 dias. Gerar outro invalida o anterior; o anfitrião também pode revogar o link.',
      'Quem recebe entra na própria conta e confirma a participação. Não precisa compartilhar senha.',
      'O ranking fecha a semana no domingo, no horário de Brasília, e soma estudos de todos os planos. Escolha horas, questões ou páginas.',
      'Empates têm a mesma posição. Os dados são autodeclarados. Editar ou excluir estudos recalcula os totais, inclusive históricos.',
      'Os membros veem apelidos e totais, sem acesso a anotações ou arquivos. Você pode sair; o anfitrião pode remover membros ou encerrar o grupo.',
    ],
  },
  {
    id: 'conquistas',
    title: 'Colecionar conquistas',
    to: '/conquistas',
    steps: [
      'A coleção usa estudos, revisões e simulados de todos os planos.',
      'Veja o progresso e a linha do tempo. Conquistas liberadas têm cartão para baixar.',
      'Editar ou apagar registros recalcula a coleção.',
    ],
  },
  {
    id: 'sincronizacao',
    title: 'Conexão, dados e backup',
    to: '/configuracoes',
    steps: [
      'O indicador no menu mostra se os dados chegaram ao servidor.',
      'Sem conexão, alterações ficam na fila deste navegador e são reenviadas depois. Volte usando a mesma conta e o mesmo navegador.',
      'Não limpe os dados do navegador enquanto houver pendências. Arquivos enviados precisam de conexão.',
      'A fila protege alterações pendentes; abrir o site do zero ainda exige conexão e login.',
      'Exporte backups em Configurações. Antes de substituir seus dados por um backup, conclua a sincronização.',
    ],
  },
  {
    id: 'perfil',
    title: 'Perfil e aparelhos',
    to: '/perfil',
    steps: [
      'Abra Meu perfil no menu esquerdo para editar o nome e consultar sua atividade.',
      'Use Onde você está conectado para encerrar sessões de aparelhos.',
      'O apelido do ranking é ajustado separadamente na comunidade.',
      'O relógio é pareado em Configurações. O pomodoro nativo do Android complementa o site.',
    ],
  },
]
export default function Help() {
  const { hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [hash])
  const [query, setQuery] = useState('')
  const visible = guides.filter((g) => `${g.title} ${g.steps.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <>
      <PageHeader title="Ajuda" hidePlan />
      <p className="mb-5 text-muted">Receitas rápidas para cuidar da sua rotina de estudos.</p>
      <input
        aria-label="Buscar ajuda"
        className="field mb-5"
        placeholder="Buscar: ciclo, convite, revisões…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="grid items-start gap-5 md:grid-cols-2">
        {visible.map((g) => (
          <section key={g.id} id={g.id} className="scroll-mt-20">
            <Card title={g.title}>
              <ol className="list-decimal space-y-2 pl-5 text-sm">
                {g.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <Link to={g.to} className="mt-4 inline-block text-sm font-semibold text-brand-600 underline">
                Abrir {g.title.toLowerCase()}
              </Link>
            </Card>
          </section>
        ))}
      </div>
      {!visible.length && <p>Nenhum guia encontrado. Tente outro termo.</p>}
    </>
  )
}
