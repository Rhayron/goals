# Pomodoro na capa do Coado

## Comportamento

- O relógio usa uma sessão compartilhada entre a capa, a tela cheia e o miniplayer.
- Ao iniciar o modo Pomodoro na tela cheia, o app abre o Início e mostra os controles no canto inferior esquerdo da ilustração.
- Cada círculo representa um ciclo de estudo. O ciclo atual se preenche pelo tempo decorrido; os anteriores ficam marcados.
- Nas pausas curta e longa, a cena muda suavemente para a personagem segurando uma caneca. O progresso da pausa aparece em uma barra separada.
- Pausar/retomar o cronômetro é independente de pausar os movimentos do ambiente.
- Só o tempo em estudo entra no formulário de registro; as pausas ficam fora.
- A rádio da tela cheia fica no canto inferior esquerdo. Em telas estreitas, fica ao fim do conteúdo para não cobrir os controles.
- A animação respeita movimento reduzido, pausa manual, aba oculta e cena fora da área visível.

## Arte da pausa

Arquivo: `apps/web/public/illustrations/coado-lofi-break.png`.
Criada com a ferramenta integrada ImageGen, usando `coado-lofi-cover.png` como imagem de edição.
A versão original de estudo foi preservada. Movimentos locais da caneca, mãos, respiração e gato são feitos no navegador; não é vídeo.

### Prompt utilizado

Use case: precise-object-edit. Asset type: alternate rest scene for an animated study website hero. Edit the supplied artwork. Preserve the exact same wide 16:9 camera, entire room, window geometry and rainy blue evening city, bookshelves, lamps, desk, plants, color palette, cozy painted anime linework, and sleeping orange-and-cream fluffy cat in the bottom-right. Preserve the same adult young woman with dark short curly bob, round glasses, terracotta headphones, and sage green knit sweater. Change only her action: she has stopped writing for a Pomodoro break, sits a little more upright with a relaxed gentle smile, and holds the existing cream ceramic mug with BOTH hands at chest level just below her mouth, taking a comfortable coffee break. The pencil now rests on the open notebook; the mug no longer sits on the desk. Keep her overall silhouette and head placement as close as possible to the original so the shot crossfades naturally. Anatomically correct hands with no extra fingers or limbs. Warm cozy atmosphere, no text, no letters, no logo, no interface or timer elements. Final image should retain the same composition and landscape ratio of the input.


## Verificação local

- Build de produção (TypeScript + Vite) executado com sucesso.
- Teste pela interface com estudo/pausa curta de 1 minuto e 2 ciclos; ao final, preferências originais restauradas: 25/5/15 minutos, 4 ciclos, som ligado e timer de 60 minutos.
- Progresso do primeiro círculo observado em 60% e 72%; pausa manual manteve o relógio em 00:17 ao expandir.
- Término natural do minuto de estudo mudou automaticamente a capa para a pausa, preencheu o primeiro círculo em 100% e iniciou o contador da pausa.
- Avanço manual confirmou retorno ao segundo estudo, pausa longa e reinício dos círculos.
- Ao finalizar, o formulário recebeu exatamente 00:01:00, excluindo o tempo de pausa. O formulário foi cancelado; nenhum estudo de teste foi salvo.
- Quadros da região das mãos/caneca: 1476 de 1480 pixels mudaram com ambiente animado; zero pixels mudaram com ambiente pausado.
- Layout verificado em 1440 e 390 pixels; os dois canvases carregaram e não houve erros no console durante o fluxo.
- Não houve publicação de produção.

## Sininho dos ciclos

- Controle de sino ao lado dos círculos, usando a mesma preferência `timerPrefs.sound` da tela cheia.
- Ativar toca uma prévia; silenciar desativa os avisos. O fim natural de estudo, pausa curta e pausa longa usa o novo toque de duas notas.
- Contexto de áudio reutilizado e preparado no clique de iniciar/retomar para respeitar a política de reprodução do navegador ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)).
- Três testes automatizados passaram: desbloqueio/reuso do áudio, bloqueio de reprodução e indisponibilidade de Web Audio. Controles verificados na interface e build de produção aprovado. A saída física dos alto-falantes não foi medida.
- A atualização de desenvolvimento reiniciou a sessão ativa durante a implementação. A contagem foi reconstruída a partir da leitura de 22:27 restantes e do horário registrado dessa leitura (precisão de aproximadamente um segundo). O código temporário de recuperação foi removido; foi mantido apenas um cache em memória de desenvolvimento para preservar sessões nas próximas atualizações do Vite.
