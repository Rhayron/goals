# Rádio Coado

A rádio toca uma playlist local de 24 faixas instrumentais de HoliznaCC0. Todas foram baixadas do álbum [Public Domain Lofi](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi) no Free Music Archive, onde cada página de faixa indica a licença [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Os arquivos em `apps/web/public/radio/` foram convertidos para MP3 estéreo a 96 kb/s, sem alterar a música. A playlist se repete; não é uma transmissão ao vivo.

| Arquivo | Faixa original |
| --- | --- |
| `tokyo-sunset.mp3` | [Tokyo Sunset](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/tokyo-sunset-lofi-peaceful-soft/) |
| `moon-unit.mp3` | [Moon Unit](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/moon-unit-lofi-reflection-dreamy/) |
| `bubbles.mp3` | [Bubbles](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/bubbles-lofi-bright-relaxed/) |
| `complicated-feelings.mp3` | [Complicated Feelings](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/complicated-feelings-lofi-dreamy-relaxed/) |
| `ease-into-night.mp3` | [Ease into Night](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/ease-into-night-lofi-relax-chill/) |
| `calm-currents.mp3` | [Calm Currents](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/calm-currents-lofi-relax-calm/) |
| `tranquil-mindscape.mp3` | [Tranquil Mindscape](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/tranquil-mindscape-lofi-happy-reflection/) |
| `peaceful-drift.mp3` | [Peaceful Drift](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/peaceful-drift-lofi-nostalgic-calm/) |
| `saturation.mp3` | [Saturation](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/saturation-lofi-calm-relaxed/) |
| `wetlands.mp3` | [Wetlands](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/wetlands-lofi-calm-relaxed/) |
| `one-night-in-france.mp3` | [One Night in France](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/one-night-in-france-lofi-nostalgic-chill/) |
| `infinite-echoes.mp3` | [Infinite Echoes](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/infinite-echoes-lofi-dreamy-soft/) |
| `birds.mp3` | [Birds](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/birds-lofi-chill/) |
| `still-life.mp3` | [Still Life](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/still-life-lofi-chill-nostalgic/) |
| `lucid.mp3` | [Lucid](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/lucid-lofi-dreamy-chill/) |
| `waiting-around.mp3` | [Waiting Around](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/waiting-around-lofi-calm/) |
| `doodles.mp3` | [Doodles](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/doodles-lofi-happy-mp3/) |
| `theta-frequency.mp3` | [Theta Frequency](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/theta-frequency-lofi-chill-calm/) |
| `reminders.mp3` | [Reminders](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/reminders-lofi-calm-nostalgic/) |
| `shimmer.mp3` | [Shimmer](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/shimmer-lofi-chill/) |
| `down-time.mp3` | [Down Time](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/down-time-lofi-peaceful-mp3/) |
| `warm-fuzz.mp3` | [Warm Fuzz](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/warm-fuzz-lofi-retro/) |
| `ocean-breeze.mp3` | [Ocean Breeze](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/ocean-breeze-lofi-ukulele-peaceful-mp3/) |
| `into-the-mist.mp3` | [Into the Mist](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/into-the-mist-lofi-calm-relaxed/) |

## Rádios do YouTube

O card no topo das páginas autenticadas oferece seis transmissões oficiais de [Lofi Girl](https://www.youtube.com/@LofiGirl/streams) e [Chillhop Music](https://www.youtube.com/@ChillhopMusic/streams), com links conferidos nas abas de transmissões dos canais em 17/10/2026:

- [Lofi Girl — beats to relax/study to](https://www.youtube.com/watch?v=rFZHOHl-L8A).
- [Synthwave — beats to chill/game to](https://www.youtube.com/watch?v=4xDzrJKXOOY).
- [Chillhop Radio — jazzy & lofi hip hop beats](https://www.youtube.com/watch?v=5yx6BWlEVcY).
- [Jazz Lofi — beats to chill/study to](https://www.youtube.com/watch?v=E2vONfzoyRI).
- [Asian Lofi — beats to relax/study to](https://www.youtube.com/watch?v=1Tl2FtV06qo).
- [Sleep Lofi — relaxing music to sleep/dream to](https://www.youtube.com/watch?v=VAlMDl00mYY).

O player oficial só é carregado após escolher uma estação e não inicia automaticamente. Escolher YouTube pausa a playlist local; tocar o disco encerra o player do YouTube. Fechar o card também encerra o vídeo. A seleção fica disponível ao navegar entre as páginas do app.

O iframe tem altura mínima de 200 px e é desmontado quando sai da área visível ou quando a aba fica oculta. Ao voltar, é necessário dar play novamente. Isso evita áudio oculto do YouTube, conforme as [políticas de reprodução](https://developers.google.com/youtube/terms/developer-policies) e os [requisitos do player](https://developers.google.com/youtube/terms/required-minimum-functionality). Para escutar em segundo plano, a playlist local continua disponível no disco.

O link “Abrir no YouTube” permanece disponível caso o navegador ou a transmissão bloqueie a incorporação. Os IDs das transmissões podem mudar; atualize `STATIONS` em `YoutubeRadioCard.tsx` usando a aba de transmissões do canal oficial. Nenhum áudio do YouTube é baixado ou hospedado pelo Coado.
