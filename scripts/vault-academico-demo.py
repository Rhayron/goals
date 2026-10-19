#!/usr/bin/env python3
"""Monta a vault demo só do sistema acadêmico.

Copia o fechamento de dc.require a partir do painel acadêmico, os templates
que o painel abre, e uma disciplina/semestre de exemplo. Não copia notas
pessoais de System/Academico/Disciplinas nem PDFs.
"""
from __future__ import annotations

import re
import zipfile
from pathlib import Path

VAULT = Path("/home/davi/Documentos/Obsidian_Vaults/megabrain")
OBS = VAULT / ".obsidian" / "plugins"
PLUGIN_IDS = ["datacore", "dataview", "templater-obsidian", "tasknotes"]
PLUGIN_SKIP = {"sync.log", "vault-scan-index.json"}
SECRET_KEYS = {
    "apiAuthToken",
    "googleCalendarSyncTokens",
    "microsoftCalendarSyncTokens",
    "githubToken",
    "lemonSqueezyLicenseKey",
}
OUT = Path("/home/davi/Projetos/worktrees/coado-temas/apps/web/public/vault-academico-demo.zip")
LINK = re.compile(r"""dc\.fileLink\(\s*["']([^"']+)["']\s*\)""")
PATH = re.compile(r"""System/(?:Templates|TaskNotes|Academico|Dashboards)/[^"'#\]]+""")

ROOTS = [
    "System/Scripts/Widgets/dc-academicoIntegrado.jsx",
    "System/Scripts/Widgets/dc-academicDashboard.jsx",
    "System/Scripts/Widgets/dc-coadoPainel.jsx",
    "System/Scripts/Widgets/dc-subjectIndex.jsx",
    "System/Scripts/Widgets/dc-subjectMetrics.jsx",
    "System/Scripts/Core/dc-coadoCore.jsx",
    "System/Scripts/Core/dc-subjectData.jsx",
]
TEMPLATES = [
    "System/Templates/Disciplina Template.md",
    "System/Templates/Semestre Template.md",
    "System/Templates/Notas de Aula Template.md",
    "System/Templates/Trabalho Template.md",
    "System/Templates/Nota Generica Template.md",
]
BASES = [
    "System/TaskNotes/Views/kanban-academico.base",
    "System/TaskNotes/Views/calendar-default.base",
    "System/Templates/Bases/Disciplinas.base",           # embutida no semestre (Por Semestre)
    "System/Templates/Bases/Trabalhos de Curso.base",    # embutida na disciplina (Por Disciplina)
]

DASHBOARD = """---
cssclasses:
  - noyaml
  - dashboard
tags:
  - dashboards
  - academico
---
```datacorejsx
const { PainelAcademico } = await dc.require(dc.fileLink("System/Scripts/Widgets/dc-academicoIntegrado.jsx"));
return <PainelAcademico />;
```
"""

SEMESTRE_NOME = "2026-2"
DISC_NOME = "DEMO01 Sistemas de exemplo"
DISC_PASTA = f"System/Academico/Disciplinas/{DISC_NOME}"

# A ponte do Coado e o backend do Kindle só leem semestre com status active e disciplina dentro de uma
# subpasta de Disciplinas/, com `semestre` igual ao nome da nota do semestre.
SEMESTRE = f"""---
tags:
  - semestre
  - academico
type: semestre
status: active
start: 2026-08-03
end: 2026-12-12
---
# 2026/2

Semestre de exemplo da vault demo do Coado. Troque as datas e as disciplinas.

![[Disciplinas.base#Por Semestre]]
"""

DISCIPLINA = f"""---
tags:
  - academico
categories:
  - "[[Disciplinas]]"
codigo: DEMO01
disciplina: Sistemas de exemplo
professor: ""
creditos: 4
semestre: {SEMESTRE_NOME}
type: disciplina
status: open
priority: normal
cssclasses:
  - dashboard
  - wide-page
natureza: conteudo
conteudo_programatico:
  - id: t01
    nome: Introdução e modelagem
    aula: 1
  - id: t02
    nome: Resposta no tempo
    aula: 4
  - id: t03
    nome: Estabilidade
    aula: 8
---

# DEMO01 - Sistemas de exemplo

```datacorejsx
const {{ ClassView }} = await dc.require(dc.fileLink("System/Scripts/Widgets/dc-classView.jsx"));
return <ClassView />;
```

```datacorejsx
const {{ SubjectDashboard }} = await dc.require(dc.fileLink("System/Scripts/Widgets/dc-subjectMetrics.jsx"));
return <SubjectDashboard />;
```

Disciplina fictícia para o painel acadêmico abrir com dados. Não é uma matéria real.

### Avaliações

| Data | Avaliação | Conteúdo cobrado |
|---|---|---|
| 24/09/2026 | **Prova 1** (40%) | Introdução e modelagem; Resposta no tempo |
| 26/11/2026 | **Prova 2** (60%) | Estabilidade |

![[Trabalhos de Curso.base#Por Disciplina|embed-clean]]
"""

# Tarefa do TaskNotes que recebe o tempo de estudo da disciplina (a mesma que a ponte criaria).
ESTUDO_GERAL = f"""---
tags:
  - tipo/task
  - academico
class: "[[{DISC_NOME}]]"
project:
  - "[[{DISC_NOME}]]"
type: tarefa
status: in-progress
priority: normal
coado_disciplina: demo01
timeEntries: []
---

# DEMO01 · Estudo geral

Tarefa do TaskNotes para estudar [[{DISC_NOME}]] quando não é uma entrega específica. Escolha esta tarefa no pomodoro: o tempo fica aqui e soma no projeto da disciplina nas estatísticas do TaskNotes.
"""

# Nota de estado do semestre no formato que a ponte do Coado grava (estado_inicial em coado_ponte.py).
ESTADO = f"""---
cssclasses:
  - noyaml
  - dashboard
  - wide-page
semestre: "[[{SEMESTRE_NOME}]]"
coado_plano: demo-{SEMESTRE_NOME}
data_prova: null
meta_semanal:
  minutos: 300
  questoes: 0
intervalos_revisao: [1, 7, 30]
cores:
  DEMO01: "#a8bfd4"
planejamento:
  tipo: ciclo
  minutos_semana: 300
  dias: [false, true, true, true, true, true, false]
  sessao_min: 30
  sessao_max: 90
  disciplinas:
    - codigo: DEMO01
      importancia: 2
      conhecimento: 2.5
  ciclo:
    - id: c1
      codigo: DEMO01
      minutos: 60
    - id: c2
      codigo: DEMO01
      minutos: 60
  ciclos_completos: 0
  inicio_ciclo: 2026-08-03
  empurrar_atrasados: true
topicos_concluidos: []
revisoes: []
---

# Estudo {SEMESTRE_NOME}

```datacorejsx
const {{ PainelEstudo }} = await dc.require(dc.fileLink("System/Scripts/Widgets/dc-coadoPainel.jsx"));
return <PainelEstudo />;
```
"""

# Estado acumulado do TaskNotes do dono da vault: histórico, índices e impressões digitais da agenda,
# última tarefa aberta. Não é configuração; sai inteiro do template.
TASKNOTES_ESTADO = {
    "pomodoroHistory",
    "googleCalendarEventIndex",
    "googleCalendarTaskFingerprints",
    "microsoftCalendarEventIndex",
    "microsoftCalendarTaskFingerprints",
    "lastSelectedTaskPath",
}

README = """# Vault acadêmica do Coado

Só o sistema acadêmico: painel, widgets, núcleo do Coado na vault, templates e uma disciplina de exemplo.

Não inclui notas pessoais, editais, PDFs nem o restante da vault.

Abra esta pasta como vault no Obsidian. Na primeira abertura, confirme a confiança da vault para os plugins da comunidade carregarem: o Obsidian guarda essa permissão fora da pasta. Eles já vão instalados, configurados e listados como habilitados.

Plugins: Datacore, Dataview, Templater, TaskNotes. O painel está em `System/Dashboards/Painel Academico.md`.
"""


def collect() -> set[str]:
    seen: set[str] = set()
    queue = list(ROOTS)
    while queue:
        rel = queue.pop()
        if rel in seen:
            continue
        path = VAULT / rel
        if not path.is_file():
            continue
        seen.add(rel)
        text = path.read_text(errors="ignore")
        for match in LINK.findall(text):
            if match.startswith("System/Academico/Disciplinas"):
                continue
            candidate = VAULT / match
            if candidate.is_file() and match not in seen:
                queue.append(match)
        for match in PATH.findall(text):
            rel = match.strip()
            if rel.startswith("System/Academico/Disciplinas"):
                continue
            if (VAULT / rel).is_file() and rel not in seen:
                queue.append(rel)
    return seen


def scrub(obj):
    if isinstance(obj, dict):
        return {k: ("" if k in SECRET_KEYS else scrub(v)) for k, v in obj.items()}
    if isinstance(obj, list):
        return [scrub(v) for v in obj]
    return obj


def limpar_tasknotes(data: dict) -> dict:
    for k in TASKNOTES_ESTADO:
        if k in data:
            data[k] = [] if isinstance(data[k], list) else ({} if isinstance(data[k], dict) else "")
    for k in ("googleCalendarExport", "microsoftCalendarExport"):
        if isinstance(data.get(k), dict):
            data[k]["enabled"] = False
            data[k]["targetCalendarId"] = ""
    return data


def add_plugins(zf: zipfile.ZipFile) -> None:
    import json

    enabled = []
    for plugin_id in PLUGIN_IDS:
        src = OBS / plugin_id
        if not src.is_dir():
            raise SystemExit(f"plugin ausente: {plugin_id}")
        enabled.append(plugin_id)
        for path in src.rglob("*"):
            if not path.is_file() or path.name in PLUGIN_SKIP:
                continue
            rel = f".obsidian/plugins/{plugin_id}/{path.relative_to(src).as_posix()}"
            if path.name == "data.json":
                data = scrub(json.loads(path.read_text()))
                if plugin_id == "tasknotes" and isinstance(data, dict):
                    data = limpar_tasknotes(data)
                zf.writestr(rel, json.dumps(data, indent=2) + "\n")
            else:
                zf.write(path, rel)
    zf.writestr(".obsidian/community-plugins.json", json.dumps(enabled, indent=2) + "\n")
    zf.writestr(
        ".obsidian/core-plugins.json",
        json.dumps(
            [
                "file-explorer",
                "global-search",
                "switcher",
                "graph",
                "backlink",
                "outgoing-link",
                "tag-pane",
                "properties",
                "page-preview",
                "templates",
                "note-composer",
                "command-palette",
                "editor-status",
                "outline",
                "word-count",
                "bases",
            ],
            indent=2,
        )
        + "\n",
    )
    zf.writestr(
        ".obsidian/app.json",
        json.dumps(
            {
                "alwaysUpdateLinks": True,
                "newFileLocation": "folder",
                "newFileFolderPath": "System/Academico",
                "propertiesInDocument": "visible",
                "livePreview": True,
                "defaultViewMode": "preview",
                "openBehavior": "file:System/Dashboards/Painel Academico.md",
                "strictLineBreaks": True,
                "showInlineTitle": False,
            },
            indent=2,
        )
        + "\n",
    )
    zf.writestr(
        ".obsidian/appearance.json",
        json.dumps({"theme": "obsidian", "baseFontSize": 16, "showRibbon": True}, indent=2) + "\n",
    )


def main() -> None:
    files = collect()
    for rel in TEMPLATES + BASES:
        if (VAULT / rel).is_file():
            files.add(rel)
    files.discard("System/Dashboards/Painel Academico.md")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("README.md", README)
        zf.writestr("System/Dashboards/Painel Academico.md", DASHBOARD)
        zf.writestr(f"System/Academico/Semestres/{SEMESTRE_NOME}.md", SEMESTRE)
        zf.writestr(f"System/Academico/Semestres/{SEMESTRE_NOME} Estudo.md", ESTADO)
        zf.writestr(f"{DISC_PASTA}/{DISC_NOME}.md", DISCIPLINA)
        zf.writestr(f"{DISC_PASTA}/DEMO01 Estudo geral.md", ESTUDO_GERAL)
        add_plugins(zf)
        for rel in sorted(files):
            if rel.endswith(".base"):
                # as views do TaskNotes guardam uma chave por agenda conectada, com o e-mail da conta no nome
                texto = (VAULT / rel).read_text(encoding="utf-8")
                texto = re.sub(r"^[ \t]*[A-Za-z]+_[^\s:]+@[^\s:]+:.*\n", "", texto, flags=re.M)
                zf.writestr(rel, texto)
            elif rel.endswith(".md"):
                # o dashboard guarda embaixo o embed da última disciplina aberta: no template é link quebrado
                texto = (VAULT / rel).read_text(encoding="utf-8")
                texto = re.sub(r"^!\[\[System/Academico/Disciplinas/[^\]]*\]\]\n?", "", texto, flags=re.M)
                zf.writestr(rel, texto)
            else:
                zf.write(VAULT / rel, rel)
    print(f"files={len(files)} zip={OUT} bytes={OUT.stat().st_size}")


if __name__ == "__main__":
    main()
