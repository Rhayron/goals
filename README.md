# goals — Coado ☕

<p align="center">
  <img src="docs/img/hero.png" alt="O Coado no navegador, no celular e no relógio" width="100%">
</p>

Planner de estudos para concursos com tema café/lofi: planos, edital verticalizado, ciclo e planejamento
semanal, cronômetro/pomodoro, revisões espaçadas, estatísticas, simulados e uma gaveta de arquivos.
Login com Google; planos, arquivos e histórico ficam presos à conta. A comunidade compartilha apenas
apelido e totais semanais, mediante participação em grupos ou adesão ao ranking global.

O mesmo app roda em três lugares, sempre na mesma conta: no **navegador**, no **celular Android** e no
**relógio Wear OS**, onde o pomodoro faz mais sentido.

[Site](#site) · [Celular](#celular-android) · [Relógio](#relógio-wear-os) · [Como os três conversam](#como-os-três-conversam) · [Arquitetura](#arquitetura) · [Rodar com Docker](#rodar-com-docker) · [Desenvolvimento](#desenvolvimento)

## Site

Planos (um por concurso, com a data da prova), disciplinas com cor, **edital verticalizado**, **ciclo de
estudos** ou planejamento semanal, **pomodoro**, cronômetro e timer, **revisões espaçadas** (1, 7, 30, 60 e
120 dias), histórico, **estatísticas**, simulados e uma gaveta de arquivos. O tema claro ("tarde na
cafeteria") e o noturno ("madrugada de lofi") seguem o sistema.

A **Rádio Coado** toca 24 faixas lo-fi em domínio público (cerca de 61 minutos), com play/pausa, próxima faixa e volume. O áudio continua entre as páginas e durante o cronômetro; começa somente após o usuário apertar play. No topo das páginas, o card do YouTube oferece seis estações de Lofi Girl e Chillhop Music em um player oficial visível. Escolher uma fonte interrompe a outra. Fontes, licenças e comportamento: [docs/RADIO.md](docs/RADIO.md).

### Rotina e comunidade

- **Ciclo por tópico:** cada sessão pode apontar para um tópico; o timer e o registro recebem essa escolha.
- **Evolução:** avanço por disciplina, conclusões mensais e média por dia da semana, incluindo os dias sem estudo.
- **Modelos:** três bases originais de preparação (engenharia, administrativa e fiscal), importadas como novos planos. Confira o edital oficial antes de usar.
- **Conquistas:** marcos de constância, horas, questões, leitura, revisões e simulados, calculados a partir dos registros. Cartão em SVG para baixar.
- **Ranking e grupos:** competição semanal por horas, questões ou páginas; global opcional e grupos privados de até 200 membros. Convites expiram em sete dias, podem ser revogados e exigem confirmação de entrada. O criador administra os membros; até 20 grupos por criador.
- **Perfil, biblioteca e ajuda:** navegação própria à esquerda no perfil, guias originais de estudo e instruções contextuais.
- **Fila durável no navegador:** alterações pendentes ficam no IndexedDB, separadas por conta, e são removidas após confirmação da API. Fechar/reabrir a aba preserva a fila. A entrada ainda depende da API; não é um modo totalmente offline. Limpar os dados do navegador também apaga pendências locais. Em uma rejeição permanente, exporte um backup em Configurações antes de qualquer recuperação manual.

Rankings usam a semana de segunda a domingo no horário de Brasília, somam todos os planos e ignoram datas futuras. Questões são acertos + erros; páginas seguem a convenção existente (final − inicial). Os dados são autodeclarados e a edição do histórico recalcula pontuações e conquistas. E-mails, materiais, arquivos e comentários não são compartilhados. Os rankings mostram os primeiros 100 e a posição pessoal, quando houver pontuação. Preferências e associações da comunidade ficam na API e não fazem parte do backup de planos.

<table>
  <tr>
    <td width="50%"><img src="docs/img/web-inicio-claro.png" alt="Início, tema claro"><br><sub><b>Início.</b> Sequência de dias, próxima sessão do ciclo, painel por disciplina, metas da semana e revisões do dia.</sub></td>
    <td width="50%"><img src="docs/img/web-inicio-noturno.png" alt="Início, tema noturno"><br><sub><b>Madrugada de lofi.</b> O tema noturno, o mesmo do celular e do relógio.</sub></td>
  </tr>
  <tr>
    <td><img src="docs/img/web-planejamento-claro.png" alt="Planejamento: sequência do ciclo e rosca"><br><sub><b>Planejamento.</b> O ciclo de estudos em sequência, com o progresso de cada sessão e a rosca por disciplina.</sub></td>
    <td><img src="docs/img/web-estatisticas-claro.png" alt="Estatísticas"><br><sub><b>Estatísticas.</b> Desempenho, tempo, constância e evolução por dia, com filtro por período e disciplina.</sub></td>
  </tr>
  <tr>
    <td><img src="docs/img/web-edital-claro.png" alt="Edital verticalizado"><br><sub><b>Edital verticalizado.</b> Tópicos por disciplina, com acertos, erros e o quanto já foi concluído.</sub></td>
    <td><img src="docs/img/web-pomodoro.png" alt="Pomodoro no site"><br><sub><b>Pomodoro.</b> Tela cheia, com chuva na janela e som de chuva gerado no navegador. Ao finalizar, abre o registro do estudo.</sub></td>
  </tr>
</table>

### Novas telas (ambiente local)

As capturas abaixo usam contas e estudos fictícios de validação, sem dados de produção.

| Ranking de um grupo | Perfil com navegação própria |
| --- | --- |
| ![Ranking de grupo](docs/img/web-ranking-grupos.png) | ![Menu do perfil](docs/img/web-perfil-menu.png) |

A interface também foi conferida em 390 px: [ranking no celular](docs/img/web-ranking-mobile.png).

## Celular (Android)

O app do celular entra com o **Google** (nativo), abre o **site inteiro** numa WebView já logada (todas as
telas acima, sem refazer nada) e traz o **pomodoro nativo**, que não depende da tela do site estar aberta:
roda em segundo plano, com notificação fixa (pausar, pular, finalizar), e o estudo registrado sobe para a
conta e vai para o relógio.

![O site no celular: entrada, início, menu e planejamento](docs/img/phone-site.png)

![O pomodoro no celular: escolha, estudo, pausa e registro](docs/img/phone-pomodoro.png)

- **Entrada nativa.** Sign in with Google pelo aparelho; o servidor valida o `id_token` e abre uma sessão de aparelho (veja [Como os três conversam](#como-os-três-conversam)). O botão "Entrar como visitante" só existe em build de debug, contra um servidor com `AUTH_DEV_LOGIN=true`.
- **O site, sem remendo.** A WebView carrega as mesmas páginas; o botão de iniciar estudo do site abre o pomodoro nativo.
- **Pomodoro.** Escolhe entre as próximas sessões do ciclo ou qualquer disciplina, em pomodoro (estudo, pausa curta, pausa longa a cada N rodadas) ou cronômetro livre. A xícara enche conforme o café é coado e fumega na pausa.
- **Registro.** Categoria, acertos e erros, se conta no ciclo e se agenda as revisões (nos intervalos da conta), como o formulário do site.

## Relógio (Wear OS)

O app do relógio é **focado no pomodoro**: mostra a próxima sessão do ciclo, roda o timer no pulso e registra o
estudo na conta. As durações (estudo, pausas, rodadas) são as da conta e podem ser mudadas ali mesmo.

![O pomodoro no relógio: próxima do ciclo, estudo, pausa e registro](docs/img/watch-pomodoro.png)

![O progresso no relógio: ciclo, constância, meta da semana e ajustes](docs/img/watch-progresso.png)

- **Pelo celular, sem digitar nada.** O relógio recebe um recorte da conta pelo celular pareado (Data Layer do Wear OS) e devolve os estudos por ele. Um estudo registrado sem o celular por perto sobe quando ele aparecer.
- **Ou direto.** Sem celular, Ajustes → Conta → *Direto* e o código de **Configurações → Relógio** do site.
- **Baixo consumo.** Nada conta segundos em segundo plano: o timer são carimbos de tempo, o fim de cada etapa é um alarme exato e a contagem regressiva vai numa atividade em andamento do Wear OS, que o sistema atualiza sozinho. Com o pulso abaixado, o modo ambiente é um quadro preto com contornos, atualizado uma vez por minuto. Vapor e café pingando só rodam com a tela acesa e dá para desligá-los.
- **Progresso na mão.** A rosca do ciclo, a sequência de dias, as metas da semana em horas e questões, a contagem regressiva da prova e as revisões pendentes.

Testado num **TicWatch Pro 5 Enduro** (Wear OS) pareado a um **Galaxy S23 Ultra** (Android 16), e em emuladores:
estudo registrado no pulso, enviado pelo celular e gravado na conta, e o caminho inverso do recorte. Ainda **não
conferidos** num aparelho: o login com o Google nativo (os testes usaram o visitante), o modo ambiente e o
chip da atividade em andamento no mostrador. As imagens desta página são de uma conta de exemplo
("Petrobras 2026"), em build de debug.

## Como os três conversam

```
   site (WebView)            api                          relógio
┌────────────────┐  Bearer  ┌───────────┐  Data Layer  ┌──────────────┐
│ celular        │◄────────►│ /api/...  │              │ pomodoro     │
│ · login Google │          └───────────┘              │ · ciclo      │
│ · pomodoro     │◄──────── /coado/snapshot ──────────►│ · registro   │
│ · ponte        │◄──────── /coado/study/<id> ─────────│ · progresso  │
└────────────────┘                                      └──────────────┘
```

Celular e relógio entram com uma **sessão de aparelho** (token Bearer, 1 ano), que aparece em Perfil → "Onde
você está conectado" e pode ser encerrada de lá. O celular troca o `id_token` do Google por ela; o relógio a
recebe pelo celular ou por um código curto. O relógio nunca guarda a senha nem fala com o Google. Detalhes e
como instalar nos aparelhos: [`apps/android/README.md`](apps/android/README.md).

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
- `apps/api`: Fastify 5 + `pg` + Zod. Rotas em `src/auth`, `src/me`, `src/data`, `src/files` e `src/watch`.
- `packages/shared`: modelo de dados, validação (Zod) e protocolo de sincronização, usados pelos dois lados. O contrato HTTP está documentado em [`api.ts`](packages/shared/src/api.ts).
- `apps/android` (projeto Gradle à parte, fora do npm): o Coado no **celular** (login Google nativo, o site inteiro numa WebView logada e o pomodoro nativo) e no **relógio Wear OS** (pomodoro, ciclo e registro no pulso, pela ponte com o celular). Veja [`apps/android/README.md`](apps/android/README.md).

### Decisões

- **Login com Google no servidor.** O fluxo é authorization code com PKCE, `state` e `nonce`, e o `id_token` é validado com as chaves públicas do Google. A sessão fica num cookie `httpOnly` + `SameSite=Lax`; o banco guarda só o hash do token. Toda escrita exige o cabeçalho `X-Coado-Request` (proteção contra CSRF).
- **Isolamento por conta no banco.** Toda tabela tem chave `(user_id, id)` e as chaves estrangeiras incluem `user_id`, então um registro nunca aponta para dados de outra pessoa, mesmo com ids gerados no navegador.
- **Sincronização em lote.** As ações continuam instantâneas no navegador. A cada pausa, o app manda só a diferença para `POST /api/sync`, que o servidor aplica numa transação. Sem conexão, ele tenta de novo com backoff, e o indicador "tudo salvo / salvando… / sem conexão" fica no rodapé do menu. Ao voltar para a aba, os dados são recarregados se outro aparelho mudou algo.
- **Arquivos.** Ficam num volume próprio, atrás de uma interface de armazenamento (dá para trocar por S3 depois), com limite por arquivo e por conta. PDFs e imagens abrem inline; o resto sempre baixa como anexo, com `CSP: sandbox`.
- **Aparelhos.** Celular e relógio entram com uma *sessão de aparelho*: um token Bearer de longa duração, aberto pelo Sign in with Google nativo (`POST /auth/google/token`) ou pelo código curto de Configurações → Relógio (`POST /watch/pair`). Ela é uma sessão comum da conta (aparece e pode ser encerrada em Perfil → "Onde você está conectado"). A WebView do app vira sessão web por `GET /auth/web-session`. O relógio recebe um recorte enxuto da conta (`GET /watch/snapshot`) e registra estudos pelo `/sync` de sempre.

## Rodar com Docker

Para publicar com Vercel e Railway, veja [DEPLOY.md](DEPLOY.md).

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

### Celular e relógio

O projeto Gradle fica em [`apps/android`](apps/android) (JDK 17+ e Android SDK 37). O build de debug fala `http`
com o `npm run dev`; use `-Pcoado.server=` para apontar para outro endereço.

```bash
cd apps/android
./gradlew :shared:testDebugUnitTest :phone:assembleDebug :watch:assembleDebug
adb install -r phone/build/outputs/apk/debug/phone-debug.apk
adb install -r watch/build/outputs/apk/debug/watch-debug.apk
```

Para o login com Google no celular, crie também um cliente OAuth do tipo **Android** (pacote `br.app.coado` e o
SHA-1 do certificado de assinatura) no mesmo projeto do Google Cloud. O app usa o ID do cliente web que a api
informa em `/api/auth/config`.

### Editais: importar, revisar e consultar

Em **Planos → Importar edital**, selecione um PDF ou informe um link público. Escolha as páginas do conteúdo programático, confira as disciplinas e os tópicos, informe o cargo e confirme a revisão. Só então o Coado cria um plano separado, preservando os anteriores. A leitura do arquivo local acontece no navegador. O limite é 20 MB e 300 páginas; não há OCR integrado.

A **Base de editais** pesquisa nosso catálogo compartilhado por texto e UF. O catálogo começa vazio e só mostra registros publicados após conferência. A QAPI é uma fonte opcional para o coletor independente; o site não consulta o fornecedor diretamente. Cada plano mantém sua procedência e não muda automaticamente com retificações. Configuração, custos, limitações e comandos editoriais estão na [seção 6 do guia de deploy](DEPLOY.md#6-importação-e-base-compartilhada-de-editais).
