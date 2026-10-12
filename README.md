# goals — Coado ☕

Planner de estudos para concursos com tema café/lofi: planos, edital verticalizado, ciclo e planejamento
semanal, cronômetro/pomodoro, revisões espaçadas, estatísticas, simulados e uma gaveta de arquivos.
Login com Google; perfil, dados, arquivos e histórico ficam presos à conta.

## Arquitetura

```
navegador ──► web (nginx: SPA + proxy /api) ──► api (Fastify) ──► db (Postgres 17)
                                                   │
                                                   └──► volume de arquivos (/data/uploads)
```

| Container | Imagem | Papel |
| --- | --- | --- |
| `web` | `apps/web/Dockerfile` | Serve o React compilado e encaminha `/api` para a api. CSP e cabeçalhos de segurança. Única porta exposta. |
| `api` | `apps/api/Dockerfile` | REST + OAuth do Google + sessões + sincronização + upload. Roda como usuário sem privilégio. |
| `migrate` | mesma imagem da api | Aplica `apps/api/migrations/*.sql` e encerra. A api só sobe depois dele. |
| `db` | `postgres:17-alpine` | Fica numa rede interna (`backend`), sem saída para a internet e sem porta publicada. |

Monorepo com npm workspaces:

- `apps/web`: React 19 + Vite + Tailwind. O estado fica em memória e as alterações vão em lote para a api ([`lib/sync.ts`](apps/web/src/lib/sync.ts)).
- `apps/api`: Fastify 5 + `pg` + Zod. Rotas em `src/auth`, `src/me`, `src/data` e `src/files`.
- `packages/shared`: modelo de dados, validação (Zod) e protocolo de sincronização, usados pelos dois lados. O contrato HTTP está documentado em [`api.ts`](packages/shared/src/api.ts).

### Decisões

- **Login com Google no servidor.** O fluxo é authorization code com PKCE, `state` e `nonce`, e o `id_token` é validado com as chaves públicas do Google. A sessão fica num cookie `httpOnly` + `SameSite=Lax`; o banco guarda só o hash do token. Toda escrita exige o cabeçalho `X-Coado-Request` (proteção contra CSRF).
- **Isolamento por conta no banco.** Toda tabela tem chave `(user_id, id)` e as chaves estrangeiras incluem `user_id`, então um registro nunca aponta para dados de outra pessoa, mesmo com ids gerados no navegador.
- **Sincronização em lote.** As ações continuam instantâneas no navegador. A cada pausa, o app manda só a diferença para `POST /api/sync`, que o servidor aplica numa transação. Sem conexão, ele tenta de novo com backoff, e o indicador "tudo salvo / salvando… / sem conexão" fica no rodapé do menu. Ao voltar para a aba, os dados são recarregados se outro aparelho mudou algo.
- **Arquivos.** Ficam num volume próprio, atrás de uma interface de armazenamento (dá para trocar por S3 depois), com limite por arquivo e por conta. PDFs e imagens abrem inline; o resto sempre baixa como anexo, com `CSP: sandbox`.

## Rodar com Docker

```bash
cp .env.example .env
# preencha POSTGRES_PASSWORD, SESSION_SECRET (openssl rand -hex 32) e as credenciais do Google
docker compose up -d --build
```

Abre em `http://localhost:8080` (ou no `COADO_PORT`/`PUBLIC_URL` que você definir).

### Credenciais do Google

1. Em [Google Cloud → APIs e serviços → Credenciais](https://console.cloud.google.com/apis/credentials), crie um **ID do cliente OAuth** do tipo *Aplicativo da Web*.
2. Em **URIs de redirecionamento autorizados**, cadastre `PUBLIC_URL + /api/auth/google/callback`. Exemplo: `http://localhost:8080/api/auth/google/callback`. Para desenvolvimento, cadastre também `http://localhost:5173/api/auth/google/callback`.
3. Copie o ID e a chave secreta para `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` no `.env`.

Em produção, sirva por **https** (por exemplo, com um proxy reverso na frente da porta do `web`) e use `PUBLIC_URL=https://coado.app.br` (cadastre também `https://coado.app.br/api/auth/google/callback` no Google). Assim os cookies saem com `Secure`.

### Host sem acesso ao npm / Docker Hub

Gere as imagens numa máquina com acesso e leve-as prontas:

```bash
docker compose build
docker pull postgres:17-alpine
docker save coado-web coado-api postgres:17-alpine | gzip > coado-images.tar.gz
scp coado-images.tar.gz compose.yaml .env host:~/coado/
ssh host 'cd ~/coado && gunzip -c coado-images.tar.gz | docker load && docker compose up -d --no-build'
```

### Backup

```bash
docker compose exec db pg_dump -U coado coado | gzip > coado-db-$(date +%F).sql.gz
docker run --rm -v coado_uploads:/data -v "$PWD":/out alpine tar czf /out/coado-uploads-$(date +%F).tgz -C /data .
```

Cada pessoa também pode exportar os próprios dados em **Configurações → Exportar backup**.

## Desenvolvimento

```bash
cp .env.example .env     # ajuste DATABASE_URL com a mesma POSTGRES_PASSWORD
npm install
npm run db:up            # só o Postgres, publicado em 127.0.0.1:5432
npm run db:migrate
npm run dev              # api em :3000 + vite em :5173 (com proxy para /api)
```

Sem credenciais do Google, `AUTH_DEV_LOGIN=true` mostra o botão **Entrar como visitante**, que nunca funciona com `NODE_ENV=production`.

| Comando | O que faz |
| --- | --- |
| `npm run typecheck` | TypeScript em todos os pacotes |
| `npm test` | testes do protocolo (`shared`) e da api; a api precisa de `TEST_DATABASE_URL` apontando para um Postgres descartável |
| `npm run lint` | ESLint do front |
| `npm run build` | build do front e bundle da api |

Testes da api com um Postgres temporário:

```bash
docker run -d --name coado-test-db -e POSTGRES_PASSWORD=test -e POSTGRES_DB=coado_test -p 54329:5432 postgres:17-alpine
TEST_DATABASE_URL=postgres://postgres:test@localhost:54329/coado_test npm test
docker rm -f coado-test-db
```
