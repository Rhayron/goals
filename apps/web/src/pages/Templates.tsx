import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Search } from 'lucide-react'
import { PageHeader } from '../components/Layout'
import { Button, Card, Modal } from '../components/ui'
import { PLAN_TEMPLATES, type PlanTemplate } from '../data/plan-templates'
import { useStore } from '../lib/store'
import { SUBJECT_COLORS, uid } from '../lib/utils'

export default function Templates() {
  const [query, setQuery] = useState(''),
    [selected, setSelected] = useState<PlanTemplate | null>(null)
  const { update } = useStore(),
    navigate = useNavigate()
  const visible = PLAN_TEMPLATES.filter((t) =>
    `${t.name} ${t.area} ${t.description}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')),
  )
  function useTemplate(t: PlanTemplate) {
    const planId = uid(),
      subjects = t.subjects.map((s, i) => ({ id: uid(), planId, name: s.name, color: SUBJECT_COLORS[i % SUBJECT_COLORS.length], order: i }))
    const topics = t.subjects.flatMap((s, i) =>
      s.topics.map((name, order) => ({ id: uid(), subjectId: subjects[i].id, name, order, finished: false, links: [] })),
    )
    update((s) => ({
      ...s,
      activePlanId: planId,
      plans: [
        ...s.plans,
        {
          id: planId,
          name: t.name,
          role: t.area,
          notes: 'Modelo de preparação. Confira e adapte ao edital oficial.',
          weeklyGoal: { minutes: 600, questions: 100 },
          createdAt: new Date().toISOString(),
        },
      ],
      subjects: [...s.subjects, ...subjects],
      topics: [...s.topics, ...topics],
    }))
    navigate('/edital')
  }
  return (
    <>
      <PageHeader title="Modelos de planos" hidePlan />
      <Link to="/importar-edital" className="mb-4 inline-block text-brand-600 underline">Já tem um edital? Importe por PDF ou link</Link>
      <p className="mb-5 text-muted">
        Comece com uma base pronta e ajuste ao seu objetivo. São roteiros de preparação, não editais oficiais nem uma lista de concursos
        abertos.
      </p>
      <div className="relative mb-5">
        <Search className="absolute left-3 top-3 text-muted" size={18} />
        <input
          className="field pl-10"
          aria-label="Buscar modelos"
          placeholder="Buscar área ou modelo"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {visible.map((t) => (
          <Card key={t.id}>
            <BookOpen className="mb-3 text-brand-600" />
            <p className="text-xs uppercase text-muted">{t.area}</p>
            <h2 className="mt-1 font-display text-xl font-bold">{t.name}</h2>
            <p className="my-3 text-sm text-muted">{t.description}</p>
            <p className="mb-4 text-sm">
              {t.subjects.length} disciplinas · {t.subjects.reduce((n, s) => n + s.topics.length, 0)} tópicos
            </p>
            <Button onClick={() => setSelected(t)}>Ver conteúdo</Button>
          </Card>
        ))}
      </div>
      {!visible.length && <p>Nenhum modelo encontrado. Você pode criar um plano personalizado em Planos.</p>}
      {selected && (
        <Modal
          open
          onClose={() => setSelected(null)}
          title={selected.name}
          footer={<Button onClick={() => useTemplate(selected)}>Criar plano com este modelo</Button>}
        >
          <p className="mb-4 text-sm text-muted">
            Cria um novo plano sem substituir seus dados. Depois você pode editar todas as disciplinas e tópicos.
          </p>
          {selected.subjects.map((s) => (
            <section key={s.name} className="mb-4">
              <h3 className="font-bold">{s.name}</h3>
              <ul className="mt-1 list-inside list-disc text-sm text-muted">
                {s.topics.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          ))}
        </Modal>
      )}
    </>
  )
}
