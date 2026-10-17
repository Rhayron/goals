# Coado — direção das ilustrações

## Referências consultadas

- [Lofi Girl](https://www.lofigirl.com/): mesa de estudo, companhia felina, janela e luz de tarefa.
- [Spirit City: Lofi Sessions](https://store.steampowered.com/app/2113850/Spirit_City_Lofi_Sessions/): ambiente acolhedor de foco, livros e contraste entre luz quente e exterior frio.

As referências orientaram o clima e a composição. Nenhuma imagem dessas fontes foi incorporada ao app.

## Implementação

- A cena principal foi criada com a ferramenta integrada de geração de imagens (image_gen). Arquivo: `apps/web/public/illustrations/coado-study-room.png`.
- As ilustrações menores são SVGs editáveis, com formas compartilhadas em `illustration-parts.tsx`.
- Paleta: papel creme, café, terracota, sálvia, azul noturno e lavanda.
- Gato: cabeça larga, orelhas triangulares, focinho curto, patas e cauda volumosa.
- Movimento: respiração e piscadas no gato vetorial, vapor, chuva, luz suave, disco e rolos de cassete. O controle da cena pausa chuva, luz e vapor. Os desenhos respeitam `prefers-reduced-motion`.

## Prompt da arte principal

```text
Use case: illustration-story
Asset type: finished hero illustration for Coado, a Brazilian cozy study planning web app.
Primary request: an original beautifully crafted cozy lo-fi study corner with a clearly recognizable adorable ginger-and-cream domestic cat, open study books, notebooks, coffee and music.
Style/medium: polished hand-painted 2D editorial animation background, warm gouache textures with refined dark cocoa outlines, layered detail, sophisticated muted colors. Not crude geometric clipart, not 3D.
Composition: landscape 4:3 image, full scene fills frame. A wooden desk in the foreground, large open textbook and a sage notebook on the left half, ceramic cream mug of coffee near center, sleeping fluffy ginger cat on the RIGHT foreground on a little cushion. Cat is large enough to read at thumbnail size: round head, two triangular ears, soft cheeks, pink nose, visible whiskers, tucked paws, thick curled tail and tabby markings. Cat facing viewer in three quarter view. A round table lamp over the books. Tall arched window on left in background with quiet blue-purple rainy evening rooftops. Bookshelves on the right, trailing plant and a small vintage turntable with headphones. No people.
Lighting/mood: inviting amber pools of lamplight contrasting dusky blue window, quiet rainy evening, a place to settle down and study.
Palette: cream paper, coffee brown, terracotta orange, sage green, dusty lavender and deep slate blue. Clear readable silhouettes, natural object perspective and anatomy.
Text: no text, no logo, no lettering, no watermark, no UI.
Constraints: one cat only, natural feline proportions, no ratlike pointed snout, no long bare tail, no floating objects. No drawn steam above mug (real animated steam will be added by code). A single cohesive finished illustration, not a sheet, no frame or border.
```
