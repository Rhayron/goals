# Rumo — planner de estudos

App de planejamento de estudos para concursos inspirado nas funcionalidades de planners do mercado
(ciclo de estudos, edital verticalizado, revisões espaçadas, cronômetro/pomodoro, estatísticas e simulados).

Tudo roda no navegador e os dados ficam no `localStorage` (faça backup em **Configurações → Exportar backup**).
Na primeira abertura o app já vem com o plano **Petrobrás** importado (disciplinas, tópicos, histórico e ciclo).

## Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:5173.

## Build

```bash
npm run build && npm run preview
```

## Estrutura

- `src/lib/types.ts` — modelo de dados (planos, disciplinas, tópicos, estudos, revisões, planejamento, simulados)
- `src/lib/store.tsx` — estado global + persistência + ações
- `src/lib/utils.ts` — datas, formatação, agregações, geração/progresso do ciclo, constância
- `src/data/` — dados importados da conta antiga
- `src/components/` — layout, modal de registro de estudo, cronômetro, anotações, UI base
- `src/pages/` — telas
