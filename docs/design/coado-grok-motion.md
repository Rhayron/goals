# Animação da capa com Grok Imagine

## Direção

Dois movimentos de câmera fixa: escrita no caderno e pausa para um gole de café.
A personagem, o quarto e o gato partem das artes existentes. Os quadros intermediários foram gerados com `image_edit` do Grok Imagine, preservando as referências.

- `apps/web/public/illustrations/motion/study-keyframe.jpg`: escrita avançada e gato levantando levemente a cabeça.
- `apps/web/public/illustrations/motion/break-keyframe.jpg`: caneca na boca e gato esticando as patas.
- CLI: Grok Build 1.0.52. Geração nativa Imagine; nenhum asset deste passe foi gerado por ImageGen da OpenAI.

O objetivo dos loops é interpolar essas poses com respiração, piscadas e pequenos movimentos das orelhas e patas. A reprodução deve ser muda, pausável, respeitar movimento reduzido e suspender fora de vista.

## Prompts dos quadros

```text
The user explicitly requested Grok /imagine to make intermediate animation frames for the existing Coado lofi cover. Use Grok Imagine image_edit for these existing references (not a new unrelated image_gen). Generate exactly TWO single-frame edits and report their absolute saved paths. You may read ONLY the two image references and the Imagine skill if needed. Do not inspect other project files, modify code, run shell commands, use subagents, or use the web. The only output mutations authorized are the image tools saving their generated media in their usual output folder. Stop and report any tier/quota/authentication/tool error, without retries or alternative providers.

Frame A, study intermediate frame. Reference image: /Users/rhayron/Downloads/tmp/goals/apps/web/public/illustrations/coado-lofi-cover.png
Prompt for image_edit: "Create an intermediate animation frame of this exact cozy anime study shot. Keep the same adult woman, glasses, headphones, sweater, framing, fixed camera, furniture, books, rainy window, lighting and colors precisely aligned. Her writing hand has moved a few centimeters to the right along the notebook line and her head tilts very slightly toward the page. The fluffy ginger cat at the right has lifted its head just a little, eyes half open in a sleepy blink, one ear turning and its front paw extending slightly forward, remaining in the same place on the desk. Preserve correct human hands and feline anatomy, the same painted linework and all background object positions. No text, labels or UI. One full 16:9 frame."

Frame B, break intermediate frame. Reference image: /Users/rhayron/Downloads/tmp/goals/apps/web/public/illustrations/coado-lofi-break.png
Prompt for image_edit: "Create an intermediate animation frame of this exact cozy anime coffee-break shot. Keep the same adult woman, face, glasses, headphones, sweater, fixed camera, furniture, books, window, lighting and colors precisely aligned. She raises the mug with both hands a few centimeters until its rim gently touches her lips and her eyelids relax while taking a small sip. The ginger cat on the right stays curled on the desk but opens its sleepy eyes a little and extends one front paw in a small comfortable stretch. Preserve correct human hands and feline anatomy, identical visual identity and background positions. No text, labels or UI. One full 16:9 frame."

Use aspect ratio 16:9 when applicable. Return only which output path belongs to A and B and the generation result. Do not produce a grid/contact sheet; we will assemble and animate the frames ourselves.
```

## Prompts dos loops

```text
The user explicitly requested Grok Imagine animation frames and more organic movements for Coado's study and coffee-break cover, including the cat. Two intermediate frames have been generated and inspected. Now use reference_to_video to create exactly TWO seamless 8-second loops at 720p and aspect_ratio 16:9. Use the native tool schema; if unavailable, stop and report. You may read only the four input image paths and the Imagine skill. Do not modify source code, run shell commands, use subagents, or use the web. Only media tools may save generated files to their usual output directories. Return absolute output video paths for STUDY and BREAK. Stop on a quota/authentication/tier/tool error, without retries. Do not create more source images. Audio is unnecessary; no speech or music.

STUDY:
first_frame AND last_frame: /Users/rhayron/Downloads/tmp/goals/apps/web/public/illustrations/coado-lofi-cover.png
keyframes: one anchor at timestamp_s 4.0, image /Users/rhayron/Downloads/tmp/goals/apps/web/public/illustrations/motion/study-keyframe.jpg
Prompt: "An eight-second seamless cozy anime loop in this exact fixed-camera study room. The woman's pencil hand makes small distinct handwriting strokes across the notebook, briefly lifts to move to the next line, then returns gracefully to the opening pose; her shoulders breathe softly, hair tips follow the movement, and she blinks naturally. The fluffy ginger cat breathes through its ribcage, slowly lifts its chin a little, opens and closes its sleepy eyes once, twitches an ear and stretches one front paw forward a few centimeters, then nestles back into the exact starting pose. Keep the room, window, desk, books, lighting, woman's facial identity, proportions and cat anatomy stable throughout, with only rain trails and thin coffee steam moving in the background; the camera stays completely locked, with no zoom or scene cuts. Smooth continuous intermediate poses with gentle easing and little rests between gestures, calm realistic weight and timing, no speech or added text."

BREAK:
first_frame AND last_frame: /Users/rhayron/Downloads/tmp/goals/apps/web/public/illustrations/coado-lofi-break.png
keyframes: one anchor at timestamp_s 4.0, image /Users/rhayron/Downloads/tmp/goals/apps/web/public/illustrations/motion/break-keyframe.jpg
Prompt: "An eight-second seamless cozy anime coffee-break loop in this exact fixed-camera room. The woman raises the mug with both hands from just below her mouth to her lips, closes her eyes briefly during a small slow sip, then lowers the mug smoothly back to the exact starting position, with natural breathing, a relaxed smile and small follow-through in her hair and sleeves. The ginger cat opens its sleepy eyes briefly, eases a front paw forward into a comfortable little stretch, rolls one ear and curls its paw back to settle into its original sleeping pose, chest breathing softly throughout. Keep the background, framing, furniture, light, face, clothes and feline anatomy precisely stable while thin steam curls from the mug and rain moves down the window; completely locked camera, no zoom or cuts, no speech, text or new objects. Organic intermediate poses with smooth timing and quiet pauses between movements."
```

## Referências de ferramentas

- [Comandos do Grok Build](https://docs.x.ai/build/modes-and-commands)
- Skill Imagine incluída no Grok instalado: `/Users/rhayron/.grok/bundled/skills/imagine/SKILL.md`.

## Resultado da geração

Os dois quadros intermediários foram gerados e inspecionados. As duas chamadas `reference_to_video` foram recusadas antes da geração:

> Video generation tools are unavailable under zero data retention (ZDR). To enable, either turn off /privacy mode to disable ZDR or supply a user-hosted storage bucket (see https://docs.x.ai/build/settings/zdr-video-storage).

Nenhum vídeo foi criado nessa primeira tentativa. Após a escolha do usuário **"Autorizar desativar o ZDR para gerar os loops no Grok"**, a configuração `/privacy` foi temporariamente alterada de **Opt out** para **Opt in**. A geração seguinte criou os dois vídeos. Imediatamente após a conclusão, a configuração foi restaurada para **Opt out**, conferida reabrindo `/privacy`. A alteração temporária permite retenção/treinamento conforme o texto da configuração do Grok; restaurá-la não desfaz o tratamento da geração feita durante esse intervalo.

Sessão de geração: `01a14c1a-94e0-7161-83bf-7ec39dde07cf`. Originais em `~/.grok/sessions/%2FUsers%2Frhayron%2FDownloads%2Ftmp%2Fgoals/01a14c1a-94e0-7161-83bf-7ec39dde07cf/videos/1.mp4` (estudo) e `2.mp4` (descanso).

## Assets integrados

| Arquivo em `apps/web/public/illustrations/motion/` | Duração | Resolução | Frames | Tamanho |
| --- | --- | --- | --- | --- |
| `study-loop.mp4` | 8 s | 1280 × 720 | 192 a 24 fps | 2.16 MB |
| `break-loop.mp4` | 8 s | 1280 × 720 | 192 a 24 fps | 1.99 MB |

Os originais tinham 193 frames e faixa de áudio. FFmpeg removeu a faixa de áudio e o frame final de fechamento, codificou H.264/yuv420p (CRF 21, preset slow) e aplicou `faststart`. `ffprobe` confirmou um único stream de vídeo por arquivo. Não há áudio gerado competindo com rádio/sininho.

`LofiScene` usa os vídeos com poster estático e transição entre estudo/descanso. `useLofiVideo` controla reprodução muda, pausa manual, visibilidade na tela/aba e preferência de movimento reduzido. O shader anterior e os efeitos sobrepostos da capa foram substituídos pelos movimentos gerados. A sessão e os controles do Pomodoro não foram alterados neste passe.

## Validação em 17/10/2026

- Quadros das duas cenas inspecionados a cada segundo, incluindo início e fim: escrita, gole, cabeça/patas do gato e retorno à pose inicial. A geração mantém a composição e apresenta pequenas variações de traço típicas do vídeo gerado.
- Prévia isolada com o componente real: estudo toca e descanso permanece parado/sem carregar; mudança de cena pausa estudo e reproduz descanso; pausa manual mantém o mesmo tempo (4.396142 s) entre observações e retoma corretamente. A prévia temporária foi removida.
- Página inicial: vídeo carregado e reproduzindo; ao rolar a capa para fora da tela, ambos os vídeos ficaram pausados; ao voltar, o estudo retomou. Captura salva no diretório de visualizações da sessão.
- `npm run build -w @coado/web`: exit 0, executado pelo Grok com escopo mecânico e conferido pelo Codex; estado Git idêntico antes/depois do build. Avisos já existentes sobre comentários do Zod e tamanho do bundle. Log: `/tmp/coado-motion-build.log`.
- Não houve publicação de produção. A preferência de movimento reduzido e a aba oculta são tratadas no código; não houve alteração da configuração do sistema para testá-las.

## Ajuste: gato mais discreto

A pedido do usuário, foram removidas as espreguiçadas repetidas nos dois loops. A região do gato agora reutiliza apenas os primeiros dois segundos tranquilos de cada vídeo, em ida e volta desacelerada, com interpolação e máscara de borda suave. Permanecem a respiração discreta e a pequena abertura dos olhos no descanso; a escrita e o gole de café mantêm o tempo original.

O tratamento foi local com FFmpeg, sem nova geração ou mudança de privacidade. A composição usa máscara RGB com valores idênticos nos três canais, evitando mistura de cores fora da região. Os originais da geração permanecem na sessão do Grok indicada acima; cópias anteriores ao ajuste estão em `/tmp/coado-cat-subtle/`.

Os arquivos finais seguem em H.264, 720p, 24 fps, 192 frames/8 s e sem áudio. Novos tamanhos: estudo **1.75 MB**, descanso **1.66 MB**. Os quadros foram inspecionados a cada 0.5 s, incluindo os instantes das antigas espreguiçadas. A URL dos vídeos recebeu `?v=calm-cat-1` para atualizar o cache do navegador.

Na capa aberta, foi conferida a URL nova e a reprodução do vídeo com duração de 8 s, sem erro de mídia. Esta revisão alterou apenas os dois arquivos de vídeo, a versão na URL e esta documentação; não exigiu novo build ou alterações no Pomodoro.
