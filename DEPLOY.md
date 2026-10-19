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

### Dados adicionais do perfil

A migração `006_account_profile.sql` adiciona a apresentação, cidade, estado e
escolha entre foto Google e iniciais à conta. São campos privados, fora do ranking
e do backup de estudos. O apelido, área de estudo e participação global continuam
usando `community_profiles`, sem uma segunda cópia desses dados.

A API deve concluir o pre-deploy com essa migração antes de liberar o novo
formulário do frontend. Confira salvar e recarregar o perfil e editar preferências
da comunidade com uma conta de teste. O e-mail e a foto original continuam vindo
do Google; o formulário não altera credenciais de acesso.


## 5. Atualização de comunidade e rotina

Esta versão adiciona `003_community.sql`. Publique a API e execute a migração antes do frontend: ela cria perfis de comunidade, grupos, membros, convites e índices sem migrar usuários automaticamente para o ranking global. O comando de pre-deploy acima já executa as migrações pendentes.

Após publicar, valide com duas contas de teste: adesão global, convite, entrada no grupo, ranking, revogação de convite e bloqueio de acesso após sair. Confira também um registro com tópico e a recuperação de uma alteração pendente depois de uma interrupção de rede. Testes locais não substituem essa verificação no domínio publicado.

Os novos rankings e grupos não exigem novos escopos OAuth. O frontend usa a mesma API autenticada. Convites guardam apenas o hash no banco e duram sete dias. A interface exige adesão explícita ao ranking global e confirmação ao entrar em grupos.

## 6. Importação e base compartilhada de editais

As migrações `004_notice_catalog.sql` e `005_plan_import_source.sql` devem entrar na API antes do frontend. O catálogo usa o schema `catalog` no PostgreSQL existente, separado das tabelas pessoais. Não requer outro serviço agora. O coletor é um comando independente; a busca do Coado consulta apenas nossa API e nossa base.

Fluxo: **QAPI → coletor → registros pendentes → conferência/publicação → base do Coado → revisão do PDF pelo estudante → plano pessoal**.

- O catálogo guarda metadados, fonte oficial, URL do PDF, versões e histórico. PDFs não são arquivados no catálogo nesta versão.
- Mudanças nos metadados retiram o registro da busca até nova conferência. Uma troca do PDF mantendo a mesma URL não é detectada automaticamente: confira retificações na fonte oficial.
- A cópia pessoal guarda a origem, a versão do catálogo e o SHA-256 do PDF lido. Atualizações da base não alteram planos existentes.
- A publicação exige PDF acessível e a versão conferida. Só registros publicados aparecem para usuários autenticados.
- A importação aceita arquivo ou link HTTPS, até 20 MB/300 páginas. O navegador extrai texto e sugere disciplinas; o usuário seleciona o cargo, corrige o conteúdo e confirma antes da criação. PDFs sem camada de texto exigem OCR externo ou transcrição; tabelas/colunas exigem revisão.
- Links passam por validação de IP/DNS e de cada redirecionamento, limites de tamanho/tempo e autenticação. A chave QAPI nunca entra no frontend nem acompanha downloads de PDFs.

### Operação do coletor

Configure `DATABASE_URL` no ambiente de execução. Somente no processo de ingestão, configure `QAPI_API_KEY` e `QAPI_INGESTION_ENABLED=true`. A ingestão está desativada por padrão e nenhum agendamento foi instalado. Não coloque chaves em argumentos, código ou Git.

```sh
# Simulação: consulta o fornecedor, consome créditos, mas não importa registros.
npm run catalog -w @coado/api -- sync-qapi --year 2026 --max-pages 3

# Importar no máximo 3 páginas; registros entram pendentes.
npm run catalog -w @coado/api -- sync-qapi --year 2026 --max-pages 3 --apply
npm run catalog -w @coado/api -- pending

# Após conferir metadados, cargo, prazos, retificações e PDF na fonte oficial:
npm run catalog -w @coado/api -- publish --id UUID --version 1 --reviewer OPERADOR --pdf-url https://fonte-oficial/edital.pdf

# Retirada reversível da busca:
npm run catalog -w @coado/api -- archive --id UUID
```

Na imagem compilada, use `node dist/notices/cli.js` seguido dos mesmos argumentos. O resultado informa chamadas, registros, ignorados e `nextPage`; use `--start-page N` para continuar uma execução parcial. Há trava contra execuções simultâneas e registros em `catalog.ingestion_runs`. Erros interrompem o lote sem repetição automática; registros já importados são preservados e a reexecução é idempotente. Registros sem fonte pública são ignorados. O comando `pending` lista até 100 registros por execução; grandes lotes exigem consulta editorial ao banco. A rotina de backup deve incluir o schema `catalog`.

### Avaliação da QAPI — 17/10/2026

A [documentação oficial](https://qapi.otunac.com/) descreve `/concursos`, metadados e site de origem; não comprova entrega do conteúdo programático completo por esse endpoint. A implementação usa somente essa consulta. Campos de data são preservados como texto, sem interpretação automática de prazos.

O preço divulgado para chamadas REST comuns é R$ 0,01, com até 10 registros por página; os [termos](https://qapi.otunac.com/terms) indicam recarga mínima de R$ 50. Exemplo hipotético: 1.000 registros exigiriam 100 chamadas, R$ 1 por varredura, sem consultas extras. Não representa o tamanho real da base.

Os termos permitem importação massiva em produtos educacionais com atribuição e restringem revenda/serviços concorrentes. Como a redação se concentra em questões, confirme com o fornecedor sua aplicação ao armazenamento de concursos/editais antes de ativar a ingestão. A atribuição QAPI está prevista na interface e na cópia pessoal.

A [página pública DATAPREV](https://qapi.otunac.com/concursos/6a582f98b7e102f6a66d0e16) consultada exibia inscrições abertas com término em 06/08/2026, já passado na data desta avaliação. É um indício pontual de desatualização, não uma medida de toda a cobertura. Recomenda-se usar QAPI para descoberta e conferir a fonte oficial antes de publicar.

Não houve chamada autenticada, contratação ou consumo de créditos. O adaptador foi validado com respostas simuladas baseadas na documentação; cobertura, disponibilidade e contrato real da API ainda dependem de um piloto com chave autorizada.

### Validação local desta implementação

Em 17/10/2026: 89 testes passaram (7 shared, 71 API com PostgreSQL descartável e 11 web), checagem de tipos, build de web/API e `git diff --check`. O build emite avisos sobre tamanho do bundle principal e comentários de uma dependência, sem falhar. No navegador, o PDF oficial AEB/Cebraspe de 49 páginas foi lido por arquivo e por link; a página 39 forneceu um trecho de Português para revisar e criar um plano de teste de 21 tópicos. Um registro demonstrativo da base local também percorreu catálogo → importação → plano, com versão e SHA-256 persistidos no PostgreSQL. Catálogo e revisão foram conferidos em largura móvel, sem transbordamento horizontal. Evidência: `docs/img/web-importar-edital-revisao.png`. Esses resultados não validam a QAPI autenticada, o Android ou o deploy em produção.
