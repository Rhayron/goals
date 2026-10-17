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
    "Disciplinas.base",
    "calendar-default.base",
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

SEMESTRE = """---
type: semestre
start: 2026-08-03
end: 2026-12-12
tags:
  - semestre
---
# 2026/2

Semestre de exemplo da vault demo do Coado. Troque as datas e as disciplinas.
"""

DISCIPLINA = """---
type: disciplina
categories:
  - Disciplinas
tags:
  - disciplina
  - class
codigo: DEMO01
credits: 4
---
# DEMO01 Sistemas de exemplo

Disciplina fictícia para o painel acadêmico abrir com dados. Não é uma matéria real.
"""

README = """# Vault acadêmica do Coado

Só o sistema acadêmico: painel, widgets, núcleo do Coado na vault, templates e uma disciplina de exemplo.

Não inclui notas pessoais, editais, PDFs nem o restante da vault.

Abra esta pasta como vault no Obsidian, com Datacore e Templater. O painel está em `System/Dashboards/Painel Academico.md`.
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
        zf.writestr("System/Academico/Semestres/2026-2.md", SEMESTRE)
        zf.writestr("System/Academico/Disciplinas/DEMO01 Sistemas de exemplo.md", DISCIPLINA)
        for rel in sorted(files):
            zf.write(VAULT / rel, rel)
    print(f"files={len(files)} zip={OUT} bytes={OUT.stat().st_size}")


if __name__ == "__main__":
    main()
