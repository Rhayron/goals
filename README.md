# goals — Rumo

Planner de estudos para concursos com tema café/lofi. O app fica em [`app/`](app/README.md).

## Rodar com Docker

```bash
RUMO_PORT=8080 docker compose up -d --build
```

Abre em `http://<host>:$RUMO_PORT`. Os dados ficam no `localStorage` do navegador.
