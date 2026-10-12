# goals — Rumo

Planner de estudos para concursos com tema café/lofi. O app fica em [`app/`](app/README.md).

## Rodar com Docker

```bash
RUMO_PORT=8080 docker compose up -d --build
```

Abre em `http://<host>:$RUMO_PORT`. Os dados ficam no `localStorage` do navegador.

## Host sem acesso ao npm / Docker Hub

Compile no seu computador e envie só o `dist/`:

```bash
(cd app && npm run build)
rsync -a --delete app/dist/ host:~/rumo/app/dist/
ssh host 'cd ~/rumo && docker compose -f compose.static.yaml up -d --build'
```

Precisa apenas da imagem `nginx:alpine` já presente no host.
