# Deploy: Vercel + Railway

O site estático roda na Vercel. A Railway hospeda a API, o PostgreSQL e um volume
persistente para os arquivos enviados pelos usuários. A Vercel encaminha `/api/*`
para a API, mantendo cookie e chamadas do navegador na mesma origem pública.

## 1. Railway

Crie um projeto **Coado** na conta Rhayron, com um serviço PostgreSQL e um serviço
da API conectado ao repositório `Rhayron/goals`. Configure a API com a **raiz do
repositório** como diretório de build e `apps/api/Dockerfile` como Dockerfile.

No serviço da API:

- **Pre-deploy command:** `node dist/migrate.js`
- **Healthcheck path:** `/api/health`
- **Volume:** monte em `/data/uploads`; habilite backup do volume
- **Public Networking:** gere um domínio HTTPS para a API e anote sua **origem**
  (sem caminho e sem barra final)
- **Replicas:** 1, pois os uploads ficam nesse volume

Variáveis da API:

| Variável | Valor |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Referência à variável `DATABASE_URL` do serviço PostgreSQL |
| `APP_URL` | URL pública da Vercel durante a preparação; depois `https://coado.app.br` |
| `SESSION_SECRET` | Resultado de `openssl rand -hex 32` |
| `TRUST_PROXY` | `true` |
| `RAILWAY_RUN_UID` | `0` (o script de entrada ajusta o volume e inicia a API como `node`) |
| `UPLOAD_DIR` | `/data/uploads` (já é o padrão da imagem) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Credenciais OAuth do Google, quando prontas |

Nunca coloque segredos no Git. O banco precisa estar acessível à API pela rede
privada da Railway. Migrações rodam antes de cada deploy e impedem a publicação
se falharem. Não use `AUTH_DEV_LOGIN` em produção.

## 2. Vercel

Importe `Rhayron/goals` como um projeto Vercel na conta Rhayron, com **Root
Directory** na raiz do repositório. O arquivo `vercel.json` define o build do web,
o diretório `apps/web/dist`, as rotas SPA e o encaminhamento da API.

O rewrite `/api/*` aponta para `https://api-production-cd57.up.railway.app`.
Se essa origem mudar, atualize `vercel.json`. Publique só depois de
`https://api-production-cd57.up.railway.app/api/health` responder
`{"status":"ok","db":"ok"}`.

Depois do deploy, confira a URL Vercel atribuída: `/` deve abrir o site e
`/api/health` deve responder pelo mesmo host. Verifique também login, escrita,
upload e download de um arquivo real antes de considerar a publicação pronta.

## 3. Google e domínio

No cliente OAuth **Web** do Google, autorize o callback da URL Vercel inicial:
`https://<dominio-vercel>/api/auth/google/callback`. Configure o ID e o segredo
na Railway. Para o app Android, mantenha também o cliente OAuth Android com o
pacote e SHA-1 descritos em `apps/android/README.md`.

Depois de registrar `coado.app.br`, adicione-o ao projeto Vercel e configure o
DNS conforme os registros que a Vercel mostrar. Cadastre
`https://coado.app.br/api/auth/google/callback` no Google, altere `APP_URL` na
Railway para `https://coado.app.br` e confira novamente login e `/api/health` no
domínio final. O Android de release já usa esse domínio.

## 4. Operação

Ative backup do PostgreSQL e do volume de uploads. Monitore os deploys, os logs
da API e `/api/health`. Um build local e um healthcheck não comprovam OAuth,
persistência do volume nem o limite de upload através do proxy da Vercel; esses
fluxos precisam ser exercitados no ambiente publicado.
