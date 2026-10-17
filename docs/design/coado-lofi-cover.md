# Capa animada do Coado

Arte original criada com a ferramenta integrada image_gen, inspirada no ambiente de estudo lo-fi já pesquisado para o projeto. Arquivo: `apps/web/public/illustrations/coado-lofi-cover.png`.

## Movimento

- Loop de 24 segundos com deslocamentos locais da mão, respiração, cabelo e gato. Câmera e ambiente permanecem fixos.
- Renderização WebGL limitada a 30 quadros por segundo, resolução máxima de 1200 px e escala de até 1,5.
- Chuva recortada nos vidros, vapor e partículas de luz em SVG/CSS.
- Pausa pelo botão da capa; processamento interrompido fora da área visível ou em aba oculta.
- `prefers-reduced-motion` desliga os movimentos. Falta ou perda do contexto WebGL mantém a imagem estática como fallback.
- É uma ilustração animada no navegador, sem vídeo externo e sem áudio automático.

## Prompt

```text
Use case: illustration-story.
Asset type: original widescreen 16:9 animated lo-fi study cover for Coado web app. Render a single finished 2D animation keyframe, not a sprite sheet.
Primary request: original anime-inspired cozy lo-fi study scene. A young adult woman with a short dark wavy bob, round glasses, large muted terracotta headphones and a loose sage green sweater sits at a wooden desk on the RIGHT HALF of the composition, quietly WRITING in an open notebook. Three-quarter side view, face looking downward at notebook, one visible hand holding a pencil over the page, other forearm rests naturally. A fluffy ginger-and-cream cat sleeps curled up at the far-right edge of the desk, with recognizable rounded cat head, triangular ears, paws and thick tail.
Scene: large rainy arched window on LEFT half, blue indigo evening city rooftops, a warm cream table lamp around center-left, bookshelves and trailing plants on right background. Wooden desk across lower third, stacked books and planner, a cream ceramic mug at lower center-left, small turntable behind the cat. No extra people.
Style: refined hand-drawn 2D animation background, painterly gouache shading, clean dark cocoa outlines, expressive original character design, flat readable shapes with lovely detail. Strongly illustrated, NOT photorealistic, NOT 3D, not generic stock vector clipart. Quiet intimate lo-fi study livestream atmosphere.
Palette: cream paper, caramel wood, sage sweater, terracotta headphones, dusty lavender blue outdoors, amber desk light.
Framing: wide landscape 16:9, medium-wide view. Full student head, writing hand and cat clearly visible inside frame with room around each for animation; keep all three spatially separate, not touching silhouettes. Character right-center, cat far right foreground. Left window and books give breathing space. Clear anatomy, natural sitting pose, five-finger hands, one pencil.
Constraints: no lettering, logos, watermarks or UI. No baked-in motion blur. No drawn steam or rain streaks (those will be animated by code). Original composition and character, do not reproduce the Lofi Girl character. Cozy and calm, premium editorial illustration.
```
