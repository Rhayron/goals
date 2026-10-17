import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { Button, Card, Modal } from '../components/ui'

const articles = [
  {
    title: 'Do edital à primeira sessão',
    subtitle: 'Uma receita para começar sem montar um plano impossível.',
    paragraphs: [
      'Separe o edital oficial e identifique as disciplinas, os tópicos e a data da prova. Um modelo pronto ajuda a sair da página em branco, mas precisa ser conferido contra o documento do seu cargo.',
      'Reserve primeiro os horários que realmente existem na sua rotina. Comece com uma carga que caiba na semana, incluindo trabalho, deslocamento e descanso. Ajuste o planejamento com base no tempo efetivamente registrado.',
      'Dê mais espaço às disciplinas importantes em que seu conhecimento é menor. No Coado, esses dois fatores orientam a distribuição do ciclo. Eles são uma escolha inicial sua, não uma previsão automática de aprovação.',
      'Escolha um tópico concreto para a próxima sessão. Ao terminar, registre o tempo e o que fez. Esse registro permite retomar o conteúdo sem gastar a sessão seguinte tentando lembrar onde parou.',
    ],
    to: '/planejamento',
    action: 'Montar meu ciclo',
  },
  {
    title: 'Questões que ajudam a decidir',
    subtitle: 'Transforme acertos e erros em uma próxima ação.',
    paragraphs: [
      'Registre questões por disciplina e, quando possível, por tópico. Um percentual geral pode esconder uma matéria forte compensando outra ainda pouco estudada.',
      'Compare resultados de conjuntos semelhantes. Banca, dificuldade e quantidade de questões afetam a interpretação; dez questões não dizem o mesmo que uma amostra grande e variada.',
      'Ao errar, anote o motivo: conceito desconhecido, interpretação, cálculo ou distração. Escolha uma ação pequena para corrigir essa causa, como revisar uma definição e resolver novas questões do assunto.',
      'Use os simulados para praticar tempo e distribuição de esforço. Registre pesos por disciplina e observe onde os pontos foram perdidos. O resultado serve para ajustar o estudo; não garante desempenho na prova real.',
    ],
    to: '/simulados',
    action: 'Registrar um simulado',
  },
  {
    title: 'Uma rotina que continua amanhã',
    subtitle: 'Revisões, pausas e uma competição que cabe na sua vida.',
    paragraphs: [
      'Defina uma sessão com começo e fim claros. O pomodoro ajuda a organizar blocos e pausas; suas durações podem ser ajustadas ao tipo de tarefa e à sua rotina.',
      'Nas revisões, tente recuperar o que lembra antes de consultar o material. Depois confira os pontos esquecidos e registre a retomada. Os intervalos do Coado são configuráveis e podem ser revistos conforme sua necessidade.',
      'Uma semana interrompida não exige compensar todas as horas de uma vez. Observe a disponibilidade real e reorganize o ciclo. Use o ritmo por dia da semana para identificar horários que funcionam.',
      'Combine com os amigos uma competição amigável. Os rankings somam registros autodeclarados e não medem qualidade de aprendizado. Comemore também a revisão feita, o tópico compreendido e o hábito que conseguiu manter.',
    ],
    to: '/revisoes',
    action: 'Organizar minhas revisões',
  },
]
export default function Library() {
  const [selected, setSelected] = useState<(typeof articles)[number] | null>(null)
  return (
    <>
      <PageHeader title="Biblioteca" hidePlan />
      <p className="mb-6 text-muted">
        Guias originais do Coado para preparar sua rotina. Seus PDFs e materiais pessoais continuam na aba Arquivos.
      </p>
      <div className="grid gap-5 lg:grid-cols-3">
        {articles.map((a) => (
          <Card key={a.title}>
            <BookOpen className="mb-4 text-brand-600" />
            <h2 className="font-display text-xl font-bold">{a.title}</h2>
            <p className="my-4 text-sm text-muted">{a.subtitle}</p>
            <Button onClick={() => setSelected(a)}>Ler guia</Button>
          </Card>
        ))}
      </div>
      {selected && (
        <Modal
          open
          size="lg"
          title={selected.title}
          onClose={() => setSelected(null)}
          footer={
            <Link className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white" to={selected.to}>
              {selected.action}
            </Link>
          }
        >
          <article className="space-y-4 leading-relaxed">
            {selected.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </article>
        </Modal>
      )}
    </>
  )
}
